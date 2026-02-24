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
  const numbers = parts.map((part) => parseInt(part, 10))

  // 检查每个部分是否在 0-255 范围内
  if (!numbers.every((num) => num >= 0 && num <= 255)) {
    return false
  }

  const [first, second, third, fourth] = numbers

  // 检查保留地址
  // 0.0.0.0/8 - 当前网络
  if (first === 0) {
    return false
  }

  // 127.0.0.0/8 - 回环地址
  if (first === 127) {
    return false
  }

  // 169.254.0.0/16 - 链路本地地址
  if (first === 169 && second === 254) {
    return false
  }

  // 192.0.2.0/24 - TEST-NET-1
  if (first === 192 && second === 0 && third === 2) {
    return false
  }

  // 198.51.100.0/24 - TEST-NET-2
  if (first === 198 && second === 51 && third === 100) {
    return false
  }

  // 203.0.113.0/24 - TEST-NET-3
  if (first === 203 && second === 0 && third === 113) {
    return false
  }

  // 224.0.0.0/4 - 组播地址
  if (first >= 224 && first <= 239) {
    return false
  }

  // 240.0.0.0/4 - 保留地址
  if (first >= 240) {
    return false
  }

  // 255.255.255.255 - 广播地址
  if (first === 255 && second === 255 && third === 255 && fourth === 255) {
    return false
  }

  return true
}

/**
 * 检查 IP 是否为私有地址
 * @param ip IP 地址字符串
 * @returns 是否为私有地址
 */
export function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map((part) => parseInt(part, 10))
  const [first, second] = parts

  // 10.0.0.0/8
  if (first === 10) {
    return true
  }

  // 172.16.0.0/12
  if (first === 172 && second >= 16 && second <= 31) {
    return true
  }

  // 192.168.0.0/16
  if (first === 192 && second === 168) {
    return true
  }

  return false
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