<template>
  <div class="app">
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">
          <span class="title-prefix">HACK</span>SIM
        </h1>
        <span class="app-version">v{{ version }}</span>
      </div>
      <div class="header-right">
        <div class="status-indicator" :class="{ online: gameStore.isRunning }">
          <span class="status-dot"></span>
          <span class="status-text">{{ gameStore.isRunning ? 'ONLINE' : 'OFFLINE' }}</span>
        </div>
        <div class="play-time">
          <span class="play-time-icon">⏱️</span>
          <span class="play-time-value">{{ gameStore.formattedPlayTime }}</span>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="sidebar">
        <UserPanel />
        <MissionPanel />
      </div>
      <div class="content">
        <Terminal />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from './stores/game'
import Terminal from './components/Terminal.vue'
import UserPanel from './components/UserPanel.vue'
import MissionPanel from './components/MissionPanel.vue'

const gameStore = useGameStore()

// 版本号（从 package.json 读取）
const version = '0.1.0'

onMounted(() => {
  // 游戏初始化在 Terminal 组件中进行
})
</script>

<style lang="scss">
@import './styles/main.scss';

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-darker);
  overflow: hidden;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(90deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.app-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;

  .title-prefix {
    color: var(--primary);
    text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
  }
}

.app-version {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-family: var(--font-family-mono);
  background-color: var(--bg-hover);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bg-hover);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);

  &.online {
    border-color: var(--success);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--error);
    animation: pulse 2s infinite;

    .online & {
      background-color: var(--success);
    }
  }

  .status-text {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.play-time {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bg-hover);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);

  .play-time-icon {
    font-size: var(--font-size-sm);
  }

  .play-time-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    font-family: var(--font-family-mono);
  }
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  padding: var(--spacing-md);
  background: linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.content {
  flex: 1;
  overflow: hidden;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .sidebar {
    width: 280px;
  }

  .app-title {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .header-right {
    gap: var(--spacing-md);
  }

  .play-time {
    display: none;
  }

  .sidebar {
    width: 250px;
  }
}

@media (max-width: 640px) {
  .app {
    flex-direction: column;
  }

  .app-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }

  .app-main {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    max-height: 40%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
}
</style>