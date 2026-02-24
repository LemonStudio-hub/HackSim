/**
 * 命令输出格式化工具
 * 统一所有命令的输出格式
 */

/**
 * 绘制边框
 * @param content 内容数组
 * @returns 带边框的字符串
 */
export function drawBorder(content: string[]): string {
  const lineWidth = 60
  const contentLength = lineWidth - 2 // 去掉两边边框
  
  return [
    '╔' + '═'.repeat(lineWidth - 2) + '╗',
    ...content.map(line => '║' + line.padEnd(contentLength) + '║'),
    '╚' + '═'.repeat(lineWidth - 2) + '╝',
  ].join('\n')
}

/**
 * 绘制标题行
 * @param title 标题
 * @param padding 左边填充
 * @returns 格式化的标题行
 */
export function drawTitle(title: string, padding: number = 2): string {
  return ' '.repeat(padding) + title.toUpperCase()
}

/**
 * 绘制分隔线
 * @param lineWidth 线宽
 * @returns 分隔线
 */
export function drawSeparator(lineWidth: number = 60): string {
  return '╠' + '═'.repeat(lineWidth - 2) + '╣'
}

/**
 * 格式化键值对
 * @param key 键
 * @param value 值
 * @param keyWidth 键的宽度
 * @returns 格式化的键值对
 */
export function drawKeyValue(key: string, value: string, keyWidth: number = 14): string {
  return `  ${key}:${' '.repeat(Math.max(0, keyWidth - key.length - 1))}${value}`
}

/**
 * 格式化信息框
 * @param title 标题
 * @param items 键值对数组
 * @returns 格式化的信息框
 */
export function drawInfoBox(title: string, items: { key: string; value: string }[]): string {
  const content: string[] = []
  
  // 标题行（居中）
  const titleLine = drawTitle(title, 2)
  content.push(titleLine)
  
  // 分隔线
  content.push(drawSeparator())
  
  // 键值对
  items.forEach(item => {
    content.push(drawKeyValue(item.key, item.value))
  })
  
  return drawBorder(content)
}

/**
 * 格式化成功消息
 * @param message 消息
 * @returns 格式化的成功消息
 */
export function drawSuccess(message: string): string {
  return `\x1b[32m✓ ${message}\x1b[0m`
}

/**
 * 格式化错误消息
 * @param message 消息
 * @returns 格式化的错误消息
 */
export function drawError(message: string): string {
  return `\x1b[31m✗ ${message}\x1b[0m`
}

/**
 * 格式化警告消息
 * @param message 消息
 * @returns 格式化的警告消息
 */
export function drawWarning(message: string): string {
  return `\x1b[33m⚠ ${message}\x1b[0m`
}

/**
 * 格式化信息消息
 * @param message 消息
 * @returns 格式化的信息消息
 */
export function drawInfo(message: string): string {
  return `\x1b[36mℹ ${message}\x1b[0m`
}

/**
 * 格式化标题行
 * @param title 标题
 * @returns 格式化的标题
 */
export function drawHeader(title: string): string {
  return `\x1b[1;93m${title}\x1b[0m`
}

/**
 * 格式化子标题
 * @param title 标题
 * @returns 格式化的子标题
 */
export function drawSubHeader(title: string): string {
  return `\x1b[36m${title}\x1b[0m`
}

/**
 * 格式化列表项
 * @param prefix 前缀
 * @param content 内容
 * @returns 格式化的列表项
 */
export function drawListItem(prefix: string, content: string): string {
  return `  ${prefix} ${content}`
}
