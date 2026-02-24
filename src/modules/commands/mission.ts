/**
 * 任务命令定义
 * 包含 missions、accept、status 等任务命令
 */

import type { BaseCommand } from './registry'
import { useMissionStore } from '../../stores/mission'
import {
  drawBorder,
  drawTitle,
  drawSeparator,
  drawKeyValue,
  drawSuccess,
  drawError,
  drawListItem,
} from '../../utils/format'

/**
 * Missions 命令 - 显示可用任务
 */
export const missionsCommand: BaseCommand = {
  name: 'missions',
  description: 'Show available missions',
  usage: 'missions',
  aliases: ['quest', 'tasks'],
  async execute(): Promise<string> {
    const missionStore = useMissionStore()
    return missionStore.getMissionList()
  },
}

/**
 * Accept 命令 - 接取任务
 */
export const acceptCommand: BaseCommand = {
  name: 'accept',
  description: 'Accept a mission by ID or index',
  usage: 'accept <ID|index>',
  validation: {
    minArgs: 1,
    maxArgs: 1,
  },
  async execute(args: string[]): Promise<string> {
    const missionStore = useMissionStore()
    const identifier = args[0]

    // 检查是否已经有活跃任务
    if (missionStore.active) {
      return drawError('You already have an active mission.') + '\n\nUse "status" to view your current mission or complete it first.'
    }

    // 尝试通过索引接取任务
    const index = parseInt(identifier)
    if (!isNaN(index) && index > 0 && index <= missionStore.available.length) {
      const mission = missionStore.available[index - 1]
      const success = missionStore.acceptMission(mission.id)

      if (success) {
        const content: string[] = []
        content.push(drawTitle('MISSION ACCEPTED', 2))
        content.push(drawSeparator())
        content.push(drawKeyValue('Title', mission.title, 10))
        content.push(drawKeyValue('Target', mission.target, 10))
        content.push(drawKeyValue('Reward', `${mission.reward.exp} EXP, ${mission.reward.credits} Credits`, 10))
        content.push(drawSeparator())
        content.push(drawListItem('Next:', 'Use "status" to view mission objectives'))
        
        return drawBorder(content)
      } else {
        return drawError('Failed to accept mission. The mission may no longer be available.')
      }
    }

    // 尝试通过 ID 接取任务
    const success = missionStore.acceptMission(identifier)

    if (success) {
      return drawSuccess('Mission accepted successfully!') + '\nUse "status" to view mission objectives.'
    }

    return drawError(`Mission "${identifier}" not found.`) + '\n\nUse "missions" to see available missions.'
  },
}

/**
 * Status 命令 - 显示当前任务状态
 */
export const statusCommand: BaseCommand = {
  name: 'status',
  description: 'Show current mission status',
  usage: 'status',
  async execute(): Promise<string> {
    const missionStore = useMissionStore()
    return missionStore.getCurrentMissionStatus()
  },
}

/**
 * 导出所有任务命令
 */
export const missionCommands: BaseCommand[] = [missionsCommand, acceptCommand, statusCommand]
