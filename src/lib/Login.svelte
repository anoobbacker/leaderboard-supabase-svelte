<script lang="ts">
    import { supabase } from '../supabaseClient'
  
    let loading = false
    let signedUpTried = false;
    let signUpFailed = false;
    let email = ''
    let emailSubmissionStatus = '';
  
    const handleLogin = async () => {
      try {
        loading = true;
        signedUpTried = true;
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        emailSubmissionStatus = 'Check your email for login link!';
        signUpFailed = false;
      } catch (error) {
        if (error instanceof Error) {
          emailSubmissionStatus = error.message;
          signUpFailed = true;
        }
      } finally {
        loading = false
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
              <button type="submit" class="btn btn-primary btn-lg px-4 gap-3" 
                  aria-live="polite" disabled="{loading}">
                  <span>{loading ? 'Loading' : 'Send magic link'}</span>
              </button>
          </form>
          {#if signedUpTried && (emailSubmissionStatus.length > 0)}
            <p class={signUpFailed ? 'text-danger' : 'text-success'}>{emailSubmissionStatus}</p>
          {/if}
        </div>
      </div>
    </div>
  </div>