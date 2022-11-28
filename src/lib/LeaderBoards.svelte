<script lang="ts">
    import { supabase } from "../supabaseClient";
    import { onMount, onDestroy } from "svelte";
    import { storeCurrentPage, storeTournament, storeTournaments, storeParticipants, 
      storeLeaderboard, storeCountScorePlusWin, storeCountWins, 
      storeCountLost, storeMatchScorePlusWin, storeMatchWin, storeMatchLoss,
      storeTotalPredicts, storeAllGames, storeUpcomingGames, storeSortedLeaderNames, 
      storeGroups, storeCurrentGroup, storeCurrentStage
    } from "../store";
    import {GameTournaments, team3To2LetterAcronym} from "../config";
    import {processData} from "../processPoints";
    import Sorry from './Sorry.svelte';
    import Header from "./Header.svelte";
    import Loading from "./Loading.svelte";
    import LeaderBoardAllMatches from "./LeaderBoardAllMatches.svelte";
    import LeaderBoardSummary from "./LeaderBoardSummary.svelte";
    import LeaderBoardBreakdown from "./LeaderBoardBreakdown.svelte";

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

    
    let currentStage: number;
    let usub17 = storeCurrentStage.subscribe(value => {
      currentStage = value;
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
      usub17();
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
      <a type="button" class="btn btn-primary" href="#app" on:click={() => storeCurrentPage.set('Predict')}>My prediction</a>
    </li>
  </ul>
</div>
{/if}

<div class="container-fluid"> 
  {#if response.processed && (sortedLeaderNames.length > 0) && (Object.keys(participants).length > 0)}
  <!-- App features section-->
  <div class="pt-5 pb-5 mt-0">
    <LeaderBoardSummary 
      {tournament}
      {participants}
      {sortedLeaderNames}
      {totalPredicts}
      {leaderboard}
    />
  
    <LeaderBoardBreakdown 
      {sortedLeaderNames}
      {participants}
      {countScorePlusWin}
      {countWins}
      {countLost}
    />
    
    <LeaderBoardAllMatches 
      {allGames}
      {participants}
      {tournament}
      {currentStage}
    />
  </div>
  {:else if (response.processed) && (sortedLeaderNames.length == 0)}
  <Sorry />
  {:else if (leaderboardLoadedOnce === true) && (response.loading == false)}
  <div class="cover-container d-flex text-center p-3 flex-column">
    <div class="row" >
      <div class="d-flex align-items-center">
        <div class="mx-auto">
          <p class="lead fs-6 mb-4"><i class="bi bi-justify"></i> No results shown. Click 'View Leaderboard'.</p>
        </div>
      </div>
    </div>
  </div>
  {:else if (response.processed === false) && (response.loading === true)}
  <Loading />
  {/if}
</div>