/**
 * 基础命令定义
 * 包含 help、clear、info 等基础命令
 */

import type { BaseCommand } from './registry'
import { usePlayerStore } from '../../stores/player'
import { useGameStore } from '../../stores/game'
import { GAME_CONFIG } from '../../constants/game'

/**
 * Help 命令 - 显示帮助信息
 */
export const helpCommand: BaseCommand = {
  name: 'help',
  description: 'Show available commands',
  usage: 'help [command]',
  async execute(args: string[]): Promise<string> {
    if (args.length > 0) {
      // 显示特定命令的帮助
      const commandName = args[0]
      return `Help for command: ${commandName}\n(Coming soon)`
    }

    return `Available Commands:
  Basic Commands:
    help         - Show this help message
    clear        - Clear the terminal
    info         - Show player information
    game         - Show game information
    version      - Show version information
  
  Hacking Commands:
    scan <IP>    - Scan a target IP address
    connect <IP> - Connect to a target system
    hack <IP>    - Hack a target system
  
  Mission Commands:
    missions     - Show available missions
    accept <ID>  - Accept a mission by ID
    status       - Show current mission status
  
  Use 'help <command>' for more information about a command`
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
    return `${GAME_CONFIG.NAME} v${GAME_CONFIG.VERSION}

A hacker simulator game built with Vue 3 + TypeScript

© 2026 HackSim. All rights reserved.`
  },
}