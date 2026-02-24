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
let commandHistory: string[] = []

/**
 * 显示提示符
 */
function showPrompt() {
  if (!terminal) return
  terminal.write('\x1b[32m>\x1b[0m ')
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
    scrollback: 1000,
    tabStopWidth: 4,
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

  // 处理回车键
  if (data === '\r') {
    terminal.writeln('')
    
    if (currentLine.trim()) {
      // 添加到历史记录
      commandHistory.push(currentLine)
      
      // 显示执行的命令
      terminal.writeln(`\x1b[32m>\x1b[0m ${currentLine}`)
      
      // 执行命令
      executeCommand(currentLine)
    } else {
      // 空行 - 显示新提示符
      showPrompt()
    }
    
    currentLine = ''
  }
  // 处理退格键
  else if (data === '\u007F' || data === '\b') {
    if (currentLine.length > 0) {
      currentLine = currentLine.slice(0, -1)
      // 让xterm.js处理退格的显示
      terminal.write('\b \b')
    }
  }
  // 处理可打印字符 - 让xterm.js处理显示
  else if (data.charCodeAt(0) >= 32) {
    currentLine += data
    terminal.write(data)
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