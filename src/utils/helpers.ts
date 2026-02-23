/**
 * 工具函数
 */

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 格式化数字
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * 格式化时间
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * 生成随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @param charset 字符集
 * @returns 随机字符串
 */
export function randomString(length: number, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * 验证 IP 地址格式
 * @param ip IP 地址字符串
 * @returns 是否有效
 */
export function isValidIP(ip: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipRegex.test(ip)) {
    return false
  }

  const parts = ip.split('.')
  return parts.every((part) => {
    const num = parseInt(part)
    return num >= 0 && num <= 255
  })
}

/**
 * 截断字符串
 * @param str 字符串
 * @param maxLength 最大长度
 * @param suffix 后缀
 * @returns 截断后的字符串
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) {
    return str
  }
  return str.substring(0, maxLength - suffix.length) + suffix
}