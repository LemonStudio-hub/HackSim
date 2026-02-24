/**
 * 游戏常量定义
 */

/**
 * 玩家初始配置
 */
export const INITIAL_PLAYER = {
  INITIAL_LEVEL: 1,
  INITIAL_EXP: 0,
  INITIAL_CREDITS: 1000,
  INITIAL_REPUTATION: 0,
}

/**
 * 经验值配置
 */
export const EXP_CONFIG = {
  /** 基础经验需求 */
  BASE_EXP_REQUIREMENT: 100,
  /** 每级经验增长倍数 */
  EXP_MULTIPLIER: 1.5,
}

/**
 * 主题颜色配置
 */
export const THEME = {
  PRIMARY: '#00ff41',
  SECONDARY: '#008f11',
  ACCENT: '#00ff9d',
  BG_DARK: '#0d0208',
  BG_DARKER: '#000000',
  TEXT_PRIMARY: '#e0e0e0',
  TEXT_SECONDARY: '#a0a0a0',
  BORDER: '#00ff4155',
  SUCCESS: '#00ff41',
  ERROR: '#ff4141',
  WARNING: '#ffcc00',
  /** ANSI 终端颜色代码（用于终端输出） */
  TERMINAL: {
    SUCCESS: '92',
    ERROR: '91',
    WARNING: '93',
    INFO: '36',
  },
}

/**
 * 终端配置
 */
export const TERMINAL_CONFIG = {
  /** 默认字体大小 */
  DEFAULT_FONT_SIZE: 14,
  /** 最大历史记录数 */
  MAX_HISTORY: 5000,
  /** 命令执行超时时间（毫秒） */
  COMMAND_TIMEOUT: 5000,
}

/**
 * 任务配置
 */
export const MISSION_CONFIG = {
  /** 每级可解锁任务数 */
  MISSIONS_PER_LEVEL: 3,
  /** 最小难度 */
  MIN_DIFFICULTY: 1,
  /** 最大难度 */
  MAX_DIFFICULTY: 5,
}

/**
 * 网络配置
 */
export const NETWORK_CONFIG = {
  /** 常见目标 IP 范围 */
  COMMON_RANGES: [
    '192.168.1.',
    '10.0.0.',
    '172.16.0.',
  ],
  /** 常见开放端口 */
  COMMON_PORTS: [21, 22, 23, 80, 443, 3306, 5432],
  /** 节点名称列表 */
  SERVER_NAMES: [
    'Corporate Server',
    'Database Server',
    'Web Server',
    'Mail Server',
    'File Server',
    'Backup Server',
    'Development Server',
    'Production Server',
  ],
}

/**
 * 黑客操作配置
 */
export const HACK_CONFIG = {
  /** 端口数量范围 */
  PORT_COUNT_RANGE: { min: 1, max: 5 },
  /** 安全等级范围 */
  SECURITY_LEVEL_RANGE: { min: 1, max: 5 },
  /** 延迟时间配置（毫秒） */
  DELAY: {
    SCAN_INIT: 1000,
    SCAN_PORTS: 500,
    SCAN_SERVICES: 800,
    SCAN_SECURITY: 500,
    SCAN_DETECT: 300,
    CONNECT_ESTABLISH: 800,
    CONNECT_HANDSHAKE: 600,
    CONNECT_AUTH: 400,
    CONNECT_AUTHENTICATE: 300,
    HACK_INIT: 1000,
    HACK_SCAN: 600,
    HACK_EXPLOIT: 800,
    HACK_BYPASS: 500,
    HACK_ESCALATE: 700,
    HACK_PRIVILEGE: 600,
    HACK_EXTRACT: 800,
    HACK_COVER: 400,
    /** 延迟范围（毫秒） */
    LATENCY_RANGE: { min: 10, max: 60 },
  },
  /** 数据提取配置 */
  DATA_EXTRACTION: {
    /** 数据量范围（MB） */
    SIZE_RANGE: { min: 50, max: 150 },
  },
  /** 入侵时间配置（秒） */
  HACK_TIME: {
    /** 时间范围（秒） */
    DURATION_RANGE: { min: 2, max: 7 },
  },
}

/**
 * 游戏配置
 */
export const GAME_CONFIG = {
  /** 游戏版本 */
  VERSION: '0.1.0',
  /** 游戏名称 */
  NAME: 'HackSim',
  /** 自动保存间隔（毫秒） */
  AUTO_SAVE_INTERVAL: 30000,
}

/**
 * 启动消息配置
 */
export interface BootMessage {
  text: string
  color: string
  delay: number
  pause?: boolean // 是否在显示此消息后暂停
}

export const BOOT_CONFIG = {
  /** 启动速度倍数（越大越慢） */
  SPEED_MULTIPLIER: 2,

  /** 启动消息列表 */
  MESSAGES: [
    { text: '[BOOT] Starting HackSim OS v0.1.0...', color: '36', delay: 80 },
    { text: '[SYSTEM] Detecting hardware configuration...', color: '36', delay: 100 },
    { text: '[SYSTEM] CPU: Quantum Processor @ 4.2GHz', color: '90', delay: 60 },
    { text: '[SYSTEM] RAM: 32TB Quantum Memory', color: '90', delay: 60 },
    { text: '[SYSTEM] Storage: Neural Drive - ONLINE', color: '90', delay: 60, pause: true },
    { text: '[KERNEL] Loading kernel modules...', color: '36', delay: 120 },
    { text: '[KERNEL] Network stack initialized', color: '90', delay: 60 },
    { text: '[KERNEL] File system mounted', color: '90', delay: 60 },
    { text: '[KERNEL] Security protocols loaded', color: '90', delay: 60, pause: true },
    { text: '[NETWORK] Establishing secure connections...', color: '36', delay: 150 },
    { text: '[NETWORK] Connection established', color: '90', delay: 80 },
    { text: '[NETWORK] Encryption: AES-256-GCM', color: '90', delay: 60 },
    { text: '[NETWORK] Tunnel active: Secure', color: '90', delay: 60, pause: true },
    { text: '[SERVICES] Loading system services...', color: '36', delay: 120 },
    { text: '[SERVICES] Daemon: hacknetd - STARTED', color: '90', delay: 60 },
    { text: '[SERVICES] Daemon: missiond - STARTED', color: '90', delay: 60 },
    { text: '[SERVICES] Daemon: loggerd - STARTED', color: '90', delay: 60 },
    { text: '[SERVICES] Daemon: terminald - STARTED', color: '90', delay: 60, pause: true },
    { text: '[INTERFACE] Initializing terminal interface...', color: '36', delay: 120 },
    { text: '[INTERFACE] Display: 1080p High-DPI', color: '90', delay: 60 },
    { text: '[INTERFACE] Color mode: Full RGB', color: '90', delay: 60 },
    { text: '[INTERFACE] Font: Hack Nerd Font', color: '90', delay: 60, pause: true },
    { text: '[MODULES] Loading command modules...', color: '36', delay: 120 },
    { text: '[MODULES] Loaded: basic commands (5)', color: '90', delay: 60 },
    { text: '[MODULES] Loaded: hacking commands (3)', color: '90', delay: 60 },
    { text: '[MODULES] Loaded: mission commands (3)', color: '90', delay: 60, pause: true },
    { text: '[MISSION] Initializing mission system...', color: '36', delay: 120 },
    { text: '[MISSION] Connecting to global network...', color: '90', delay: 80 },
    { text: '[MISSION] Syncing with mission database...', color: '90', delay: 100 },
    { text: '[MISSION] Database synchronized', color: '90', delay: 60, pause: true },
    { text: '[PLAYER] Loading player profile...', color: '36', delay: 100 },
    { text: '[PLAYER] Profile: Anonymous', color: '90', delay: 60 },
    { text: '[PLAYER] Level: 1', color: '90', delay: 60 },
    { text: '[PLAYER] Reputation: 0', color: '90', delay: 60 },
    { text: '[PLAYER] Credits: 1000', color: '90', delay: 60, pause: true },
    { text: '[SECURITY] Initializing security protocols...', color: '36', delay: 120 },
    { text: '[SECURITY] Firewall: ACTIVE', color: '90', delay: 60 },
    { text: '[SECURITY] Intrusion detection: ENABLED', color: '90', delay: 60 },
    { text: '[SECURITY] Encryption keys: ROTATED', color: '90', delay: 60 },
    { text: '[SECURITY] Anonymity layer: ACTIVE', color: '90', delay: 60, pause: true },
    { text: '[SYSTEM] Running diagnostics...', color: '36', delay: 150 },
    { text: '[SYSTEM] Memory integrity: OK', color: '32', delay: 80 },
    { text: '[SYSTEM] Network connectivity: OK', color: '32', delay: 80 },
    { text: '[SYSTEM] Security status: OK', color: '32', delay: 80 },
    { text: '[SYSTEM] All systems operational', color: '32', delay: 100, pause: true },
    { text: '', color: '', delay: 0 },
    { text: '========================================', color: '90', delay: 100 },
    { text: '     HackSim Terminal v0.1.0', color: '93', delay: 150 },
    { text: '========================================', color: '90', delay: 100 },
    { text: '', color: '', delay: 0 },
    { text: 'System ready. Welcome, hacker.', color: '32', delay: 200, pause: true },
    { text: '', color: '', delay: 0 },
    { text: 'Quick Start:', color: '36', delay: 80 },
    { text: '  Type "help"      - See all available commands', color: '90', delay: 60 },
    { text: '  Type "missions"  - View available missions', color: '90', delay: 60 },
    { text: '  Type "info"      - Check your stats', color: '90', delay: 60 },
    { text: '', color: '', delay: 0 },
  ] as BootMessage[],
}