'use strict';

angular.module('gasAdmin').factory('ProductService', [
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

    var _getProductList = function(filters) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      $http
        .post(configs.apiEndpoint + '/v1/admin/products', filters)
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

    var _updateProduct = function(product, imgSrc) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      var data = {
        id: product.id,
        size_id: product.size_id,
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        image: imgSrc,
        delivery_charge: product.delivery_charge,
        deposit_amount: product.deposit_amount,
        product_id: product.product_id,
        category_id: product.category_id
      };

      $http
        .post(configs.apiEndpoint + '/v1/admin/products/save', data)
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

    var _getProductById = function(productId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/product/' + productId)
        .then(function(response) {
          if (response.data.data.product != null) {
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

    var _deleteProductById = function(productId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        id: productId
      };
      $http
        .post(
          configs.apiEndpoint + '/v1/admin/product/delete/' + productId,
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

    var _getProductBrands = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/list/brands')
        .then(function(response) {
          if (response.data.categories) {
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

    var _getProductSizes = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/list/sizes')
        .then(function(response) {
          if (response.data.categories) {
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

    var _getMainProducts = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/list/products')
        .then(function(response) {
          if (response.data.products) {
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

    service.GetProductList = _getProductList;
    service.UpdateProduct = _updateProduct;
    service.GetProductById = _getProductById;
    service.DeleteProductById = _deleteProductById;
    service.GetProductBrands = _getProductBrands;
    service.GetProductSizes = _getProductSizes;
    service.GetMainProducts = _getMainProducts;

    return service;
  }
]);
