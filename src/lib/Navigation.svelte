<script lang="ts">
    import { onMount } from "svelte";
    import { storeCurrentPage, storeTournaments, storeParticipants} from "../store";
    import { supabase } from "../supabaseClient";

    function changePage(e) {
        storeCurrentPage.set('Leaderboard')
    }

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
        let participants = {};
        response.profileData?.forEach((pProfile, pIndex) => {
            participants[pProfile.id] = {full_name: pProfile.full_name, avatar_url: pProfile.avatar_url}
        })
        storeParticipants.set(participants);
        //console.log("Navigation output: ", response, participants);
      }).catch(console.log)
    }

    onMount(() => {
      loadDataFromSupabase();
    })
</script>
<!-- Navigation-->
<nav class="navbar navbar-expand-lg navbar-light fixed-top shadow-sm" id="mainNav">
    <div class="container px-5">
        <a class="navbar-brand fw-bold" href="#app" on:click={changePage}>KOTAS</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <i class="bi-list"></i>
        </button>
        <div class="collapse navbar-collapse" id="navbarResponsive">
            <ul class="navbar-nav ms-auto me-4 my-3 my-lg-0">
                <li class="nav-item"><a class="nav-link me-lg-3" href="https://github.com/anoobbacker/leaderboard-react" target="_blank" rel="noreferrer"><i class="bi bi-github"></i> Contribute</a></li>
                <li class="nav-item"><a class="nav-link me-lg-3" href="https://github.com/anoobbacker/leaderboard-react/issues/new/choose" target="_blank" rel="noreferrer"><i class="bi bi-bug"></i> Submit issues</a></li>
            </ul>
        </div>
    </div>
</nav>