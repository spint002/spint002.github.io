angular.module('app.controllers', ['timer', 'toaster', 'ngCordova'])
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $q, 
                        $ionicPopup, $ionicPlatform, $ionicListDelegate, $timeout, toaster, $cordovaMedia) {
  
  /*
    Local Storage variables:
      teamv = "teams_v4";
      'timer' , 'history'
  */
  
  // current storage version
  var teamv = "teams_v4";
  $scope.currNewScore = "new score: ";
  $scope.sortstyle = 0;
  $scope.predicate = 'id';
  $scope.reverse = false;
  $scope.timerRunning = false;
  $scope.timerLength = 60; 
  $scope.showtimer = false; //start as false
  $scope.showtimerEdit = false; //start as false
  $scope.editMinutes = 1;
  $scope.editSeconds = 0;
  $scope.audioTimer; 
  $scope.history = []; 
  
  // 9 possible colors
  var classes = ["item-positive item-icon-left itemScore",		// positive		(blue)
                 "item-assertive item-icon-left itemScore",		// assertive	(red)
                 "item-balanced item-icon-left itemScore",		// balanced		(green)
                 "item-energized item-icon-left itemScore",		// energized	(gold)
                 "item-royal item-icon-left itemScore",			  // royal		(purple)
                 "item-stable item-icon-left itemScore",			// stable		(gray)
                 "item-dark item-icon-left itemScore",			  // dark			(black)
                 "item-calm item-icon-left itemScore",			  // calm			(aqua)
                 "item-light item-icon-left itemScore"   ];		// light		(white)
	
  // Set initial team names (either from local storage or Team1, Team2, ...)  
  $scope.init = function() {
    console.log("init main");
    // team scores
    var teamsStore = localStorage.getItem(teamv);
    if (teamsStore != null && teamsStore != '' && angular.isArray(angular.fromJson(teamsStore))) {
      $scope.teams = angular.fromJson(teamsStore);
    } else {
      $scope.teams = [ { id: 1, name: "Team1", score: 0, myClass: classes[0]},
             { id: 2, name: "Team2", score: 0, myClass: classes[1]},
             { id: 3, name: "Team3", score: 0, myClass: classes[2]},
             { id: 4, name: "Team4", score: 0, myClass: classes[3]}];
    }
    
    // get timer length from storage
    var timerStore = localStorage.getItem('timer');
    if (!isNaN(timerStore)){
      $scope.timerLength = timerStore;
      $scope.editMinutes = Math.floor(timerStore/60);
      $scope.editSeconds = timerStore%60;
    } else {
      $scope.timerLength = 60;
    }      
    
    // get history for undo fom storage
    var historyStore = localStorage.getItem('history');
    if (historyStore) {
      $scope.history = angular.fromJson(historyStore);
    }
      
  };
  
  $scope.init();	
  
  $scope.hideTimer = function (){
    $scope.stopTimer();
    $scope.showtimer = !$scope.showtimer;
  }
  
  $scope.startTimer = function (){
      toaster.pop('success', "Go!", "", 50);
      $scope.$broadcast('timer-start');
      $scope.timerRunning = true;
  };

  $scope.stopTimer = function (){
      $scope.$broadcast('timer-stop');
      $scope.timerRunning = false;
  };
  
  $scope.resetTimer = function (){
      $scope.$broadcast('timer-reset');
      $scope.timerRunning = false;     
  };
  
  $scope.saveTimer = function() {
    if ($scope.editMinutes > 59){
      $scope.editMinutes = 59;
    }
    if ($scope.editSeconds > 59){
      $scope.editSeconds = 59;
    }
    $scope.timerLength = $scope.editMinutes*60 + $scope.editSeconds;
    $scope.showtimerEdit = ! $scope.showtimerEdit;
	localStorage.setItem('timer', $scope.timerLength);
    $timeout(function() {
        $scope.resetTimer();
    }, 10);
  };
  
  // return true if timer values are valid (0-59). otherwise returns false.
  $scope.validateTimer = function() {
    return !($scope.editMinutes > 59 || $scope.editSeconds > 59 || $scope.editMinutes < 0 || 
             $scope.editSeconds < 0 || $scope.editSeconds+$scope.editMinutes == 0);
  };
  
  // called when timer reaches 0
  $scope.timerFinished = function (){          
     toaster.pop('warning', "Time\'s up!", "click to close", 8000);
     var audio = new Audio('./sounds/pager.mp3').play();
  };
  
  // toggle between: no sort, descending, or ascending. 
  $scope.toggleSort = function() {
    if(!$scope.reverse && $scope.predicate == 'score'){	
        $scope.sortstyle = 0; // NO sort
        $scope.predicate = 'id';
        $scope.reverse = false;	
    }else if (!$scope.reverse){  
        $scope.sortstyle = 1; // Descending
        $scope.predicate = 'score';
        $scope.reverse = true;	
    }else{
        $scope.sortstyle = 2;  // Ascending
        $scope.predicate = 'score';
        $scope.reverse = false;	
    }
  };

  // set all scores to 0
  $scope.clearAll = function() {
      //$scope.saveHistory('clearall',null,null,$scope.teams,null);
      var confirmPopup = $ionicPopup.confirm({
       title: 'Clear Scores',
       template: 'Are you sure you want to set all scores to 0? (you cannot undo this)'
      });
      confirmPopup.then(function(res) {
       if(res) {
          for(var i = 0; i < $scope.teams.length; i++) {
              $scope.teams[i].score = 0;
          }
          localStorage.setItem(teamv, angular.toJson($scope.teams));
          $scope.history = []; //erase history
          localStorage.setItem('history', angular.toJson($scope.history));
       } else {
         //cancel or exit
       }
      });
  };
	
  var getTeamById = function(id) {
      var t = null;
      if ($scope.teams != null) {
          for(var i = 0; i < $scope.teams.length; i++) {
              if ($scope.teams[i].id === id){
                  t = $scope.teams[i];
              }
          }
      } 
      return t;
  };
	
  // the next id to add will be the first missing slot
  // example: 
  // if ids are [1,2,5,12], next id will be 3.
  var getNextId = function() {
      var nextId = 1;
      var ids = [];
      for(var i = 0; i < $scope.teams.length; i++) {
          ids.push($scope.teams[i].id);
      }	
      ids = ids.sort(function(a, b){return a-b});
      var continu = true;
      for(var i = 0; i < ids.length && continu; i++) {
          if(ids[i] != i+1){
              nextId = i+1;
              continu = false;
          } else if(i+1 == ids.length) {
              nextId = i+2;
          }
      }
      return nextId;
  };
	
  // show popup for new name and save to storage
  $scope.showRename = function(id) {
      $scope.data = {}
      //Keyboard.show();
      //window.cordova.plugins.Keyboard.show();
      $ionicPopup.show({
         templateUrl: 'popup-template.html',
         title: 'Change Team Name',
         template: 'New Team name:',
         inputType: 'text',
         inputPlaceholder: 'Team',
         scope: $scope,
         buttons: [
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  return $scope.data.newName || true;
                }
              },
              { text: 'Cancel', 
                type: 'button-assertive',
                onTap: function(e) { return true; } },
            ]
       }).then(function(res) {
          if (res != true){
              var currTeam = getTeamById(id);
              if (res.length > 15)
                  res = res.substring(0,14)+"...";
              currTeam.name = res;	
              localStorage.setItem(teamv, angular.toJson($scope.teams));
              $ionicListDelegate.closeOptionButtons();
          }			
       });
   };
		
  $scope.plusMinusOne = function(id,qty) {
      var currTeam = getTeamById(id);
      currTeam.score += qty;
      localStorage.setItem(teamv, angular.toJson($scope.teams));
      $scope.saveHistory('score',id,currTeam.name,qty,null);
  };
  
  // show popup to add more points
  $scope.addMultPoints = function(id) {
      $scope.data = {};
      var currTeam = getTeamById(id);
      //$scope.updateNewScore(0);

      //Keyboard.show();
      //window.cordova.plugins.Keyboard.show();
      $ionicPopup.show({
       templateUrl: 'popup-template2.html',
		   title: 'Add/Subtract Points to '+currTeam.name,
		   template: 'Amount:',
		   inputType: 'number',
		   inputPlaceholder: 5,
           scope: $scope,
		   buttons: [
                { text: '<b>+</b>',
                  type: 'button-positive',
                  onTap: function(e) {
					return $scope.data.numToAdd || true;
                  }
                },
				{ text: '<b>-</b>',
                  type: 'button-balanced',
                  onTap: function(e) {
					return $scope.data.numToAdd*(-1) || true;
                  }
                },
                { text: 'Close', 
                  type: 'button-assertive',
				  onTap: function(e) { return true; } },
              ]
		 }).then(function(res) {
			//alert("res: "+res);
			if (typeof res === 'undefined'){
				//don't don anything (case of pressing back button instead of close)
			}else if (res != true){
				var NTA = parseInt(res);	//NumberToAdd	
				if(NTA > 10000){
                  //$cordovaToast.show("Sorry, the max is 10,000", 'short', 'center')
                  toaster.pop('warning', "Sorry, the max is 10,000", "");
				}else if(NTA < -10000){
                  //$cordovaToast.show("Sorry, the min is -10,000", 'short', 'center')
                  toaster.pop('warning', "Sorry, the min is -10,000", "");
                } else {
                  $scope.plusMinusOne(id,NTA);
				}
			}
		 });
	 };
	
  // add new team and assign color
  $scope.addTeam = function() {
      var	nextId = getNextId();
      $scope.teams.push({id: nextId, name: "Team"+nextId, score: 0, myClass: classes[(nextId-1)%9]});
      localStorage.setItem(teamv, angular.toJson($scope.teams));
      $scope.saveHistory('team',nextId,"Team"+nextId,0,null);
  }
	
  $scope.deleteTeam = function(id) {
      //var confirmPopup = $ionicPopup.confirm({
      // title: 'Remove Team',
      // template: 'Are you sure you want to remove this team?'
      //});
      //confirmPopup.then(function(res) {
      // if(res) {	
          var team = getTeamById(id);
          var index = $scope.teams.indexOf(team);
          if (index > -1) {
              $scope.teams.splice(index, 1);
          }
          localStorage.setItem(teamv, angular.toJson($scope.teams));
          $scope.saveHistory('team',id,team.name,team.score,team.myClass);
       //} else {
       //  //cancel or exit
       //}
      //});
  };

  // save history
  $scope.saveHistory = function(type,id,name,score,myclass){    
    $scope.history.push({type: type, id: id, name: name, score: score, myclass: myclass});
    // max length is 50 (for memory reasons)
    if ($scope.history.length > 50){
      $scope.history.shift();
    }
    // save
    localStorage.setItem('history', angular.toJson($scope.history));
  }
  
  // undo last change  
  // types: 
  //  'score'     : add or subtracted points
  //  'team'      : added or deleted team (score param is what score they had )
  //  'clearall'  : saves all team scores 
  $scope.undo = function(){
    if ($scope.history.length > 0){
      var lastmove = $scope.history.pop();
      var currTeam = getTeamById(lastmove.id);
      switch(lastmove.type) {
          case 'score':
              if (currTeam)
                currTeam.score -= lastmove.score;
              break;
          case 'team':
              if (currTeam){ //remove
                var index = $scope.teams.indexOf(currTeam);
                if (index > -1) {
                    $scope.teams.splice(index, 1);
                }
              } else { // add
                $scope.teams.push({id: lastmove.id, name: lastmove.name, score: lastmove.score, myClass: lastmove.myclass});
              }
              break;
          //case 'clearall':
          //    console.log(lastmove.score);
          //    for(var i = 0; i < lastmove.score.length; i++) {                
          //      $scope.teams[i].score = lastmove.score[i].score;
          //    }
          //    break;
          default:
              console.log("save History default..");
      }
      localStorage.setItem(teamv, angular.toJson($scope.teams));
      localStorage.setItem('history', angular.toJson($scope.history));
    }
  }
  
})

.controller('AboutCtrl', function($scope) {
  if($rootScope.ismobile() && !$rootScope.appversion){
    cordova.getAppVersion(function(version) {
       $rootScope.appversion = version;
     });
  }
  
  $scope.html = "<a href='http://clevermonkeysoftware.com'>CleverMonkeySoftware.com</a>";
});

