<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { storeCurrentPage, storeTournaments, storeParticipants, storeLoggedUID} from "../store";
    import { supabase } from "../supabaseClient";

    function changePage(e) {
        storeCurrentPage.set('Leaderboard')
    }

    let participants;
    let usub1 = storeParticipants.subscribe(value => {
      participants = value;
    });

    let uuid;
    let usub2 = storeLoggedUID.subscribe(value => {
      uuid = value;
    });


    let response = {
      tournamentsData: null,
      profileData: null,
      processed: false,
    };

    function loadDataFromSupabase() {
      const getResults = async () => {
        try {
            {
              const { data, error, status } = await supabase
                .from('tournaments')
                .select('tournament')
                  
              if (error && status !== 406) throw error
              response.tournamentsData = data;
            }

            {
              const { data, error, status } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                  
              if (error && status !== 406) throw error
              response.profileData = data;
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
        storeTournaments.set(response.tournamentsData);
        let qParticipants = {};
        response.profileData?.forEach((pProfile, pIndex) => {
          qParticipants[pProfile.id] = {full_name: pProfile.full_name, avatar_url: pProfile.avatar_url}
        })
        storeParticipants.set(qParticipants);
        //console.log("Navigation output: ", response, qParticipants);
      }).catch(console.log)
    }

    onMount(() => {
      loadDataFromSupabase();
    })

    onDestroy(() => {
      usub1();
      usub2();
    })
</script>
<!-- Navigation-->
<nav class="navbar navbar-expand-lg navbar-light fixed-top shadow-sm" id="mainNav">
  <div class="container px-3">
    <a class="navbar-brand fw-bold" href="#app" on:click={changePage}>KOTAS</a>
    {#if (response.processed) && (response.profileData.length > 0)}    
    <div class="nav-item dropdown">
      <!-- svelte-ignore a11y-missing-attribute -->
      <a class="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown" 
      data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation" role="button">
        <span class="mr-2 d-none d-lg-inline text-gray-600 small">{participants[uuid].full_name}</span>
        <img class="img-profile rounded-circle"
            src="{participants[uuid].avatar_url}" alt="Avatar"
            width='30em'>
      </a>
      <div class="dropdown-menu dropdown-menu-end shadow animated--grow-in" 
        id="navbarNavDropdown"
        aria-labelledby="navbarNavDropdown">
        <a class="dropdown-item" 
            href="https://github.com/anoobbacker/leaderboard-supabase-svelte/issues/new/choose" 
            target="_blank" 
            rel="noreferrer">
            <i class="bi bi-bug mr-2 text-gray-400"></i>
            Submit issues
        </a>
        <a class="dropdown-item" 
            href="https://github.com/anoobbacker/leaderboard-supabase-svelte" 
            target="_blank" 
            rel="noreferrer">
            <i class="bi bi-github mr-2 text-gray-400"></i>
            Contribute
        </a>
      </div>
    </div>
    {/if}
  </div>
</nav>