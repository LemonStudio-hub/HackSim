/**
 * 游戏全局状态管理
 * 使用 Pinia 管理游戏相关状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { GAME_CONFIG } from '../constants/game'

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
  const playTimeTimer = ref<number | null>(null)

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
    isInitialized.value = true
    isRunning.value = true
    startTime.value = Date.now()
    startPlayTimeTimer()
  }

  /**
   * 开始游戏
   */
  function start(): void {
    isRunning.value = true
    startPlayTimeTimer()
  }

  /**
   * 暂停游戏
   */
  function pause(): void {
    isRunning.value = false
    stopPlayTimeTimer()
  }

  /**
   * 继续游戏
   */
  function resume(): void {
    isRunning.value = true
    startPlayTimeTimer()
  }

  /**
   * 停止游戏
   */
  function stop(): void {
    isRunning.value = false
    stopPlayTimeTimer()
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
  }

  /**
   * 开始播放时间计时器
   */
  function startPlayTimeTimer(): void {
    if (playTimeTimer.value) {
      return
    }

    playTimeTimer.value = window.setInterval(() => {
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
   * 获取游戏信息
   * @returns 游戏信息字符串
   */
  function getGameInfo(): string {
    const lineLength = 60
    const contentLength = lineLength - 2 // 去掉两边边框
    
    const nameLine = `  ${GAME_CONFIG.NAME}${' '.repeat(Math.max(0, contentLength - GAME_CONFIG.NAME.length))}`
    const versionLine = `  Version ${GAME_CONFIG.VERSION}${' '.repeat(Math.max(0, contentLength - 8 - GAME_CONFIG.VERSION.length))}`
    const statusValue = isRunning.value ? 'Running' : 'Paused'
    const statusLine = `  Status:      ${statusValue}${' '.repeat(Math.max(0, contentLength - 13 - statusValue.length))}`
    const initValue = isInitialized.value ? 'Yes' : 'No'
    const initLine = `  Initialized: ${initValue}${' '.repeat(Math.max(0, contentLength - 14 - initValue.length))}`
    const timeLine = `  Play Time:   ${formattedPlayTime.value}${' '.repeat(Math.max(0, contentLength - 13 - formattedPlayTime.value.length))}`
    
    return `
╔════════════════════════════════════════════════════════════╗
║${nameLine}║
║${versionLine}║
╠════════════════════════════════════════════════════════════╣
║${statusLine}║
║${initLine}║
║${timeLine}║
╚════════════════════════════════════════════════════════════╝
    `.trim()
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
    getGameInfo,
  }
})