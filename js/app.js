
angular.module('app', ['ionic', 'app.controllers']) //, 'ngCordova'

.run(function($ionicPlatform, $cordovaSplashscreen, $rootScope) {
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
 
    $rootScope.ismobile = function() {
      if (ionic.Platform.isWebView() || ionic.Platform.isIPad() || ionic.Platform.isIOS() ||
              ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone()){
        return true;
      }
      return false;      
    };
    
    setTimeout(function() {
        if ($rootScope.ismobile()){
          $cordovaSplashscreen.hide();
        }        
    }, 100);
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

;