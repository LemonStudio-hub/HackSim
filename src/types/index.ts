/**
 * HackSim 类型定义
 * 定义游戏中使用的所有类型接口
 */

/**
 * 玩家信息
 */
export interface Player {
  /** 玩家唯一 ID */
  id: string
  /** 玩家名称 */
  name: string
  /** 玩家等级 */
  level: number
  /** 当前经验值 */
  exp: number
  /** 信用点 */
  credits: number
  /** 声望值 */
  reputation: number
}

/**
 * 任务接口
 */
export interface Mission {
  /** 任务唯一 ID */
  id: string
  /** 任务标题 */
  title: string
  /** 任务描述 */
  description: string
  /** 目标 IP 地址 */
  target: string
  /** 任务难度 1-5 */
  difficulty: number
  /** 奖励 */
  reward: {
    /** 经验奖励 */
    exp: number
    /** 信用点奖励 */
    credits: number
  }
  /** 任务状态 */
  status: 'available' | 'active' | 'completed'
}

/**
 * 网络节点信息
 */
export interface NetworkNode {
  /** 节点 IP 地址 */
  ip: string
  /** 节点名称 */
  name: string
  /** 开放端口列表 */
  ports: number[]
  /** 安全等级 */
  security: number
  /** 是否已被入侵 */
  hacked: boolean
}

/**
 * 终端历史记录
 */
export interface TerminalHistory {
  /** 输入的命令 */
  input: string
  /** 命令输出结果 */
  output: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 终端接口
 * 定义xterm.js终端实例的基本方法
 */
export interface ITerminal {
  /** 写入文本到终端 */
  write(data: string): void
  /** 写入文本并换行 */
  writeln(data: string): void
  /** 清空终端 */
  clear(): void
  /** 刷新终端 */
  refresh(start: number, end: number): void
  /** 获取终端行数 */
  rows: number
  /** 获取终端列数 */
  cols: number
  /** 终端选项 */
  options: ITerminalOptions
}

/**
 * 终端选项接口
 */
export interface ITerminalOptions {
  fontSize?: number
  fontFamily?: string
}