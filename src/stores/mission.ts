/**
 * 任务状态管理
 * 使用 Pinia 管理任务相关状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Mission } from '../types'
import { nanoid } from 'nanoid'
import { MISSION_CONFIG, NETWORK_CONFIG } from '../constants/game'
import { drawBorder, drawTitle, drawSeparator, drawListItem, drawError, drawKeyValue } from '../utils/format'

export const useMissionStore = defineStore('mission', () => {
  // ========== 状态 ==========

  /** 可用任务列表 */
  const available = ref<Mission[]>([])

  /** 活跃任务 */
  const active = ref<Mission | null>(null)

  /** 已完成任务 */
  const completed = ref<Mission[]>([])

  // ========== 计算属性 ==========

  /** 所有任务列表 */
  const allMissions = computed(() => {
    return [...available.value, ...(active.value ? [active.value] : []), ...completed.value]
  })

  // ========== 私有方法 ==========

  /**
   * 生成随机 IP 地址
   * @returns IP 地址字符串
   */
  function generateRandomIP(): string {
    const range = NETWORK_CONFIG.COMMON_RANGES[
      Math.floor(Math.random() * NETWORK_CONFIG.COMMON_RANGES.length)
    ]
    const suffix = Math.floor(Math.random() * 254) + 1
    return `${range}${suffix}`
  }

  /**
   * 生成任务标题
   * @param difficulty 任务难度
   * @returns 任务标题
   */
  function generateMissionTitle(difficulty: number): string {
    const titles = [
      ['Simple Recon', 'Basic Infiltration', 'Data Collection'],
      ['Server Breach', 'Password Crack', 'Port Scan'],
      ['Network Intrusion', 'Database Hack', 'System Exploit'],
      ['Corporate Espionage', 'Advanced Penetration', 'Security Bypass'],
      ['Master Heist', 'Legendary Hack', 'Ultimate Breach'],
    ]
    const levelTitles = titles[difficulty - 1]
    return levelTitles[Math.floor(Math.random() * levelTitles.length)]
  }

  /**
   * 生成任务描述
   * @param difficulty 任务难度
   * @returns 任务描述
   */
  function generateMissionDescription(difficulty: number): string {
    const descriptions = [
      'A simple reconnaissance mission.',
      'Breach a basic server and extract data.',
      'Penetrate a network and steal sensitive information.',
      'Execute a sophisticated attack on a corporate system.',
      'An impossible mission requiring elite skills.',
    ]
    return descriptions[difficulty - 1]
  }

  /**
   * 生成任务奖励
   * @param difficulty 任务难度
   * @returns 奖励对象
   */
  function generateMissionReward(difficulty: number): { exp: number; credits: number } {
    const baseExp = 100
    const baseCredits = 200
    const multiplier = Math.pow(2, difficulty - 1)
    return {
      exp: baseExp * multiplier,
      credits: baseCredits * multiplier,
    }
  }

  // ========== 公共方法 ==========

  /**
   * 生成可用任务
   * @param playerLevel 玩家等级
   */
  function generateMissions(playerLevel: number): void {
    available.value = []

    // 根据等级生成任务
    const missionCount = MISSION_CONFIG.MISSIONS_PER_LEVEL + Math.floor(playerLevel / 2)

    for (let i = 0; i < missionCount; i++) {
      // 难度不超过玩家等级 + 2
      const maxDifficulty = Math.min(MISSION_CONFIG.MAX_DIFFICULTY, playerLevel + 2)
      const difficulty = Math.floor(Math.random() * maxDifficulty) + 1

      const mission: Mission = {
        id: nanoid(),
        title: generateMissionTitle(difficulty),
        description: generateMissionDescription(difficulty),
        target: generateRandomIP(),
        difficulty,
        reward: generateMissionReward(difficulty),
        status: 'available',
      }

      available.value.push(mission)
    }
  }

  /**
   * 接取任务
   * @param missionId 任务 ID
   * @returns 是否成功接取
   */
  function acceptMission(missionId: string): boolean {
    const missionIndex = available.value.findIndex((m) => m.id === missionId)

    if (missionIndex === -1) {
      return false
    }

    const mission = available.value.splice(missionIndex, 1)[0]
    mission.status = 'active'
    active.value = mission

    return true
  }

  /**
   * 完成当前活跃任务
   * @returns 奖励对象
   */
  function completeMission(): { exp: number; credits: number } | null {
    if (!active.value) {
      return null
    }

    const mission = active.value
    mission.status = 'completed'
    completed.value.push(mission)
    active.value = null

    return mission.reward
  }

  /**
   * 放弃当前任务
   */
  function abandonMission(): void {
    if (active.value) {
      active.value.status = 'available'
      available.value.push(active.value)
      active.value = null
    }
  }

  /**
   * 获取任务信息
   * @param missionId 任务 ID
   * @returns 任务信息字符串
   */
  function getMissionInfo(missionId: string): string | null {
    const mission =
      available.value.find((m) => m.id === missionId) ||
      (active.value?.id === missionId ? active.value : null) ||
      completed.value.find((m) => m.id === missionId)
  
    if (!mission) {
      return null
    }
  
    const difficultyStars = '★'.repeat(mission.difficulty) + '☆'.repeat(5 - mission.difficulty)
  
    const content: string[] = []
    content.push(drawTitle(`MISSION: ${mission.title}`, 0))
    content.push(drawSeparator())
    content.push(drawKeyValue('Description', mission.description, 12))
    content.push(drawKeyValue('Target', mission.target, 12))
    content.push(drawKeyValue('Difficulty', difficultyStars, 12))
    content.push(drawKeyValue('Status', mission.status.toUpperCase(), 12))
    content.push(drawSeparator())
    content.push(drawListItem('REWARDS:', ''))
    content.push(drawListItem('EXP:', mission.reward.exp.toString()))
    content.push(drawListItem('Credits:', mission.reward.credits.toString()))
  
    return drawBorder(content)
  }
  /**
   * 获取任务列表
   * @returns 任务列表字符串
   */
  function getMissionList(): string {
    if (available.value.length === 0 && !active.value) {
      return drawError('No missions available. Try again later.')
    }
  
    const content: string[] = []
    content.push(drawTitle('AVAILABLE MISSIONS', 14))
    content.push(drawSeparator())
  
    if (active.value) {
      const stars = '★'.repeat(active.value.difficulty) + '☆'.repeat(5 - active.value.difficulty)
      const missionLine = `  [ACTIVE] ${active.value.id.substring(0, 8)} - ${active.value.title} ${stars}`
      content.push(missionLine)
    }
  
    available.value.forEach((mission, index) => {
      const stars = '★'.repeat(mission.difficulty) + '☆'.repeat(5 - mission.difficulty)
      const missionLine = `  [${(index + 1).toString().padStart(2)}] ${mission.id.substring(0, 8)} - ${mission.title} ${stars}`
      content.push(missionLine.padEnd(58))
    })
  
    const result = drawBorder(content)
    
    return result + '\n\n' + drawListItem('Use:', '"accept <ID>" to accept a mission')
  }
  /**
   * 获取当前任务状态
   * @returns 当前任务信息字符串
   */
  function getCurrentMissionStatus(): string {
    if (!active.value) {
      return drawError('No active mission.') + '\nUse "missions" to see available missions.'
    }
  
    const stars = '★'.repeat(active.value.difficulty) + '☆'.repeat(5 - active.value.difficulty)
    
    const content: string[] = []
    content.push(drawTitle('CURRENT MISSION', 0))
    content.push(drawSeparator())
    content.push(drawKeyValue('Title', active.value.title, 12))
    content.push(drawKeyValue('Target', active.value.target, 12))
    content.push(drawKeyValue('Difficulty', stars, 12))
    content.push(drawSeparator())
    content.push(drawListItem('OBJECTIVES:', ''))
    content.push(drawListItem('[ ]', `Scan target (${active.value.target})`))
    content.push(drawListItem('[ ]', 'Connect to target'))
    content.push(drawListItem('[ ]', 'Hack target'))
  
    return drawBorder(content)
  }
  /**
   * 重置任务系统
   */
  function reset(): void {
    available.value = []
    active.value = null
    completed.value = []
  }

  return {
    available,
    active,
    completed,
    allMissions,
    generateMissions,
    acceptMission,
    completeMission,
    abandonMission,
    getMissionInfo,
    getMissionList,
    getCurrentMissionStatus,
    reset,
  }
})