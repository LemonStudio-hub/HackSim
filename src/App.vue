<template>
  <div class="app">
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">
          <span class="title-prefix">HACK</span>SIM
        </h1>
      </div>
      <div class="header-right">
        <div class="status-indicator" :class="{ online: gameStore.isRunning }">
          <span class="status-dot"></span>
          <span class="status-text">{{ gameStore.isRunning ? 'ONLINE' : 'OFFLINE' }}</span>
        </div>
        <div class="play-time">
          <span class="play-time-value">{{ gameStore.formattedPlayTime }}</span>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="sidebar" :class="{ 'mobile-hidden': isMobile && activeTab !== 'user' && activeTab !== 'mission' }">
        <UserPanel :class="{ 'mobile-hidden': isMobile && activeTab !== 'user' }" />
        <MissionPanel :class="{ 'mobile-hidden': isMobile && activeTab !== 'mission' }" />
      </div>
      <div class="content" :class="{ 'mobile-hidden': isMobile && activeTab !== 'terminal' }">
        <Terminal />
      </div>
    </main>

    <!-- 移动端底部导航栏 -->
    <div class="mobile-nav">
      <button
        class="nav-btn"
        :class="{ active: activeTab === 'terminal' }"
        @click="switchTab('terminal')"
      >
        <span class="nav-icon">>></span>
        <span class="nav-label">Terminal</span>
      </button>
      <button
        class="nav-btn"
        :class="{ active: activeTab === 'user' }"
        @click="switchTab('user')"
      >
        <span class="nav-icon">@</span>
        <span class="nav-label">User</span>
      </button>
      <button
        class="nav-btn"
        :class="{ active: activeTab === 'mission' }"
        @click="switchTab('mission')"
      >
        <span class="nav-icon">!</span>
        <span class="nav-label">Missions</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/game'
import Terminal from './components/Terminal.vue'
import UserPanel from './components/UserPanel.vue'
import MissionPanel from './components/MissionPanel.vue'

const gameStore = useGameStore()
const activeTab = ref('terminal')
const isMobile = ref(false)

/**
 * 检测是否为移动设备
 */
function checkMobile() {
  isMobile.value = window.innerWidth <= 640
}

/**
 * 切换标签页
 */
function switchTab(tab: string) {
  activeTab.value = tab
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  checkMobile()
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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

// 移动端隐藏类
.mobile-hidden {
  display: none !important;
}

// 移动端导航栏
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, var(--bg-dark) 0%, rgba(13, 2, 8, 0.95) 100%);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-xs) 0;
  z-index: var(--z-modal);
  backdrop-filter: blur(10px);
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: transparent;
  border: none;
  border-top: 3px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base) var(--ease-out);

  &:active {
    transform: scale(0.95);
  }

  &.active {
    color: var(--primary);
    border-top-color: var(--primary);
  }

  .nav-icon {
    font-size: var(--font-size-lg);
    font-family: var(--font-family-mono);
    font-weight: bold;
  }

  .nav-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
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
    padding: var(--spacing-sm);
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .app-title {
    font-size: var(--font-size-lg);
  }

  .app-version {
    display: none;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .status-indicator {
    flex: 1;
  }

  .play-time {
    display: none;
  }

  .app-main {
    flex-direction: column;
    padding-bottom: 60px; // 为底部导航栏留出空间
  }

  .sidebar {
    width: 100%;
    height: 100%;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .content {
    flex: 1;
    height: 100%;
    min-height: 100%;
  }

  .mobile-nav {
    display: flex;
  }
}

// 超小屏幕优化
@media (max-width: 480px) {
  .app-header {
    padding: var(--spacing-xs);
  }

  .app-title {
    font-size: var(--font-size-base);
  }

  .status-text {
    font-size: var(--font-size-xs);
  }

  .status-dot {
    width: 6px;
    height: 6px;
  }

  .sidebar {
    padding: var(--spacing-xs);
    gap: var(--spacing-xs);
  }
}

// 横屏模式优化
@media (max-height: 600px) and (orientation: landscape) {
  .app-header {
    padding: var(--spacing-xs) var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  .app-title {
    font-size: var(--font-size-lg);
  }

  .app-version {
    display: none;
  }

  .sidebar {
    width: 250px;
    max-height: none;
    border-right: 1px solid var(--border-color);
    border-bottom: none;
  }
}
</style>