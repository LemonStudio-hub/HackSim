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
 * 命令接口
 */
export interface Command {
  /** 命令名称 */
  name: string
  /** 命令描述 */
  description: string
  /** 使用方法 */
  usage: string
  /** 命令执行函数 */
  execute: (args: string[]) => Promise<string>
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