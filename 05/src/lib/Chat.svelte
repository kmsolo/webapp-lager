<script>
  import { onDestroy } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  /* import { resolve } from '$app/paths'; */
  import { io } from 'socket.io-client';

  let username = $state('');
  let joined = $state(false);
  let messageInput = $state('');
  let messages = $state([]); // { name, message, own }
  let connectionStatus = $state('disconnected'); // disconnected | connecting | connected | error
  let socket;

  function connect() {
    connectionStatus = 'connecting';

    socket = io('https://lager-chat.emilfolino.se');

    socket.on('connect', () => {
      connectionStatus = 'connected';
    });

    socket.on('chat message', (data) => {
      // Robust felhantering: krascha aldrig även om datan inte har rätt form
      let name = 'Okänd';
      let message = null;

      try {
        if (typeof data === 'string') {
          message = data;
        } else if (data && typeof data === 'object') {
          if (typeof data.message === 'string') message = data.message;
          if (typeof data.name === 'string' && data.name.trim() !== '') name = data.name;
        }
      } catch (err) {
        console.warn('Kunde inte tolka inkommande meddelande:', err);
        return;
      }

      if (message === null) {
        console.warn('Ogiltigt meddelandeformat, ignorerar:', data);
        return;
      }

      messages = [...messages, { name, message, own: name === username }];
    });

    socket.on('disconnect', () => {
      connectionStatus = 'disconnected';
    });

    socket.on('connect_error', () => {
      connectionStatus = 'error';
    });
  }

  function joinChat() {
    if (username.trim() === '') return;
    joined = true;
    connect();
  }

  function sendMessage() {
    if (messageInput.trim() === '') return;
    if (!socket || !socket.connected) return;

    const payload = { name: username, message: messageInput };

    try {
      socket.emit('chat message', payload);
    } catch (err) {
      console.error('Kunde inte skicka meddelande:', err);
      return;
    }

    messageInput = '';
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') sendMessage();
  }

  onDestroy(() => {
    if (socket) socket.disconnect();
  });
</script>

{#if !joined}
  <div class="join-screen" in:fade={{ duration: 200 }}>
    <h1>Lager-chatten</h1>
    <p>Skriv ett användarnamn för att gå med.</p>
    <input
      type="text"
      placeholder="Ditt namn"
      bind:value={username}
      onkeydown={(e) => e.key === 'Enter' && joinChat()}
    />
    <button onclick={joinChat} disabled={username.trim() === ''}>Gå med i chatten</button>
  </div>
{:else}
  <div class="chat-screen" in:fade={{ duration: 200 }}>
    <header>
      <h1>Lager-chatten</h1>
      <span class="status status-{connectionStatus}">
        {#if connectionStatus === 'connected'}🟢 Ansluten
        {:else if connectionStatus === 'connecting'}🟡 Ansluter...
        {:else if connectionStatus === 'error'}🔴 Fel
        {:else}⚪ Frånkopplad{/if}
      </span>
    </header>

    <div class="messages">
      {#each messages as msg, i (i)}
        <div class="message {msg.own ? 'own' : ''}" in:fly={{ y: 10, duration: 150 }}>
          <strong>{msg.name}</strong>
          <p>{msg.message}</p>
        </div>
      {/each}
    </div>

    <div class="input-row">
      <input
        type="text"
        placeholder="Skriv ett meddelande..."
        bind:value={messageInput}
        onkeydown={handleKeydown}
        disabled={connectionStatus !== 'connected'}
      />
      <button onclick={sendMessage} disabled={connectionStatus !== 'connected'}>Skicka</button>
    </div>
  </div>
{/if}

<style>
  .join-screen {
    max-width: 320px;
    margin: 3rem auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .chat-screen {
    max-width: 480px;
    margin: 0 auto;
    height: 90vh;
    display: flex;
    flex-direction: column;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  .status { font-size: 0.85rem; }
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .message {
    background: #f3f3f3;
    border-radius: 10px;
    padding: 0.5rem 0.75rem;
    max-width: 80%;
  }
  .message.own {
    background: #f7c6d0;
    align-self: flex-end;
  }
  .message strong { font-size: 0.8rem; opacity: 0.7; }
  .message p { margin: 0.2rem 0 0; }
  .input-row {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }
  input {
    flex: 1;
    padding: 0.6rem;
    border-radius: 8px;
    border: 1px solid #ccc;
  }
  button {
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 8px;
    background: #f3b1bf;
    cursor: pointer;
    font-weight: bold;
  }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>