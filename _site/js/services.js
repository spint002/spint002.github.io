angular.module('starter.services', [])
  
  .factory('ScoreFactory', function() {

    var scores = [];
    var scoreStore = localStorage.getItem("scores");
    if (scoreStore != null && scoreStore != '' && angular.isArray(angular.fromJson(scoreStore))) {
      scores = angular.fromJson(scoreStore);
    }
    var scoreSrv = {
      setList: function(newList) {
        scores = newList;
        localStorage.setItem("scores", angular.toJson(scores));
        return true;
      },
      getList: function() {
        if (scores != null) {
          return scores;
        } else {
          return [];
        }
      }
    };
    return scoreSrv;
  })
;