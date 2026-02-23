<template>
  <div class="terminal-container">
    <div ref="terminalRef" class="terminal"></div>
    <div class="terminal-input-line">
      <span class="prompt">></span>
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="terminal-input"
        @keydown="handleKeyDown"
        placeholder="Enter command..."
        autocomplete="off"
        spellcheck="false"
      />
      <span class="cursor" :class="{ 'blink': isFocused }"></span>
    </div>
  </div>
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
import { helpCommand, clearCommand, infoCommand, gameCommand, versionCommand } from '../modules/commands/basic'
import { scanCommand, connectCommand, hackCommand } from '../modules/commands/hack'
import { missionsCommand, acceptCommand, statusCommand } from '../modules/commands/mission'

const terminalRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const inputValue = ref('')
const isFocused = ref(false)

const terminalStore = useTerminalStore()
const playerStore = usePlayerStore()
const missionStore = useMissionStore()
const gameStore = useGameStore()

let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null
let commandRegistry: CommandRegistry | null = null

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

  // 生成初始任务
  missionStore.generateMissions(playerStore.player.level)

  // 初始化游戏
  gameStore.initialize()

  // 聚焦输入框
  nextTick(() => {
    inputRef.value?.focus()
  })
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
    return
  }

  // 执行命令
  try {
    const output = await (command as any).execute(args)
    if (output) {
      terminal?.writeln(output)
    }
  } catch (error) {
    terminal?.writeln(`Error: ${error}`)
  }
}

/**
 * 处理键盘事件
 */
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    
    const command = inputValue.value.trim()
    
    if (command) {
      // 显示输入的命令
      terminal?.writeln(`> ${command}`)
      
      // 执行命令
      executeCommand(command)
    }
    
    // 清空输入
    inputValue.value = ''
    
    // 滚动到底部
    nextTick(() => {
      terminal?.scrollToBottom()
    })
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
  window.addEventListener('focus', () => {
    isFocused.value = true
    inputRef.value?.focus()
  })
  window.addEventListener('blur', () => {
    isFocused.value = false
  })
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
  overflow: auto;
}

.terminal-input-line {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-dark);
  border-top: 1px solid var(--border-color);
  position: relative;
}

.prompt {
  color: var(--primary);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-base);
  font-weight: bold;
  margin-right: var(--spacing-sm);
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-base);
  caret-color: transparent;

  &::placeholder {
    color: var(--text-muted);
  }
}

.cursor {
  width: 8px;
  height: 16px;
  background-color: var(--primary);
  margin-left: -8px;

  &.blink {
    animation: blink 1s step-end infinite;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
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
</style>