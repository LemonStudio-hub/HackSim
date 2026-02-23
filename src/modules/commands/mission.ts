/**
 * 任务命令定义
 * 包含 missions、accept、status 等任务命令
 */

import type { BaseCommand } from './registry'
import { useMissionStore } from '../../stores/mission'

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
  async execute(args: string[]): Promise<string> {
    if (args.length === 0) {
      return 'Error: Mission ID or index required\nUsage: accept <ID|index>\n\nUse "missions" to see available missions.'
    }

    const missionStore = useMissionStore()
    const identifier = args[0]

    // 尝试通过索引接取任务
    const index = parseInt(identifier)
    if (!isNaN(index) && index > 0 && index <= missionStore.available.length) {
      const mission = missionStore.available[index - 1]
      const success = missionStore.acceptMission(mission.id)

      if (success) {
        return `
╔════════════════════════════════════════════════════════════╗
║  MISSION ACCEPTED                                          ║
╠════════════════════════════════════════════════════════════╣
║  Title:    ${mission.title.padEnd(46)}║
║  Target:   ${mission.target.padEnd(46)}║
║  Reward:   ${mission.reward.exp} EXP, ${mission.reward.credits} Credits${' '.repeat(8 - mission.reward.exp.toString().length)}║
║                                                              ║
║  Use 'status' to view mission objectives.                   ║
╚════════════════════════════════════════════════════════════╝
        `.trim()
      }
    }

    // 尝试通过 ID 接取任务
    const success = missionStore.acceptMission(identifier)

    if (success) {
      return 'Mission accepted successfully!\nUse "status" to view mission objectives.'
    }

    return `Error: Mission "${identifier}" not found.\n\nUse "missions" to see available missions.`
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
