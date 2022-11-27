<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { storeParticipants, storeGroups, storeLoggedUID, addToast } from "../store";
  import { supabase } from '../supabaseClient'
  import Toasts from './Toasts.svelte';

  let participants;
  let usub1 = storeParticipants.subscribe(value => {
    participants = value;
  });

  let groups
  let usub2 = storeGroups.subscribe(value => {
    groups = value;
  });

  let uuid;
  let usub3 = storeLoggedUID.subscribe(value => {
    uuid = value;
  });

  function addGroup(groupName: string, groupDesc: string) {
    //TODO: add support for new group addition
    addToast({
      message: "Adding group " + groupName,
      type: 'info',
      dismissible: true,
      timeout: 1000,
    });
  }

  function addMember(groupName: string, participantId: string) {
    //TODO: add support for new member addition
    addToast({
      message: "Adding participant to " + groupName,
      type: 'info',
      dismissible: true,
      timeout: 1000,
    });
  }

  function deleteMember(groupName: string, participantId: string) {
    //TODO: add support to delete addition
    addToast({
      message: "Deleting participant from " + groupName,
      type: 'info',
      dismissible: true,
      timeout: 1000,
    });
  }

  onDestroy(() => {
    usub1();
    usub2();
    usub3();
  })
</script>

<!-- skip fixed-top navigation bar -->
<hr class="pt-5 bg-white">

<div class="container pt-5 pb-5">
  <div class="table-wrapper">
    <div class="table-title">
      <div class="row">
        <div class="col-sm-5">
          <h2>Groups</h2>
        </div>
        <div class="col-sm-7">
          {#if participants[uuid].is_admin}
          <button type="button" class="btn btn-primary add-new"
          on:click={() => addGroup('group', 'participantid')}>
            <i class="bi bi-plus-lg"></i> Add new group
          </button>
          <button type="button" class="btn btn-primary add-new" 
          on:click={() => addMember('group', 'participantid')}>
            <i class="bi bi-plus-lg"></i> Add new member
          </button>
          {/if}
        </div>
      </div>
    </div>
    <table class="table table-condensed">
      <thead>
        <tr>
          <th>Group</th>
          <th>Participant</th>
          <th>...</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.keys(groups) as group}
        {#each groups[group] as participantid, index}
        <tr>
          {#if index == 0}
          <td rowspan="{groups[group].length}">{group}</td>
          {/if}
          <td>{participants[participantid].full_name}</td>
          <td>            
            {#if participants[uuid].is_admin}
            <!-- svelte-ignore a11y-missing-attribute -->
            <button class="btn"
                on:click={() => deleteMember(group, participantid)}>
                <i class="bi bi-trash"></i>
            </button>
            {:else}              
            <button class="btn" disabled>
                <i class="bi bi-trash"></i>
            </button>
            {/if}
          </td>
        </tr>
        {/each}
        {/each}
      </tbody>
    </table>
  </div>
</div>
<!-- Toast which shows the success status -->
<div class="toast-container position-fixed top-0 end-0 p-3">
  <Toasts />
</div>