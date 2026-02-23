<template>
  <div class="user-panel">
    <div class="panel-header">
      <h2 class="panel-title">PLAYER INFO</h2>
      <div class="player-level">
        <span class="level-badge">LVL {{ player.level }}</span>
      </div>
    </div>

    <div class="panel-content">
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">{{ player.name }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Credits:</span>
        <span class="info-value success">{{ formatNumber(player.credits) }}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Reputation:</span>
        <span class="info-value warning">{{ player.reputation }}</span>
      </div>

      <div class="exp-section">
        <div class="exp-header">
          <span class="info-label">Experience:</span>
          <span class="info-value">{{ player.exp }} / {{ expToNextLevel }}</span>
        </div>
        <div class="exp-bar">
          <div class="exp-fill" :style="{ width: `${levelProgress}%` }"></div>
        </div>
        <div class="exp-percent">{{ levelProgress }}%</div>
      </div>

      <div class="stats-section">
        <h3 class="section-title">STATISTICS</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Missions Completed:</span>
            <span class="stat-value">{{ completedMissions }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total EXP Earned:</span>
            <span class="stat-value">{{ formatNumber(totalExpEarned) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useMissionStore } from '../stores/mission'
import { formatNumber } from '../utils/helpers'

const playerStore = usePlayerStore()
const missionStore = useMissionStore()

const player = computed(() => playerStore.player)
const expToNextLevel = computed(() => playerStore.expToNextLevel)
const levelProgress = computed(() => playerStore.levelProgress)

const completedMissions = computed(() => missionStore.completed.length)

const totalExpEarned = computed(() => {
  return missionStore.completed.reduce((total, mission) => total + mission.reward.exp, 0)
})
</script>

<style scoped lang="scss">
.user-panel {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: linear-gradient(90deg, var(--bg-dark) 0%, var(--bg-card) 100%);
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.player-level {
  .level-badge {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: var(--bg-darker);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-glow);
  }
}

.panel-content {
  padding: var(--spacing-md);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-light);

  &:last-of-type {
    border-bottom: none;
  }
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.info-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);

  &.success {
    color: var(--success);
  }

  &.warning {
    color: var(--warning);
  }

  &.error {
    color: var(--error);
  }
}

.exp-section {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--bg-dark);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.exp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.exp-bar {
  height: 8px;
  background-color: var(--bg-hover);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-dark) 0%, var(--primary) 100%);
  border-radius: var(--radius-full);
  transition: width var(--transition-base) var(--ease-out);
  box-shadow: var(--shadow-glow);
}

.exp-percent {
  text-align: right;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: var(--font-weight-bold);
}

.stats-section {
  margin-top: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-sm);
}

.stats-grid {
  display: grid;
  gap: var(--spacing-xs);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bg-dark);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.stat-value {
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);
}
</style>