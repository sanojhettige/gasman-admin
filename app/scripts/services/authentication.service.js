'use strict';

angular.module('gasAdmin').factory('AuthenticationService', [
  '$q',
  '$http',
  'localStorageService',
  '$rootScope',
  '$state',
  'Notification',
  '$base64',
  'configs',
  function(
    $q,
    $http,
    localStorageService,
    $rootScope,
    $state,
    Notification,
    $base64,
    configs
  ) {
    var vm = this;

    var service = {};

    var _authData = {
      isAuth: false,
      userId: '',
      role: '',
      login: '',
      firstname: '',
      lastname: '',
      token: ''
    };

    vm.presentTime = new Date().getTime();

    var user_roles = configs.userRoles;

    // User authentication
    var _signIn = function(username, password) {
      var encodedAuthData = $base64.encode(username + ':' + password);

      // $http.defaults.headers.common['Authorization'] =
      //   'Bearer ' + encodedAuthData;
      $http.defaults.headers.common['Content-Type'] = 'application/json';
      // $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

      var data = {
        username: username,
        password: password
      };

      var deferred = $q.defer();

      $http
        .post(configs.apiEndpoint + '/v1/login/admin', data)
        .then(function(response) {
          // console.log(response);
          if (response.data.access_token != null) {
            _saveCredentials(response.data, encodedAuthData);
            deferred.resolve(response.data);
          } else if (response.data.error === 1) {
            var err = {
              code: response.data.error,
              message: 'Error:Authentication/Authorization Failed'
            };
            deferred.reject(err);
          } else {
            var err = {
              code: response.data.resultCode,
              message: response.data.errors[0].message
            };
            deferred.reject(err);
          }
        })
        .catch(function(response) {
          var err = {
            message: 'Authentication/Authorization Failed..'
          };
          deferred.reject(err);
        });

      return deferred.promise;
    };

    // Sign out function
    var _signOut = function() {
      _clearCredentials();
      localStorage.clear();
      Notification.primary('You have successfully logged out!');
      $state.go('app.login');
    };

    // Saving user auth data to local storage
    var _saveCredentials = function(response, token) {
      localStorageService.set('authData', {
        userId: 0,
        role: _resolveUserRoleByRoleId(response.data.r),
        login: response.data,
        firstname: response.data.firstName,
        lastname: response.data.lastName,
        token: response.access_token
      });
    };

    // Assign role name to user based on his roleId
    var _resolveUserRoleByRoleId = function(roleId) {
      for (var i in user_roles) {
        if (user_roles[i].id == roleId) {
          return user_roles[i].name;
        }
      }
      return '';
    };

    // Clear user data in local storage
    var _clearCredentials = function() {
      localStorageService.remove('authData');
      _authData.isAuth = false;
      _authData.userId = '';
      _authData.role = '';
      _authData.login = '';
      _authData.firstname = '';
      _authData.lastname = '';
      _authData.token = '';
    };

    // Check if user authenticated
    var _checkAuthentication = function(roles) {
      var authData = localStorageService.get('authData');

      if (authData) {
        _authData.isAuth = true;
        _authData.userId = authData.userId;
        _authData.role = authData.role;
        _authData.login = authData.login;
        _authData.firstname = authData.firstname;
        _authData.lastname = authData.lastname;
        _authData.token = authData.token;

        return _checkAccessRights(roles);
      } else {
        _clearCredentials();
        return false;
      }
    };

    var _getUserRole = function() {
      var authData = localStorageService.get('authData');
      return authData.role;
    };
    // Check access rights
    var _checkAccessRights = function(roles) {
      if (typeof roles != 'undefined') {
        for (var i = 0; i < roles.length; i++) {
          if (_authData.role == roles[i]) return true;
        }
      }
      return false;
    };

    var _getHeaderWithAuth = function() {
      var authData = localStorageService.get('authData');

      if (authData) {
        $http.defaults.headers.common['Authorization'] =
          'Bearer ' + authData.token;
        $http.defaults.headers.common['Content-Type'] = 'application/json';
      }
    };

    var _getHeader = function() {
      $http.defaults.headers.common['Content-Type'] = 'application/json';
    };

    var _getAuthUser = function() {
      var authData = localStorageService.get('authData');
      if (authData) {
        var userData = {
          userLogin: authData.login,
          userId: authData.userId,
          role: authData.role
        };
      }
      return userData;
    };

    var _resetPassword = function(email) {
      var config = _getHeaderWithAuth();

      var deferred = $q.defer();

      var url = '';
      url = configs.apiEndpoint + '/v1/forgot';

      var data = {
        email: email
      };

      $http
        .post(url, data)
        .then(function(response) {
          if (response.data.success === 1) {
            deferred.resolve(response);
          } else if (response.data.error === 1) {
            deferred.reject(response.data);
          } else {
            var err = {
              code: response.data.resultCode,
              message: response.data.content.message
            };
            deferred.reject(err);
          }
        })
        .catch(function(e) {
          deferred.reject(e.data);
        });
      return deferred.promise;
    };

    var _changePassword = function(user) {
      var config = _getHeaderWithAuth();

      var deferred = $q.defer();

      var url = '';
      url = configs.apiEndpoint + '/v1/reset';

      var data = {
        email: user.email,
        password: user.password,
        confirm_password: user.cpass,
        token: user.token
      };

      $http
        .post(url, data)
        .then(function(response) {
          if (response.data.success === 1) {
            deferred.resolve(response);
          } else if (response.data.error === 1) {
            deferred.reject(response.data);
          } else {
            var err = {
              code: response.data.resultCode,
              message: response.data.content.message
            };
            deferred.reject(err);
          }
        })
        .catch(function(e) {
          deferred.reject(e.data);
        });
      return deferred.promise;
    };

    var _getTokenEmailRef = function(token) {
      var config = _getHeaderWithAuth();
      var deferred = $q.defer();

      var url = '';
      url = configs.apiEndpoint + '/v1/web/api/token/email/' + token;

      $http
        .get(url)
        .then(function(response) {
          if (response.data) {
            deferred.resolve(response);
          } else if (response.data.error === 1) {
            deferred.reject(response.data);
          } else {
            var err = {
              code: response.data.resultCode,
              message: response.data.content.message
            };
            deferred.reject(err);
          }
        })
        .catch(function(e) {
          deferred.reject(e.data);
        });
      return deferred.promise;
    };

    service.SignIn = _signIn;
    service.SignOut = _signOut;
    service.CheckAuthentication = _checkAuthentication;
    service.Authentication = _authData;
    service.SaveCredentials = _saveCredentials;
    service.ClearCredentials = _clearCredentials;
    service.GetHeaderWithAuth = _getHeaderWithAuth;
    service.GetHeader = _getHeader;
    service.GetAuthUser = _getAuthUser;
    service.ResetPassword = _resetPassword;
    service.ChangePassword = _changePassword;
    service.GetTokenEmailRef = _getTokenEmailRef;
    service.GetUserRole = _getUserRole;

    return service;
  }
]);
