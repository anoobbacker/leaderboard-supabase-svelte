<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import { supabase } from '../supabaseClient'
    import type { AuthSession } from '@supabase/supabase-js'
    import { storeTournament, storeLoggedUID } from "../store";
    import {GameTournaments, team2LetterAcronym, teamNameAcronymn} from "../config";
    import Sorry from './Sorry.svelte';
    import Loading from './Loading.svelte';
  
    export let session: AuthSession
    
    let response = {
      tournamentsData: null,
      resultData: null,
      predictData: null,
      processed: false,
      changePredict: {},
      matchDatetime: {},
    };

    let uuid;
    let usub1 = storeLoggedUID.subscribe(value => {
      uuid = value;
    });

    let tournament;
    let usub2 = storeTournament.subscribe(value => {
      tournament = value;
    });

    function loadDataFromSupabase() {
      const getResults = async () => {
        try {
          {
              const { data, error, status } = await supabase
                .from('results')
                .select('matchnumber, teama, teamb, status, matchdate')
                .eq('tournament', tournament.name)
                .neq('status','Complete')
                .order('matchnumber', {ascending: true})
                .limit(10)
                  
              if (error && status !== 406) throw error
              response.resultData = data;
            }
            {
              const { data, error, status } = await supabase
                .from('predicts')
                .select('matchnumber, resulta, resultb')
                .eq('tournament', tournament.name)
                .eq('participant', uuid)
                .order('matchnumber', {ascending: true})
                  
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
        response.resultData.forEach((result) => {
          let datetimeString: Date = new Date(result.matchdate.replace("-","").trim() + " GMT+0530")
          let matchnumber: number = result.matchnumber;
          response.matchDatetime[matchnumber] = datetimeString; //used to disable the button
          //console.log("Date", matchnumber, datetimeString)
        });

        response.predictData.forEach((result) => {
          let matchnumber: number = result.matchnumber;
          let resultTeamA: any = (result.resulta == null) ? '' : result.resulta;
          let resultTeamB: any = (result.resultb == null) ? '' : result.resultb;
          response.changePredict[matchnumber] = {
            resulta: resultTeamA, //value retrieved from DB but gets changed based on UI input
            resultb: resultTeamB, 
            last_resulta: result.resulta, //value retrieved from DB
            last_resultb: result.resultb,
            submit: false, //capture if value changed from last value, used for enabling button. 
            submitted: false, //capture if the changed value got saved
            haserror: false, //to indicated if the changed prediction has errors            
          }
          response.processed = true;
        })
        //console.log("Output: ", tournament, uuid, response);
      }).catch(console.log)      
    }

    onMount(() => {
      supabase.auth.getSession().then(({ data }) => {
        session = data.session
      })
  
      supabase.auth.onAuthStateChange((_event, _session) => {
        session = _session
      })

      //defaulting it to world cup 2022 as there are no multiple match prediction supported now.
      //TODO: This should be configurable or can be chosen by participants in case multiple predictions are happening
      storeTournament.set(GameTournaments.WorldCup2022);
      loadDataFromSupabase();      
    });

    onDestroy(() => {
      usub1();
      usub2();
    });

    
    let responseAddPredictData = {
      loading: false,
      statusMsg: '',
      status: -1,
      error: null,
      lastOperationStatus: '',
      processed: false,
    };
    
    function showToast()
    {
      const toastLiveExample = document.getElementById('liveToast')
      if (toastLiveExample) {
        const toast = new bootstrap.Toast(toastLiveExample)
        toast.show()
      }
    }

    const addPrediction = async (matchnumber) => {
          try {
            responseAddPredictData.loading = true;
            responseAddPredictData.processed = false;
            const { user } = session
    
            const row = {
              resulta: response.changePredict[matchnumber].resulta,
              resultb: response.changePredict[matchnumber].resultb,
            }
            //console.log("Inserting row:", row);
     
            const { data, error, status } = await supabase
              .from('predicts')
              .update(row)
              .eq('matchnumber', matchnumber)
            
            responseAddPredictData.status = status;
            responseAddPredictData.error = error;
      
            if (error && status !== 406) throw error
            responseAddPredictData.lastOperationStatus = 'Success';
            responseAddPredictData.statusMsg = 'Added the entry!'
            response.changePredict[matchnumber].submitted = true;
            showToast();
          } catch (error) {
            console.error("Error:", error);
            if (error instanceof Error) {
              responseAddPredictData.statusMsg = error.message;
            }
            responseAddPredictData.lastOperationStatus = 'Failed';
            response.changePredict[matchnumber].submitted = false;
          } finally {
            responseAddPredictData.loading = false
          }
    }

    function saveScore(matchnumber) {
      //console.log("Console:", matchnumber, response.changePredict[matchnumber]);
      showToast();
      const p1 = addPrediction(matchnumber);
      p1.then(() => {
        responseAddPredictData.processed = true;
        //console.log("Add prediction: ", responseAddPredictData, response)
      }).catch(console.log)
    }

    function scoreChanged(matchnumber) {
      let predict = response.changePredict[matchnumber]
      //console.log("Console:", matchnumber, predict);
      
      //check if it is old value if so no need to save
      if ( (predict.resulta == predict.last_resulta) 
          && (predict.resultb == predict.last_resultb) ) {
            //setting in the local varilable predict wasn't working.
            //hence setting in the main variable
            response.changePredict[matchnumber].haserror = false;
            response.changePredict[matchnumber].submit = false;
            response.changePredict[matchnumber].submitted = true;
      }

      //if both are not numbers don't turn on save button.
      if ( isNaN(predict.resulta) || isNaN(predict.resultb) 
            ||  (predict.resultb === '') 
            || (predict.resulta === '')
            || (predict.resulta === null)
            || (predict.resultb === null)) {
            response.changePredict[matchnumber].haserror = true;
      } else if ( (predict.resulta != predict.last_resulta) 
          || (predict.resultb != predict.last_resultb) ) {
          //if both are not numbers and was edited turn on save button      
            //setting in the local varilable predict wasn't working.
            //hence setting in the main variable
            response.changePredict[matchnumber].haserror = false;
            response.changePredict[matchnumber].submit = true;
            response.changePredict[matchnumber].submitted = false;
      }
      //console.log("Console:", matchnumber, response.changePredict[matchnumber]);
    }
  </script>
  
  <section id="predictions" class="container-fluid">
  {#if response.processed && (response.resultData.length > 0) && (response.predictData?.length > 0) }
    <h1 class="display-6 fw-bold">Predictions</h1>
    <p class="text-muted pt-3">Enter your predictions for upcoming matches (limited to a maximum of 10 matches.)</p>
    <table class="table table-condensed">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Match</th>
          <th scope="col">Predict</th>
          <th scope="col">...</th>
        </tr>
      </thead>
      <tbody>
        {#each response.resultData as result, index}
        {#if index < 10}
        <tr>
          <th scope="row">{result.matchnumber}</th>
          <td><img src={'/assets/img/country-flags-main/' + team2LetterAcronym[result.teama] + '.svg'} width='18px' alt="{result.teama}"/> {teamNameAcronymn[result.teama]}
            <br/><img src={'/assets/img/country-flags-main/' + team2LetterAcronym[result.teamb] + '.svg'} width='18px' alt="{result.teamb}"/> {teamNameAcronymn[result.teamb]}</td>
          <td class="col-4">
          {#if (result.status == 'Complete') || (Date.now() > response.matchDatetime[result.matchnumber])}
            {#if (response.predictData[result.matchnumber-1].resulta == null) || (response.predictData[result.matchnumber-1].resulta < 0)}
            ➖
            {:else}
            {response.predictData[result.matchnumber-1].resulta}
            {/if}
          {:else}
            <input 
              id="teama{result.matchnumber}" type="number" 
              class="form-control mb-1 {response.changePredict[result.matchnumber].haserror ? 'is-invalid' : response.changePredict[result.matchnumber].submit && !response.changePredict[result.matchnumber].submitted ? 'is-valid': ''}" 
              placeholder="{result.teama}" aria-label="Team A Precition" aria-describedby="basic-addon1"
              bind:value={response.changePredict[result.matchnumber].resulta} min=0 max=20
              on:change={() => scoreChanged(result.matchnumber)}
              on:keyup={() => scoreChanged(result.matchnumber)}
            >
          {/if}
          {#if (result.status == 'Complete') || (Date.now() > response.matchDatetime[result.matchnumber]) }
          {#if (response.predictData[result.matchnumber-1].resultb == null) || (response.predictData[result.matchnumber-1].resultb < 0)}
          ➖
          {:else}
          <br/>{response.predictData[result.matchnumber-1].resultb}
          {/if}
          {:else}
            <input 
              id="teamb{result.matchnumber}" type="number" 
              class="form-control {response.changePredict[result.matchnumber].submit && !response.changePredict[result.matchnumber].submitted ? 'is-valid': ''}"
              placeholder="{result.teamb}" aria-label="Team A Precition" aria-describedby="basic-addon2" 
              bind:value={response.changePredict[result.matchnumber].resultb} min=0 max=20
              on:change={() => scoreChanged(result.matchnumber)}
              on:keyup={() => scoreChanged(result.matchnumber)}
            >
            <div class="valid-feedback">
              Save score!
            </div>
            <div class="invalid-feedback">
              Invalid score!
            </div>
          {/if}
          </td>
          <td class="align-middle">
            {#if (result.status != 'Complete') && (Date.now() <= response.matchDatetime[result.matchnumber])}
            <button id="{result.matchnumber}" type="button" class="btn {response.changePredict[result.matchnumber].submit ? 'btn-primary' : 'btn-outline-dark'}" 
            on:click={() => saveScore(result.matchnumber)} disabled="{response.changePredict[result.matchnumber].submit === false}">Save</button>
            {:else if (result.status != 'Complete') }
            <!-- don't show save button, instead show that match is on-going -->
            ⏱
            {:else}
            <!-- don't show save button, instead show that match was completed -->
            ✔️
            {/if}             
          </td>
        </tr>
        {/if}
        {/each}
      </tbody>
    </table>
    <!-- Toast which shows the success status -->
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">🏆 Kotas Leaderboard</strong>
          <small>Few seconds ago</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {#if (responseAddPredictData.loading === true) }
          Adding your predictions...
          {:else if (responseAddPredictData.lastOperationStatus === 'Failed') }
          {responseAddPredictData.lastOperationStatus}: {responseAddPredictData.statusMsg}
          {:else if (responseAddPredictData.lastOperationStatus === 'Success') }
          Successfully added your prediction!
          {/if}
        </div>
      </div>
    </div>
  {:else if response.processed == false}
  <Loading />
  {:else if response.predictData?.length == 0}
  <Sorry />
  {/if}
</section>
  