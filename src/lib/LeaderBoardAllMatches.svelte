<script lang="ts">
  import {team3To2LetterAcronym} from "../config";
  export let allGames;
  export let participants;
  export let tournament;
  export let currentStage: number;

  function increaseStage() {
    let maxStage = tournament.matchStages.length;
    if( currentStage < maxStage ) {
      currentStage++
    } else {
      currentStage = maxStage;
    }
  }

  function decreaseStage() {
    let minStage = 1;
    if( currentStage > minStage ) {
      currentStage--
    } else {
      currentStage = minStage;
    }
  }

</script>
<div class="section-heading text-center pb-3" id="#all-predictions">
  <h2>Match predictions</h2>
  <p class="text-muted">Breakup of the prediction made by participants for upcoming stage.</p>
  <br/>
  <div class="fixtures-header align-items-center">
    <button class="btn" on:click={decreaseStage}><i class="bi bi-chevron-left fs-3"></i></button>
    <h3 class="title">{tournament.matchStages[currentStage-1].Desc}</h3> 
    <button class="btn" on:click={increaseStage}><i class="bi bi-chevron-right fs-3"></i></button>
  </div>
  <div class="tiles">
    {#each allGames as gameResult, gameIndex}
    {#if ((gameIndex+1) >= tournament.matchStages[currentStage-1].StartMatchNumber) 
        && ((gameIndex+1) <= tournament.matchStages[currentStage-1].EndMatchNumber)
    }      
    <div class="tile">
      <div class="header fs-6 px-1">Match: {gameIndex + 1}</div>
      <div class="content">
        <div class="left">
          <div class="top">
            <div>
              <img class="rounded" src={'/assets/img/country-flags-main/' + team3To2LetterAcronym[gameResult.match.teamA.name] + '.svg'} width='30em' alt="{gameResult.match.teamA.name}"/>
              &nbsp;{gameResult.match.teamA.name}
            </div>
            <div class="score">{(gameResult.match.result !== "📅") ? gameResult.match.teamA.score : '📅'}</div>            
          </div>
          <div class="bottom">
            <div>
              <img class="rounded" src={'/assets/img/country-flags-main/' + team3To2LetterAcronym[gameResult.match.teamB.name] + '.svg'} width='30px' alt="{gameResult.match.teamB.name}"/>
              &nbsp;{gameResult.match.teamB.name}
            </div>
            <div class="score">{(gameResult.match.result !== '📅') ? gameResult.match.teamB.score : '📅'}</div>
          </div>
        </div>
      </div>
      <div class="avatars text-muted">
        {#each Object.entries(gameResult.predict) as item, index}
        <div class="arow">
          <div class="acol-img">
            <img class="rounded" src={participants[item[0]].avatar_url} alt="Avatar images" width="18em">
          </div>
          {#if (gameResult.predict[item[0]]?.type !== '➖') && (gameResult.predict[item[0]]?.type !== '📅')}
          <div class="acol-point">{gameResult.predict[item[0]].type}{gameResult.predict[item[0]].points}</div>
          <div class="acol-details">
            <img class="rounded" src={'/assets/img/country-flags-main/' + team3To2LetterAcronym[gameResult.match.teamA.name] + '.svg'} width='18em' alt="{gameResult.match.teamA.name}"/>
            <span class={(gameResult.predict[item[0]].result == 'A-win') ? 'fw-bold' : 'fw-normal'}>
              &nbsp;{gameResult.predict[item[0]].teamA}
            </span>
            <span>&nbsp;-&nbsp;</span>
            <span class={(gameResult.predict[item[0]].result == 'B-win') ? 'fw-bold' : 'fw-normal'}>
              {gameResult.predict[item[0]].teamB}
            </span>
            &nbsp;<img class="rounded" src={'/assets/img/country-flags-main/' + team3To2LetterAcronym[gameResult.match.teamB.name] + '.svg'} width='18em' alt="{gameResult.match.teamB.name}"/>            
          </div>          
          {:else}
          <div class="acol-point"></div>
          <div class="acol-details"><span>{gameResult.predict[item[0]]?.type}</span>
          </div>          
          {/if}
          <!-- svelte-ignore a11y-missing-attribute -->
          <!-- <a class="btn btn-primary btn-sm" on:click={() => setTileIndex(gameIndex)}>View</a> -->
        </div>
        {/each}
      </div>
    </div>
    {/if}
    {/each}
  </div>
</div>

<style>
  .tiles {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  }
  .tiles .tile {
    position: relative;
    border-radius: 6px;
    background-color: rgb(255, 255, 255);
    color: rgb(29, 10, 48);
    margin: 8px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 0px 0px;
    max-width: 5530px;
  }
  .tiles .tile .header {
    background-color: rgb(29, 10, 48);
    color: rgb(255, 255, 255);
    height: 24px;
    display: flex;
    justify-content: space-between;
  }
  .tiles .tile .content {
    display: grid;
    gap: 0px;
    /* grid-template-columns: 2fr 2fr; */
  }
  .tiles .tile .content .left {
    letter-spacing: 0.6px;
    text-transform: uppercase;
    font-size: 16px;
    font-weight: 800;
    padding: 8px 0px 8px 8px;
  }
  .tiles .tile .content .right {
    border-left: 1px dotted lightgrey;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .tiles .tile .content .left .top {
    border-bottom: 1px dotted lightgrey;
    padding: 4px 0px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tiles .tile .content .left .bottom {
    border-bottom: 1px dotted lightgrey;
    padding: 4px 0px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tiles .tile .content .left .top .score {
    padding-right: 8px;
  }
  .tiles .tile .content .left .bottom .score {
    padding-right: 8px;
  }
  .tiles .tile .avatars {
    display: grid;
    gap: 0rem;
    align-items: center;
    justify-content: space-between;
    grid-template-columns: 50% 50%;
  }
  .tiles .tile .avatars .arow {
    /* border-bottom: 1px dotted lightgrey; */
    display: grid;
    align-items: center;
    justify-content: space-between;
    grid-template-columns: 10% 30% 60%;
  }
  .tiles .tile .avatars .arow .acol-point {
    display: flex;
    gap: 0rem;
  }
  .tiles .tile .avatars .arow .acol-details {
    display: flex;
    align-items: center;
    border-right: 1px solid lightgrey;
    gap: 0rem;
  }
  .tiles .tile .avatars .arow .acol-img {
    display: flex;
    gap: 0rem;
  }
  .fixtures-header {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-family: "Big Shoulders Text", sans-serif;
    letter-spacing: 0.6px;
  }
  .fixtures-header .title {
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    width: 155px;
  }
</style>