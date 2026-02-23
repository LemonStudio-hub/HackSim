/**
 * 命令接口定义
 */

export interface Command {
  /** 命令名称 */
  name: string
  /** 命令描述 */
  description: string
  /** 使用方法 */
  usage: string
  /** 命令执行函数 */
  execute: (args: string[]) => Promise<string>
}

/**
 * 基础命令接口
 */
export interface BaseCommand extends Omit<Command, 'execute'> {
  /** 命令别名 */
  aliases?: string[]
  /** 命令执行函数 */
  execute: (args: string[]) => Promise<string>
}

/**
 * 命令注册表
 */
export class CommandRegistry {
  private commands: Map<string, BaseCommand> = new Map()

  /**
   * 注册命令
   * @param command 命令对象
   */
  register(command: BaseCommand): void {
    this.commands.set(command.name, command)

    // 注册别名
    if (command.aliases) {
      command.aliases.forEach((alias) => {
        this.commands.set(alias, command)
      })
    }
  }

  /**
   * 获取命令
   * @param name 命令名称
   * @returns 命令对象或 null
   */
  get(name: string): BaseCommand | null {
    return this.commands.get(name) || null
  }

  /**
   * 检查命令是否存在
   * @param name 命令名称
   * @returns 是否存在
   */
  has(name: string): boolean {
    return this.commands.has(name)
  }

  /**
   * 获取所有命令名称
   * @returns 命令名称数组
   */
  getAllNames(): string[] {
    return Array.from(new Set(Array.from(this.commands.keys())))
  }

  /**
   * 获取所有命令（去重）
   * @returns 命令对象数组
   */
  getAllCommands(): BaseCommand[] {
    const uniqueCommands = new Map<string, BaseCommand>()
    this.commands.forEach((command) => {
      if (!uniqueCommands.has(command.name)) {
        uniqueCommands.set(command.name, command)
      }
    })
    return Array.from(uniqueCommands.values())
  }

  /**
   * 注销命令
   * @param name 命令名称
   * @returns 是否成功注销
   */
  unregister(name: string): boolean {
    return this.commands.delete(name)
  }

  /**
   * 清空所有命令
   */
  clear(): void {
    this.commands.clear()
  }
}