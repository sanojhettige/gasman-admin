'use strict';
angular.module('gasAdmin').controller('CategoryCtrl', CategoryCtrl);

CategoryCtrl.$inject = [
  'localStorageService',
  '$state',
  'AuthenticationService',
  'Notification',
  'initPageContent',
  'cfpLoadingBar',
  'ngDialog',
  'CategoryService',
  '$ngConfirm',
  '$scope',
  'DTOptionsBuilder',
  'DTColumnBuilder',
  '$http',
  '$q',
  '$compile',
  'uiCalendarConfig',
  '$rootScope',
  'PageHtml'
];

function CategoryCtrl(
  localStorageService,
  $state,
  AuthenticationService,
  Notification,
  initPageContent,
  cfpLoadingBar,
  ngDialog,
  CategoryService,
  $ngConfirm,
  $scope,
  DTOptionsBuilder,
  DTColumnBuilder,
  $http,
  $q,
  $compile,
  uiCalendarConfig,
  $rootScope,
  PageHtml
) {
  var vm = this;

  vm.pageContent = initPageContent;
  $rootScope.PageHtml = PageHtml;
  PageHtml.setTitle('Administrator | Categories');

  let appAccessRoles = $state.$current.data.applicationAccess;

  vm.applicationAccessView = AuthenticationService.CheckAuthentication(
    appAccessRoles
  );

  vm.splitType = 1;

  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

  //Definitions
  vm.closePopUp = _closePopUp;
  vm.redirectToUrl = _redirectToUrl;
  vm.refreshMainPageData = _refreshMainPageData;
  vm.currentYear = new Date().getFullYear();
  vm.showCategoryById = _showCategoryById;
  vm.categoryList = [];
  vm.getCategoryList = _getCategoryList;
  vm.categoryById = {};
  vm.getCategoryById = _getCategoryById;
  vm.updateCategory = _updateCategory;
  vm.errors = [];
  vm.handleRemoveCategory = _handleRemoveCategory;
  vm.pageData = {
    total: 0
  };
  vm.submitting = false;
  vm.prodFile = null;
  vm.imageSrc = '';

  vm.getCategoryTypes = _getCategoryTypes;
  vm.GetcategoryTypes = [];

  vm.onFileChanged = function(event) {
    vm.prodFile = event.target.files[0];
  };

  function _refreshMainPageData() {}

  function _closePopUp() {
    ngDialog.close();
  }

  function _redirectToUrl(route) {
    $state.go(route);
  }

  //Get Category list
  function _getCategoryList(pageNumber) {
    cfpLoadingBar.start();
    CategoryService.GetCategoryList(0, pageNumber).then(
      function(response) {},
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  // Get Category by id
  function _getCategoryById(categoryId) {
    vm.categoryById = {};
    if (categoryId != 0) {
      cfpLoadingBar.start();
      CategoryService.GetCategoryById(categoryId).then(
        function(response) {
          vm.categoryById = {};
          vm.categoryById = response.data.category;
          vm.imageSrc = response.data.category.image;
        },
        function(err) {
          Notification.error(err.message);
          if (err.error === '1' || err.access === 'Unauthorized') {
            ngDialog.close();
            AuthenticationService.ClearCredentials();
            $state.go('app.login');
          }
          cfpLoadingBar.complete();
        }
      );
      cfpLoadingBar.complete();
    }
  }

  function _getCategoryTypes() {
    CategoryService.GetcategoryTypes().then(
      function(response) {
        vm.categoryTypes = [];
        angular.forEach(response.types, function(value, key) {
          vm.categoryTypes.push({ id: key, name: value });
        });
        // vm.categoryTypes = response.types;
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          ngDialog.close();
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  //Update Category
  function _updateCategory(category) {
    cfpLoadingBar.start();
    vm.submitting = true;
    CategoryService.UpdateCategory(category, vm.imageSrc).then(
      function(response) {
        Notification.primary(response.data.message);
        ngDialog.close();
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        if (err.message) {
          Notification.error(err.message);
        }
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          ngDialog.close();
          $state.go('app.login');
        } else if (err.errors) {
          _handleValidationErrors(err.errors);
        }
        cfpLoadingBar.complete();
        vm.submitting = false;
      }
    );
    cfpLoadingBar.complete();
  }

  //handle validation errors
  function _handleValidationErrors(err) {
    Notification.error('Please fix above errors to save event details.');
    vm.errors = [];
    angular.forEach(err, function(value, key) {
      if (value.location === 'name') {
        vm.errors.name = value.message;
      }
      if (value.location === 'description') {
        vm.errors.description = value.message;
      }
      if (value.location === 'category_type') {
        vm.errors.category_type = value.message;
      }
    });
  }

  //show category popup
  function _showCategoryById(categoryId) {
    cfpLoadingBar.start();
    var templateURL = '';
    var title = 'Add New Category';
    var saveBtn = 'Add Category';
    if (categoryId) {
      title = 'Update Category Details';
      saveBtn = 'Update Category';
    }

    templateURL = '/views/categories/category_form.html';

    ngDialog.open({
      template: templateURL,
      className: 'ngdialog-theme-default modal-70',
      controller: 'CategoryCtrl',
      controllerAs: 'vm',
      data: {
        categoryId: categoryId,
        title: title,
        saveBtn: saveBtn,
        categoryTypes: vm.categoryTypes
      }
    });
    cfpLoadingBar.complete();
  }

  // remove category
  function _handleRemoveCategory(id) {
    $ngConfirm({
      title: 'Confirm! ',
      content: 'Are you sure about this action ?',
      scope: $scope,
      buttons: {
        delete: {
          text: 'Delete',
          btnClass: 'btn-danger',
          action: function(scope, button) {
            _deleteCategory(id);
          }
        },
        close: function(scope, button) {
          // closes the modal
        }
      }
    });
  }

  function _deleteCategory(categoryId) {
    cfpLoadingBar.start();
    CategoryService.DeleteCategoryById(categoryId).then(
      function(response) {
        Notification.primary('Category successfully deleted!');
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  // this function used to get all leads
  var get = function(sSource, aoData, fnCallback, oSettings) {
    var draw = aoData[0].value;
    var order = aoData[2].value;
    var start = aoData[3].value;
    var length = aoData[4].value;
    var search = aoData[5].value;
    var params = {
      offset: start,
      limit: length,
      order: order,
      draw: draw,
      search: search.value
    };
    CategoryService.GetCategoryList(params).then(
      function(response) {
        var records = {
          draw: 0,
          recordsTotal: 0,
          recordsFiltered: 0,
          data: []
        };
        if (response.data) {
          records = {
            draw: draw,
            recordsTotal: response.data.count,
            recordsFiltered: response.data.count,
            data: response.data.items
          };

          vm.events = response.data.items;
        }
        vm.pageData.total = response.data.total;
        fnCallback(records);
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
  };

  function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    $compile(nRow)($scope);
  }

  vm.dtOptions = DTOptionsBuilder.newOptions()
    .withFnServerData(get)
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('paging', true)
    .withPaginationType('full_numbers')
    .withDisplayLength(10)
    .withOption('rowCallback', rowCallback);

  vm.dtColumns = [
    DTColumnBuilder.newColumn(null, 'Image')
      .notSortable()
      .renderWith(imageRender),
    DTColumnBuilder.newColumn('name', 'Category Name'),
    DTColumnBuilder.newColumn('type', 'Category Type'),
    DTColumnBuilder.newColumn('modified_date', 'Modified Date'),
    DTColumnBuilder.newColumn(null, 'Actions')
      .notSortable()
      .renderWith(actionsHtml)
  ];

  function imageRender(data, type, full, meta) {
    var content = '';
    content += '<img width=\'32\' height=\'32\' src=\'' + data.image + '\'>';
    return content;
  }

  function actionsHtml(data, type, full, meta) {
    var content = '';
    content += '<div class=\'btn-group\'>';
    content +=
      '<button class=\'btn btn-sm btn-success\' ng-click=vm.showCategoryById(\'' +
      data.id +
      '\')>';
    content += '<i class=\'wb-pencil\'></i></button>';
    content +=
      '<button class=\'btn btn-sm btn-danger\' ng-click=vm.handleRemoveCategory(\'' +
      data.id +
      '\')>';
    content += '<i class=\'wb-trash\'></i></button>';
    content += '</div>';
    return content;
  }

  vm.eventSources = [vm.events];
}
