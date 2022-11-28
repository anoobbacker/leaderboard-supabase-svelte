<script lang="ts">
  export let tournament;
  export let sortedLeaderNames;
  export let participants;
  export let totalPredicts;
  export let leaderboard;
</script>

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