/**
 * 黑客命令定义
 * 包含 scan、connect、hack 等黑客命令
 */

import type { BaseCommand } from './registry'
import { useTerminalStore } from '../../stores/terminal'
import { useMissionStore } from '../../stores/mission'
import { usePlayerStore } from '../../stores/player'
import { NETWORK_CONFIG, THEME, HACK_CONFIG } from '../../constants/game'
import { sleep, isValidIP } from '../../utils/helpers'
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
  const { min: minPorts, max: maxPorts } = HACK_CONFIG.PORT_COUNT_RANGE
  const portCount = Math.floor(Math.random() * (maxPorts - minPorts + 1)) + minPorts
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
  const { min: minSec, max: maxSec } = HACK_CONFIG.SECURITY_LEVEL_RANGE
  const security = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec

  // 生成节点名称
  const name = NETWORK_CONFIG.SERVER_NAMES[Math.floor(Math.random() * NETWORK_CONFIG.SERVER_NAMES.length)]

  return { name, ports, security, services }
}

/**
 * Scan 命令 - 扫描目标
 */
export const scanCommand: BaseCommand = {
  name: 'scan',
  description: 'Scan a target IP address',
  usage: 'scan <IP>',
  validation: {
    minArgs: 1,
    maxArgs: 1,
    validate: (args: string[]) => {
      if (!isValidIP(args[0])) {
        return {
          valid: false,
          message: `Error: Invalid IP address format: ${args[0]}`,
        }
      }
      return { valid: true }
    },
  },
  async execute(args: string[]): Promise<string> {
    const target = args[0]
    const terminalStore = useTerminalStore()

    // 模拟扫描过程
    await sleep(HACK_CONFIG.DELAY.SCAN_INIT)
    terminalStore.write('Initializing scan...', true)
    await sleep(HACK_CONFIG.DELAY.SCAN_PORTS)
    terminalStore.write('Scanning ports...', true)
    await sleep(HACK_CONFIG.DELAY.SCAN_SERVICES)
    terminalStore.write('Analyzing services...', true)
    await sleep(HACK_CONFIG.DELAY.SCAN_SECURITY)
    terminalStore.write('Detecting security measures...', true)
    await sleep(HACK_CONFIG.DELAY.SCAN_DETECT)

    // 执行扫描
    const result = scanTarget(target)

    // 绘制扫描结果
    const content: string[] = []
    content.push(drawTitle('SCAN RESULTS FOR ' + target, 2))
    content.push(drawSeparator())
    content.push(drawKeyValue('Target Name', result.name, 15))
    content.push(drawKeyValue('Target IP', target, 15))
    content.push(drawKeyValue('Security Level', '█'.repeat(result.security) + '░'.repeat(5 - result.security) + ` (${result.security}/5)`, 15))
    content.push(drawSeparator())
    content.push(drawListItem('OPEN PORTS:', ''))
    
    result.ports.forEach((port, i) => {
      content.push(drawListItem(`Port ${port}:`, result.services[i]))
    })
    
    return drawBorder(content)
  },
}
export const connectCommand: BaseCommand = {
  name: 'connect',
  description: 'Connect to a target system',
  usage: 'connect <IP>',
  validation: {
    minArgs: 1,
    maxArgs: 1,
    validate: (args: string[]) => {
      if (!isValidIP(args[0])) {
        return {
          valid: false,
          message: `Error: Invalid IP address format: ${args[0]}`,
        }
      }
      return { valid: true }
    },
  },
  async execute(args: string[]): Promise<string> {
    const target = args[0]
    const terminalStore = useTerminalStore()

    // 模拟连接过程
    await sleep(HACK_CONFIG.DELAY.CONNECT_ESTABLISH)
    terminalStore.write('Establishing connection...', true)
    await sleep(HACK_CONFIG.DELAY.CONNECT_HANDSHAKE)
    terminalStore.write('Handshake...', true)
    await sleep(HACK_CONFIG.DELAY.CONNECT_AUTH)
    terminalStore.write('Authenticating...', true)
    await sleep(HACK_CONFIG.DELAY.CONNECT_AUTHENTICATE)

    // 检查是否是任务目标
    const missionStore = useMissionStore()
    const isMissionTarget = missionStore.active?.target === target

    if (isMissionTarget) {
      terminalStore.writeColored(drawSuccess('Connection established!'), THEME.TERMINAL.SUCCESS)
      
      const { min: minLatency, max: maxLatency } = HACK_CONFIG.DELAY.LATENCY_RANGE
      const latency = Math.floor(Math.random() * (maxLatency - minLatency)) + minLatency
      
      const content: string[] = []
      content.push(drawTitle('CONNECTION ESTABLISHED', 2))
      content.push(drawSeparator())
      content.push(drawKeyValue('Target', target, 10))
      content.push(drawKeyValue('Status', 'Connected', 10))
      content.push(drawKeyValue('Type', 'Secure', 10))
      content.push(drawKeyValue('Latency', `${latency}ms`, 10))
      content.push(drawSeparator())
      content.push(drawListItem('Next:', `Use 'hack ${target}' to initiate the attack`))
      
      return drawBorder(content)
    } else {
      terminalStore.writeColored(drawError('Access denied!'), THEME.TERMINAL.ERROR)
      
      const content: string[] = []
      content.push(drawTitle('CONNECTION FAILED', 2))
      content.push(drawSeparator())
      content.push(drawKeyValue('Target', target, 10))
      content.push(drawKeyValue('Error', 'Access denied - Authorization required', 10))
      content.push(drawSeparator())
      content.push(drawListItem('Note:', 'This target is not part of your current mission'))
      
      return drawBorder(content)
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
  validation: {
    minArgs: 1,
    maxArgs: 1,
    validate: (args: string[]) => {
      if (!isValidIP(args[0])) {
        return {
          valid: false,
          message: `Error: Invalid IP address format: ${args[0]}`,
        }
      }
      return { valid: true }
    },
  },
  async execute(args: string[]): Promise<string> {
    const target = args[0]
    const terminalStore = useTerminalStore()
    const missionStore = useMissionStore()
    const playerStore = usePlayerStore()

    // 检查是否有活跃任务
    if (!missionStore.active) {
      return drawError('No active mission.') + '\nUse "missions" to see available missions.'
    }

    // 检查是否是任务目标
    if (missionStore.active.target !== target) {
      return drawError(`Target ${target} is not your current mission target.`)
    }

    // 模拟入侵过程
    await sleep(HACK_CONFIG.DELAY.HACK_INIT)
    terminalStore.write('Initializing attack sequence...', true)
    await sleep(HACK_CONFIG.DELAY.HACK_SCAN)
    terminalStore.write('Scanning for vulnerabilities...', true)
    await sleep(HACK_CONFIG.DELAY.HACK_EXPLOIT)
    terminalStore.write('Exploiting vulnerabilities...', true)
    await sleep(HACK_CONFIG.DELAY.HACK_BYPASS)
    terminalStore.write('Bypassing firewall...', true)
    await sleep(HACK_CONFIG.DELAY.HACK_ESCALATE)
    terminalStore.write('Escalating privileges...', true)
    await sleep(HACK_CONFIG.DELAY.HACK_PRIVILEGE)
    terminalStore.write('Extracting data...', true)
    await sleep(HACK_CONFIG.DELAY.HACK_EXTRACT)
    terminalStore.write('Covering tracks...', true)
    await sleep(HACK_CONFIG.DELAY.HACK_COVER)

    // 任务成功
    terminalStore.writeColored(drawSuccess('Attack successful!'), THEME.TERMINAL.SUCCESS)

    // 完成任务并获取奖励
    const reward = missionStore.completeMission()

    if (reward) {
      playerStore.addExp(reward.exp)
      playerStore.addCredits(reward.credits)
      playerStore.addReputation(1)

      const { min: minData, max: maxData } = HACK_CONFIG.DATA_EXTRACTION.SIZE_RANGE
      const dataExtracted = Math.floor(Math.random() * (maxData - minData)) + minData
      
      const { min: minTime, max: maxTime } = HACK_CONFIG.HACK_TIME.DURATION_RANGE
      const timeTaken = (Math.random() * (maxTime - minTime) + minTime).toFixed(2)
      
      const content: string[] = []
      content.push(drawTitle('ATTACK SUCCESSFUL', 2))
      content.push(drawSeparator())
      content.push(drawKeyValue('Target', target, 10))
      content.push(drawKeyValue('Data Extracted', `${dataExtracted} MB`, 10))
      content.push(drawKeyValue('Time Taken', `${timeTaken}s`, 10))
      content.push(drawSeparator())
      content.push(drawListItem('REWARDS:', ''))
      content.push(drawListItem('EXP:', reward.exp.toString()))
      content.push(drawListItem('Credits:', reward.credits.toString()))
      content.push(drawListItem('Reputation:', '+1'))
      
      const result = drawBorder(content)
      
      return result + `\n${drawSuccess('Mission completed! You are now level ' + playerStore.player.level + '.')}`
    }

    return drawError('Failed to complete mission.')
  },
}

/**
 * 导出所有黑客命令
 */
export const hackCommands: BaseCommand[] = [scanCommand, connectCommand, hackCommand]