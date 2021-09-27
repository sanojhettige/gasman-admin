'use strict';

angular.module('gasAdmin').factory('UserService', [
  '$q',
  '$http',
  'localStorageService',
  '$rootScope',
  '$state',
  'AuthenticationService',
  '$base64',
  'configs',
  function(
    $q,
    $http,
    localStorageService,
    $rootScope,
    $state,
    AuthenticationService,
    $base64,
    configs
  ) {
    var filterDates = {};
    var service = {};

    var _getLoginUser = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var userProfileId = '';
      var authData = localStorageService.get('authData');
      if (authData) {
        userProfileId = authData.userId;
      }

      $http
        .get(configs.apiEndpoint + '/v1/profile')
        .then(function(response) {
          if (response.data.data) {
            deferred.resolve(response);
          } else {
            deferred.reject(response.data);
          }
        })
        .catch(function(e) {
          deferred.reject(e.data);
        });
      return deferred.promise;
    };

    var _savePassword = function(newPassword, cnewPassword) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      var data = {
        password: newPassword,
        password_confirmation: cnewPassword
      };

      $http
        .post(configs.apiEndpoint + '/v1/profile/password', data)
        .then(function(response) {
          console.log(response.data.data);
          if (response.data.data.success === 1) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        })
        .catch(function(e) {
          deferred.reject(e.data);
        });
      return deferred.promise;
    };

    var _updateProfile = function(user) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      var data = {
        name: user.name,
        email: user.email,
        username: user.username,
        mobile: user.mobile
      };

      $http
        .post(configs.apiEndpoint + '/v1/profile/update', data)
        .then(function(response) {
          console.log(response.data.data);
          if (response.data.data.success === 1) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        })
        .catch(function(e) {
          deferred.reject(e.data);
        });
      return deferred.promise;
    };

    var _getDashboard = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/dashboard')
        .then(function(response) {
          if (response) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        })
        .catch(function(e) {
          deferred.reject(e.data);
        });
      return deferred.promise;
    };

    var _getSettings = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/settings')
        .then(function(response) {
          if (response.data.data) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        })
        .catch(function(e) {
          deferred.reject(e);
        });
      return deferred.promise;
    };

    var _updateSetting = function(setting) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .post(configs.apiEndpoint + '/v1/admin/settings', setting)
        .then(function(response) {
          if (response.data) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        })
        .catch(function(e) {
          deferred.reject(e.data);
        });
      return deferred.promise;
    };

    var _getNotifications = function(params) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .post(configs.apiEndpoint + '/v1/api/notifications', params)
        .then(function(response) {
          if (response.data) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        })
        .catch(function(e) {
          deferred.reject(e);
        });
      return deferred.promise;
    };

    var _getUserList = function(filters) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      $http
        .post(configs.apiEndpoint + '/v1/admin/users', filters)
        .then(function(response) {
          if (response.data.data) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        });
      return deferred.promise;
    };

    var _updateUser = function(user) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      var data = {
        id: user.id,
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        role_id: user.role_id,
        username: user.username,
        password: user.password,
        password_confirmation: user.password_confirmation,
        changePw: user.changePw ? user.changePw : null
      };

      $http
        .post(configs.apiEndpoint + '/v1/admin/users/save', data)
        .then(function(response) {
          if (response.data.data.success === 1) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        })
        .catch(function(e) {
          deferred.reject(e.data);
        });
      return deferred.promise;
    };

    var _getUserById = function(userId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/user/' + userId)
        .then(function(response) {
          if (response.data.data.user != null) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        });
      return deferred.promise;
    };

    var _deleteUserById = function(videoId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        id: videoId
      };
      $http
        .post(configs.apiEndpoint + '/v1/admin/user/delete', data)
        .then(function(response) {
          if (response.data.success === 1) {
            deferred.resolve(response.data);
          } else {
            deferred.reject(response.data);
          }
        });
      return deferred.promise;
    };

    service.GetLoginUser = _getLoginUser;
    service.SavePassword = _savePassword;
    service.UpdateProfile = _updateProfile;
    service.GetDashboard = _getDashboard;
    service.GetSettings = _getSettings;
    service.UpdateSetting = _updateSetting;
    service.GetNotifications = _getNotifications;
    service.GetUserList = _getUserList;
    service.UpdateUser = _updateUser;
    service.GetUserById = _getUserById;
    service.DeleteUserById = _deleteUserById;

    return service;
  }
]);
