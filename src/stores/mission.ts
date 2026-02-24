/**
 * 任务状态管理
 * 使用 Pinia 管理任务相关状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Mission } from '../types'
import { nanoid } from 'nanoid'
import { drawBorder, drawTitle, drawSeparator, drawListItem, drawError, drawKeyValue } from '../utils/format'
import { generateMissionList } from '../modules/missions/generator'

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
   * 验证任务ID格式
   * @param missionId 任务 ID
   * @returns 是否有效
   */
  function isValidMissionId(missionId: string): boolean {
    // nanoid 生成的 ID 是字母数字混合，通常长度为 21
    const missionIdRegex = /^[A-Za-z0-9_-]{21}$/
    return missionIdRegex.test(missionId)
  }

  // ========== 公共方法 ==========

  /**
   * 生成可用任务
   * @param playerLevel 玩家等级
   */
  function generateMissions(playerLevel: number): void {
    available.value = generateMissionList(playerLevel)
  }

  /**
   * 接取任务
   * @param missionId 任务 ID
   * @returns 是否成功接取
   */
  function acceptMission(missionId: string): boolean {
    // 验证任务ID格式（如果不是数字索引）
    if (isNaN(parseInt(missionId)) && !isValidMissionId(missionId)) {
      return false
    }

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
    // 验证任务ID格式
    if (isNaN(parseInt(missionId)) && !isValidMissionId(missionId)) {
      return null
    }

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

/**
 * 导出任务数据（用于存档）
 * @returns 任务数据的副本
 */
export function exportMissionData(): {
  available: Mission[]
  active: Mission | null
  completed: Mission[]
} {
  const store = useMissionStore()
  return {
    available: store.available.map(m => ({ ...m })),
    active: store.active ? { ...store.active } : null,
    completed: store.completed.map(m => ({ ...m })),
  }
}

/**
 * 导入任务数据（用于读档）
 * @param data 任务数据
 */
export function importMissionData(data: {
  available: Mission[]
  active: Mission | null
  completed: Mission[]
}): void {
  const store = useMissionStore()
  store.available = data.available.map(m => ({ ...m }))
  store.active = data.active ? { ...data.active } : null
  store.completed = data.completed.map(m => ({ ...m }))
}