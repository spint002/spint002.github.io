
angular.module('ngCordova', [
  'ngCordova.plugins'
]);

// link      :      https://github.com/brodysoft/Cordova-SQLitePlugin/blob/master/README.md

angular.module('ngCordova.plugins.sqlite', [])

  .factory('$cordovaSQLite', ['$q', '$window', function ($q, $window) {

    return {
      openDB: function (dbName, background) {

        if (typeof background === 'undefined') {
          background = 0;
        }

        return $window.sqlitePlugin.openDatabase({
          name: dbName,
          bgType: background
        });
      },

      execute: function (db, query, binding) {
        var q = $q.defer();
        db.transaction(function (tx) {
          tx.executeSql(query, binding, function (tx, result) {
              q.resolve(result);
            },
            function (transaction, error) {
              q.reject(error);
            });
        });
        return q.promise;
      },

      insertCollection: function (db, query, bindings) {
        var q = $q.defer();
        var coll = bindings.slice(0); // clone collection

        db.transaction(function (tx) {
          (function insertOne() {
            var record = coll.splice(0, 1)[0]; // get the first record of coll and reduce coll by one
            try {
              tx.executeSql(query, record, function (tx, result) {
                if (coll.length === 0) {
                  q.resolve(result);
                } else {
                  insertOne();
                }
              }, function (transaction, error) {
                q.reject(error);
                return;
              });
            } catch (exception) {
              q.reject(exception);
            }
          })();
        });
        return q.promise;
      },

      nestedExecute: function (db, query1, query2, binding1, binding2) {
        var q = $q.defer();

        db.transaction(function (tx) {
            tx.executeSql(query1, binding1, function (tx, result) {
              q.resolve(result);
              tx.executeSql(query2, binding2, function (tx, res) {
                q.resolve(res);
              });
            });
          },
          function (transaction, error) {
            q.reject(error);
          });

        return q.promise;
      },

      deleteDB: function (dbName) {
        var q = $q.defer();

        $window.sqlitePlugin.deleteDatabase(dbName, function (success) {
          q.resolve(success);
        }, function (error) {
          q.reject(error);
        });

        return q.promise;
      }
    };
  }]);
// install   :      cordova plugin add https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git
// link      :      https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin

angular.module('ngCordova.plugins.toast', [])

  .factory('$cordovaToast', ['$q', '$window', function ($q, $window) {

    return {
      showShortTop: function (message) {
        var q = $q.defer();
        $window.plugins.toast.showShortTop(message, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error);
        });
        return q.promise;
      },

      showShortCenter: function (message) {
        var q = $q.defer();
        $window.plugins.toast.showShortCenter(message, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error);
        });
        return q.promise;
      },

      showShortBottom: function (message) {
        var q = $q.defer();
        $window.plugins.toast.showShortBottom(message, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error);
        });
        return q.promise;
      },

      showLongTop: function (message) {
        var q = $q.defer();
        $window.plugins.toast.showLongTop(message, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error);
        });
        return q.promise;
      },

      showLongCenter: function (message) {
        var q = $q.defer();
        $window.plugins.toast.showLongCenter(message, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error);
        });
        return q.promise;
      },

      showLongBottom: function (message) {
        var q = $q.defer();
        $window.plugins.toast.showLongBottom(message, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error);
        });
        return q.promise;
      },


      show: function (message, duration, position) {
        var q = $q.defer();
        $window.plugins.toast.show(message, duration, position, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error);
        });
        return q.promise;
      }
    };

  }]);