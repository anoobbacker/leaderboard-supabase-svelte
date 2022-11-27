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
<section class="bg-gradient-primary-to-secondary-insta pt-5 pb-5" id="avatars">
  <div class="container px-5 justify-content-center">
    <h2 class="text-center text-white font-alt mb-4">Kotas <i class="bi-heart-fill"></i> Football</h2>
    <div class="container text-center px-5 my-3">    
    {#each Object.entries(participants) as participant}
      <span>
        <img src={participant[1]?.avatar_url} alt={participant[1]?.full_name} width="60em" />
      </span>
    {/each}    
    </div>
    <div class="container text-center px-5">
        <a href="#app" class="btn btn-outline-light py-3 px-4 rounded-pill ">Go to Top!</a>
    </div>    
  </div>
</section>

<style>  
.bg-gradient-primary-to-secondary-insta {
  background: -webkit-radial-gradient(32% 106%, circle cover, rgb(255, 225, 125) 0%, rgb(255, 205, 105) 10%, rgb(250, 145, 55) 28%, rgb(235, 65, 65) 42%, transparent 82%), -webkit-linear-gradient(-45deg, rgb(35, 75, 215) 12%, rgb(195, 60, 190) 58%);
  background: -moz-radial-gradient(32% 106%, circle cover, rgb(255, 225, 125) 0%, rgb(255, 205, 105) 10%, rgb(250, 145, 55) 28%, rgb(235, 65, 65) 42%, transparent 82%), -moz-linear-gradient(-45deg, rgb(35, 75, 215) 12%, rgb(195, 60, 190) 58%);
  background: -ms-radial-gradient(32% 106%, circle cover, rgb(255, 225, 125) 0%, rgb(255, 205, 105) 10%, rgb(250, 145, 55) 28%, rgb(235, 65, 65) 42%, transparent 82%), -ms-linear-gradient(-45deg, rgb(35, 75, 215) 12%, rgb(195, 60, 190) 58%);
  background: -o-radial-gradient(32% 106%, circle cover, rgb(255, 225, 125) 0%, rgb(255, 205, 105) 10%, rgb(250, 145, 55) 28%, rgb(235, 65, 65) 42%, transparent 82%), -o-linear-gradient(-45deg, rgb(35, 75, 215) 12%, rgb(195, 60, 190) 58%);
  background: radial-gradient(circle farthest-corner at 32% 106%, rgb(255, 225, 125) 0%, rgb(255, 205, 105) 10%, rgb(250, 145, 55) 28%, rgb(235, 65, 65) 42%, transparent 82%), linear-gradient(135deg, rgb(35, 75, 215) 12%, rgb(195, 60, 190) 58%);
}
</style>