'use strict';

angular.module('gasAdmin').factory('AgentService', [
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

    var _getAgentList = function(filters) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      $http
        .post(configs.apiEndpoint + '/v1/admin/agents', filters)
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

    var _updateAgent = function(agent, image, fields, fields2) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();

      var data = {
        id: agent.id,
        name: agent.name,
        contact_person: agent.contact_person,
        image: image,
        email: agent.email,
        video_url: agent.video,
        contact_number: agent.contact_number,
        address: agent.address,
        city_id: agent.city_id,
        delivery_charge: agent.delivery_charge,
        password: agent.password,
        confirm_password: agent.confirm_password,
        uid: agent.uid
      };

      $http
        .post(configs.apiEndpoint + '/v1/admin/agent/save', data)
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

    var _getAgentById = function(agentId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/agent/' + agentId)
        .then(function(response) {
          if (response.data.data.agent != null) {
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

    var _deleteAgentById = function(agentId) {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      var data = {
        id: agentId
      };
      $http
        .post(configs.apiEndpoint + '/v1/admin/agent/delete/' + agentId, data)
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

    var _getSettings = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/settings/agent')
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
        .post(configs.apiEndpoint + '/v1/admin/settings/agent', setting)
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

    var _getCities = function() {
      var config = AuthenticationService.GetHeaderWithAuth();
      var deferred = $q.defer();
      $http
        .get(configs.apiEndpoint + '/v1/admin/cities')
        .then(function(response) {
          if (response.data.cities) {
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

    service.GetAgentList = _getAgentList;
    service.UpdateAgent = _updateAgent;
    service.GetAgentById = _getAgentById;
    service.DeleteAgentById = _deleteAgentById;
    service.GetSettings = _getSettings;
    service.UpdateSetting = _updateSetting;
    service.GetCities = _getCities;

    return service;
  }
]);
