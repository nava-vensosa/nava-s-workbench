<script>
  import { onMount } from 'svelte';
  let loggedIn = false;
  let showRegister = false;
  let username = '';
  let password = '';
  let newUsername = '';
  let newPassword = '';
  let content = '';

  function login(e) {
    e.preventDefault();
    // TODO: Replace with real auth logic
    loggedIn = true;
    content = '';
  }

  function register(e) {
    e.preventDefault();
    // TODO: Replace with real registration logic
    alert('Registration submitted!');
    showRegister = false;
  }

  function showContent(type) {
    if (type === 'messages') content = 'Messages will appear here.';
    if (type === 'availability') content = 'Availability form will appear here.';
    if (type === 'propose') content = 'Propose a hedge form will appear here.';
    if (type === 'upcoming') content = 'Upcoming hedges will appear here.';
  }
</script>

<main>
  <h1>Hedge App</h1>
  {#if !loggedIn}
    {#if showRegister}
      <form class="auth-form" on:submit={register}>
        <input type="text" bind:value={newUsername} placeholder="New Username" required />
        <input type="password" bind:value={newPassword} placeholder="New Password" required />
        <button type="submit">Register</button>
        <button type="button" on:click={() => showRegister = false}>Back to Login</button>
      </form>
    {:else}
      <form class="auth-form" on:submit={login}>
        <input type="text" bind:value={username} placeholder="Username" required />
        <input type="password" bind:value={password} placeholder="Password" required />
        <button type="submit">Log In</button>
        <button type="button" on:click={() => showRegister = true}>Create Account</button>
      </form>
    {/if}
  {:else}
    <section class="main-menu">
      <button on:click={() => showContent('messages')}>View My Messages</button>
      <button on:click={() => showContent('availability')}>Indicate My Availability</button>
      <button on:click={() => showContent('propose')}>Propose a Hedge</button>
      <button on:click={() => showContent('upcoming')}>View Upcoming Hedges</button>
    </section>
    <section class="content-section">
      {#if content}
        <div>{content}</div>
      {/if}
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 400px;
    margin: 2rem auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 2rem;
    font-family: Arial, sans-serif;
  }
  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .auth-form input {
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  .auth-form button {
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 4px;
    border: none;
    background: #1976d2;
    color: #fff;
    cursor: pointer;
    margin-bottom: 0.5rem;
    transition: background 0.2s;
  }
  .auth-form button:hover {
    background: #1565c0;
  }
  .main-menu button {
    display: block;
    width: 100%;
    margin: 0.5rem 0;
    padding: 0.75rem;
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .main-menu button:hover {
    background: #1565c0;
  }
  .content-section {
    margin-top: 2rem;
    min-height: 2rem;
    text-align: center;
  }
</style>