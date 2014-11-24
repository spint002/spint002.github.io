//cd "C:\Users\Santiago Pintos\Documents\Android\adt-bundle-windows-x86_64\sdk\platform-tools\"
//.\adb.exe install "C:\Users\Santiago Pintos\Desktop\scorekeeper\platforms\android\ant-build\HelloCordova-debug.apk"

angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicPopover, $ionicModal, $timeout, $q, 
                        $ionicPopup, $ionicPlatform, $cordovaToast, $ionicListDelegate) { 
	
	// 9 possible colors
	var classes = ["item-positive item-icon-left itemScore",		// positive		(blue)
				   "item-assertive item-icon-left itemScore",		// assertive	(red)
				   "item-balanced item-icon-left itemScore",		// balanced		(green)
				   "item-energized item-icon-left itemScore",		// energized	(gold)
				   "item-royal item-icon-left itemScore",			// royal		(purple)
				   "item-stable item-icon-left itemScore",			// stable		(gray)
				   "item-dark item-icon-left itemScore",			// dark			(black)
				   "item-calm item-icon-left itemScore",			// calm			(aqua)
				   "item-light item-icon-left itemScore"   ];		// light		(white)
	
	// current storage version
	var teamv = "teams_v4";
	$scope.currNewScore = "new score: ";
	
	// Set initial team names (either from local storage or Team1, Team2, ...)
	var teams = [{ id: 1, name: "Team1", score: 0, myClass: classes[0]},
				 { id: 2, name: "Team2", score: 0, myClass: classes[1]},
				 { id: 3, name: "Team3", score: 0, myClass: classes[2]},
				 { id: 4, name: "Team4", score: 0, myClass: classes[3]}];
    var teamsStore = localStorage.getItem(teamv);
    if (teamsStore != null && teamsStore != '' && angular.isArray(angular.fromJson(teamsStore))) {
		$scope.teams = angular.fromJson(teamsStore);
    } else {
		$scope.teams = [ { id: 1, name: "Team1", score: 0, myClass: classes[0]},
						 { id: 2, name: "Team2", score: 0, myClass: classes[1]},
						 { id: 3, name: "Team3", score: 0, myClass: classes[2]},
						 { id: 4, name: "Team4", score: 0, myClass: classes[3]}];
	}
	$scope.predicate = 'id';
	$scope.reverse = false;
	$scope.sorting = { checked: false };
	
	$scope.toggleSort = function() {
		if($scope.sorting.checked){
			$scope.predicate = 'score';
			$scope.reverse = true;		
		}else{
			$scope.predicate = 'id';
			$scope.reverse = false;			
		}
	}
	
	$scope.plusOne = function(id) {
		var currTeam = getTeamById(id);
		currTeam.score += 1;
		localStorage.setItem(teamv, angular.toJson($scope.teams));
	};
	
	$scope.minusOne = function(id) {
		var currTeam = getTeamById(id);
		currTeam.score -= 1;
		localStorage.setItem(teamv, angular.toJson($scope.teams));
	};

	// set all scores to 0
	$scope.clearAll = function() {
		var confirmPopup = $ionicPopup.confirm({
		 title: 'Clear Scores',
		 template: 'Are you sure you want to set all scores to 0?'
		});
		confirmPopup.then(function(res) {
		 if(res) {	
			for(var i = 0; i < $scope.teams.length; i++) {
				$scope.teams[i].score = 0;
			}
			localStorage.setItem(teamv, angular.toJson($scope.teams));
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
				var NTA = parseInt(res);		
				if(NTA > 10000){
                    $cordovaToast.show("Sorry, the max is 10,000", 'short', 'center')
				}else if(NTA < -10000){
                    $cordovaToast.show("Sorry, the min is -10,000", 'short', 'center')
                } else {
					currTeam.score += NTA;	
					localStorage.setItem(teamv, angular.toJson($scope.teams));
				}
			}
		 });
	 }
	
	// this is only the temporary new score for show in the popup
	/*
	$scope.updateNewScore = function(tempNewScore) {
		var currTeam = getTeamById($scope.currTeamId);
		var temp = currTeam.score + parseInt(tempNewScore);
		if (temp == parseInt(currTeam.score + parseInt(tempNewScore)))
			$scope.currNewScore = "new score: "+ temp;
		else
			$scope.currNewScore = "new score: ";
	}*/
	
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
	
	// Help popover stuff
	$ionicPopover.fromTemplateUrl('popover.html', function(popover) {
		$scope.popover = popover;
	});
	
	// AD stuff
	$ionicPlatform.ready(function() {
		// on ready..
	});
})

;