<script>
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
  
    const dispatch = createEventDispatcher()
  
    export let type = 'error'
    export let dismissible = true
  </script>
  
  <article class={type} role="alert" transition:fade>
    {#if type === 'success'}
    <i class="bi bi-check-circle" width="1.1em"></i>
    {:else if type === 'error'}
    <i class="bi bi-exclamation-circle-fill" width="1.1em"></i>
    {:else}
    <i class="bi bi-info-circle-fill" width="1.1em"></i>
    {/if}
  
    <div class="text">
      <slot />
    </div>
  
    {#if dismissible}
      <button class="close" on:click={() => dispatch('dismiss')}>
        <i class="bi bi-x-circle-fill" width="0.8em" ></i>
      </button>
    {/if}
  </article>
  
  <style lang="postcss">
    article {
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.2rem;
      display: flex;
      align-items: center;
      margin: 0 auto 0.5rem auto;
      width: 20rem;
    }
    .error {
      background: IndianRed;
    }
    .success {
      background: MediumSeaGreen;
    }
    .info {
      background: SkyBlue;
    }
    .text {
      margin-left: 1rem;
    }
    button {
      color: white;
      background: transparent;
      border: 0 none;
      padding: 0;
      margin: 0 0 0 auto;
      line-height: 1;
      font-size: 1rem;
    }
  </style>