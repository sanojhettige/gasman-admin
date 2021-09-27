'use strict';
angular.module('gasAdmin').controller('MainCtrl', MainCtrl);

MainCtrl.$inject = [
  'localStorageService',
  '$state',
  'AuthenticationService',
  'Notification',
  'initPageContent',
  'cfpLoadingBar',
  'ngDialog',
  'UserService',
  '$rootScope',
  'PageHtml'
];

function MainCtrl(
  localStorageService,
  $state,
  AuthenticationService,
  Notification,
  initPageContent,
  cfpLoadingBar,
  ngDialog,
  UserService,
  $rootScope,
  PageHtml
) {
  var vm = this;

  vm.pageContent = initPageContent;
  $rootScope.PageHtml = PageHtml;
  PageHtml.setTitle('Administrator');

  let appAccessRoles = $state.$current.data.applicationAccess;

  vm.applicationAccessView = AuthenticationService.CheckAuthentication(
    appAccessRoles
  );

  vm.splitType = 1;
  vm.getLoggedUser = _getLoginUser;
  vm.updateProfile = _updateProfile;
  vm.savePassword = _savePassword;

  vm.closePopUp = _closePopUp;

  vm.redirectToUrl = _redirectToUrl;

  vm.refreshMainPageData = _refreshMainPageData;

  vm.currentYear = new Date().getFullYear();

  vm.getDashboard = _getDashboard;
  vm.getDashboardData = {};

  vm.getSetting = {};
  vm.getSettings = _getSettings;

  vm.updateSettings = _updateSettings;

  function _refreshMainPageData() {}

  function _getLoginUser() {
    cfpLoadingBar.start();
    UserService.GetLoginUser().then(
      function(response) {
        vm.getLoginUser = response.data.data;
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

  function _savePassword(currentPassword, newPassword) {
    cfpLoadingBar.start();
    UserService.SavePassword(currentPassword, newPassword).then(
      function(response) {
        Notification.primary('Password is updated!');
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        Notification.error(err);
        if (err.code == '-3') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _updateProfile(user) {
    cfpLoadingBar.start();
    UserService.UpdateProfile(user).then(
      function(response) {
        Notification.primary(response.data.message);
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

  //handle validation errors
  function _handleValidationErrors(err) {
    vm.errors = [];
    angular.forEach(err, function(value, key) {
      if (value.location === 'name') {
        vm.errors.name = value.message;
      }
      if (value.location === 'email') {
        vm.errors.email = value.message;
      }
      if (value.location === 'mobile') {
        vm.errors.mobile = value.message;
      }
      if (value.location === 'username') {
        vm.errors.username = value.message;
      }
      if (value.location === 'password') {
        vm.errors.password = value.message;
      }
      if (value.location === 'confirm_password') {
        vm.errors.confirm_password = value.message;
      }
      if (value.location === 'sender_email') {
        vm.errors.sender_email = value.message;
      }
      if (value.location === 'sender_name') {
        vm.errors.sender_name = value.message;
      }
      if (value.location === 'response_timer') {
        vm.errors.response_timer = value.message;
      }
    });
  }

  function _savePassword(nwPw, cnPw) {
    cfpLoadingBar.start();

    UserService.SavePassword(nwPw, cnPw).then(
      function(response) {
        Notification.primary(response.data.message);
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

  function _getDashboard() {
    cfpLoadingBar.start();
    UserService.GetDashboard().then(
      function(response) {
        if (response.error === '1' || response.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        } else {
          vm.getDashboardData = response;
        }
      },
      function(err) {
        if (err.message) {
          Notification.error(err.message);
        }
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _getSettings() {
    cfpLoadingBar.start();
    UserService.GetSettings().then(
      function(response) {
        vm.getSetting = response.data.setting;
      },
      function(err) {
        if (err.message) {
          Notification.error(err.message);
        }
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

  function _updateSettings(setting) {
    cfpLoadingBar.start();
    vm.submitting = true;
    UserService.UpdateSetting(setting).then(
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

  function _closePopUp() {
    ngDialog.close();
  }

  function _redirectToUrl(route) {
    $state.go(route);
  }
}
