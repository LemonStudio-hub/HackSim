/**
 * 游戏全局状态管理
 * 使用 Pinia 管理游戏相关状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { GAME_CONFIG } from '../constants/game'
import { drawBorder, drawTitle, drawSeparator, drawKeyValue } from '../utils/format'
import { saveGame, loadGame, SaveData, hasSave, deleteSave } from '../utils/save'
import { exportPlayer, importPlayer } from './player'
import { exportMissionData, importMissionData } from './mission'

export const useGameStore = defineStore('game', () => {
  // ========== 状态 ==========

  /** 游戏是否正在运行 */
  const isRunning = ref(false)

  /** 游戏是否已初始化 */
  const isInitialized = ref(false)

  /** 游戏开始时间 */
  const startTime = ref<number | null>(null)

  /** 游戏运行时间（秒） */
  const playTime = ref(0)

  /** 播放时间计时器 */
  const playTimeTimer = ref<ReturnType<typeof setInterval> | null>(null)

  /** 自动保存计时器 */
  const autoSaveTimer = ref<ReturnType<typeof setInterval> | null>(null)

  // ========== 计算属性 ==========

  /** 格式化的游戏时间 */
  const formattedPlayTime = computed(() => {
    const hours = Math.floor(playTime.value / 3600)
    const minutes = Math.floor((playTime.value % 3600) / 60)
    const seconds = playTime.value % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  })

  // ========== 方法 ==========

  /**
   * 初始化游戏
   */
  function initialize(): void {
    if (isInitialized.value) return

    isInitialized.value = true
    isRunning.value = true
    startTime.value = Date.now()
    startPlayTimeTimer()
    startAutoSaveTimer()
  }
  
  /**
   * 开始游戏
   */
  function start(): void {
    if (!isInitialized.value) {
      initialize()
    } else if (!isRunning.value) {
      isRunning.value = true
      startPlayTimeTimer()
    }
  }
  /**
   * 暂停游戏
   */
  function pause(): void {
    isRunning.value = false
    stopPlayTimeTimer()
    stopAutoSaveTimer()
  }

  /**
   * 继续游戏
   */
  function resume(): void {
    isRunning.value = true
    startPlayTimeTimer()
    startAutoSaveTimer()
  }

  /**
   * 停止游戏
   */
  function stop(): void {
    isRunning.value = false
    stopPlayTimeTimer()
    stopAutoSaveTimer()
    // 停止时自动保存
    saveGameToStorage()
  }

  /**
   * 重置游戏
   */
  function reset(): void {
    isRunning.value = false
    isInitialized.value = false
    startTime.value = null
    playTime.value = 0
    stopPlayTimeTimer()
    stopAutoSaveTimer()
    // 重置时删除存档
    deleteGameSave()
  }

  /**
   * 开始播放时间计时器
   */
  function startPlayTimeTimer(): void {
    if (playTimeTimer.value) {
      return
    }

    playTimeTimer.value = setInterval(() => {
      playTime.value++
    }, 1000)
  }

  /**
   * 停止播放时间计时器
   */
  function stopPlayTimeTimer(): void {
    if (playTimeTimer.value) {
      clearInterval(playTimeTimer.value)
      playTimeTimer.value = null
    }
  }

  /**
   * 开始自动保存计时器
   */
  function startAutoSaveTimer(): void {
    if (autoSaveTimer.value) {
      return
    }

    autoSaveTimer.value = setInterval(() => {
      saveGameToStorage()
    }, GAME_CONFIG.AUTO_SAVE_INTERVAL)
  }

  /**
   * 停止自动保存计时器
   */
  function stopAutoSaveTimer(): void {
    if (autoSaveTimer.value) {
      clearInterval(autoSaveTimer.value)
      autoSaveTimer.value = null
    }
  }

  /**
   * 保存游戏到存储
   * @returns 是否保存成功
   */
  function saveGameToStorage(): boolean {
    const saveData: SaveData = {
      player: exportPlayer(),
      availableMissions: exportMissionData().available,
      activeMission: exportMissionData().active,
      completedMissions: exportMissionData().completed,
      playTime: playTime.value,
      timestamp: Date.now(),
      version: GAME_CONFIG.VERSION,
    }

    return saveGame(saveData)
  }

  /**
   * 从存储加载游戏
   * @returns 是否加载成功
   */
  function loadGameFromStorage(): boolean {
    const data = loadGame()
    if (!data) {
      return false
    }

    // 导入玩家数据
    importPlayer(data.player)

    // 导入任务数据
    importMissionData({
      available: data.availableMissions,
      active: data.activeMission,
      completed: data.completedMissions,
    })

    // 恢复游戏时间
    playTime.value = data.playTime

    return true
  }

  /**
   * 检查是否存在存档
   * @returns 是否存在存档
   */
  function checkHasSave(): boolean {
    return hasSave()
  }

  /**
   * 删除存档
   * @returns 是否删除成功
   */
  function deleteGameSave(): boolean {
    return deleteSave()
  }

  /**
   * 获取游戏信息
   * @returns 游戏信息字符串
   */
  function getGameInfo(): string {
    const statusValue = isRunning.value ? 'Running' : 'Paused'
    const initValue = isInitialized.value ? 'Yes' : 'No'
    
    const content: string[] = []
    content.push(drawTitle(GAME_CONFIG.NAME, 0))
    content.push(drawTitle(`Version ${GAME_CONFIG.VERSION}`, 0))
    content.push(drawSeparator())
    content.push(drawKeyValue('Status', statusValue, 12))
    content.push(drawKeyValue('Initialized', initValue, 14))
    content.push(drawKeyValue('Play Time', formattedPlayTime.value, 12))

    return drawBorder(content)
  }

  return {
    isRunning,
    isInitialized,
    startTime,
    playTime,
    formattedPlayTime,
    initialize,
    start,
    pause,
    resume,
    stop,
    reset,
    saveGameToStorage,
    loadGameFromStorage,
    checkHasSave,
    deleteGameSave,
    getGameInfo,
  }
})