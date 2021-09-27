'use strict';

angular
  .module('gasAdmin')
  .directive('a', preventClickDirective)
  .directive('a', bootstrapCollapseDirective)
  .directive('a', navigationDirective)
  .directive('button', layoutToggleDirective)
  .directive('a', layoutToggleDirective)
  .directive('button', collapseMenuTogglerDirective)
  .directive('div', bootstrapCarouselDirective)
  .directive('toggle', bootstrapTooltipsPopoversDirective)
  .directive('tab', bootstrapTabsDirective)
  .directive('select', convertToNumberDirective)
  .directive('input', ngEnter)
  .directive('ngFileSelect', function(fileReader, $timeout) {
    return {
      scope: {
        ngModel: '='
      },
      link: function($scope, el) {
        function getFile(file) {
          fileReader.readAsDataUrl(file, $scope).then(function(result) {
            $timeout(function() {
              $scope.ngModel = result;
            });
          });
        }

        el.bind('change', function(e) {
          var file = (e.srcElement || e.target).files[0];
          getFile(file);
        });
      }
    };
  })
  .directive('onErrorSrc', function() {
    return {
      link: function(scope, element, attrs) {
        element.bind('error', function() {
          if (attrs.src != attrs.onErrorSrc) {
            attrs.$set('src', attrs.onErrorSrc);
          }
        });
      }
    };
  });

//Prevent click if href="#"
function preventClickDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    if (attrs.href === '#') {
      element.on('click', function(event) {
        event.preventDefault();
      });
    }
  }
}

//Bootstrap Collapse
function bootstrapCollapseDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    if (attrs.toggle == 'collapse') {
      element
        .attr('href', 'javascript;;')
        .attr('data-target', attrs.href.replace('index.html', ''));
    }
  }
}

/**
 * @desc Main navigation - Sidebar menu
 * @example <li class="nav-item nav-dropdown"></li>
 */
function navigationDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    if (
      element.hasClass('nav-dropdown-toggle') &&
      angular.element('body').width() > 782
    ) {
      element.on('click', function() {
        if (!angular.element('body').hasClass('compact-nav')) {
          element
            .parent()
            .toggleClass('open')
            .find('.open')
            .removeClass('open');
        }
      });
    } else if (
      element.hasClass('nav-dropdown-toggle') &&
      angular.element('body').width() < 783
    ) {
      element.on('click', function() {
        element
          .parent()
          .toggleClass('open')
          .find('.open')
          .removeClass('open');
      });
    }
  }
}

sidebarNavDynamicResizeDirective.$inject = ['$window', '$timeout'];

function sidebarNavDynamicResizeDirective($window, $timeout) {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    if (
      element.hasClass('sidebar-nav') &&
      angular.element('body').hasClass('fixed-nav')
    ) {
      var bodyHeight = angular.element(window).height();
      scope.$watch(function() {
        var headerHeight = angular.element('header').outerHeight();

        if (angular.element('body').hasClass('sidebar-off-canvas')) {
          element.css('height', bodyHeight);
        } else {
          element.css('height', bodyHeight - headerHeight);
        }
      });

      angular.element($window).bind('resize', function() {
        var bodyHeight = angular.element(window).height();
        var headerHeight = angular.element('header').outerHeight();
        var sidebarHeaderHeight = angular
          .element('.sidebar-header')
          .outerHeight();
        var sidebarFooterHeight = angular
          .element('.sidebar-footer')
          .outerHeight();

        if (angular.element('body').hasClass('sidebar-off-canvas')) {
          element.css(
            'height',
            bodyHeight - sidebarHeaderHeight - sidebarFooterHeight
          );
        } else {
          element.css(
            'height',
            bodyHeight -
              headerHeight -
              sidebarHeaderHeight -
              sidebarFooterHeight
          );
        }
      });
    }
  }
}

//LayoutToggle
layoutToggleDirective.$inject = ['$interval'];

function layoutToggleDirective($interval) {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function() {
      if (element.hasClass('sidebar-toggler')) {
        angular.element('body').toggleClass('sidebar-hidden');
      }

      if (element.hasClass('aside-menu-toggler')) {
        angular.element('body').toggleClass('aside-menu-hidden');
      }
    });
  }
}

//Collapse menu toggler
function collapseMenuTogglerDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function() {
      if (
        element.hasClass('navbar-toggler') &&
        !element.hasClass('layout-toggler')
      ) {
        angular.element('body').toggleClass('sidebar-mobile-show');
      }
    });
  }
}

//Bootstrap Carousel
function bootstrapCarouselDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    if (attrs.ride == 'carousel') {
      element.find('a').each(function() {
        $(this)
          .attr(
            'data-target',
            $(this)
              .attr('href')
              .replace('index.html', '')
          )
          .attr('href', 'javascript;;');
      });
    }
  }
}

//Bootstrap Tooltips & Popovers
function bootstrapTooltipsPopoversDirective() {
  var directive = {
    restrict: 'A',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    if (attrs.toggle == 'tooltip') {
      angular.element(element).tooltip();
    }
    if (attrs.toggle == 'popover') {
      angular.element(element).popover();
    }
  }
}

//Bootstrap Tabs
function bootstrapTabsDirective() {
  var directive = {
    restrict: 'A',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.click(function(e) {
      e.preventDefault();
      angular.element(element).tab('show');
    });
  }
}

function convertToNumberDirective() {
  var directive = {
    require: 'ngModel',
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs, ngModel) {
    ngModel.$parsers.push(function(val) {
      return val != null ? parseInt(val, 10) : null;
    });
    ngModel.$formatters.push(function(val) {
      return val != null ? '' + val : null;
    });
  }
}

function ngEnter() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.bind('keydown keypress', function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  }
}
