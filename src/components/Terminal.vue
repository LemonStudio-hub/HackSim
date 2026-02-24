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
let resizeTimer: number | null = null
let isInitialized = false

/**
 * 显示提示符
 */
function showPrompt() {
  if (!terminal) return
  try {
    terminal.write('\x1b[32m>\x1b[0m ')
  } catch (error) {
    console.error('Failed to show prompt:', error)
  }
}

/**
 * 初始化终端
 */
function initTerminal() {
  if (!terminalRef.value || isInitialized) return

  try {
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
    
    // 延迟执行fit，确保DOM已完全渲染
    setTimeout(() => {
      try {
        fitAddon?.fit()
      } catch (error) {
        console.error('Failed to fit terminal:', error)
      }
    }, 100)

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

    isInitialized = true
  } catch (error) {
    console.error('Failed to initialize terminal:', error)
    isInitialized = false
  }
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
  
  try {
    // 只显示简单的提示
    terminal.writeln('提示：输入 help 命令查看所有可用命令')
    terminal.writeln('')
  } catch (error) {
    console.error('Failed to show welcome message:', error)
  }
}

/**
 * 处理终端数据输入
 */
function handleTerminalInput(data: string) {
  if (!terminal) return

  try {
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
  } catch (error) {
    console.error('Error handling terminal input:', error)
  }
}

/**
 * 执行命令
 */
async function executeCommand(input: string) {
  if (!commandRegistry || !terminal) return

  try {
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
    try {
      terminal?.writeln(`Error: ${error}`)
      // 输出提示符
      terminal?.writeln('')
      showPrompt()
    } catch (writeError) {
      console.error('Failed to write error to terminal:', writeError)
    }
  }
}

/**
 * 窗口大小变化时重新适配
 */
function handleResize() {
  // 防抖处理
  if (resizeTimer !== null) {
    clearTimeout(resizeTimer)
  }
  
  resizeTimer = window.setTimeout(() => {
    try {
      fitAddon?.fit()
    } catch (error) {
      console.error('Failed to fit terminal on resize:', error)
    }
    resizeTimer = null
  }, 250)
}

onMounted(() => {
  initTerminal()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理resize定时器
  if (resizeTimer !== null) {
    clearTimeout(resizeTimer)
    resizeTimer = null
  }
  
  window.removeEventListener('resize', handleResize)
  
  // 安全清理终端
  if (terminal) {
    try {
      terminal.dispose()
    } catch (error) {
      console.error('Failed to dispose terminal:', error)
    }
    terminal = null
  }
  
  isInitialized = false
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
  // 添加触摸优化
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

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
  // 移动端优化
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