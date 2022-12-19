<script lang="ts">
    import { supabase } from '../supabaseClient'

    enum QueryReponse {
      YetToStart, //0
      Failed, //1
      Success, //2
      Inprogress, //3
    }

    let response = {
      status: QueryReponse.YetToStart,
      message: '',
    }
    let email = ''
  
    const handleLogin = async () => {
      try {
        response = { status: QueryReponse.Inprogress, message: ''};
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        response = { status: QueryReponse.Success, message: 'Check your email for login link!'};
      } catch (error) {
        if (error instanceof Error) {
          response = { status: QueryReponse.Failed, message: error.message};
        }
      } finally {
        //nop
      }
    }
  </script>
  
  <div class="cover-container d-flex text-center p-3 flex-column">
    <div class="row min-vh-100" >
      <div class="d-flex align-items-center">
        <div class="mx-auto">
          <h1 class="display-5 fw-bold">🏆 Kotas fun friendly football prediction leaderboard!❤️</h1>
          <p class="lead mb-4">Sign in via magic link with your email below</p>
          <form class="d-flex justify-content-center gap-3" on:submit|preventDefault="{handleLogin}">
              <input
                  id="email"
                  type="email"
                  class="input-group-text" 
                  placeholder="Enter your email"
                  bind:value="{email}"
              />
              <button type="submit" class="btn btn-primary px-4 gap-3" 
                  aria-live="polite" disabled="{response.status === QueryReponse.Inprogress}">
                  <span>{response.status === QueryReponse.Inprogress ? 'Sending magic link' : 'Send magic link'}</span>
              </button>
          </form>
          {#if (response.status === QueryReponse.Failed) || (response.status === QueryReponse.Success)}
            <p class={response.status === QueryReponse.Failed ? 'text-danger' : 'text-success'}>{response.message}</p>
          {/if}
        </div>
      </div>
    </div>
  </div>