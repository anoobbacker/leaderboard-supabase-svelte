<script lang="ts">
    import { supabase } from "../supabaseClient";
    import { onMount, onDestroy } from "svelte";
    import { storeCurrentPage, storeTournament, storeTournaments, storeParticipants, 
      storeLeaderboard, storeCountScorePlusWin, storeCountWins, 
      storeCountLost, storeMatchScorePlusWin, storeMatchWin, storeMatchLoss,
      storeTotalPredicts, storeAllGames, storeUpcomingGames, storeSortedLeaderNames, 
      storeGroups, storeCurrentGroup
    } from "../store";
    import {GameTournaments, team3To2LetterAcronym} from "../config";
    import {processData} from "../processPoints";
    import Sorry from './Sorry.svelte';
    import Header from "./Header.svelte";
    import Loading from "./Loading.svelte";

    let tournament;
    let usub1 = storeTournament.subscribe(value => {
      tournament = value;
    });

    let tournaments;
    let usub13 = storeTournaments.subscribe(value => {
      tournaments = value;
    });

    let participants;
    let usub14 = storeParticipants.subscribe(value => {
      participants = value;
    });

    let groups;    
    let usub15 = storeGroups.subscribe(value => {
      groups = value;
    });

    let upcomingGames;
    let usub2 = storeUpcomingGames.subscribe(value => {
      upcomingGames = value;
    });

    let sortedLeaderNames;
    let usub3 = storeSortedLeaderNames.subscribe(value => {
      sortedLeaderNames = value;
    });

    let allGames;
    let usub4 = storeAllGames.subscribe(value => {
      allGames = value;
    });

    let totalPredicts;
    let usub5 = storeTotalPredicts.subscribe(value => {
      totalPredicts = value;
    });

    let matchLoss;
    let usub6 = storeMatchLoss.subscribe(value => {
      matchLoss = value;
    });


    let matchScorePlusWin;
    let usub7 = storeMatchScorePlusWin.subscribe(value => {
      matchScorePlusWin = value;
    });

    let leaderboardLoadedOnce = false;
    let leaderboard;
    let usub8 = storeLeaderboard.subscribe(value => {
      leaderboard = value;
      if ( (Object.keys(leaderboard).length > 0) && (leaderboardLoadedOnce == false)) {
        leaderboardLoadedOnce = true;
      }
    });
    
    let countScorePlusWin;
    let usub9 = storeCountScorePlusWin.subscribe(value => {
      countScorePlusWin = value;
    });

    let countWins;
    let usub10 = storeCountWins.subscribe(value => {
      countWins = value;
    });
    
    let matchWin;
    let usub11 = storeMatchWin.subscribe(value => {
      matchWin = value;
    });

    let countLost;
    let usub12 = storeCountLost.subscribe(value => {
      countLost = value;
    });

    let response = {
      resultData: null,
      predictData: null,
      processed: false,
      loading: false,
    };

    
    let currentgroup;
    let usub16 = storeCurrentGroup.subscribe(value => {
      let lastvalue = currentgroup;
      currentgroup = value;
      //switchGroup(lastvalue);
      resetProcessedData();
    });

    function resetProcessedData() 
    {
      response.resultData = null;
      response.predictData = null;
      response.processed =  false;

      storeLeaderboard.set({})
      storeCountScorePlusWin.set({})
      storeCountWins.set({})
      storeCountLost.set({})
      storeMatchScorePlusWin.set({})
      storeMatchWin.set({})
      storeMatchLoss.set({})
      storeTotalPredicts.set({})
      storeAllGames.set([])
      storeUpcomingGames.set([])
      storeSortedLeaderNames.set([])
    }

    function switchGroup(grpName)
    {
      if (currentgroup === grpName) return;
      resetProcessedData();
      loadDataFromSupabase();
    }

    function switchTournament(e) {
      let clickedTournamet = e.target.text;
      if (tournament === clickedTournamet) return;
      resetProcessedData();
      if (clickedTournamet === GameTournaments.EuroCup2020.name) {
        storeTournament.set(GameTournaments.EuroCup2020);
      } else if (clickedTournamet === GameTournaments.WorldCup2018.name) {
        storeTournament.set(GameTournaments.WorldCup2018);
      } else if (clickedTournamet === GameTournaments.WorldCup2022.name) {
        storeTournament.set(GameTournaments.WorldCup2022);
      } else {
        return;
      }
      loadDataFromSupabase();
    }

    function loadDataFromSupabase() {
      const getResults = async () => {
        try {
            response.loading = true;
            {
              const { data, error, status } = await supabase
                .from('results')
                .select('matchnumber, teama, teamb, status, resulta, resultb')
                .eq('tournament', tournament.name)
                .order('matchnumber', {ascending: true})
                  
              if (error && status !== 406) throw error
              response.resultData = data;
            }
            {
              
              const { data, error, status } = await supabase
                .from('predicts')
                .select('matchnumber, participant, resulta, resultb')
                .eq('tournament', tournament.name)
                .order('matchnumber', {ascending: true})
                .order('participant', {ascending: true})
                .in('participant', groups[currentgroup])
                  
              if (error && status !== 406) throw error
              response.predictData = data;
            }
            //console.log("Output: ", tournament, response);
          } catch (error) {
            console.error("Error:", error);
          } finally {
            //no-op
          }
      }
      const p1 = getResults();
      p1.then(() => {
        processData(response.resultData, response.predictData, tournament.matchStages);
        response.processed = true;
        response.loading = false;
      }).catch((e) => {
        response.loading = false;
        console.log("Error: ", e)
      })
    }

    onMount(() => {
      //loadDataFromSupabase();
    })

    onDestroy(() => {
      usub1();
      usub2();
      usub3();
      usub4();
      usub5();
      usub6();
      usub7();
      usub8();
      usub9();
      usub10();
      usub11();
      usub12();
      usub13();
      usub14();
      usub15();
      usub16();
    });
</script>

{#if leaderboardLoadedOnce === false }
<Header 
  {tournaments}
  {switchTournament}
  {storeCurrentPage}
/>
{:else}
<hr class="pt-5 bg-white">
<div id="leaderboards" class="container-fluid">
  <ul class="nav justify-content-end gap-3 pt-5 pb-3 mb-3">
    {#if tournaments.length > 0}
    <li class="nav-item">
      <div class="dropdown">
        <a 
          class="dropdown-toggle btn btn-secondary" href="#leaderboards" 
          tabIndex="0" role="button" type="button"
          data-bs-toggle="dropdown" data-bs-target="#leaderboardDropdown" 
          aria-controls="leaderboardDropdown" aria-expanded="false" aria-label="Select tournament">
          View Leaderboard
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">{tournaments.length}
            <span class="visually-hidden">{tournaments.length} tournaments</span></span>
        </a>
        <div class="dropdown-menu shadow animated--grow-in" id="leaderboardDropdown"
        aria-labelledby="leaderboardDropdown">
          {#each tournaments as tName}
          <a class="dropdown-item" href="#leaderboards" on:click={switchTournament}>{tName.tournament}</a>
          {/each}
        </div>
      </div>
    </li>
    {/if}
    <li class="nav-item">
      <a type="button" class="btn btn-primary" href="#app" on:click={() => storeCurrentPage.set('Predict')}>Submit prediction</a>
    </li>
  </ul>
</div>
{/if}

<div class="container-fluid"> 
  {#if response.processed && (sortedLeaderNames.length > 0) && (Object.keys(participants).length > 0)}
  <!-- App features section-->
  <div class="pt-5 pb-5 mt-0">
    <div data-bs-spy="scroll" data-bs-target="#simple-list-example" data-bs-offset="0" 
        data-bs-smooth-scroll="true" class="scrollspy-example" tabIndex="0">
      <div class="section-heading text-center pt-3 pb-3">
        <h2>Leader Board - {tournament.name}</h2>
        <p class="text-muted">Leader board shows the overrall points of the participants.</p>
        <table class="table table-condensed ">
            <thead>
                <tr>
                    <th colSpan='2'>Name</th>
                    <th>Total Points</th>
                </tr>
            </thead>
            <tbody>
                {#each sortedLeaderNames as pName}
                <tr>
                  <td align="right">
                    <img class="rounded" src={participants[pName].avatar_url} alt="Avatar images" width="30" />
                  </td>
                  <td align="left">{participants[pName].full_name}</td>
                  <td class="text-center">
                    {#if totalPredicts.Total === 0}
                    📅
                    {/if}
                    <span  class={(totalPredicts.Total > 0) ? 'fw-bold' : 'visually-hidden'}>{leaderboard[pName]}</span><br/>
                    </td>
                </tr>              
                {/each}
            </tbody>                
        </table>
      </div>
  
      <div class="section-heading text-center pb-3">
        <h2>Leader Board break down</h2>
        <p class="text-muted">Shows the leader board details. To see all the predictions scroll down to 'All predictions' section.</p>
        <br/>
        <table class="table table-condensed">
          <thead>
              <tr><th colSpan='2'>Name</th><th>🎯Perfect scores</th>
                  <th>✅Only Winner</th><th>❌Lost</th>
              </tr>
          </thead>
          <tbody>
            {#each sortedLeaderNames as pName}
            <tr>
              <td align="right"><img class="rounded" src={participants[pName].avatar_url} alt="Avatar images" width="30" /></td>
              <td align="left">{participants[pName].full_name}</td>
              <td class="text-center">{countScorePlusWin[pName]}</td>
              <td class="text-center">{countWins[pName]}</td>
              <td class="text-center">{countLost[pName]}</td>
            </tr>
            {/each}
          </tbody>        
        </table>      
      </div>
  
      <div class="section-heading text-center pb-3">
        <h2>Match predictions</h2>
        <p class="text-muted">Breakup of the prediction made by participants for upcoming stage.</p>
        <br/>
        <table class="table table-condensed ">
                <thead>
                    <tr>
                        <th>Match</th>
                        <th colSpan='2'>Name</th>
                        <th>Predict</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {#each allGames as gameResult}
                      {#each Object.entries(gameResult.predict) as item, index}  
                        <tr>
                          {#if index === 0}
                            <td class="text-center" rowSpan={Object.keys(gameResult.predict)?.length}>
                              <span class={(gameResult.match.result == 'A-win') ? 'fw-bold' : 'fw-normal'}>
                                <img class="rounded" src={'/assets/img/country-flags-main/' + team3To2LetterAcronym[gameResult.match.teamA.name] + '.svg'} height='16px' alt="{gameResult.match.teamA.name}"/>
                                &nbsp;
                                {gameResult.match.teamA.name}({(gameResult.predict[item[0]]?.type !== '📅') ? gameResult.match.teamA.score : '📅'})
                              </span>
                              <br />
                              <span class={(gameResult.match.result == 'B-win') ? 'fw-bold' : 'fw-normal'}>
                                <img class="rounded" src={'/assets/img/country-flags-main/' + team3To2LetterAcronym[gameResult.match.teamB.name] + '.svg'} height='16px' alt="{gameResult.match.teamB.name}"/>
                                &nbsp;
                                {gameResult.match.teamB.name}({(gameResult.predict[item[0]]?.type !== '📅') ? gameResult.match.teamB.score : '📅'})</span>
                            </td>                          
                          {/if}
                          <td><img class="rounded" src={participants[item[0]].avatar_url} alt="Avatar images" width="30" /></td>
                          <td align="left">{participants[item[0]].full_name}</td>
                          {#if (gameResult.predict[item[0]]?.type !== '➖') && (gameResult.predict[item[0]]?.type !== '📅')}
                          <td class="text-center">
                              <span class={(gameResult.predict[item[0]].result == 'A-win') ? 'fw-bold' : 'fw-normal'}>{gameResult.match.teamA.name}({gameResult.predict[item[0]].teamA})</span><br />
                              <span class={(gameResult.predict[item[0]].result == 'B-win') ? 'fw-bold' : 'fw-normal'}>{gameResult.match.teamB.name}({gameResult.predict[item[0]].teamB})</span>
                          </td>
                          <td class="text-center">
                          {gameResult.predict[item[0]].type}{gameResult.predict[item[0]].points}
                          </td>
                          {:else}
                          <td class="text-center">{gameResult.predict[item[0]]?.type}</td>
                          <td class="text-center">{gameResult.predict[item[0]]?.type}</td>
                          {/if}                    
                        </tr>
                      {/each}
                    {/each}
                </tbody>                
            </table>       
      </div>
    </div>
  </div>
  {:else if (response.processed) && (sortedLeaderNames.length == 0)}
  <Sorry />
  {:else if (leaderboardLoadedOnce === true) && (response.loading == false)}
  <div class="cover-container d-flex text-center p-3 flex-column">
    <div class="row" >
      <div class="d-flex align-items-center">
        <div class="mx-auto">
          <p class="lead fs-6 mb-4"><i class="bi bi-justify"></i> No results shown. Click 'View Leadearboard'.</p>
        </div>
      </div>
    </div>
  </div>
  {:else if (response.processed === false) && (response.loading === true)}
  <Loading />
  {/if}
</div>