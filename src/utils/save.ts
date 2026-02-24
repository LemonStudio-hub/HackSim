/**
 * 游戏存档工具
 * 处理游戏的保存和加载功能
 */

import type { Player } from '../types'
import type { Mission } from '../types'

/** 存档数据结构 */
export interface SaveData {
  /** 玩家数据 */
  player: Player
  /** 可用任务列表 */
  availableMissions: Mission[]
  /** 活跃任务 */
  activeMission: Mission | null
  /** 已完成任务 */
  completedMissions: Mission[]
  /** 游戏运行时间（秒） */
  playTime: number
  /** 存档时间戳 */
  timestamp: number
  /** 游戏版本 */
  version: string
}

/** 存档键名 */
const SAVE_KEY = 'hacksim_save'

/**
 * 保存游戏数据
 * @param data 存档数据
 * @returns 是否保存成功
 */
export function saveGame(data: SaveData): boolean {
  try {
    const json = JSON.stringify(data)
    localStorage.setItem(SAVE_KEY, json)
    return true
  } catch (error) {
    console.error('Failed to save game:', error)
    return false
  }
}

/**
 * 加载游戏数据
 * @returns 存档数据或 null
 */
export function loadGame(): SaveData | null {
  try {
    const json = localStorage.getItem(SAVE_KEY)
    if (!json) {
      return null
    }

    const data = JSON.parse(json) as SaveData

    // 验证存档数据完整性
    if (!data.player || !data.version) {
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to load game:', error)
    return null
  }
}

/**
 * 删除存档
 * @returns 是否删除成功
 */
export function deleteSave(): boolean {
  try {
    localStorage.removeItem(SAVE_KEY)
    return true
  } catch (error) {
    console.error('Failed to delete save:', error)
    return false
  }
}

/**
 * 检查是否存在存档
 * @returns 是否存在存档
 */
export function hasSave(): boolean {
  try {
    const json = localStorage.getItem(SAVE_KEY)
    return json !== null
  } catch (error) {
    console.error('Failed to check save:', error)
    return false
  }
}

/**
 * 获取存档信息
 * @returns 存档信息或 null
 */
export function getSaveInfo(): { timestamp: number; version: string; playerLevel: number; playTime: number } | null {
  try {
    const json = localStorage.getItem(SAVE_KEY)
    if (!json) {
      return null
    }

    const data = JSON.parse(json) as SaveData

    return {
      timestamp: data.timestamp,
      version: data.version,
      playerLevel: data.player.level,
      playTime: data.playTime,
    }
  } catch (error) {
    console.error('Failed to get save info:', error)
    return null
  }
}

/**
 * 格式化存档时间
 * @param timestamp 时间戳
 * @returns 格式化的时间字符串
 */
export function formatSaveTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}