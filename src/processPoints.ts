import {teamNameAcronymn} from "./config";
import {storeLeaderboard, storeCountScorePlusWin, storeCountWins, 
  storeCountLost, storeMatchScorePlusWin, storeMatchWin, storeMatchLoss,
  storeTotalPredicts, storeAllGames, storeUpcomingGames, storeSortedLeaderNames,
  storeCurrentStage
} from "./store";


export function processData(matchResults, predictionResults, matchStages): void
{
  var leaderboard = {};
  var leaderboardPredictScorePlusWinnerGameCount = {};
  var leaderboardPredictWinnerGameCount = {};
  var leaderboardPredictLossesGameCount = {};
  var leaderboardPredictMatchesScorePlusWinner = {};
  var leaderboardPredictMatchesWinner = {};
  var leaderboardPredictMatchesLost = {};
  
  var leaderboardTotalPredicts = {};
  var allPredictions = [];
  var upcomingPredictions = [];
  var leaderboardCatalog = [];
  var keyOptions = [];


  //iterate through the matchStages defined under config.js
  //and initalize the keyOptions
  matchStages.forEach((value, index, array) => {
      if (keyOptions.length === 0) {
        keyOptions.push("Participant"); //index 0
        keyOptions.push("Total points"); //index 1
        keyOptions.push("Total score predict matches"); //index 2
        keyOptions.push("Total winner predict matches"); //index 3
        keyOptions.push("Total predict lost matches"); //index 4
        keyOptions.push("Total number of matches"); //index 5
      }
  
      //add these to every stages in the matchStages
      keyOptions.push(value['Desc'] + " points");
      keyOptions.push(value['Desc'] + " score predict matches");
      keyOptions.push(value['Desc'] + " winner predict matches");
      keyOptions.push(value['Desc'] + " predict lost matches");    
    })    

  //find the active stage rounds of the matches
  //stage number starts from 1, after processing if 
  //activeStageMatchNumber is zero that means all the matches
  //are completed.
  let activeStageMatchNumber = 0;
  let activeStage = matchStages.length;
  let activeStageYetToStart = false;
  let activeStageYetToEnd = false;
  let tournamentStillOn = false;
  let today = new Date();
  //console.log("processPoints: ", matchStages);
  for (var i = 0; i < matchStages.length; i++) {
    let dDiffEndDate = Date.parse(matchStages[i].StageEndDate) - today.getTime();
    let diffDaysEndDate = Math.ceil(dDiffEndDate / (1000 * 3600 * 24));

    let dDiffStartDate = Date.parse(matchStages[i].StageEndDate) - today.getTime();
    let diffDaysStartDate = Math.ceil(dDiffStartDate / (1000 * 3600 * 24));

    //if diffDays is -ve that means match was completed.
    //if diffDays is zero or +ve that means match is yet to happen.
    if (diffDaysEndDate >= 0) {
      activeStageMatchNumber = matchStages[i].StartMatchNumber;
      activeStage = matchStages[i].Stage;

      //set flag to indicate if tournament is still running.
      tournamentStillOn = true;
      activeStageYetToEnd = true;

      if (diffDaysStartDate >= 0 ) {
        activeStageYetToStart = true;
      }
      break;
    }
  }

  matchResults.forEach((matchResult,matchResultIndex) => {
    //actual result
    let matchResultEval = allPredictions[matchResultIndex]?.match;

    let matchResultTeamAName = (matchResult.teama === "") ? "TBD" : matchResult.teama;
    let matchResultTeamBName = (matchResult.teamb === "") ? "TBD" : matchResult.teamb;
    
    let teamAName = teamNameAcronymn[matchResultTeamAName];
    let teamBName = teamNameAcronymn[matchResultTeamBName];
    
    //TODO: new match flag is used to populate allpredictions & upcoming matches
    //This logic needs to change as we depend a lot on array index to find new match.
    let matchResultTeamAScore = matchResult.resulta;
    let matchResultTeamBScore = matchResult.resultb;
    let matchResultStatus = matchResult.status;
    let isUpcoming = false;
    if ("Complete".localeCompare(matchResultStatus) === 0) {
      if (matchResultTeamAScore > matchResultTeamBScore) {
        matchResultEval = {
            teamA: {name: teamAName, score: matchResultTeamAScore, result: 'win'},
            teamB: {name: teamBName, score: matchResultTeamBScore, result: 'lost'},
            result: 'A-win'
        }
      } else if (matchResultTeamAScore < matchResultTeamBScore) {
        matchResultEval = {
            teamA: {name: teamAName, score: matchResultTeamAScore, result: 'lost'},
            teamB: {name: teamBName, score: matchResultTeamBScore, result: 'win'},
            result: 'B-win'
        }          
      } else {
        matchResultEval = {
            teamA: {name: teamAName, score: matchResultTeamAScore, result: 'draw'},
            teamB: {name: teamBName, score: matchResultTeamBScore, result: 'draw'},
            result: 'draw'
        }            
      }
    } else {
      var matchDateDiff = Math.abs(Date.parse(matchResultStatus.trim()) - (new Date()).getTime());
      var diffDays = Math.ceil(matchDateDiff / (1000 * 3600 * 24));
      //if the match is going to happen in the next x days 
      //show that in upcoming section.
      let notComplete = '❌'
      if (diffDays <= 2) {
        isUpcoming = true;
        notComplete = '📅';
      } else if ( ((matchResultIndex+1) >= activeStageMatchNumber) 
            && ((activeStageYetToStart === true) 
            || (activeStageYetToEnd === true))
        ) {
        isUpcoming = true;
        notComplete = '📅';
      }
      matchResultEval = {
        teamA: {name: teamAName},
        teamB: {name: teamBName},
        result: notComplete
      };
    }

    //set match result only once.
    allPredictions[matchResultIndex] = { 
        match: matchResultEval,
        predict: {} 
    };
    
    if (isUpcoming && tournamentStillOn) {
        upcomingPredictions[matchResultIndex] = { 
            match: matchResultEval,
            predict: {} 
        };
    }
  });

  let lastMatchNo = 0;
  let newMatch = false;
  
  for (var i = predictionResults.length - 1; i >= 0; i--) {
    let row = predictionResults[i];
    let currentMatchNo = row.matchnumber;
     
    //set the current match stage by reading stages defined in config.js
    //set default currentMatchStage to last match stage to ensure that if we
    //don't match the if-condition inside for loop, it means last stage.
    let currentMatchStage = matchStages.length - 1;
    for (var x = 0; x < matchStages.length; x++) {
      if (currentMatchNo < matchStages[x].StartMatchNumber) {
        currentMatchStage = matchStages[x].Stage - 1;
        break;
      }
    }

    //name
    var participantName = row.participant;

    //actual result
    var matchResultEval = allPredictions[currentMatchNo-1]?.match;
    let matchResultTeamAScore = matchResultEval.teamA.score;
    let matchResultTeamBScore = matchResultEval.teamB.score;

    //predict
    var predictTeamAScore = row.resulta;
    var predictTeamBScore = row.resultb;
    var predictEval = {};  

    //points
    var predictPoints = matchStages[currentMatchStage].LostPoints;

    if ((0 === predictTeamAScore?.length) && (0 === predictTeamBScore?.length)) {
      //upcoming prediction
      predictEval = {
          type: '📅'
      }
    } else if ((-1 === predictTeamAScore) && (-1 === predictTeamBScore)) {
      //skipped prediction
      predictEval = {
          type: '➖'
      }
    } else if ( (null === predictTeamAScore) || isNaN(predictTeamAScore) ||
                (null === predictTeamBScore) || isNaN(predictTeamBScore)) {
      if ( matchResultEval.result === '📅' ) {
        predictEval = {
          type: '📅'
        }
      } else {
        predictEval = {
          type: '➖'
        }
      }
    } else if ((matchResultTeamAScore === predictTeamAScore) &&
      (matchResultTeamBScore === predictTeamBScore)) {
      //Perfect prediction
      predictPoints = matchStages[currentMatchStage].ScoreAndWinnerPoints;
      predictEval = {
          type: '🎯', result: matchResultEval?.result, 
          teamA: predictTeamAScore, teamB: predictTeamBScore,
          points: predictPoints
      }  
    } else if ((matchResultTeamAScore === matchResultTeamBScore) &&
      (predictTeamAScore === predictTeamBScore)) {
      //Only predicted the winner but score wasn't correct.
      predictPoints = matchStages[currentMatchStage].WinnerOnlyPoints;
      predictEval = {
          type: '🔺', result: matchResultEval?.result, 
          teamA: predictTeamAScore, teamB: predictTeamBScore,
          points: predictPoints
      }
    } else if ((matchResultTeamAScore > matchResultTeamBScore) &&
      (predictTeamAScore > predictTeamBScore)) {
      //Only predicted the winner but score wasn't correct.
      predictPoints = matchStages[currentMatchStage].WinnerOnlyPoints;
      predictEval = {
          type: '🔺', result: matchResultEval?.result, 
          teamA: predictTeamAScore, teamB: predictTeamBScore,
          points: predictPoints
      }        
    } else if ((matchResultTeamAScore < matchResultTeamBScore) &&
      (predictTeamAScore < predictTeamBScore)) {
      //Only predicted the winner but score wasn't correct.
      predictPoints = matchStages[currentMatchStage].WinnerOnlyPoints;
      predictEval = {
          type: '🔺', result: matchResultEval?.result, 
          teamA: predictTeamAScore, teamB: predictTeamBScore,
          points: predictPoints
      }        
    } else {
      //Not needed as variable is initalized but added for clarity
      predictPoints = matchStages[currentMatchStage].LostPoints;
      if (predictTeamAScore > predictTeamBScore) {
          predictEval = {
              type: '🔻', result: 'A-win', 
              teamA: predictTeamAScore, teamB: predictTeamBScore,
              points: predictPoints
          }
      } else if (predictTeamAScore < predictTeamBScore) {
          predictEval = {
              type: '🔻', result: 'B-win', 
              teamA: predictTeamAScore, teamB: predictTeamBScore,
              points: predictPoints
          }
      } else {
          predictEval = {
              type: '🔻', result: 'draw', 
              teamA: predictTeamAScore, teamB: predictTeamBScore,
              points: predictPoints
          }
      }
    }

    //whether match is complete or not initialize leaderboard
    if (!(participantName in leaderboard)) {
      leaderboard[participantName] = 0;
      leaderboardPredictScorePlusWinnerGameCount[participantName] = 0;
      leaderboardPredictWinnerGameCount[participantName] = 0;
      leaderboardPredictLossesGameCount[participantName] = 0;
      leaderboardPredictMatchesScorePlusWinner[participantName] = [];
      leaderboardPredictMatchesWinner[participantName] = [];
      leaderboardPredictMatchesLost[participantName] = [];
      leaderboardTotalPredicts[participantName] = 0;
      if (!('Total' in leaderboardTotalPredicts)) {
          leaderboardTotalPredicts['Total'] = 0;      
      }
    }

    //if match got completed
    if (matchResultEval.result !== '📅') {
      leaderboard[participantName] += predictPoints;

      if (predictPoints >= matchStages[currentMatchStage].WinnerOnlyPoints) {
        leaderboardPredictWinnerGameCount[participantName] += 1;
        leaderboardPredictMatchesWinner[participantName].push(predictEval);
      }

      if (predictPoints === matchStages[currentMatchStage].ScoreAndWinnerPoints) {
        leaderboardPredictScorePlusWinnerGameCount[participantName] += 1;
        leaderboardPredictMatchesScorePlusWinner[participantName].push(predictEval);
      }

      if (predictPoints === matchStages[currentMatchStage].LostPoints) {
        leaderboardPredictLossesGameCount[participantName] += 1;
        leaderboardPredictMatchesLost[participantName].push(predictEval);
      }

      updateLeaderBoardCatalog(keyOptions, participantName, predictPoints, 
          currentMatchStage, matchStages, leaderboardCatalog);
    } else {
      predictEval = {
          type: '📅'
      }
    }
    
    //add particpant's prediction.
    allPredictions[currentMatchNo-1].predict[participantName] = predictEval;
    if ((matchResultEval.result === '📅') && tournamentStillOn) {
      upcomingPredictions[currentMatchNo-1].predict[participantName] = predictEval;
    }
    if ('📅' !== matchResultEval.result) {
      //increment the total predictions
      leaderboardTotalPredicts[participantName] += 1;
      leaderboardTotalPredicts['Total'] += 1;
    }      
  }

  var sortedLeaderboard = Object.keys(leaderboard) //Create a list from the keys of your map. 
    .sort( //Sort it ...
      function (a, b) { // using a custom sort function that...
        // compares (the keys) by their respective values.
        return leaderboard[b] - leaderboard[a];
  })


  //If active stage number will be final stage if the tournament is over.
  storeCurrentStage.set(activeStage);
  //console.log("Active Stage Number", activeStageMatchNumber);

  storeLeaderboard.set(leaderboard);
  //console.log("Leaderboard", leaderboard);
  
  //console.log("leaderboardPredictScorePlusWinnerGameCount", leaderboardPredictScorePlusWinnerGameCount)
  storeCountScorePlusWin.set(leaderboardPredictScorePlusWinnerGameCount);

  //console.log("leaderboardPredictWinnerGameCount", leaderboardPredictWinnerGameCount)
  storeCountWins.set(leaderboardPredictWinnerGameCount);

  //console.log("leaderboardPredictLossesGameCount", leaderboardPredictLossesGameCount)
  storeCountLost.set(leaderboardPredictLossesGameCount);

  //console.log("leaderboardPredictMatchesScorePlusWinner", leaderboardPredictMatchesScorePlusWinner)
  storeMatchScorePlusWin.set(leaderboardPredictMatchesScorePlusWinner);

  //console.log("leaderboardPredictMatchesWinner", leaderboardPredictMatchesWinner)
  storeMatchWin.set(leaderboardPredictMatchesWinner);

  //console.log("leaderboardPredictMatchesLost", leaderboardPredictMatchesLost)
  storeMatchLoss.set(leaderboardPredictMatchesLost);

  //console.log("leaderboardTotalPredicts", leaderboardTotalPredicts)
  storeTotalPredicts.set(leaderboardTotalPredicts);

  storeSortedLeaderNames.set(sortedLeaderboard);
  //console.log("sortedLeaderboard", sSortedLeaderNames)

  //console.log("upcomingPredictions", upcomingPredictions)
  storeUpcomingGames.set(upcomingPredictions);

  //console.log("allPredictions", allPredictions)
  storeAllGames.set(allPredictions);
}

function updateLeaderBoardCatalog(keyOptions, participantName, predictPoints, 
  currentMatchStage, matchStages, leaderboardCatalog) {

  checkAndInitialize(participantName, keyOptions, leaderboardCatalog);

  //find participantName in the array
  for (var i = 0; i < leaderboardCatalog.length; i++) {
    if (leaderboardCatalog[i][keyOptions[0]] === participantName) {
      var leaderBoardItem = leaderboardCatalog[i];
      
      //update total prediction points
      leaderBoardItem[keyOptions[1]] += predictPoints;

      //count correct score prediction
      if (predictPoints === matchStages[currentMatchStage].ScoreAndWinnerPoints) {
        leaderBoardItem[keyOptions[2]] += 1;
      }

      //count winner only predictions
      if (predictPoints >= matchStages[currentMatchStage].WinnerOnlyPoints) {
        leaderBoardItem[keyOptions[3]] += 1;
      }

      //count lost predictions
      if (predictPoints === matchStages[currentMatchStage].LostPoints) {
        leaderBoardItem[keyOptions[4]] += 1;
      }

      //update total number of matches
      leaderBoardItem[keyOptions[5]] += 1;

      matchStages.forEach(initializeStageLeaderBoards);

      function initializeStageLeaderBoards(value, index, array) {
        //stage points, prefect prediction, winner only & lost
        leaderBoardItem[value['Desc'] + " points"] += predictPoints;
        if (predictPoints === matchStages[currentMatchStage].ScoreAndWinnerPoints) {
          leaderBoardItem[value['Desc'] + " score predict matches"] += 1;
        }

        if (predictPoints >= matchStages[currentMatchStage].WinnerOnlyPoints) {
          leaderBoardItem[value['Desc'] + " winner predict matches"] += 1;
        }

        if (predictPoints === matchStages[currentMatchStage].LostPoints) {
          leaderBoardItem[value['Desc'] + " predict lost matches"] += 1;
        }
      }
    }
  }
}

function checkAndInitialize(pName, keyOptions, leaderboardCatalog) {
  var pFound = false;
  //find participantName in the array
  for (var i = 0; i < leaderboardCatalog.length; i++) {
    var leaderBoardItem = leaderboardCatalog[i];
    if (leaderBoardItem[keyOptions[0]] === pName) {
      pFound = true;
      break;
    }
  }

  if (pFound === false) {
    const pKeyName = keyOptions[0];
    const leaderBoardItem = {};
    leaderBoardItem[pKeyName] = pName;
    for (var k = 1; k < keyOptions.length; k++) {
      leaderBoardItem[keyOptions[k]] = 0;
    }
    leaderboardCatalog.push(leaderBoardItem);
  }
}