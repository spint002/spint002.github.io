
angular.module('app', ['ionic', 'app.controllers']) //, 'ngCordova'

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', { //menu
    url: "/app",
    abstract: true,
    templateUrl: "views/menu.html"//,
    //controller: 'AppCtrl'
  })

  .state('app.main', {
    url: "/main",
    views: {
      'menuContent': {
        templateUrl: "views/main.html",
        controller: 'AppCtrl'
      }
    }
  })

  /*.state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "views/settings.html"
      }
    }
  })*/
  
  .state('app.help', {
    url: "/help",
    views: {
      'menuContent': {
        templateUrl: "views/help.html"//,
        //controller: 'HelpCtrl'
      }
    }
  })
  
  .state('app.about', {
    url: "/about",
    views: {
      'menuContent': {
        templateUrl: "views/about.html",
        controller: 'AboutCtrl'
      }
    }
  });
  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/main');
})

// for media plugin : http://plugins.cordova.io/#/package/org.apache.cordova.media
.factory('MediaSrv', function($q, $ionicPlatform, $window){
  var service = {
    loadMedia: loadMedia,
    getStatusMessage: getStatusMessage,
    getErrorMessage: getErrorMessage
  };

  function loadMedia(src, onError, onStatus, onStop){
    var defer = $q.defer();
    $ionicPlatform.ready(function(){
      var mediaSuccess = function(){
        if(onStop){onStop();}
      };
      var mediaError = function(err){
        _logError(src, err);
        if(onError){onError(err);}
      };
      var mediaStatus = function(status){
        if(onStatus){onStatus(status);}
      };

      if($ionicPlatform.is('android')){src = '/android_asset/www/' + src;}
      defer.resolve(new $window.Media(src, mediaSuccess, mediaError, mediaStatus));
    });
    return defer.promise;
  }

  function _logError(src, err){
    console.error('media error', {
      code: err.code,
      message: getErrorMessage(err.code)
    });
  }

  function getStatusMessage(status){
    if(status === 0){return 'Media.MEDIA_NONE';}
    else if(status === 1){return 'Media.MEDIA_STARTING';}
    else if(status === 2){return 'Media.MEDIA_RUNNING';}
    else if(status === 3){return 'Media.MEDIA_PAUSED';}
    else if(status === 4){return 'Media.MEDIA_STOPPED';}
    else {return 'Unknown status <'+status+'>';}
  }

  function getErrorMessage(code){
    if(code === 1){return 'MediaError.MEDIA_ERR_ABORTED';}
    else if(code === 2){return 'MediaError.MEDIA_ERR_NETWORK';}
    else if(code === 3){return 'MediaError.MEDIA_ERR_DECODE';}
    else if(code === 4){return 'MediaError.MEDIA_ERR_NONE_SUPPORTED';}
    else {return 'Unknown code <'+code+'>';}
  }

  return service;
})
;