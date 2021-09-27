'use strict';

angular
  .module('gasAdmin')
  .factory('rememberMeService', function() {
    function fetchValue(name) {
      var gCookieVal = document.cookie.split('; ');
      for (var i = 0; i < gCookieVal.length; i++) {
        // a name/value pair (a crumb) is separated by an equal sign
        var gCrumb = gCookieVal[i].split('=');
        if (name === gCrumb[0]) {
          var value = '';
          try {
            value = angular.fromJson(gCrumb[1]);
          } catch (e) {
            value = unescape(gCrumb[1]);
          }
          return value;
        }
      }
      // a cookie with the requested name does not exist
      return null;
    }
    return function(name, values) {
      if (arguments.length === 1) return fetchValue(name);
      var cookie = name + '=';
      if (typeof values === 'object') {
        var expires = '';
        cookie +=
          typeof values.value === 'object'
            ? angular.toJson(values.value) + ';'
            : values.value + ';';
        if (values.expires) {
          var date = new Date();
          date.setTime(date.getTime() + values.expires * 24 * 60 * 60 * 1000);
          expires = date.toGMTString();
        }
        cookie += !values.session ? 'expires=' + expires + ';' : '';
        cookie += values.path ? 'path=' + values.path + ';' : '';
        cookie += values.secure ? 'secure;' : '';
      } else {
        cookie += values + ';';
      }
      document.cookie = cookie;
    };
  })
  .factory('fileReader', function($q, $log) {
    var onLoad = function(reader, deferred, scope) {
      return function() {
        scope.$apply(function() {
          deferred.resolve(reader.result);
        });
      };
    };

    var onError = function(reader, deferred, scope) {
      return function() {
        scope.$apply(function() {
          deferred.reject(reader.result);
        });
      };
    };

    var onProgress = function(reader, scope) {
      return function(event) {
        scope.$broadcast('fileProgress', {
          total: event.total,
          loaded: event.loaded
        });
      };
    };

    var getReader = function(deferred, scope) {
      var reader = new FileReader();
      reader.onload = onLoad(reader, deferred, scope);
      reader.onerror = onError(reader, deferred, scope);
      reader.onprogress = onProgress(reader, scope);
      return reader;
    };

    var readAsDataURL = function(file, scope) {
      var deferred = $q.defer();

      var reader = getReader(deferred, scope);
      reader.readAsDataURL(file);

      return deferred.promise;
    };

    return {
      readAsDataUrl: readAsDataURL
    };
  });
