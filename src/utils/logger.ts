/**
 * 日志系统
 * 提供结构化的日志记录功能，支持不同日志级别、格式化和过滤
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  levelName: string
  message: string
  context?: string
  data?: unknown
}

export interface LoggerOptions {
  /** 最小日志级别 */
  minLevel?: LogLevel
  /** 是否启用时间戳 */
  enableTimestamp?: boolean
  /** 是否启用彩色输出 */
  enableColors?: boolean
  /** 日志上下文 */
  context?: string
  /** 是否输出到控制台 */
  enableConsole?: boolean
  /** 最大日志条数（用于内存存储） */
  maxEntries?: number
}

/**
 * 日志类
 */
class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private options: Required<LoggerOptions> = {
    minLevel: LogLevel.INFO,
    enableTimestamp: true,
    enableColors: true,
    context: '',
    enableConsole: true,
    maxEntries: 1000,
  }

  private constructor(options: LoggerOptions = {}) {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取Logger实例（单例模式）
   */
  public static getInstance(options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options)
    }
    return Logger.instance
  }

  /**
   * 更新配置
   */
  public updateOptions(options: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < this.options.minLevel) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      message,
      context: this.options.context || undefined,
      data,
    }

    // 存储日志
    this.logs.push(entry)
    if (this.logs.length > this.options.maxEntries) {
      this.logs.shift()
    }

    // 输出到控制台
    if (this.options.enableConsole) {
      this.logToConsole(entry)
    }
  }

  /**
   * 输出到控制台
   */
  private logToConsole(entry: LogEntry): void {
    // 只在开发环境输出日志
    // @ts-ignore - Vite 环境变量
    if (import.meta?.env?.PROD) {
      return
    }
  
    const { enableTimestamp, enableColors } = this.options
    const { timestamp, levelName, message, context, data } = entry
  
    let output = ''
    
    if (enableTimestamp) {
      output += `[${timestamp}] `
    }
  
    if (context) {
      output += `[${context}] `
    }
  
    output += `[${levelName}] ${message}`
  
    // 根据日志级别选择颜色
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m',    // Cyan
      [LogLevel.INFO]: '\x1b[32m',     // Green
      [LogLevel.WARN]: '\x1b[33m',     // Yellow
      [LogLevel.ERROR]: '\x1b[31m',    // Red
      [LogLevel.FATAL]: '\x1b[35m',    // Magenta
    }
    const resetColor = '\x1b[0m'
  
    if (enableColors) {
      output = `${colors[entry.level]}${output}${resetColor}`
    }
  
    console.log(output)
    
    if (data !== undefined) {
      console.log(data)
    }
  }  /**
   * DEBUG级别日志
   */
  public debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data)
  }

  /**
   * INFO级别日志
   */
  public info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data)
  }

  /**
   * WARN级别日志
   */
  public warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data)
  }

  /**
   * ERROR级别日志
   */
  public error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data)
  }

  /**
   * FATAL级别日志
   */
  public fatal(message: string, data?: unknown): void {
    this.log(LogLevel.FATAL, message, data)
  }

  /**
   * 获取所有日志
   */
  public getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * 根据级别过滤日志
   */
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  /**
   * 根据上下文过滤日志
   */
  public getLogsByContext(context: string): LogEntry[] {
    return this.logs.filter(log => log.context === context)
  }

  /**
   * 清空日志
   */
  public clear(): void {
    this.logs = []
  }

  /**
   * 导出日志为JSON
   */
  public exportToJSON(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * 导出日志为CSV
   */
  public exportToCSV(): string {
    const headers = ['timestamp', 'level', 'message', 'context', 'data']
    const rows = this.logs.map(log => [
      log.timestamp,
      log.levelName,
      log.message,
      log.context || '',
      log.data !== undefined ? JSON.stringify(log.data) : '',
    ])
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }
}

/**
 * 创建Logger实例
 */
export const logger = Logger.getInstance()

/**
 * 创建带有上下文的Logger
 */
export function createLogger(context: string, options?: LoggerOptions): Logger {
  return Logger.getInstance({ ...options, context })
}

/**
 * 设置最小日志级别
 */
export function setMinLevel(level: LogLevel): void {
  logger.updateOptions({ minLevel: level })
}

/**
 * 启用/禁用控制台输出
 */
export function setConsoleOutput(enabled: boolean): void {
  logger.updateOptions({ enableConsole: enabled })
}

/**
 * 启用/禁用彩色输出
 */
export function setColors(enabled: boolean): void {
  logger.updateOptions({ enableColors: enabled })
}
