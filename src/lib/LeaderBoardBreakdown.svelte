<script lang="ts">
  export let sortedLeaderNames;
  export let participants;
  export let countScorePlusWin;
  export let countWins;
  export let countLost;
</script>

<div class="section-heading text-center pb-3">
  <h2>Leader Board break down</h2>
  <p class="text-muted">Shows the leader board details. To see all the predictions scroll down to 'All predictions' section.</p>
  <br/>
  <table class="table table-condensed align-middle">
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