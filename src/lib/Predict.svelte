<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import { supabase } from '../supabaseClient'
    import type { AuthSession } from '@supabase/supabase-js'
    import { storeTournament, storeLoggedUID, addToast } from "../store";
    import {GameTournaments, team2LetterAcronym, teamNameAcronymn} from "../config";
    import Sorry from './Sorry.svelte';
    import Loading from './Loading.svelte';
    import Toasts from './Toasts.svelte';
  
    export let session: AuthSession
    
    let response = {
      resultData: null,
      predictData: null,
      processed: false,
      matchNumbers: [],
      changePredict: {},
      matchDatetime: {},
      flagName: {},
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
      let maxlimit = 10;
      const getResults = async () => {
        try {
          {
              const { data, error, status } = await supabase
                .from('results')
                .select('matchnumber, teama, teamb, status, matchdate')
                .eq('tournament', tournament.name)
                .neq('status','Complete')
                .neq('teama', 'TBD')
                .neq('teamb', 'TBD')
                .order('matchnumber', {ascending: true})
                .limit(maxlimit)
                  
              if (error && status !== 406) throw error
              response.resultData = data;
            }
          } catch (error) {
            console.error("Error:", error);
          } finally {
            //no-op
          }
      }
      const getPredicts = async () => {
        try {
            {

              //numeric sort
              response.matchNumbers.sort(function(a, b){return a - b});
              let upcomingMatchLen = response.matchNumbers.length;
              if ( upcomingMatchLen > 0 ) {
                let min = response.matchNumbers[0];
                let max = response.matchNumbers[upcomingMatchLen-1];

                const { data, error, status } = await supabase
                  .from('predicts')
                  .select('matchnumber, resulta, resultb')
                  .eq('tournament', tournament.name)
                  .eq('participant', uuid)
                  .gte('matchnumber', min)
                  .lte('matchnumber', max)
                  .order('matchnumber', {ascending: true})
                  .limit(maxlimit)
                    
                if (error && status !== 406) throw error
                response.predictData = data;
              }
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
          response.matchNumbers.push(matchnumber); //used in prediction query below.
          response.matchDatetime[matchnumber] = datetimeString; //used to disable the button
          let fa = (result.teama === '' ? 'TBD' : result.teama)
          let fb = (result.teamb === '' ? 'TBD' : result.teamb)
          response.flagName[matchnumber] = {
            teama: team2LetterAcronym[fa],
            teamb: team2LetterAcronym[fb],
          }
          response.changePredict[matchnumber] = {
              indb: false,
              resulta: null, //value retrieved from DB but gets changed based on UI input
              resultb: null, 
              last_resulta: null, //value retrieved from DB
              last_resultb: null,
              submit: false, //capture if value changed from last value, used for enabling button. 
              submitted: false, //capture if the changed value got saved
              avalidation: 'default', //to indicated if the changed prediction has errors
              bvalidation: 'default',
              response: {
                loading: false,
                statusMsg: '',
                status: -1,
                error: null,
                lastOperationStatus: '',
                processed: false,
              },
            };
        });
          
        const p2 = getPredicts();
        p2.then(() => {
          response.predictData.forEach((result) => {
            let matchnumber: number = result.matchnumber;
            let resultTeamA: number = result.resulta;
            let resultTeamB: number = result.resultb;
            response.changePredict[matchnumber] = {
              indb: true,
              resulta: resultTeamA, //value retrieved from DB but gets changed based on UI input
              resultb: resultTeamB, 
              last_resulta: resultTeamA, //value retrieved from DB
              last_resultb: resultTeamB,
              submit: false, //capture if value changed from last value, used for enabling button. 
              submitted: false, //capture if the changed value got saved
              avalidation: 'default', //to indicated if the changed prediction has errors
              bvalidation: 'default',
              response: {
                loading: false,
                statusMsg: '',
                status: -1,
                error: null,
                lastOperationStatus: '',
                processed: false,
              },
            };       
          })
          response.processed = true;
        }).catch(console.log)
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
    
    const addPrediction = async (mNum) => {
          try {
            response.changePredict[mNum].response.loading = true;
            response.changePredict[mNum].response.processed = false;
            const { user } = session
    
            const row = {
              matchnumber: mNum,
              resulta: response.changePredict[mNum].resulta,
              resultb: response.changePredict[mNum].resultb,
              tournament: tournament.name,
            }
     
            const { data, error, status } = await supabase
              .from('predicts')
              .upsert(row)
            
            response.changePredict[mNum].response.status = status;
            response.changePredict[mNum].response.error = error;
      
            if (error && status !== 406) throw error
            response.changePredict[mNum].submitted = true;
          } catch (error) {
            console.error("Error:", error);
            if (error instanceof Error) {
              response.changePredict[mNum].response.statusMsg = error.message;
            }
            response.changePredict[mNum].response.lastOperationStatus = 'failed';
            response.changePredict[mNum].submitted = false;
          } finally {
            response.changePredict[mNum].response.loading = false
          }
    }

    function saveScore(matchnumber) {
      //console.log("Console:", matchnumber, response.changePredict[matchnumber]);
      //show toast before triggerring
      response.changePredict[matchnumber].response.lastOperationStatus = 'info';
      response.changePredict[matchnumber].response.statusMsg = 'Adding the entry!'
      addToast({
        message: response.changePredict[matchnumber].response.statusMsg, 
        type: response.changePredict[matchnumber].response.lastOperationStatus, 
        dismissible: true, 
        timeout: 1000});

      //add prediction
      const p1 = addPrediction(matchnumber);

      //wait for the prediction to get added.
      p1.then(() => {
        response.changePredict[matchnumber].response.processed = true;
        response.changePredict[matchnumber].submit = false;
        response.changePredict[matchnumber].response.lastOperationStatus = "success";
        response.changePredict[matchnumber].response.statusMsg = 'Successfully added prediction!'
        addToast({
          message: response.changePredict[matchnumber].response.statusMsg, 
          type: response.changePredict[matchnumber].response.lastOperationStatus, 
          dismissible: true, 
          timeout: 3000});
        //console.log("Add prediction: ", responseAddPredictData, response)
      }).catch((error) => {
        response.changePredict[matchnumber].response.processed = true;
        response.changePredict[matchnumber].submit = false;
        response.changePredict[matchnumber].response.lastOperationStatus = "error";
        response.changePredict[matchnumber].response.statusMsg = 'Failed to add prediction!'
        addToast({
          message: response.changePredict[matchnumber].response.statusMsg, 
          type: response.changePredict[matchnumber].response.lastOperationStatus, 
          dismissible: true, 
          timeout: 3000});
        //console.log("Save score:", response.changePredict)
      })
      //console.log("Console:", matchnumber, response.changePredict[matchnumber]);
    }

    function increaseTeamAScore(matchnumber: number)
    {
      let resulta = response.changePredict[matchnumber]?.resulta;
      if ((resulta === "") || (resulta === null) ) {
        response.changePredict[matchnumber].resulta = 0;
      }      
      response.changePredict[matchnumber].resulta++;
      scoreChanged(matchnumber);
    }

    function increaseTeamBScore(matchnumber: number)
    {
      let resultb = response.changePredict[matchnumber]?.resultb;
      if ((resultb === "") || (resultb === null) ) {
        response.changePredict[matchnumber].resultb = 0;
      }
      response.changePredict[matchnumber].resultb++;
      scoreChanged(matchnumber);
    }

    function decreaseTeamAScore(matchnumber: number) {
      let resulta = response.changePredict[matchnumber]?.resulta;
      if ((resulta === "") || (resulta === null) ) {
        response.changePredict[matchnumber].resulta = 0;
      } else if (response.changePredict[matchnumber].resulta <= 0 ) {
        //skip as it will go negative.
      } else {
        response.changePredict[matchnumber].resulta--;
      }
      scoreChanged(matchnumber);
    }

    function decreaseTeamBScore(matchnumber: number) {
      let resultb = response.changePredict[matchnumber]?.resultb;
      if ((resultb === "") || (resultb === null) ) {
        response.changePredict[matchnumber].resultb = 0;
      } else if (response.changePredict[matchnumber].resultb <= 0 ) {
        //skip as it will go negative.
      } else {
        response.changePredict[matchnumber].resultb--;
      }
      scoreChanged(matchnumber);
    }

    function scoreChanged(matchnumber: number) {
      let predict = response.changePredict[matchnumber]
      //console.log("Console:", matchnumber, predict);
      
      //check if resulta has error.
      if ( predict.resulta === predict.last_resulta ) {
        //not an error if result has old value. in this case both can be null.
        response.changePredict[matchnumber].avalidation = 'default';
      } else if ( (predict.resulta === null) 
            || isNaN(predict.resulta) 
            || (predict.resulta === '')
          ) {
          response.changePredict[matchnumber].avalidation = 'error';
      } else {
        response.changePredict[matchnumber].avalidation = 'ok';
      }

      if ( predict.resultb === predict.last_resultb ) {
        //not an error if result has old value. in this case both can be null.
        response.changePredict[matchnumber].bvalidation = 'default';
      } else if ((predict.resultb === null) 
          || isNaN(predict.resultb) 
          || (predict.resultb === '')
        ) {
        response.changePredict[matchnumber].bvalidation = 'error';
      } else {
        response.changePredict[matchnumber].bvalidation = 'ok';
      }

      //return if any one of the field has error.
      if ( ('error' === response.changePredict[matchnumber].bhaserror)
        || ('error' === response.changePredict[matchnumber].ahaserror) ) {
        console.log("scoreChanged error:", matchnumber, response.changePredict[matchnumber]);
        response.changePredict[matchnumber].submit = false;
        response.changePredict[matchnumber].submitted = true;
        return;
      }      

      //check if user cleared the input field and if not set the values.
      if ((predict.resulta !== "") && (predict.resulta !== null) 
          && (predict.resultb !== "") && (predict.resultb !== null)) {
        //if both are numbers and was edited turn on save button
        //setting in the local varilable predict wasn't working.
        //hence setting in the main variable
        response.changePredict[matchnumber].submit = true;
        response.changePredict[matchnumber].submitted = false;
      } else {
        response.changePredict[matchnumber].submit = false;
        response.changePredict[matchnumber].submitted = true;
      }
      //console.log("scoreChanged success:", matchnumber, response.changePredict[matchnumber]);
    }
  </script>
  
<section id="predictions">
  <div class="container pt-2">
    <h2>Predictions</h2>
    <p class="text-muted">Enter your predictions for upcoming matches (limited to a maximum of 10 matches.)</p>
    {#if response.processed && (response.resultData.length > 0) && (response.predictData?.length > 0) }
    <div class="container-fluid">
        {#each response.resultData as result, index}
        <score-predictor class="align-middle gap-2 mb-4">
          <div class="team-wrapper align-middle">
            <img src={'/assets/img/country-flags-main/' + response.flagName[result.matchnumber]?.teama + '.svg'} 
            width='25em' 
            alt="{result.teama}"/> 
            <span>{teamNameAcronymn[result.teama]}</span>            
          </div>
          <div class="score-predictor-controls align-middle">
            {#if (result.status == 'Complete') 
                  || (Date.now() > response.matchDatetime[result.matchnumber])}
              {#if (response.changePredict[result.matchnumber].resulta == null) 
                   || (response.changePredict[result.matchnumber].resulta < 0)}
              ➖
              {:else}
              <div class="fw-bold fs-2 text-center">{response.changePredict[result.matchnumber].resulta}</div>              
              {/if}
            {:else}
            <button class="score-predictor-number-button-up btn-light"
              on:click={() => increaseTeamAScore(result.matchnumber)} >
              <i class="bi bi-chevron-up text-danger"></i>
            </button>
            <input 
              id="teama{result.matchnumber}" type="number" 
              class="form-control fw-bold fs-2 text-center" 
              placeholder="-" aria-label="Team A Precition" aria-describedby="basic-addon1"
              min=0 max=20
              bind:value={response.changePredict[result.matchnumber].resulta} 
              on:change={() => scoreChanged(result.matchnumber)}
              on:keyup={() => scoreChanged(result.matchnumber)}
            >
            <button class="score-predictor-number-button-down btn-light"
              on:click={() => decreaseTeamAScore(result.matchnumber)}>
              <i class="bi bi-chevron-down text-danger"></i>
            </button>
            {/if}
          </div>
          <div class="fw-bold text-center align-middle">-</div>
          <div class="score-predictor-controls align-middle">
            {#if (result.status == 'Complete') || (Date.now() > response.matchDatetime[result.matchnumber]) }
              {#if (response.changePredict[result.matchnumber].resultb == null) || (response.changePredict[result.matchnumber].resultb < 0)}
              ➖
              {:else}
              <div class="fw-bold fs-2 text-center mb-1">{response.changePredict[result.matchnumber].resultb}</div>
              {/if}
            {:else}
              <button class="score-predictor-number-button-up btn-light"
                on:click={() => increaseTeamBScore(result.matchnumber)} >
                <i class="bi bi-chevron-up text-danger"></i>
              </button>
              <input 
                id="teamb{result.matchnumber}" type="number" 
                class="form-control fw-bold fs-2 text-center"
                placeholder="-" aria-label="Team B Precition" aria-describedby="basic-addon2" 
                min=0 max=20
                bind:value={response.changePredict[result.matchnumber].resultb} 
                on:change={() => scoreChanged(result.matchnumber)}
                on:keyup={() => scoreChanged(result.matchnumber)}
              >
              <button class="score-predictor-number-button-down btn-light"
                on:click={() => decreaseTeamBScore(result.matchnumber)}>
                <i class="bi bi-chevron-down text-danger"></i>
              </button>
            {/if}
          </div>
          <div class="team-wrapper">
            <img src={'/assets/img/country-flags-main/' + response.flagName[result.matchnumber]?.teamb  + '.svg'} 
            width='25em' 
            alt="{result.teamb}"/>
            <span>{teamNameAcronymn[result.teamb]}</span>
          </div>
          <div class="align-middle text-center">
            {#if (result.status != 'Complete') && (Date.now() <= response.matchDatetime[result.matchnumber])}
            <button id="{result.matchnumber}" type="button" class="btn {response.changePredict[result.matchnumber]?.submit ? 'btn-primary' : 'btn-outline-light'}" 
            on:click={() => saveScore(result.matchnumber)} disabled="{response.changePredict[result.matchnumber]?.submit === false}">Save</button>
            {:else if (result.status != 'Complete') }
            <!-- don't show save button, instead show that match is on-going -->
            <p class="fs-2 text-center">⏱</p>
            {:else}
            <!-- don't show save button, instead show that match was completed -->
            <p class="fs-2 text-center">✔️</p>
            {/if}             
          </div>
        </score-predictor>
        {/each}
    </div>
    <!-- Toast which shows the success status -->
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <Toasts />
    </div>
  {:else if response.processed == false}
  <Loading />
  {:else if response.predictData?.length == 0}
  <Sorry />
  {/if}
  </div>

</section>
  
<style lang="postcss">
  score-predictor {
    display: grid;
    grid-template-columns: minmax(10%, 10%) minmax(20%, 20%) minmax(5%, 5%) minmax(20%, 20%) minmax(10%, 10%) minmax(20%, 30%);
    gap: 1vw;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
  }
  .team-wrapper {
    display: flex;
    flex-flow: column wrap;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    gap: 8px;
  }
  .score-predictor-controls {
    display: grid;
    grid-template-columns: minmax(auto, auto);
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
  }
  .score-predictor-number-button-up {
    border-radius: 8px 8px 0px 0px;
    border: 1px solid var(--bs-gray);
  }
  .score-predictor-number-button-down {
    border-radius: 0px 0px 8px 8px;
    border: 1px solid var(--bs-gray);
  }
</style>