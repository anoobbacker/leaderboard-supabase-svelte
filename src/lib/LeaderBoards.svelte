<script lang="ts">
    import { supabase } from "../supabaseClient";
    import { onMount, onDestroy } from "svelte";
    import { storeCurrentPage, storeTournament, storeTournaments, storeParticipants, storeLeaderboard, storeCountScorePlusWin, storeCountWins, 
      storeCountLost, storeMatchScorePlusWin, storeMatchWin, storeMatchLoss,
      storeTotalPredicts, storeAllGames, storeUpcomingGames, storeSortedLeaderNames,
    } from "../store";
    import {GameTournaments, teamNameAcronymn, team2LetterAcronym, team3To2LetterAcronym} from "../config";
    import {processData} from "../processPoints";
    import Sorry from './Sorry.svelte';

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


    let leaderboard;
    let usub8 = storeLeaderboard.subscribe(value => {
      leaderboard = value;
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
    };

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
      //console.log("switchTournament: ", tournament.name)
      loadDataFromSupabase();
    }

    function loadDataFromSupabase() {
      const getResults = async () => {
        try {
            {
              const { data, error, status } = await supabase
                .from('results')
                .select('tournament, matchnumber, teama, teamb, status, resulta, resultb')
                .eq('tournament', tournament.name)
                .order('matchnumber', {ascending: true})
                  
              if (error && status !== 406) throw error
              response.resultData = data;
            }
            {
              const { data, error, status } = await supabase
                .from('predicts')
                .select('tournament, matchnumber, participant, resulta, resultb')
                .eq('tournament', tournament.name)
                .order('matchnumber', {ascending: true})
                  
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
      }).catch(console.log)
    }

    onMount(() => {
      loadDataFromSupabase();
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
    });
</script>

{#if response.processed && (sortedLeaderNames.length > 0)}
<!-- App features section-->
<section id="leaderboards" class="mt-0">
  <aside class="text-center mb-2">
    <div class="container">
      <div class="h2 fs-3 text-black mb-4">Click the button to view other tournaments!</div>
      <div class="d-flex flex-column flex-lg-row align-items-center justify-content-center gap-3">
        <div id="simple-list-example" class="dropdown simple-list-example-scrollspy">
            <a 
              class="btn btn-secondary dropdown-toggle" href="#leaderboards" 
              tabIndex="0" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              View Leaderboard
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
3
                <span class="visually-hidden">3 tournaments</span></span>
            </a>
            <ul class="dropdown-menu">
              {#each tournaments as tName}
              <li><a class="dropdown-item" href="#leaderboards" on:click={switchTournament}>{tName.tournament}</a></li>
              {/each}
            </ul>
        </div>
        <button type="button" class="btn btn-primary" on:click={() => storeCurrentPage.set('Predict')}>Submit prediction</button>
      </div>
    </div>
  </aside>

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
                  <div class={(totalPredicts.Total > 0) ? 'visually-hidden' : 'visually-hidden'}>
                    🎯({countScorePlusWin[pName]}), 
                    ✅({countWins[pName]}), 
                    ❌({countLost[pName]})
                  </div>
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
</section>
{:else if (response.processed) && (sortedLeaderNames.length == 0)}
<Sorry />
{/if}