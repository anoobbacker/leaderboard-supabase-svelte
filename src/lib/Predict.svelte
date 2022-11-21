<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import { supabase } from '../supabaseClient'
    import type { AuthSession } from '@supabase/supabase-js'
    import { storeTournament, storeLoggedUID } from "../store";
    import Sorry from './Sorry.svelte';
    import Loading from './Loading.svelte';
  
    export let session: AuthSession
    
    let response = {
      tournamentsData: null,
      resultData: null,
      predictData: null,
      processed: false,
      changePredict: {}
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
                .select('matchnumber, teama, teamb, status')
                .eq('tournament', tournament.name)
                .neq('teama', 'TBD')
                .neq('teamb', 'TBD')
                .order('matchnumber', {ascending: true})
                  
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
        response.processed = true;
        response.predictData.forEach((result, index) => {
          let matchnumber: number = result.matchnumber;
          let resultTeamA: any = (result.resulta == null) ? '' : result.resulta;
          let resultTeamB: any = (result.resultb == null) ? '' : result.resultb;
          response.changePredict[matchnumber] = {
            resulta: resultTeamA, 
            resultb: resultTeamB, 
            submit: false,
            last_resulta: result.resulta,
            last_resultb: result.resultb,
          }
        })
        console.log("Output: ", tournament, uuid, response);
      }).catch(console.log)      
    }

    onMount(() => {
      supabase.auth.getSession().then(({ data }) => {
        session = data.session
      })
  
      supabase.auth.onAuthStateChange((_event, _session) => {
        session = _session
      })

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
            showToast();
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
          } catch (error) {
            console.error("Error:", error);
            if (error instanceof Error) {
              responseAddPredictData.statusMsg = error.message;
            }
            responseAddPredictData.lastOperationStatus = 'Failed';
          } finally {
            responseAddPredictData.loading = false
          }
    }

    function saveScore(matchnumber) {
      //console.log("Console:", matchnumber, response.changePredict[matchnumber]);
      const p1 = addPrediction(matchnumber);
      p1.then(() => {
        responseAddPredictData.processed = true;
        //console.log("Add prediction: ", responseAddPredictData, response)
      }).catch(console.log)
    }

    function scoreChanged(matchnumber) {
      let predict = response.changePredict[matchnumber]
      //if both are not numbers don't turn on save button.
      if ( isNaN(predict.resulta) || isNaN(predict.resultb) 
            ||  (predict.resultb === '') 
            || (predict.resulta === '')) {
              return
      }
      //if both are not numbers and was edited turn on save button
      if ( (predict.resulta != predict.last_resulta) 
          || (predict.resultb != predict.last_resultb) ) {
            //setting in the local varilable predict wasn't working.
            //hence setting in the main variable
            response.changePredict[matchnumber].submit = true;
      }
      console.log("Console:", matchnumber, response.changePredict[matchnumber]);
    }
  </script>
  
  <section id="predictions" class="container-fluid">
  {#if response.processed && (response.resultData.length > 0) && (response.predictData?.length > 0) }
    <h1 class="display-6 fw-bold">Predictions</h1>
    <p class="text-muted pt-3">Enter your predictions for upcoming matches (limited to a maximum of 10 matches.)</p>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Team A</th>
          <th scope="col">Team B</th>
          <th scope="col">Predict A</th>
          <th scope="col">Predict B</th>
          <th scope="col">...</th>
        </tr>
      </thead>
      <tbody>
        {#each response.resultData as result, index}
        {#if index < 10}
        <tr>
          <th scope="row">{result.matchnumber}</th>
          <td>{result.teama}</td>
          <td>{result.teamb}</td>
          <td>
          {#if result.status == 'Complete'}
            {#if (response.predictData[result.matchnumber-1].resulta == null) || (response.predictData[result.matchnumber-1].resulta < 0)}
            ➖
            {:else}
            {response.predictData[result.matchnumber-1].resulta}
            {/if}
          {:else}
            <input 
              id="teama{result.matchnumber}" type="number" class="form-control" 
              placeholder="{result.teama}" aria-label="Team A Precition" aria-describedby="basic-addon1"
              bind:value={response.changePredict[result.matchnumber].resulta} min=0 max=20
              on:change={() => scoreChanged(result.matchnumber)}
            >
          {/if}
          </td>
          <td>
            {#if result.status == 'Complete'}
            {#if (response.predictData[result.matchnumber-1].resultb == null) || (response.predictData[result.matchnumber-1].resultb < 0)}
            ➖
            {:else}
            {response.predictData[result.matchnumber-1].resultb}
            {/if}
            {:else}
              <input 
                id="teamb{result.matchnumber}" type="number" class="form-control" 
                placeholder="{result.teamb}" aria-label="Team A Precition" aria-describedby="basic-addon1" 
                bind:value={response.changePredict[result.matchnumber].resultb} min=0 max=20
                on:change={() => scoreChanged(result.matchnumber)}
              >
            {/if}
          </td>
          <td>
            {#if result.status != 'Complete'}
            <button id="{result.matchnumber}" type="button" class="btn btn-dark" 
            on:click={() => saveScore(result.matchnumber)} disabled="{response.changePredict[result.matchnumber].submit === false}">Save</button>
            {:else}
            <button id="{result.matchnumber}" type="button" class="btn btn-dark" disabled>Save</button>
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
  