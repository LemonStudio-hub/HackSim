/**
 * 基础命令定义
 * 包含 help、clear、info 等基础命令
 */

import type { BaseCommand } from './registry'
import { usePlayerStore } from '../../stores/player'
import { useGameStore } from '../../stores/game'
import { GAME_CONFIG } from '../../constants/game'
import {
  drawBorder,
  drawTitle,
  drawSeparator,
  drawListItem,
  drawHeader,
  drawSubHeader,
  drawError,
  drawKeyValue,
} from '../../utils/format'

/**
 * Help 命令 - 显示帮助信息
 */
export const helpCommand: BaseCommand = {
  name: 'help',
  description: 'Show available commands',
  usage: 'help [command]',
  validation: {
    maxArgs: 1,
  },
  async execute(args: string[]): Promise<string> {
    if (args.length > 0) {
      // 显示特定命令的帮助
      const commandName = args[0].toLowerCase()
      
      // 由于我们无法直接访问已注册的命令，这里显示所有命令的基本信息
      return drawHeader(`COMMAND HELP: ${commandName.toUpperCase()}`) + `

${drawSubHeader('Basic Commands:')}
${drawListItem('help', 'Show this help message')}
${drawListItem('clear', 'Clear the terminal screen')}
${drawListItem('info', 'Show player information')}
${drawListItem('game', 'Show game information')}
${drawListItem('version', 'Show version information')}

${drawSubHeader('Hacking Commands:')}
${drawListItem('scan <IP>', 'Scan a target IP address')}
${drawListItem('connect <IP>', 'Connect to a target system')}
${drawListItem('hack <IP>', 'Hack a target system')}

${drawSubHeader('Mission Commands:')}
${drawListItem('missions', 'Show available missions')}
${drawListItem('accept <ID>', 'Accept a mission by ID or index')}
${drawListItem('status', 'Show current mission status')}

${drawError('Note: Detailed command help is not implemented yet.')}`
    }

    return drawHeader('AVAILABLE COMMANDS') + `

${drawSubHeader('Basic Commands:')}
${drawListItem('help', 'Show this help message')}
${drawListItem('clear', 'Clear the terminal screen')}
${drawListItem('info', 'Show player information')}
${drawListItem('game', 'Show game information')}
${drawListItem('version', 'Show version information')}

${drawSubHeader('Hacking Commands:')}
${drawListItem('scan <IP>', 'Scan a target IP address')}
${drawListItem('connect <IP>', 'Connect to a target system')}
${drawListItem('hack <IP>', 'Hack a target system')}

${drawSubHeader('Mission Commands:')}
${drawListItem('missions', 'Show available missions')}
${drawListItem('accept <ID>', 'Accept a mission by ID or index')}
${drawListItem('status', 'Show current mission status')}

${drawSubHeader('Usage:')}
Use "help <command>" for more information about a specific command.`
  },
}

/**
 * Clear 命令 - 清空终端
 */
export const clearCommand: BaseCommand = {
  name: 'clear',
  description: 'Clear the terminal screen',
  usage: 'clear',
  aliases: ['cls'],
  async execute(): Promise<string> {
    // 不返回任何内容，让 Terminal 组件处理清空操作
    return '__CLEAR__'
  },
}

/**
 * Info 命令 - 显示玩家信息
 */
export const infoCommand: BaseCommand = {
  name: 'info',
  description: 'Show player information',
  usage: 'info',
  async execute(): Promise<string> {
    const playerStore = usePlayerStore()
    return playerStore.getPlayerInfo()
  },
}

/**
 * Game 命令 - 显示游戏信息
 */
export const gameCommand: BaseCommand = {
  name: 'game',
  description: 'Show game information',
  usage: 'game',
  async execute(): Promise<string> {
    const gameStore = useGameStore()
    return gameStore.getGameInfo()
  },
}

/**
 * Version 命令 - 显示版本信息
 */
export const versionCommand: BaseCommand = {
  name: 'version',
  description: 'Show version information',
  usage: 'version',
  async execute(): Promise<string> {
    const content: string[] = []
    content.push(drawTitle('VERSION'))
    content.push(drawSeparator())
    content.push(drawKeyValue('Name', GAME_CONFIG.NAME, 8))
    content.push(drawKeyValue('Version', GAME_CONFIG.VERSION, 8))
    content.push(drawSeparator())
    content.push(drawListItem('Built with', 'Vue 3 + TypeScript'))
    content.push(drawListItem('Copyright', '© 2026 HackSim. All rights reserved.'))
    
    return drawBorder(content)
  },
}
