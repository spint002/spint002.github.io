angular.module('app.controllers', ['timer'])
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $q, 
                        $ionicPopup, $ionicPlatform, $ionicListDelegate, $timeout) { //todo: add $cordovaToast, 
  
  /*
    Local Storage variables:
      teamv = "teams_v4";
      'timer' , 'history'
  */
  
	// current storage version
	var teamv = "teams_v4";
	$scope.currNewScore = "new score: ";
	$scope.predicate = 'id';
	$scope.reverse = false;
	//$scope.sorting = { checked: false };
  $scope.timerRunning = false;
  $scope.timerLength = 60; //TODO store in localstorage
  $scope.showtimer = false; //start as false
  $scope.showtimerEdit = false; //start as false
  $scope.editMinutes = 1;
  $scope.editSeconds = 0;
  $scope.audioTimer; 
  $scope.history = []; //TODO store in localstorage
  
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
    console.log("init");
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
    if (timerStore)
      $scope.timerLength = timerStore;
    else
      $scope.timerLength = 60;
    
    // audio
    $scope.audioTimer = new Audio('/sounds/grenade.wav');
    
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
      $cordovaToast.show("Sorry, the max number of minutes is 59", 'short', 'center')
    }
    if ($scope.editSeconds > 59){
      $scope.editSeconds = 59;
      $cordovaToast.show("Sorry, the max number of seconds is 59", 'short', 'center')
    }
    $scope.timerLength = $scope.editMinutes*60 + $scope.editSeconds;
    $scope.showtimerEdit = ! $scope.showtimerEdit;
		localStorage.setItem('timer', $scope.timerLength);
    $timeout(function() {
        $scope.resetTimer();
    }, 10);
  };
  
  $scope.validateTimer = function() {
    //console.log($scope.editMinutes);
    //console.log($scope.editSeconds);
  };
  
  // called when timer reaches 0
  $scope.timerFinished = function (){    
      $scope.audioTimer.play(); //boom
  };
  
  $scope.toggleSort = function() {
    if($scope.reverse){	
			$scope.predicate = 'id';
			$scope.reverse = false;	
		}else{
			$scope.predicate = 'score';
			$scope.reverse = true;		
		}
	};
	
	$scope.plusOne = function(id) {
		var currTeam = getTeamById(id);
		currTeam.score += 1;
		localStorage.setItem(teamv, angular.toJson($scope.teams));
    $scope.saveHistory(id,1);
	};
	
	$scope.minusOne = function(id) {
		var currTeam = getTeamById(id);
		currTeam.score -= 1;
		localStorage.setItem(teamv, angular.toJson($scope.teams));
    $scope.saveHistory(id,-1);
	};

	// set all scores to 0
	$scope.clearAll = function() {
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
	 }
	
	// show popup to add more points
	$scope.addMultPoints = function(id) {
    $scope.data = {}
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
            $cordovaToast.show("Sorry, the max is 10,000", 'short', 'center')
				}else if(NTA < -10000){
            $cordovaToast.show("Sorry, the min is -10,000", 'short', 'center')
        } else {
					currTeam.score += NTA;	
					localStorage.setItem(teamv, angular.toJson($scope.teams));
          $scope.saveHistory(id,NTA);
				}
			}
		 });
	 }
	
	// add new team and assign color
	$scope.addTeam = function() {
		var	nextId = getNextId();
		$scope.teams.push({id: nextId, name: "Team"+nextId, score: 0, myClass: classes[(nextId-1)%9]});
		localStorage.setItem(teamv, angular.toJson($scope.teams));
	}
	
	$scope.deleteTeam = function(id) {
		var confirmPopup = $ionicPopup.confirm({
		 title: 'Remove Team',
		 template: 'Are you sure you want to remove this team?'
		});
		confirmPopup.then(function(res) {
		 if(res) {	
			var index = $scope.teams.indexOf(getTeamById(id));
			if (index > -1) {
				$scope.teams.splice(index, 1);
			}
			localStorage.setItem(teamv, angular.toJson($scope.teams));
		 } else {
		   //cancel or exit
		 }
		});
	}

  // save history
  $scope.saveHistory = function(id,score){    
    $scope.history.push({id: id, score: score});
    localStorage.setItem('history', angular.toJson($scope.history));
    
    // max length is 50 (for memory reasons)
    if ($scope.history.length > 50){
      $scope.history.shift();
      localStorage.setItem('history', angular.toJson($scope.history));
    }
  }
  
  // undo last score change
  $scope.undo = function(){
    if ($scope.history.length > 0){
      var lastmove = $scope.history.pop();
      var currTeam = getTeamById(lastmove.id);
      // in case the undo is for a team that no longer exists
      if (currTeam){
        currTeam.score -= lastmove.score;
        localStorage.setItem(teamv, angular.toJson($scope.teams));
      }
      localStorage.setItem('history', angular.toJson($scope.history));
    }
  }
  
})

.controller('AboutCtrl', function($scope) {
  $scope.html = "<a href='http://clevermonkeysoftware.com'>CleverMonkeySoftware.com</a>";
});

