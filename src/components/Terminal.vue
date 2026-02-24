<template>
  <div ref="containerRef" class="terminal-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { useTerminalStore } from '../stores/terminal'
import { usePlayerStore } from '../stores/player'
import { useMissionStore } from '../stores/mission'
import { useGameStore } from '../stores/game'
import { CommandRegistry } from '../modules/commands'
import { type BaseCommand } from '../modules/commands/registry'
import { helpCommand, clearCommand, infoCommand, gameCommand, versionCommand } from '../modules/commands/basic'
import { scanCommand, connectCommand, hackCommand } from '../modules/commands/hack'
import { missionsCommand, acceptCommand, statusCommand } from '../modules/commands/mission'

// ============ 常量定义 ============
const TERMINAL_CONFIG = {
  PROMPT: '$ ',
  PROMPT_COLOR: '93',
  COMMAND_COLOR: '90',
  ERROR_COLOR: '31',
  SUCCESS_COLOR: '32',
  FONT_SIZE: 14,
  FONT_FAMILY: '"Courier New", Courier, monospace',
  BACKGROUND: '#0d0208',
  FOREGROUND: '#e0e0e0',
  CURSOR: '#00ff00', // 亮绿色光标，更明显
  CURSOR_STYLE: 'bar', // 竖线光标，更容易定位
  SCROLLBACK: 1000,
} as const

// ============ 状态 ============
const containerRef = ref<HTMLElement>()
const terminalStore = useTerminalStore()
const playerStore = usePlayerStore()
const missionStore = useMissionStore()
const gameStore = useGameStore()

let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null
let commandRegistry: CommandRegistry | null = null

// 输入状态
let inputBuffer = ''
let isProcessing = false

// 历史记录
const history: string[] = []
let historyIndex = -1

// 清理
let resizeTimeout: number | null = null

// ============ 核心方法 ============

/**
 * 写入文本到终端
 */
function write(text: string): void {
  if (!terminal) return
  terminal.write(text)
}

/**
 * 写入一行文本到终端
 */
function writeln(text: string = ''): void {
  if (!terminal) return
  terminal.writeln(text)
}

/**
 * 写入带颜色的文本
 */
function writeColored(text: string, colorCode: string): void {
  if (!terminal) return
  writeln(`\x1b[${colorCode}m${text}\x1b[0m`)
}

/**
 * 滚动到最底部
 */
function scrollToBottom(): void {
  if (!terminal) return
  terminal.scrollToBottom()
}

/**
 * 清空终端
 */
function clearTerminal(): void {
  if (!terminal) return
  terminal.clear()
}

/**
 * 聚焦终端
 */
function focus(): void {
  if (!terminal) return
  terminal.focus()
}

/**
 * 显示提示符
 */
function showPrompt(): void {
  writeColored(TERMINAL_CONFIG.PROMPT, TERMINAL_CONFIG.PROMPT_COLOR)
}

/**
 * 刷新显示（强制渲染）
 */
function refresh(): void {
  if (!terminal) return
  nextTick(() => {
    terminal?.refresh(0, terminal.rows - 1)
    scrollToBottom()
  })
}

// ============ 命令处理 ============

/**
 * 初始化命令注册表
 */
function initCommands(): void {
  commandRegistry = new CommandRegistry()

  const commands = [
    // 基础命令
    helpCommand,
    clearCommand,
    infoCommand,
    gameCommand,
    versionCommand,
    // 黑客命令
    scanCommand,
    connectCommand,
    hackCommand,
    // 任务命令
    missionsCommand,
    acceptCommand,
    statusCommand,
  ]

  commands.forEach(cmd => commandRegistry!.register(cmd))
}

/**
 * 解析命令输入
 */
function parseInput(input: string): { name: string; args: string[] } {
  const trimmed = input.trim()
  if (!trimmed) return { name: '', args: [] }
  
  const parts = trimmed.split(/\s+/)
  return {
    name: parts[0].toLowerCase(),
    args: parts.slice(1),
  }
}

/**
 * 执行命令
 */
async function executeCommand(input: string): Promise<void> {
  if (isProcessing || !terminal) return
  
  isProcessing = true

  try {
    // 解析输入
    const { name, args } = parseInput(input)

    // 空命令处理
    if (!name) {
      writeln()
      showPrompt()
      scrollToBottom()
      return
    }

    // 添加到历史记录
    history.push(input)
    historyIndex = history.length

    // 获取命令
    const command = commandRegistry?.get(name)

    if (!command) {
      writeln()
      writeColored(`Error: Command not found: ${name}`, TERMINAL_CONFIG.ERROR_COLOR)
      writeColored("Type 'help' to see available commands.", TERMINAL_CONFIG.COMMAND_COLOR)
      writeln()
      showPrompt()
      scrollToBottom()
      return
    }

    // 验证参数
    const validation = commandRegistry?.validateCommand(command, args)
    if (!validation?.valid) {
      writeln()
      writeColored(validation?.message || 'Invalid arguments', TERMINAL_CONFIG.ERROR_COLOR)
      writeln()
      showPrompt()
      scrollToBottom()
      return
    }

    // 执行命令
    const output = await (command as BaseCommand).execute(args)

    // 处理输出
    writeln()
    
    if (output === '__CLEAR__') {
      clearTerminal()
      showPrompt()
    } else if (output?.trim()) {
      writeln(output)
      writeln()
      showPrompt()
    } else {
      writeln()
      showPrompt()
    }

    scrollToBottom()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    writeln()
    writeColored(`Error: ${message}`, TERMINAL_CONFIG.ERROR_COLOR)
    writeln()
    showPrompt()
    scrollToBottom()
  } finally {
    isProcessing = false
    refresh()
  }
}

// ============ 输入处理 ============

/**
 * 处理用户输入
 */
function handleInput(data: string): void {
  if (isProcessing || !terminal) return

  // 回车键
  if (data === '\r') {
    if (inputBuffer.trim()) {
      writeln()
      writeColored(inputBuffer, TERMINAL_CONFIG.COMMAND_COLOR)
      const command = inputBuffer
      inputBuffer = ''
      executeCommand(command)
    } else {
      writeln()
      showPrompt()
      scrollToBottom()
    }
  }
  // 退格键
  else if (data === '\u007F' || data === '\b') {
    if (inputBuffer.length > 0) {
      inputBuffer = inputBuffer.slice(0, -1)
      write('\b \b')
    }
  }
  // 上下箭头（历史记录）
  else if (data === '\x1b[A') {
    // 上箭头
    if (historyIndex > 0) {
      historyIndex--
      replaceInputWithHistory()
    }
  }
  else if (data === '\x1b[B') {
    // 下箭头
    if (historyIndex < history.length - 1) {
      historyIndex++
      replaceInputWithHistory()
    } else if (historyIndex === history.length - 1) {
      historyIndex = history.length
      inputBuffer = ''
      clearCurrentLine()
      showPrompt()
    }
  }
  // 可打印字符
  else if (data.charCodeAt(0) >= 32) {
    inputBuffer += data
    write(data)
  }
}

/**
 * 清除当前输入行
 */
function clearCurrentLine(): void {
  if (!terminal) return
  // 删除提示符和当前输入
  write('\r\x1b[K')
  showPrompt()
}

/**
 * 用历史记录替换当前输入
 */
function replaceInputWithHistory(): void {
  clearCurrentLine()
  inputBuffer = history[historyIndex] || ''
  write(inputBuffer)
}

// ============ 初始化 ============

/**
 * 创建终端实例
 */
function createTerminal(): void {
  terminal = new Terminal({
    fontSize: TERMINAL_CONFIG.FONT_SIZE,
    fontFamily: TERMINAL_CONFIG.FONT_FAMILY,
    theme: {
      background: TERMINAL_CONFIG.BACKGROUND,
      foreground: TERMINAL_CONFIG.FOREGROUND,
      cursor: TERMINAL_CONFIG.CURSOR,
      cursorAccent: '#ffffff', // 光标辅助色
    },
    cursorBlink: true,
    cursorStyle: TERMINAL_CONFIG.CURSOR_STYLE as 'block' | 'underline' | 'bar',
    scrollback: TERMINAL_CONFIG.SCROLLBACK,
    cursorWidth: 2, // 光标宽度
  })

  fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
}

/**
 * 显示启动序列
 */
async function showBootSequence(): Promise<void> {
  if (!terminal) return

  const bootMessages = [
    { text: '[BOOT] Starting HackSim OS v0.1.0...', color: '36', delay: 30 },
    { text: '[SYSTEM] Detecting hardware configuration...', color: '36', delay: 40 },
    { text: '[SYSTEM] CPU: Quantum Processor @ 4.2GHz', color: '90', delay: 20 },
    { text: '[SYSTEM] RAM: 32TB Quantum Memory', color: '90', delay: 20 },
    { text: '[SYSTEM] Storage: Neural Drive - ONLINE', color: '90', delay: 20 },
    { text: '[KERNEL] Loading kernel modules...', color: '36', delay: 50 },
    { text: '[KERNEL] Network stack initialized', color: '90', delay: 20 },
    { text: '[KERNEL] File system mounted', color: '90', delay: 20 },
    { text: '[KERNEL] Security protocols loaded', color: '90', delay: 20 },
    { text: '[NETWORK] Establishing secure connections...', color: '36', delay: 60 },
    { text: '[NETWORK] Connection established to: 192.168.1.100', color: '90', delay: 30 },
    { text: '[NETWORK] Encryption: AES-256-GCM', color: '90', delay: 20 },
    { text: '[NETWORK] Tunnel active: Secure', color: '90', delay: 20 },
    { text: '[SERVICES] Loading system services...', color: '36', delay: 50 },
    { text: '[SERVICES] Daemon: hacknetd - STARTED', color: '90', delay: 25 },
    { text: '[SERVICES] Daemon: missiond - STARTED', color: '90', delay: 25 },
    { text: '[SERVICES] Daemon: loggerd - STARTED', color: '90', delay: 25 },
    { text: '[SERVICES] Daemon: terminald - STARTED', color: '90', delay: 25 },
    { text: '[INTERFACE] Initializing terminal interface...', color: '36', delay: 50 },
    { text: '[INTERFACE] Display: 1080p High-DPI', color: '90', delay: 20 },
    { text: '[INTERFACE] Color mode: Full RGB', color: '90', delay: 20 },
    { text: '[INTERFACE] Font: Hack Nerd Font', color: '90', delay: 20 },
    { text: '[MODULES] Loading command modules...', color: '36', delay: 50 },
    { text: '[MODULES] Loaded: basic commands (5)', color: '90', delay: 20 },
    { text: '[MODULES] Loaded: hacking commands (3)', color: '90', delay: 20 },
    { text: '[MODULES] Loaded: mission commands (3)', color: '90', delay: 20 },
    { text: '[MISSION] Initializing mission system...', color: '36', delay: 50 },
    { text: '[MISSION] Connecting to global network...', color: '90', delay: 30 },
    { text: '[MISSION] Syncing with mission database...', color: '90', delay: 40 },
    { text: '[MISSION] Database synchronized', color: '90', delay: 20 },
    { text: '[PLAYER] Loading player profile...', color: '36', delay: 40 },
    { text: '[PLAYER] Profile: Anonymous', color: '90', delay: 20 },
    { text: '[PLAYER] Level: 1', color: '90', delay: 20 },
    { text: '[PLAYER] Reputation: 0', color: '90', delay: 20 },
    { text: '[PLAYER] Credits: 1000', color: '90', delay: 20 },
    { text: '[SECURITY] Initializing security protocols...', color: '36', delay: 50 },
    { text: '[SECURITY] Firewall: ACTIVE', color: '90', delay: 20 },
    { text: '[SECURITY] Intrusion detection: ENABLED', color: '90', delay: 20 },
    { text: '[SECURITY] Encryption keys: ROTATED', color: '90', delay: 20 },
    { text: '[SECURITY] Anonymity layer: ACTIVE', color: '90', delay: 20 },
    { text: '[SYSTEM] Running diagnostics...', color: '36', delay: 60 },
    { text: '[SYSTEM] Memory integrity: OK', color: '32', delay: 20 },
    { text: '[SYSTEM] Network connectivity: OK', color: '32', delay: 20 },
    { text: '[SYSTEM] Security status: OK', color: '32', delay: 20 },
    { text: '[SYSTEM] All systems operational', color: '32', delay: 30 },
    { text: '', color: '', delay: 0 },
    { text: '========================================', color: '90', delay: 0 },
    { text: '     HackSim Terminal v0.1.0', color: '93', delay: 0 },
    { text: '========================================', color: '90', delay: 0 },
    { text: '', color: '', delay: 0 },
    { text: 'System ready. Welcome, hacker.', color: '32', delay: 30 },
    { text: '', color: '', delay: 0 },
    { text: 'Quick Start:', color: '36', delay: 20 },
    { text: '  Type "help"      - See all available commands', color: '90', delay: 20 },
    { text: '  Type "missions"  - View available missions', color: '90', delay: 20 },
    { text: '  Type "info"      - Check your stats', color: '90', delay: 20 },
    { text: '', color: '', delay: 0 },
  ]

  for (const msg of bootMessages) {
    if (msg.text) {
      writeColored(msg.text, msg.color)
      writeln()
    }
    scrollToBottom()
    if (msg.delay > 0) {
      await delay(msg.delay)
    }
  }
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 初始化终端
 */
async function init(): Promise<void> {
  if (!containerRef.value) return

  try {
    // 创建终端
    createTerminal()
    
    // 挂载到DOM
    if (terminal) {
      terminal.open(containerRef.value)
      
      // 保存到store
      terminalStore.setTerminalInstance(terminal)
      
      // 初始化命令
      initCommands()
      
      // 等待DOM渲染完成
      await nextTick()
      
      // 适配尺寸
      fitAddon?.fit()
      
      // 清空并显示启动序列
      clearTerminal()
      await showBootSequence()
      
      // 显示初始提示符
      showPrompt()
      scrollToBottom()
      
      // 初始化游戏系统
      missionStore.generateMissions(playerStore.player.level)
      gameStore.initialize()
      
      // 绑定输入处理
      terminal.onData(handleInput)
      
      // 聚焦终端
      focus()
    }
  } catch (error) {
    console.error('Failed to initialize terminal:', error)
  }
}

/**
 * 处理窗口大小变化
 */
function handleResize(): void {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  
  resizeTimeout = window.setTimeout(() => {
    fitAddon?.fit()
    refresh()
  }, 200) as unknown as number
}

// ============ 生命周期 ============

onMounted(() => {
  init()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理定时器
  if (resizeTimeout) clearTimeout(resizeTimeout)
  
  // 移除监听器
  window.removeEventListener('resize', handleResize)
  
  // 销毁终端
  terminal?.dispose()
  terminal = null
})
</script>

<style scoped lang="scss">
.terminal-container {
  width: 100%;
  height: 100%;
  background-color: var(--bg-darker);
  overflow: hidden;
  cursor: text;

  :deep(.xterm) {
    height: 100% !important;
    padding: var(--spacing-md) !important;
  }

  :deep(.xterm-viewport) {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-dark) var(--bg-dark);
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  :deep(.xterm-viewport::-webkit-scrollbar) {
    width: 8px;
  }

  :deep(.xterm-viewport::-webkit-scrollbar-track) {
    background: var(--bg-dark);
  }

  :deep(.xterm-viewport::-webkit-scrollbar-thumb) {
    background: var(--primary-dark);
    border-radius: 4px;
  }

  :deep(.xterm-viewport::-webkit-scrollbar-thumb:hover) {
    background: var(--primary);
  }

  // 移动端优化
  @media (max-width: 640px) {
    :deep(.xterm) {
      padding: var(--spacing-sm) !important;
      font-size: 12px !important;
    }
  }

  @media (max-width: 480px) {
    :deep(.xterm) {
      padding: var(--spacing-xs) !important;
      font-size: 11px !important;
    }
  }

  // 横屏模式
  @media (max-height: 600px) and (orientation: landscape) {
    min-height: 300px;

    :deep(.xterm) {
      padding: var(--spacing-sm) !important;
    }
  }
}
</style>