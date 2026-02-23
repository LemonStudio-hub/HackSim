/**
 * 黑客命令定义
 * 包含 scan、connect、hack 等黑客命令
 */

import type { BaseCommand } from './registry'
import { useTerminalStore } from '../../stores/terminal'
import { useMissionStore } from '../../stores/mission'
import { usePlayerStore } from '../../stores/player'
import { NETWORK_CONFIG, THEME } from '../../constants/game'
import { sleep } from '../../utils/helpers'

/**
 * 扫描网络节点信息
 * @param _target 目标 IP（未使用，用于生成随机数据）
 * @returns 节点信息
 */
function scanTarget(_target: string): {
  name: string
  ports: number[]
  security: number
  services: string[]
} {
  // 生成随机端口
  const portCount = Math.floor(Math.random() * 5) + 1
  const ports: number[] = []
  const availablePorts = [...NETWORK_CONFIG.COMMON_PORTS]

  for (let i = 0; i < portCount && availablePorts.length > 0; i++) {
    const index = Math.floor(Math.random() * availablePorts.length)
    ports.push(availablePorts.splice(index, 1)[0])
  }

  // 端口服务映射
  const serviceMap: Record<number, string> = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    80: 'HTTP',
    443: 'HTTPS',
    3306: 'MySQL',
    5432: 'PostgreSQL',
  }

  const services = ports.map((port) => serviceMap[port] || 'Unknown')

  // 生成安全等级
  const security = Math.floor(Math.random() * 5) + 1

  // 生成节点名称
  const names = [
    'Corporate Server',
    'Database Server',
    'Web Server',
    'Mail Server',
    'File Server',
    'Backup Server',
    'Development Server',
    'Production Server',
  ]
  const name = names[Math.floor(Math.random() * names.length)]

  return { name, ports, security, services }
}

/**
 * Scan 命令 - 扫描目标
 */
export const scanCommand: BaseCommand = {
  name: 'scan',
  description: 'Scan a target IP address',
  usage: 'scan <IP>',
  async execute(args: string[]): Promise<string> {
    if (args.length === 0) {
      return 'Error: Target IP required\nUsage: scan <IP>'
    }

    const target = args[0]
    const terminalStore = useTerminalStore()

    // 验证 IP 格式
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(target)) {
      return `Error: Invalid IP address format: ${target}`
    }

    // 模拟扫描过程
    await sleep(1000)
    terminalStore.write('Initializing scan...', true)
    await sleep(500)
    terminalStore.write('Scanning ports...', true)
    await sleep(800)
    terminalStore.write('Analyzing services...', true)
    await sleep(500)
    terminalStore.write('Detecting security measures...', true)
    await sleep(300)

    // 执行扫描
    const result = scanTarget(target)

    return `
╔════════════════════════════════════════════════════════════╗
║  SCAN RESULTS FOR: ${target.padEnd(37)}║
╠════════════════════════════════════════════════════════════╣
║  Target Name:     ${result.name.padEnd(42)}║
║  Target IP:       ${target.padEnd(42)}║
║  Security Level:  ${'█'.repeat(result.security)}${'░'.repeat(5 - result.security)} (${result.security}/5)║
╠════════════════════════════════════════════════════════════╣
║  OPEN PORTS:                                                ║
${result.ports.map((port, i) => {
  return `║  Port ${port.toString().padEnd(6)} - ${result.services[i].padEnd(40)}║`
}).join('\n')}
╚════════════════════════════════════════════════════════════╝
    `.trim()
  },
}

/**
 * Connect 命令 - 连接目标
 */
export const connectCommand: BaseCommand = {
  name: 'connect',
  description: 'Connect to a target system',
  usage: 'connect <IP>',
  async execute(args: string[]): Promise<string> {
    if (args.length === 0) {
      return 'Error: Target IP required\nUsage: connect <IP>'
    }

    const target = args[0]
    const terminalStore = useTerminalStore()

    // 验证 IP 格式
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(target)) {
      return `Error: Invalid IP address format: ${target}`
    }

    // 模拟连接过程
    await sleep(800)
    terminalStore.write('Establishing connection...', true)
    await sleep(600)
    terminalStore.write('Handshake...', true)
    await sleep(400)
    terminalStore.write('Authenticating...', true)
    await sleep(300)

    // 检查是否是任务目标
    const missionStore = useMissionStore()
    const isMissionTarget = missionStore.active?.target === target

    if (isMissionTarget) {
      terminalStore.writeColored('Connection established!', THEME.SUCCESS)
      return `
╔════════════════════════════════════════════════════════════╗
║  CONNECTED TO: ${target.padEnd(40)}║
╠════════════════════════════════════════════════════════════╣
║  Status:          Connected                               ║
║  Connection Type: Secure                                  ║
║  Latency:         ${Math.floor(Math.random() * 50 + 10)}ms                                     ║
║                                                              ║
║  Use 'hack ${target}' to initiate the attack.              ║
╚════════════════════════════════════════════════════════════╝
      `.trim()
    } else {
      terminalStore.writeColored('Access denied!', THEME.ERROR)
      return `
╔════════════════════════════════════════════════════════════╗
║  CONNECTION FAILED                                        ║
╠════════════════════════════════════════════════════════════╣
║  Target: ${target.padEnd(50)}║
║  Error:  Access denied - Authorization required          ║
║                                                              ║
║  This target is not part of your current mission.         ║
╚════════════════════════════════════════════════════════════╝
      `.trim()
    }
  },
}

/**
 * Hack 命令 - 入侵目标
 */
export const hackCommand: BaseCommand = {
  name: 'hack',
  description: 'Hack a target system',
  usage: 'hack <IP>',
  async execute(args: string[]): Promise<string> {
    if (args.length === 0) {
      return 'Error: Target IP required\nUsage: hack <IP>'
    }

    const target = args[0]
    const terminalStore = useTerminalStore()
    const missionStore = useMissionStore()
    const playerStore = usePlayerStore()

    // 验证 IP 格式
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(target)) {
      return `Error: Invalid IP address format: ${target}`
    }

    // 检查是否有活跃任务
    if (!missionStore.active) {
      return 'Error: No active mission. Use "missions" to see available missions.'
    }

    // 检查是否是任务目标
    if (missionStore.active.target !== target) {
      return `Error: Target ${target} is not your current mission target.`
    }

    // 模拟入侵过程
    await sleep(1000)
    terminalStore.write('Initializing attack sequence...', true)
    await sleep(600)
    terminalStore.write('Scanning for vulnerabilities...', true)
    await sleep(800)
    terminalStore.write('Exploiting vulnerabilities...', true)
    await sleep(500)
    terminalStore.write('Bypassing firewall...', true)
    await sleep(700)
    terminalStore.write('Escalating privileges...', true)
    await sleep(600)
    terminalStore.write('Extracting data...', true)
    await sleep(800)
    terminalStore.write('Covering tracks...', true)
    await sleep(400)

    // 任务成功
    terminalStore.writeColored('Attack successful!', THEME.SUCCESS)

    // 完成任务并获取奖励
    const reward = missionStore.completeMission()

    if (reward) {
      playerStore.addExp(reward.exp)
      playerStore.addCredits(reward.credits)
      playerStore.addReputation(1)

      return `
╔════════════════════════════════════════════════════════════╗
║  ATTACK SUCCESSFUL                                         ║
╠════════════════════════════════════════════════════════════╣
║  Target:         ${target.padEnd(42)}║
║  Data Extracted: ${Math.floor(Math.random() * 100 + 50)} MB                                     ║
║  Time Taken:     ${(Math.random() * 5 + 2).toFixed(2)}s                                     ║
╠════════════════════════════════════════════════════════════╣
║  REWARDS:                                                   ║
║  EXP:            ${reward.exp}                                     ║
║  Credits:        ${reward.credits}                                     ║
║  Reputation:     +1                                      ║
╚════════════════════════════════════════════════════════════╝

Mission completed! You are now level ${playerStore.player.level}.
      `.trim()
    }

    return 'Error: Failed to complete mission.'
  },
}

/**
 * 导出所有黑客命令
 */
export const hackCommands: BaseCommand[] = [scanCommand, connectCommand, hackCommand]