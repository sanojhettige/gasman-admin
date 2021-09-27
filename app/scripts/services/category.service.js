'use strict';

angular.module('gasAdmin').factory('CategoryService', [
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

    var _getCategoryList = function(filters) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      $http
        .post(configs.apiEndpoint + '/v1/admin/categories', filters)
        .then(function(response) {
          if (response.data.data) {
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

    var _updateCategory = function(category) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      var data = {
        id: category.id,
        name: category.name,
        description: category.description,
        category_type: category.category_type
      };

      $http
        .post(configs.apiEndpoint + '/v1/admin/categories/save', data)
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

    var _getCategoryById = function(categoryId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/category/' + categoryId)
        .then(function(response) {
          if (response.data.data.category) {
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

    var _deleteCategoryById = function(categoryId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        id: categoryId
      };
      $http
        .post(
          configs.apiEndpoint + '/v1/admin/category/delete/' + categoryId,
          data
        )
        .then(function(response) {
          if (response.data.success === 1) {
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

    var _getCategoryTypes = function(categoryId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/dropdowns/category_types')
        .then(function(response) {
          if (response.data.types) {
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

    service.GetCategoryList = _getCategoryList;
    service.UpdateCategory = _updateCategory;
    service.GetCategoryById = _getCategoryById;
    service.DeleteCategoryById = _deleteCategoryById;
    service.GetcategoryTypes = _getCategoryTypes;

    return service;
  }
]);
