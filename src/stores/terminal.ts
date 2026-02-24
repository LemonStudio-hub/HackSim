/**
 * 终端状态管理
 * 使用 Pinia 管理终端相关状态
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TerminalHistory, ITerminal } from '../types'
import { TERMINAL_CONFIG } from '../constants/game'

export const useTerminalStore = defineStore('terminal', () => {
  // ========== 状态 ==========

  /** 终端历史记录 */
  const history = ref<TerminalHistory[]>([])

  /** 当前输入 */
  const currentInput = ref('')

  /** 是否正在处理命令 */
  const isProcessing = ref(false)

  /** 终端实例引用 */
  const terminalInstance = ref<ITerminal | null>(null)

  /** 光标位置 */
  const cursorPosition = ref(0)

  /** 字体大小 */
  const fontSize = ref(TERMINAL_CONFIG.DEFAULT_FONT_SIZE)

  // ========== 方法 ==========

  /**
   * 添加到历史记录
   * @param input 输入的命令
   * @param output 命令输出结果
   */
  function addToHistory(input: string, output: string): void {
    history.value.push({
      input,
      output,
      timestamp: Date.now(),
    })

    // 限制历史记录数量
    if (history.value.length > TERMINAL_CONFIG.MAX_HISTORY) {
      history.value = history.value.slice(-TERMINAL_CONFIG.MAX_HISTORY)
    }
  }

  /**
   * 执行命令
   * @param command 命令字符串
   * @param output 输出结果
   */
  async function executeCommand(command: string, output: string): Promise<void> {
    isProcessing.value = true
    addToHistory(command, output)
    isProcessing.value = false
  }

  /**
   * 清空终端
   */
  function clear(): void {
    history.value = []
  }

  /**
   * 更新当前输入
   * @param input 输入字符串
   */
  function updateCurrentInput(input: string): void {
    currentInput.value = input
  }

  /**
   * 设置终端实例
   * @param instance 终端实例
   */
  function setTerminalInstance(instance: ITerminal): void {
    terminalInstance.value = instance
  }

  /**
   * 写入到终端
   * @param text 要写入的文本
   * @param newline 是否换行
   */
  function write(text: string, newline = true): void {
    if (terminalInstance.value) {
      terminalInstance.value.write(text)
      if (newline) {
        terminalInstance.value.writeln('')
      }
    }
  }

  /**
   * 写入带颜色的文本
   * @param text 文本
   * @param color 颜色类名
   */
  function writeColored(text: string, color: string): void {
    if (terminalInstance.value) {
      const colorCode = getColorCode(color)
      terminalInstance.value.writeln(`\x1b[${colorCode}m${text}\x1b[0m`)
    }
  }

  /**
   * 获取 ANSI 颜色代码
   * @param color 颜色名称
   * @returns ANSI 颜色代码
   */
  function getColorCode(color: string): string {
    const colors: Record<string, string> = {
      red: '31',
      green: '32',
      yellow: '33',
      blue: '34',
      magenta: '35',
      cyan: '36',
      white: '37',
      brightRed: '91',
      brightGreen: '92',
      brightYellow: '93',
      brightBlue: '94',
      brightMagenta: '95',
      brightCyan: '96',
      brightWhite: '97',
    }
    return colors[color] || '37'
  }

  /**
   * 设置字体大小
   * @param size 字体大小
   */
  function setFontSize(size: number): void {
    fontSize.value = size
    if (terminalInstance.value) {
      terminalInstance.value.options.fontSize = size
      terminalInstance.value.refresh(0, terminalInstance.value.rows - 1)
    }
  }

  /**
   * 获取欢迎信息
   * @returns 欢迎信息字符串
   */
  function getWelcomeMessage(): string {
    const version = '0.1.0'
    const lineLength = 60
    const contentLength = lineLength - 2 // 去掉两边边框
    const prefix = '   HACKSIM v'
    const versionPadding = contentLength - prefix.length - version.length
    
    return `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   HACKSIM v${version}${' '.repeat(Math.max(0, versionPadding))}║
║                                                            ║
║   Welcome to the terminal.                                 ║
║   Type 'help' to see available commands.                  ║
║   Type 'missions' to see available missions.               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `.trim()
  }

  return {
    history,
    currentInput,
    isProcessing,
    terminalInstance,
    cursorPosition,
    fontSize,
    addToHistory,
    executeCommand,
    clear,
    updateCurrentInput,
    setTerminalInstance,
    write,
    writeColored,
    setFontSize,
    getWelcomeMessage,
  }
})