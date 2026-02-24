<template>
  <div class="terminal-container">
    <div ref="terminalRef" class="terminal"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { useTerminalStore } from '../stores/terminal'
import { usePlayerStore } from '../stores/player'
import { useMissionStore } from '../stores/mission'
import { useGameStore } from '../stores/game'
import { CommandRegistry } from '../modules/commands'
import { helpCommand, clearCommand, infoCommand, gameCommand, versionCommand } from '../modules/commands/basic'
import { scanCommand, connectCommand, hackCommand } from '../modules/commands/hack'
import { missionsCommand, acceptCommand, statusCommand } from '../modules/commands/mission'

const terminalRef = ref<HTMLElement>()

const terminalStore = useTerminalStore()
const playerStore = usePlayerStore()
const missionStore = useMissionStore()
const gameStore = useGameStore()

let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null
let commandRegistry: CommandRegistry | null = null
let currentLine = ''
let cursorPosition = 0
let commandHistory: string[] = []
let historyIndex = -1

/**
 * 重绘当前输入行
 */
function redrawLine() {
  if (!terminal) return
  
  // 回到行首
  terminal.write('\r')
  // 清除从光标到行尾
  terminal.write('\x1b[K')
  // 显示提示符
  terminal.write('\x1b[32m>\x1b[0m ')
  // 显示当前行内容
  terminal.write(currentLine)
  // 移动光标到正确位置
  const moveBack = currentLine.length - cursorPosition
  if (moveBack > 0) {
    terminal.write(`\x1b[${moveBack}D`)
  }
  // 确保光标可见
  terminal.write('\x1b[?25h')
}

/**
 * 显示提示符
 */
function showPrompt() {
  if (!terminal) return
  // 回到行首并清除当前行
  terminal.write('\r\x1b[K')
  // 显示提示符
  terminal.write('\x1b[32m>\x1b[0m ')
  // 滚动到底部
  scrollToBottom()
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
  if (!terminal) return
  // 使用xterm.js内置的滚动方法
  const viewport = terminal.element?.querySelector('.xterm-viewport') as HTMLElement
  if (viewport) {
    viewport.scrollTop = viewport.scrollHeight
  }
}

/**
 * 初始化终端
 */
function initTerminal() {
  if (!terminalRef.value) return

  // 创建终端实例
  terminal = new Terminal({
    fontSize: 14,
    fontFamily: '"Courier New", Courier, monospace',
    theme: {
      background: '#0d0208',
      foreground: '#e0e0e0',
      cursor: '#00ff41',
      cursorAccent: '#0d0208',
    },
    cursorBlink: true,
    cursorStyle: 'block',
    cursorInactiveStyle: 'none',
    scrollback: 1000,
    tabStopWidth: 4,
    disableStdin: false,
  })

  // 创建自适应插件
  fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)

  // 挂载终端
  terminal.open(terminalRef.value)
  fitAddon.fit()

  // 保存终端实例
  terminalStore.setTerminalInstance(terminal)

  // 初始化命令注册表
  initCommands()

  // 显示欢迎信息
  showWelcomeMessage()

  // 显示初始提示符
  showPrompt()

  // 生成初始任务
  missionStore.generateMissions(playerStore.player.level)

  // 初始化游戏
  gameStore.initialize()

  // 添加键盘输入监听
  terminal.onData(handleTerminalInput)
  terminal.onKey(handleKeyInput)
}

/**
 * 初始化命令系统
 */
function initCommands() {
  commandRegistry = new CommandRegistry()

  // 注册基础命令
  commandRegistry.register(helpCommand)
  commandRegistry.register(clearCommand)
  commandRegistry.register(infoCommand)
  commandRegistry.register(gameCommand)
  commandRegistry.register(versionCommand)

  // 注册黑客命令
  commandRegistry.register(scanCommand)
  commandRegistry.register(connectCommand)
  commandRegistry.register(hackCommand)

  // 注册任务命令
  commandRegistry.register(missionsCommand)
  commandRegistry.register(acceptCommand)
  commandRegistry.register(statusCommand)
}

/**
 * 显示欢迎信息
 */
function showWelcomeMessage() {
  if (!terminal) return

  const welcomeMessage = terminalStore.getWelcomeMessage()
  terminal.writeln(welcomeMessage)
  terminal.writeln('')
  
  // 显示引导提示
  terminal.writeln('提示：输入 help 命令查看所有可用命令')
  terminal.writeln('')
  terminal.writeln('提示：输入 missions 命令查看可用任务')
  terminal.writeln('')
  terminal.writeln('─────────────────────────────────────────────────────────')
  terminal.writeln('')
}

/**
 * 处理终端数据输入
 */
function handleTerminalInput(data: string) {
  if (!terminal) return

  const charCode = data.charCodeAt(0)

  // 处理回车键
  if (data === '\r') {
    terminal.writeln('')
    if (currentLine.trim()) {
      // 添加到历史记录
      commandHistory.push(currentLine)
      historyIndex = commandHistory.length
      // 显示执行的命令
      terminal.writeln(`\x1b[32m>\x1b[0m ${currentLine}`)
      // 执行命令
      executeCommand(currentLine)
    } else {
      // 空行 - 显示新提示符
      showPrompt()
    }
    currentLine = ''
    cursorPosition = 0
  }
  // 处理退格键
  else if (data === '\u007F' || data === '\b') {
    if (cursorPosition > 0) {
      currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition)
      cursorPosition--
      redrawLine()
    }
  }
  // 处理可打印字符
  else if (charCode >= 32 && charCode <= 126) {
    // 在光标位置插入字符
    currentLine = currentLine.slice(0, cursorPosition) + data + currentLine.slice(cursorPosition)
    cursorPosition++
    redrawLine()
  }
}

/**
 * 处理按键输入
 */
function handleKeyInput(event: { key: string; domEvent: KeyboardEvent }) {
  if (!terminal) return

  const key = event.domEvent.key

  // 左箭头 - 向左移动光标
  if (key === 'ArrowLeft') {
    event.domEvent.preventDefault()
    if (cursorPosition > 0) {
      cursorPosition--
      redrawLine()
    }
  }
  // 右箭头 - 向右移动光标
  else if (key === 'ArrowRight') {
    event.domEvent.preventDefault()
    if (cursorPosition < currentLine.length) {
      cursorPosition++
      redrawLine()
    }
  }
  // 上箭头 - 浏览历史记录
  else if (key === 'ArrowUp') {
    event.domEvent.preventDefault()
    if (historyIndex > 0) {
      historyIndex--
      currentLine = commandHistory[historyIndex]
      cursorPosition = currentLine.length
      redrawLine()
    }
  }
  // 下箭头 - 浏览历史记录
  else if (key === 'ArrowDown') {
    event.domEvent.preventDefault()
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++
      currentLine = commandHistory[historyIndex]
      cursorPosition = currentLine.length
      redrawLine()
    } else if (historyIndex === commandHistory.length - 1) {
      historyIndex = commandHistory.length
      currentLine = ''
      cursorPosition = 0
      redrawLine()
    }
  }
  // Home 键 - 移动到行首
  else if (key === 'Home') {
    event.domEvent.preventDefault()
    cursorPosition = 0
    redrawLine()
  }
  // End 键 - 移动到行尾
  else if (key === 'End') {
    event.domEvent.preventDefault()
    cursorPosition = currentLine.length
    redrawLine()
  }
  // Delete 键 - 删除光标处的字符
  else if (key === 'Delete') {
    event.domEvent.preventDefault()
    if (cursorPosition < currentLine.length) {
      currentLine = currentLine.slice(0, cursorPosition) + currentLine.slice(cursorPosition + 1)
      redrawLine()
    }
  }
}

/**
 * 执行命令
 */
async function executeCommand(input: string) {
  if (!commandRegistry || !terminal) return

  // 解析命令和参数
  const parts = input.trim().split(/\s+/)
  const commandName = parts[0].toLowerCase()
  const args = parts.slice(1)

  // 获取命令
  const command = commandRegistry.get(commandName)

  if (!command) {
    terminal?.writeln(`Error: Command not found: ${commandName}`)
    terminal?.writeln(`Type 'help' to see available commands.`)
    // 输出提示符
    terminal?.writeln('')
    showPrompt()
    return
  }

  // 执行命令
  try {
    const output = await (command as any).execute(args)
    
    // 处理特殊命令
    if (output === '__CLEAR__') {
      terminal.clear()
    } else if (output) {
      terminal?.writeln(output)
    }
    
    // 输出提示符
    terminal?.writeln('')
    showPrompt()
  } catch (error) {
    terminal?.writeln(`Error: ${error}`)
    // 输出提示符
    terminal?.writeln('')
    showPrompt()
  }
}

/**
 * 窗口大小变化时重新适配
 */
function handleResize() {
  fitAddon?.fit()
}

onMounted(() => {
  initTerminal()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  terminal?.dispose()
})
</script>

<style scoped lang="scss">
.terminal-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--bg-darker);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.terminal {
  flex: 1;
  padding: var(--spacing-md);
  // 移除 overflow: auto，让 xterm.js 自己管理滚动

  // 移动端优化
  @media (max-width: 640px) {
    padding: var(--spacing-sm);
    font-size: 13px; // 稍微减小字体以适应小屏幕
  }

  // 超小屏幕优化
  @media (max-width: 480px) {
    padding: var(--spacing-xs);
  }
}

// 覆盖 xterm.js 默认样式
:deep(.xterm) {
  padding: 0 !important;
}

:deep(.xterm-viewport) {
  scrollbar-width: thin;
  scrollbar-color: var(--primary-dark) var(--bg-dark);
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
  .terminal {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .terminal {
    font-size: 11px;
    padding: var(--spacing-xs);
  }
}

// 横屏模式优化
@media (max-height: 600px) and (orientation: landscape) {
  .terminal-container {
    min-height: 300px;
  }

  .terminal {
    padding: var(--spacing-sm);
  }
}
</style>