'use strict';

angular.module('gasAdmin').factory('OrderService', [
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

    var _getOrderList = function(filters) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      $http
        .post(configs.apiEndpoint + '/v1/admin/orders', filters)
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

    var _updateOrder = function(order) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      $http
        .post(configs.apiEndpoint + '/v1/admin/order/save', order)
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

    var _getOrderById = function(orderId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/order/' + orderId)
        .then(function(response) {
          if (response.data.data.order) {
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

    var _deleteOrderById = function(orderId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        id: orderId
      };
      $http
        .post(configs.apiEndpoint + '/v1/admin/order/delete/' + orderId, data)
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

    var _cancelOrderById = function(orderId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        id: orderId
      };
      $http
        .post(configs.apiEndpoint + '/v1/admin/order/cancel/' + orderId, data)
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

    var _getOrderTypes = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/order-types')
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

    var _getAgents = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/dropdowns/agents')
        .then(function(response) {
          if (response.data.agents) {
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

    var _getCustomers = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/dropdowns/customers')
        .then(function(response) {
          if (response.data.customers) {
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

    var _addCustomer = function(customer) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      var data = {
        id: customer.id,
        name: customer.name,
        address: customer.address,
        contact_number: customer.contact_number
      };

      $http
        .post(configs.apiEndpoint + '/v1/admin/customer/save', data)
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

    var _getCustomersAddresses = function(customerId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      var data = {
        id: customerId
      };

      $http
        .post(configs.apiEndpoint + '/v1/admin/customer/addresses', data)
        .then(function(response) {
          if (response.data.addresses) {
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

    var _getProductSuggetions = function(filters) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      $http
        .post(configs.apiEndpoint + '/v1/admin/products-suggetions', filters)
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

    var _assignOrderAgentById = function(orderId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        orderId: orderId.id,
        agentId: orderId.agent_user_id,
        items: orderId.items
      };
      $http
        .post(configs.apiEndpoint + '/v1/admin/order/assign/agent', data)
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

    var _acceptOrderById = function(orderId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        id: orderId.id
      };
      $http
        .post(
          configs.apiEndpoint + '/v1/admin/order/accept/' + orderId.id,
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

    var _dispatchOrderById = function(orderId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        id: orderId.id
      };
      $http
        .post(
          configs.apiEndpoint + '/v1/admin/order/dispatch/' + orderId.id,
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

    var _completeOrderById = function(orderId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        id: orderId.id
      };
      $http
        .post(
          configs.apiEndpoint + '/v1/admin/order/complete/' + orderId.id,
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

    service.GetOrderList = _getOrderList;
    service.UpdateOrder = _updateOrder;
    service.GetOrderById = _getOrderById;
    service.DeleteOrderById = _deleteOrderById;
    service.CancelOrderById = _cancelOrderById;
    service.AcceptOrderById = _acceptOrderById;
    service.DispatchOrderById = _dispatchOrderById;
    service.CompleteOrderById = _completeOrderById;
    service.GetOrderTypes = _getOrderTypes;
    service.GetAgents = _getAgents;
    service.GetCustomers = _getCustomers;
    service.AddCustomer = _addCustomer;
    service.GetCustomersAddresses = _getCustomersAddresses;
    service.GetProductList = _getProductList;
    service.GetProductSuggetions = _getProductSuggetions;
    service.AssignOrderAgentById = _assignOrderAgentById;

    return service;
  }
]);
