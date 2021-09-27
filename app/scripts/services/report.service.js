'use strict';

angular.module('gasAdmin').factory('ReportService', [
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

        var _getSalesReport = function(filters) {
            var config = AuthenticationService.GetHeaderWithAuth();
            var deferred = $q.defer();

            $http
                .post(configs.apiEndpoint + '/v1/admin/order/salesReport', filters)
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

        const _getCustomerList = function(filters) {
            var config = AuthenticationService.GetHeaderWithAuth();
            var deferred = $q.defer();

            $http
                .post(configs.apiEndpoint + '/v1/admin/customers', filters)
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
        }


        service.GetSalesReport = _getSalesReport;
        service.GetCustomerList = _getCustomerList;
        return service;
    }
]);