<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { storeCurrentPage, storeTournaments, storeParticipants, storeLoggedUID, storeGroups, storeCurrentGroup} from "../store";
    import { supabase } from "../supabaseClient";

    function changePage(pageName: string) {
        storeCurrentPage.set(pageName)
    }

    let participants;
    let usub1 = storeParticipants.subscribe(value => {
      participants = value;
    });

    let uuid;
    let usub2 = storeLoggedUID.subscribe(value => {
      uuid = value;
    });

    let groups;    
    let usub3 = storeGroups.subscribe(value => {
      groups = value;
    });

    let currentgroup;    
    let usub4 = storeCurrentGroup.subscribe(value => {
      currentgroup = value;
    });

    let response = {
      tournamentsData: null,
      profileData: null,
      processed: false,
      tribeData: null,
    };

    let selectedGroupName = currentgroup;

    function loadDataFromSupabase() {
      const getResults = async () => {
        try {
            {
              //pull all the tournaments
              const { data, error, status } = await supabase
                .from('tournaments')
                .select('tournament')
                .order('tournament', {ascending: true})
                  
              if (error && status !== 406) throw error
              response.tournamentsData = data;
            }

            {
              //pull all the participants in my tribe
              const { data, error, status } = await supabase
                .from('tribes')
                .select(`name, desc, tribemember(participant_id, is_admin)`)
                .order('name', {ascending: true})
                  
              if (error && status !== 406) throw error
              response.tribeData = data;
            }
            
            if ( uuid !== null) {
              //create the list of profiles to pull the information
              const tribeMembers = [uuid];
              response.tribeData.forEach(row => {
                row.tribemember.forEach(particpant => {
                  if (tribeMembers.indexOf(particpant.participant_id) === -1) {
                    tribeMembers.push(particpant.participant_id);
                  }
                });
              });
              
              //pull all the participants in my tribe
              const { data, error, status } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', tribeMembers)
                  
              if (error && status !== 406) throw error
              response.profileData = data;
            }            
          } catch (error) {
            response.processed = false;
            console.error("Error:", error);
          } finally {
            //no-op
          }
      }
      const p1 = getResults();
      p1.then(() => {
        storeTournaments.set(response.tournamentsData);
        let qParticipants = {};
        //update full name and avatar url
        response.profileData?.forEach((pProfile, pIndex) => {
          qParticipants[pProfile.id] = {full_name: pProfile.full_name, avatar_url: pProfile.avatar_url}
        })
        //update is_admin from tribe data
        let qTribes = {};
        response.tribeData.forEach(row => {
          row.tribemember.forEach(particpant => {
              //set the tribes object
              let tribeName = row.name;
              if (qTribes[tribeName] == null) {
                qTribes[tribeName] = [];
              }
              qTribes[tribeName].push(particpant.participant_id);
              //set the participants object
              qParticipants[particpant.participant_id].is_admin = particpant.is_admin;
              if (qParticipants[particpant.participant_id].tribe == null) {
                qParticipants[particpant.participant_id].tribe = []
              }
              qParticipants[particpant.participant_id].tribe.push(row.name);
          });
        });
        storeParticipants.set(qParticipants);
        storeGroups.set(qTribes);
        //set the first in the list as the default tribe name
        storeCurrentGroup.set(response?.tribeData[0]?.name);
        response.processed = true;
      }).catch((e) => {
        response.processed = false;
        console.log("Navigation: ", e)
      })
    }

    function changeGroup(e) {
      storeCurrentGroup.set(selectedGroupName);
    }

    onMount(() => {
      loadDataFromSupabase();
    })

    onDestroy(() => {
      usub1();
      usub2();
      usub3();
      usub4();
    })
</script>
<!-- Navigation-->
<nav class="navbar navbar-expand-lg navbar-light fixed-top shadow-sm" id="mainNav">
  <div class="container px-3">
    <!-- Show the website name and on click change it to home page -->
    <a class="navbar-brand fw-bold" href="#app" on:click={() => changePage('Home')}>KOTAS.CLUB</a>
    <!-- Top right avatar drop-down -->
    <div class="nav-item dropdown">
        <!-- svelte-ignore a11y-missing-attribute -->
        <a class="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown" 
        data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation" role="button">
          {#if (response.processed) && (Object.keys(participants).length > 0)}
          <span class="mr-2 d-none d-lg-inline text-gray-600 small">{participants[uuid].full_name}</span>
          <img class="img-profile rounded-circle"
              src="{participants[uuid].avatar_url}" alt="Avatar"
              width='30em'>
          {:else}
          <i class="bi bi-person-circle mr-2 fs-4" ></i>
          {/if}
        </a>
        <div class="dropdown-menu dropdown-menu-end shadow animated--grow-in" 
          id="navbarNavDropdown"
          aria-labelledby="navbarNavDropdown">

          <!-- show change group, only if the participant is part of more than one group -->
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a class="dropdown-item {(participants[uuid]?.tribe?.length > 1) ? '' : 'disabled'}" 
              href="#changeGroupModal" 
              data-bs-toggle="modal" data-bs-target="#changeGroupModal"
              >
              <i class="bi bi-people mr-2 text-gray-400"></i> Switch group
          </a>
          
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a class="dropdown-item {(participants[uuid]?.tribe?.length > 1) ? '' : 'disabled'}" 
              href="#" 
              on:click={() => changePage('Group')} 
              >
              <i class="bi bi-people mr-2 text-gray-400"></i> Manage group
          </a>

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
  </div>
</nav>


<!-- Modal -->
<div class="modal fade" id="changeGroupModal" tabindex="-1" aria-labelledby="changeGroupModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="changeGroupModalLabel">Select group</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <label for="chooseGroupName">Choose a group name:</label>
        <select id="chooseGroupName" class="form-select mb-3" bind:value={selectedGroupName}>
          {#each Object.keys(groups) as groupName}
          {#if currentgroup.trim() === groupName.trim()}
          <option value={groupName} selected>{groupName} (selected)</option>
          {:else}
          <option value={groupName}>{groupName}</option>
          {/if}
          {/each}
        </select>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" on:click={changeGroup}>Save changes</button>
      </div>
    </div>
  </div>
</div>