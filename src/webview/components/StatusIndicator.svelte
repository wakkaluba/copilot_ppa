<script lang="ts">
  export let status: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  export let message: string = '';
  export let modelName: string = '';
  export let providerName: string = '';

  $: statusClass = {
    disconnected: 'status-disconnected',
    connecting: 'status-connecting',
    connected: 'status-connected',
    error: 'status-error'
  }[status];

  $: statusIcon = {
    disconnected: '🔴',
    connecting: '🟡',
    connected: '🟢',
    error: '⚠️'
  }[status];
</script>

<div class="status-indicator {statusClass}">
  <span class="status-icon">{statusIcon}</span>
  <div class="status-details">
    <span class="status-message">{message}</span>
    {#if status === 'connected' && modelName}
      <span class="status-model">Model: {modelName}</span>
    {/if}
  </div>
</div>

<style>
  .status-indicator {
    display: flex;
    align-items: center;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    font-size: 12px;
    gap: 8px;
  }

  .status-icon {
    font-size: 14px;
  }

  .status-details {
    display: flex;
    flex-direction: column;
  }

  .status-disconnected {
    background-color: rgba(255, 0, 0, 0.1);
    border: 1px solid rgba(255, 0, 0, 0.3);
  }

  .status-connecting {
    background-color: rgba(255, 255, 0, 0.1);
    border: 1px solid rgba(255, 255, 0, 0.3);
  }

  .status-connected {
    background-color: rgba(0, 255, 0, 0.1);
    border: 1px solid rgba(0, 255, 0, 0.3);
  }

  .status-error {
    background-color: rgba(255, 100, 0, 0.1);
    border: 1px solid rgba(255, 100, 0, 0.3);
  }

  .status-model {
    font-style: italic;
  }
</style>
