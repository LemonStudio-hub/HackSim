/**
 * 任务生成器
 * 负责生成各种类型的任务
 */

import type { Mission } from '../../types'
import { nanoid } from 'nanoid'
import { MISSION_CONFIG, NETWORK_CONFIG } from '../../constants/game'

/**
 * 生成随机 IP 地址
 * @returns IP 地址字符串
 */
export function generateRandomIP(): string {
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
export function generateMissionTitle(difficulty: number): string {
  const titles = [
    ['Simple Recon', 'Basic Infiltration', 'Data Collection'],
    ['Server Breach', 'Password Crack', 'Port Scan'],
    ['Network Intrusion', 'Database Hack', 'System Exploit'],
    ['Corporate Espionage', 'Advanced Penetration', 'Security Bypass'],
    ['Master Heist', 'Legendary Hack', 'Ultimate Breach'],
  ]
  const levelTitles = titles[difficulty - 1] || titles[0]
  return levelTitles[Math.floor(Math.random() * levelTitles.length)]
}

/**
 * 生成任务描述
 * @param difficulty 任务难度
 * @returns 任务描述
 */
export function generateMissionDescription(difficulty: number): string {
  const descriptions = [
    'A simple reconnaissance mission.',
    'Breach a basic server and extract data.',
    'Penetrate a network and steal sensitive information.',
    'Execute a sophisticated attack on a corporate system.',
    'An impossible mission requiring elite skills.',
  ]
  return descriptions[difficulty - 1] || descriptions[0]
}

/**
 * 生成任务奖励
 * @param difficulty 任务难度
 * @returns 奖励对象
 */
export function generateMissionReward(difficulty: number): { exp: number; credits: number } {
  const baseExp = 100
  const baseCredits = 200
  const multiplier = Math.pow(2, difficulty - 1)
  return {
    exp: baseExp * multiplier,
    credits: baseCredits * multiplier,
  }
}

/**
 * 生成单个任务
 * @param difficulty 任务难度
 * @returns 任务对象
 */
export function generateMission(difficulty: number): Mission {
  return {
    id: nanoid(),
    title: generateMissionTitle(difficulty),
    description: generateMissionDescription(difficulty),
    target: generateRandomIP(),
    difficulty,
    reward: generateMissionReward(difficulty),
    status: 'available',
  }
}

/**
 * 生成任务列表
 * @param playerLevel 玩家等级
 * @returns 任务列表
 */
export function generateMissionList(playerLevel: number): Mission[] {
  const missions: Mission[] = []

  // 根据等级生成任务
  const missionCount = MISSION_CONFIG.MISSIONS_PER_LEVEL + Math.floor(playerLevel / 2)

  for (let i = 0; i < missionCount; i++) {
    // 难度不超过玩家等级 + 2
    const maxDifficulty = Math.min(MISSION_CONFIG.MAX_DIFFICULTY, playerLevel + 2)
    const difficulty = Math.floor(Math.random() * maxDifficulty) + 1

    missions.push(generateMission(difficulty))
  }

  return missions
}