<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { storeParticipants} from "../store";  

  let participants;
  let usub1 = storeParticipants.subscribe(value => {
    participants = value;
  });

  onDestroy(() => {
    usub1();
  });
</script>

<!-- Avatars section-->
<section class="bg-gradient-primary-to-secondary" id="avatars">
  <div class="container px-5 justify-content-center">
    <h2 class="text-center text-white font-alt mb-4">Kotas <i class="bi-heart-fill"></i> Football</h2>
    <div class="container text-center px-5 my-3">    
    {#each Object.entries(participants) as participant}
      <span>
        <img src={participant[1]?.avatar_url} alt={participant[1]?.full_name} width="80" />
      </span>
    {/each}    
    </div>
    <div class="container text-center px-5">
        <a href="#app" class="btn btn-outline-light py-3 px-4 rounded-pill ">Go to Top!</a>
    </div>    
  </div>
</section>