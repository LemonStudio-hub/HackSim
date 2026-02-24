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
 * 命令分类信息
 */
interface CommandCategory {
  name: string
  commands: Array<{ name: string; usage: string; description: string }>
}

/**
 * 获取所有命令分类信息
 * @returns 命令分类数组
 */
function getCommandCategories(): CommandCategory[] {
  return [
    {
      name: 'Basic Commands',
      commands: [
        { name: 'help', usage: 'help [command]', description: 'Show available commands' },
        { name: 'clear', usage: 'clear', description: 'Clear the terminal screen' },
        { name: 'info', usage: 'info', description: 'Show player information' },
        { name: 'game', usage: 'game', description: 'Show game information' },
        { name: 'version', usage: 'version', description: 'Show version information' },
      ],
    },
    {
      name: 'Hacking Commands',
      commands: [
        { name: 'scan', usage: 'scan <IP>', description: 'Scan a target IP address' },
        { name: 'connect', usage: 'connect <IP>', description: 'Connect to a target system' },
        { name: 'hack', usage: 'hack <IP>', description: 'Hack a target system' },
      ],
    },
    {
      name: 'Mission Commands',
      commands: [
        { name: 'missions', usage: 'missions', description: 'Show available missions' },
        { name: 'accept', usage: 'accept <ID|index>', description: 'Accept a mission by ID or index' },
        { name: 'status', usage: 'status', description: 'Show current mission status' },
      ],
    },
  ]
}

/**
 * 生成帮助信息
 * @param specificCommand 特定命令名称（可选）
 * @returns 帮助信息字符串
 */
function generateHelpInfo(specificCommand?: string): string {
  const categories = getCommandCategories()

  // 如果指定了命令，显示该命令的详细信息
  if (specificCommand) {
    const commandName = specificCommand.toLowerCase()
    let found = false
    let result = drawHeader(`COMMAND HELP: ${commandName.toUpperCase()}`) + '\n\n'

    for (const category of categories) {
      const command = category.commands.find(cmd => cmd.name === commandName)
      if (command) {
        found = true
        result += drawSubHeader(`${category.name}:\n`)
        result += drawListItem('Command:', command.name)
        result += drawListItem('Usage:', command.usage)
        result += drawListItem('Description:', command.description)
        break
      }
    }

    if (!found) {
      result += drawError(`Command "${commandName}" not found.`)
      result += '\n\n' + drawSubHeader('Usage:')
      result += 'Use "help" to see all available commands.'
    }

    return result
  }

  // 显示所有命令
  let result = drawHeader('AVAILABLE COMMANDS') + '\n\n'

  for (const category of categories) {
    result += drawSubHeader(`${category.name}:\n`)
    for (const command of category.commands) {
      result += drawListItem(command.name, command.usage)
    }
    result += '\n'
  }

  result += drawSubHeader('Usage:')
  result += 'Use "help <command>" for more information about a specific command.'

  return result
}

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
    return generateHelpInfo(args[0])
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
