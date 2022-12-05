<script lang="ts">
  import Navigation from "./lib/Navigation.svelte";
  import LeaderBoards from "./lib/LeaderBoards.svelte";
  import Avatars from "./lib/Avatars.svelte";
  import Footer from "./lib/Footer.svelte";
  import { storeCurrentPage } from "./store";
  import Predict from "./lib/Predict.svelte";

  import { onMount } from 'svelte'
  import { supabase } from './supabaseClient'
  import type { AuthSession } from '@supabase/supabase-js'
  import Login from "./lib/Login.svelte";
  import {storeLoggedUID} from "./store"
  import Groups from "./lib/Groups.svelte";
  import Loading from "./lib/Loading.svelte";

  let currentPage;
  storeCurrentPage.subscribe(value => {
		currentPage = value;
	});

  let session: AuthSession
  let checkingSession = true;

  onMount(() => {
    supabase.auth.getSession().then(({ data }) => {
      session = data.session
      storeLoggedUID.set(session?.user?.id);
      checkingSession = false;
    })

    supabase.auth.onAuthStateChange((_event, _session) => {
      session = _session
    })
  })
</script>

<Navigation />

{#if !session}
  {#if checkingSession}
  <Loading />
  {:else}
  <!-- Show login page if not authenticated -->
  <Login />
  {/if}
{:else}
  {#if currentPage === 'Predict'}
    <!-- Show prediction page -->
    <Predict {session} />
  {:else if currentPage === 'Group'}
    <!-- Show group specific page -->
    <Groups />
  {:else}
    <!-- Load leaderboard -->
    <LeaderBoards />
  {/if}
{/if}

<Avatars />
<Footer />