/**
 * 命令系统入口文件
 * 统一导出所有命令和命令注册表
 */

export { CommandRegistry, type BaseCommand } from './registry'
export {
  helpCommand,
  clearCommand,
  infoCommand,
  gameCommand,
  versionCommand,
} from './basic'
export { hackCommands, scanCommand, connectCommand, hackCommand } from './hack'
export { missionCommands, missionsCommand, acceptCommand, statusCommand } from './mission'

/**
 * 获取所有命令列表
 */
export function getAllCommands() {
  const { helpCommand, clearCommand, infoCommand, gameCommand, versionCommand } = require('./basic')
  const { hackCommands } = require('./hack')
  const { missionCommands } = require('./mission')

  return [helpCommand, clearCommand, infoCommand, gameCommand, versionCommand, ...hackCommands, ...missionCommands]
}