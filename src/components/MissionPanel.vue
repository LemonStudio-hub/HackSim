<template>
  <div class="mission-panel">
    <div class="panel-header">
      <h2 class="panel-title">MISSIONS</h2>
      <div v-if="activeMission" class="mission-badge active">ACTIVE</div>
      <div v-else class="mission-badge">AVAILABLE</div>
    </div>

    <div class="panel-content">
      <!-- 当前活跃任务 -->
      <div v-if="activeMission" class="active-mission">
        <div class="mission-header">
          <h3 class="mission-title">{{ activeMission.title }}</h3>
          <div class="mission-difficulty">
            <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= activeMission.difficulty }">★</span>
          </div>
        </div>

        <div class="mission-info">
          <div class="info-row">
            <span class="info-label">Target:</span>
            <span class="info-value success">{{ activeMission.target }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Reward:</span>
            <span class="info-value warning">{{ activeMission.reward.exp }} EXP, {{ activeMission.reward.credits }} Credits</span>
          </div>
        </div>

        <div class="mission-objectives">
          <h4 class="objectives-title">OBJECTIVES:</h4>
          <ul class="objectives-list">
            <li class="objective-item">
              <span class="objective-text">Scan target ({{ activeMission.target }})</span>
            </li>
            <li class="objective-item">
              <span class="objective-text">Connect to target</span>
            </li>
            <li class="objective-item">
              <span class="objective-text">Hack target</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 无活跃任务 -->
      <div v-else class="no-mission">
        <p class="no-mission-text">No active mission</p>
        <button class="btn-primary" @click="showMissions">
          View Available Missions
        </button>
      </div>

      <!-- 可用任务列表 -->
      <div v-if="availableMissions.length > 0" class="available-missions">
        <h3 class="section-title">AVAILABLE MISSIONS ({{ availableMissions.length }})</h3>
        <div class="missions-list">
          <div
            v-for="(mission, index) in availableMissions.slice(0, 3)"
            :key="mission.id"
            class="mission-card"
            @click="acceptMission(mission.id)"
          >
            <div class="mission-card-header">
              <span class="mission-number">{{ index + 1 }}</span>
              <div class="mission-difficulty-small">
                <span v-for="i in 5" :key="i" class="star-small" :class="{ filled: i <= mission.difficulty }">★</span>
              </div>
            </div>
            <h4 class="mission-card-title">{{ mission.title }}</h4>
            <div class="mission-card-info">
              <span class="mission-target">{{ mission.target }}</span>
              <span class="mission-reward">{{ mission.reward.exp }} EXP</span>
            </div>
          </div>
        </div>
        <button v-if="availableMissions.length > 3" class="btn-secondary" @click="showMissions">
          View All Missions
        </button>
      </div>

      <!-- 统计信息 -->
      <div class="mission-stats">
        <div class="stat-row">
          <span class="stat-label">Completed:</span>
          <span class="stat-value">{{ completedCount }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Available:</span>
          <span class="stat-value">{{ availableMissions.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMissionStore } from '../stores/mission'
import { useTerminalStore } from '../stores/terminal'

const missionStore = useMissionStore()
const terminalStore = useTerminalStore()

const activeMission = computed(() => missionStore.active)
const availableMissions = computed(() => missionStore.available)
const completedCount = computed(() => missionStore.completed.length)

function acceptMission(missionId: string) {
  const success = missionStore.acceptMission(missionId)
  if (success && terminalStore.terminalInstance) {
    terminalStore.terminalInstance.writeln('\nMission accepted successfully!')
    terminalStore.terminalInstance.writeln(`Use 'status' to view mission objectives.`)
  }
}

function showMissions() {
  if (terminalStore.terminalInstance) {
    terminalStore.terminalInstance.writeln('\n')
    terminalStore.terminalInstance.writeln(missionStore.getMissionList())
  }
}
</script>

<style scoped lang="scss">
.mission-panel {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
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

.mission-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background-color: var(--bg-hover);
  color: var(--text-muted);

  &.active {
    background: linear-gradient(135deg, var(--success) 0%, var(--primary-dark) 100%);
    color: var(--bg-darker);
    box-shadow: var(--shadow-glow);
  }
}

.panel-content {
  padding: var(--spacing-md);
  flex: 1;
  overflow-y: auto;
}

.active-mission {
  background: linear-gradient(135deg, var(--bg-dark) 0%, rgba(0, 255, 65, 0.05) 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.mission-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.mission-difficulty {
  .star {
    color: var(--bg-hover);
    font-size: var(--font-size-sm);

    &.filled {
      color: var(--warning);
      text-shadow: 0 0 8px rgba(255, 204, 0, 0.5);
    }
  }
}

.mission-info {
  margin-bottom: var(--spacing-sm);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
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
}

.mission-objectives {
  margin-top: var(--spacing-sm);
}

.objectives-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-xs);
}

.objectives-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.objective-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);

  &::before {
    content: '□';
    margin-right: var(--spacing-xs);
    color: var(--primary);
  }
}

.no-mission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
}

.no-mission-text {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-md);
}

.available-missions {
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

.missions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.mission-card {
  background-color: var(--bg-dark);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-base) var(--ease-out);

  &:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }
}

.mission-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.mission-number {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
  background-color: var(--bg-hover);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.mission-difficulty-small {
  .star-small {
    color: var(--bg-hover);
    font-size: var(--font-size-xs);

    &.filled {
      color: var(--warning);
    }
  }
}

.mission-card-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.mission-card-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mission-target {
  font-size: var(--font-size-xs);
  color: var(--success);
  font-family: var(--font-family-mono);
}

.mission-reward {
  font-size: var(--font-size-xs);
  color: var(--warning);
  font-weight: var(--font-weight-bold);
}

.mission-stats {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
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

.btn-primary,
.btn-secondary {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base) var(--ease-out);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: var(--bg-darker);
  box-shadow: var(--shadow-glow);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
  }
}

.btn-secondary {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  &:hover {
    background-color: var(--border-color);
    border-color: var(--primary);
  }
}
</style>