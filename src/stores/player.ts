/**
 * 玩家状态管理
 * 使用 Pinia 管理玩家相关状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player } from '../types'
import { INITIAL_PLAYER, EXP_CONFIG } from '../constants/game'
import { nanoid } from 'nanoid'

export const usePlayerStore = defineStore('player', () => {
  // ========== 状态 ==========

  /** 玩家信息 */
  const player = ref<Player>({
    id: nanoid(),
    name: 'Anonymous',
    level: INITIAL_PLAYER.INITIAL_LEVEL,
    exp: INITIAL_PLAYER.INITIAL_EXP,
    credits: INITIAL_PLAYER.INITIAL_CREDITS,
    reputation: INITIAL_PLAYER.INITIAL_REPUTATION,
  })

  // ========== 计算属性 ==========

  /** 下一级所需经验 */
  const expToNextLevel = computed(() => {
    return Math.floor(
      EXP_CONFIG.BASE_EXP_REQUIREMENT *
        Math.pow(EXP_CONFIG.EXP_MULTIPLIER, player.value.level - 1)
    )
  })

  /** 当前等级进度百分比 */
  const levelProgress = computed(() => {
    const previousLevelExp =
      player.value.level === 1
        ? 0
        : Math.floor(
            EXP_CONFIG.BASE_EXP_REQUIREMENT *
              Math.pow(EXP_CONFIG.EXP_MULTIPLIER, player.value.level - 2)
          )
    const expNeeded = expToNextLevel.value - previousLevelExp
    const expGained = player.value.exp - previousLevelExp
    return Math.min(100, Math.floor((expGained / expNeeded) * 100))
  })

  // ========== 方法 ==========

  /**
   * 添加经验值
   * @param amount 经验值数量
   */
  function addExp(amount: number): void {
    const oldLevel = player.value.level
    player.value.exp += amount

    // 检查是否升级
    while (player.value.exp >= expToNextLevel.value) {
      player.value.level++
      player.value.exp -= expToNextLevel.value
    }

    if (player.value.level > oldLevel) {
      console.log(`Level up! You are now level ${player.value.level}`)
    }
  }

  /**
   * 添加信用点
   * @param amount 信用点数量
   */
  function addCredits(amount: number): void {
    player.value.credits += amount
  }

  /**
   * 消耗信用点
   * @param amount 信用点数量
   * @returns 是否成功消耗
   */
  function spendCredits(amount: number): boolean {
    if (player.value.credits < amount) {
      return false
    }
    player.value.credits -= amount
    return true
  }

  /**
   * 增加声望
   * @param amount 声望值
   */
  function addReputation(amount: number): void {
    player.value.reputation += amount
  }

  /**
   * 重置玩家状态
   */
  function reset(): void {
    player.value = {
      id: nanoid(),
      name: 'Anonymous',
      level: INITIAL_PLAYER.INITIAL_LEVEL,
      exp: INITIAL_PLAYER.INITIAL_EXP,
      credits: INITIAL_PLAYER.INITIAL_CREDITS,
      reputation: INITIAL_PLAYER.INITIAL_REPUTATION,
    }
  }

  /**
   * 获取玩家信息摘要
   * @returns 格式化的玩家信息字符串
   */
  function getPlayerInfo(): string {
    return `
╔══════════════════════════════════════╗
║          PLAYER INFO                  ║
╠══════════════════════════════════════╣
║  Name:     ${player.value.name.padEnd(24)}║
║  Level:    ${player.value.level.toString().padEnd(24)}║
║  EXP:      ${player.value.exp}/${expToNextLevel.value} (${levelProgress.value}%)${' '.repeat(5 - levelProgress.value.toString().length)}║
║  Credits:  ${player.value.credits}                          ║
║  Reputation: ${player.value.reputation}                        ║
╚══════════════════════════════════════╝
    `.trim()
  }

  return {
    player,
    expToNextLevel,
    levelProgress,
    addExp,
    addCredits,
    spendCredits,
    addReputation,
    reset,
    getPlayerInfo,
  }
})