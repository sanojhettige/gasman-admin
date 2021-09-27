'use strict';
angular.module('gasAdmin').controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = [
  '$state',
  'AuthenticationService',
  'Notification',
  'initPageContent',
  'cfpLoadingBar',
  'ngDialog',
  '$location',
  '$scope',
  '$stateParams',
  'rememberMeService',
  '$base64',
  '$rootScope',
  'PageHtml'
];

function LoginCtrl(
  $state,
  AuthenticationService,
  Notification,
  initPageContent,
  cfpLoadingBar,
  ngDialog,
  $location,
  $scope,
  $stateParams,
  rememberMeService,
  $base64,
  $rootScope,
  PageHtml
) {
  var vm = this;

  vm.pageContent = initPageContent;

  PageHtml.setTitle('Login');
  PageHtml.setHtmlClass('js-menubar');
  PageHtml.setBodyClass('page-login layout-full page-dark');
  $rootScope.PageHtml = PageHtml;

  vm.pageContent.customHeaderUrl = 'views/tmpls/login-header.template.html';
  vm.pageContent.customFooterUrl = 'views/tmpls/login-footer.template.html';

  vm.login = _signIn;

  vm.hideShowPassword = _hideShowPassword;

  vm.currentYear = new Date().getFullYear();

  vm.inputType = 'password';
  vm.errors = [];

  vm.forgetPassPopUp = _forgetPassPopUp;

  vm.resetPassword = _resetPassword;
  vm.changePassword = _changePassword;

  vm.tokenEmail = '';
  vm.getTokenEmail = _getTokenEmail;

  vm.adminURL = false; //TODO: admin login form

  vm.checkURL = function() {
    var url = $location.absUrl();
    if (
      url == 'http://admin.gasman.lk/login' ||
      url == 'http://localhost:9005/login' ||
      url == 'http://localhost:9001/login'
    ) {
      vm.adminURL = true;
    }
  };

  vm.createPassword = false;
  if ($state.includes('app.create-password')) {
    vm.createPassword = true;
  }

  // Remember me
  if (rememberMeService('RF56SFSAG5') && rememberMeService('7643#12DSFS4')) {
    // alert($base64.decode(rememberMeService("RF56SFSAG5")));
    // vm.username = $base64.decode(rememberMeService("RF56SFSAG5"));
    vm.password = $base64.decode(rememberMeService('7643#12DSFS4'));
    vm.remember = true;
  }

  vm.rememberMe = function() {
    if (vm.username && vm.password && vm.remember) {
      rememberMeService('RF56SFSAG5', $base64.encode(vm.username));
      rememberMeService('7643#12DSFS4', $base64.encode(vm.password));
    } else {
      rememberMeService('RF56SFSAG5', '');
      rememberMeService('7643#12DSFS4', '');
    }
  };

  angular
    .element('#mobileNumber')
    .on('countrychange', function(e, countryData) {
      $scope.$apply(function() {
        vm.username = '';
      });
    });

  // Authenticating user
  function _signIn(username, password) {
    cfpLoadingBar.start();
    AuthenticationService.SignIn(username, password).then(
      function(response) {
        if (vm.returnToState) {
          $rootScope.sideMenuOpen = false;
          PageHtml.setHtmlClass('js-menubar');
          PageHtml.setBodyClass('site-menubar-fold');
          $state.go(vm.returnToState.name, vm.returnToStateParams);
        } else {
          $rootScope.sideMenuOpen = false;
          PageHtml.setHtmlClass('js-menubar');
          PageHtml.setBodyClass('site-menubar-fold');
          $state.go('app.main', { reload: true });
        }
        vm.rememberMe();
      },
      function(err) {
        Notification.error(err);
        if (err.code == '-3' || err.code == '-6') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _hideShowPassword() {
    vm.inputType = 'password';
    vm.hideShowPassword = function() {
      if (vm.inputType == 'password') vm.inputType = 'text';
      else vm.inputType = 'password';
    };
  }

  function _forgetPassPopUp() {
    cfpLoadingBar.start();
    ngDialog.open({
      template: '/views/forgotPassword_modal.html',
      className: 'ngdialog-theme-default custom-width-400',
      showClose: false,
      controller: 'LoginCtrl',
      controllerAs: 'vm'
    });
    cfpLoadingBar.complete();
  }

  function _resetPassword(email) {
    cfpLoadingBar.start();

    AuthenticationService.ResetPassword(email).then(
      function(response) {
        Notification.primary(
          'Your password reset link will be sent to your email.'
        );
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
          $state.go('app.login');
        } else if (err.errors) {
          _handleValidationErrors(err.errors);
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _changePassword(username, password, cnpw) {
    cfpLoadingBar.start();
    var user = {
      email: username,
      password: password,
      cpass: cnpw,
      token: $stateParams.token
    };
    AuthenticationService.ChangePassword(user).then(
      function(response) {
        Notification.primary(response.message);
        $state.go('app.login', $state.params, {
          reload: true
        });
      },
      function(err) {
        if (err.message) {
          Notification.error(err.message);
        }
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        } else if (err.errors) {
          _handleValidationErrors(err.errors);
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  //handle validation errors
  function _handleValidationErrors(err) {
    vm.errors = [];
    angular.forEach(err, function(value, key) {
      if (value.location === 'email') {
        vm.errors.email = value.message;
      }
      if (value.location === 'password') {
        vm.errors.password = value.message;
      }
      if (value.location === 'confirm_password') {
        vm.errors.cn_password = value.message;
      }
      if (value.location === 'token') {
        Notification.error(value.message);
        vm.errors.token = value.message;
      }
    });
  }

  function _getTokenEmail() {
    cfpLoadingBar.start();
    var token = $stateParams.token;
    AuthenticationService.GetTokenEmailRef(token).then(
      function(response) {
        if (response.data.email) {
          vm.username = response.data.email;
        }
      },
      function(err) {
        if (err.message) {
          Notification.error(err.message);
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }
}
