/**
 * 手势控制组合式函数
 * 支持触摸设备的手势操作
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface GestureCallbacks {
  onLongPress?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
  lastX: number
  lastY: number
  lastTime: number
  touches: number
  longPressTimer: number | null
  tapCount: number
  tapTimer: number | null
  initialDistance: number
}

export function useGestures(
  elementRef: Ref<HTMLElement | undefined>,
  callbacks: GestureCallbacks = {}
) {
  const touchState = ref<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    touches: 0,
    longPressTimer: null,
    tapCount: 0,
    tapTimer: null,
    initialDistance: 0,
  })

  const {
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
  } = callbacks

  const SWIPE_THRESHOLD = 50
  const SWIPE_VELOCITY = 0.3
  const LONG_PRESS_DURATION = 500

  /**
   * 计算两点之间的距离
   */
  function getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 处理触摸开始
   */
  function handleTouchStart(event: TouchEvent) {
    const touches = event.touches
    
    if (touches.length === 1) {
      // 单指触摸
      const touch = touches[0]
      touchState.value.startX = touch.clientX
      touchState.value.startY = touch.clientY
      touchState.value.lastX = touch.clientX
      touchState.value.lastY = touch.clientY
      touchState.value.startTime = Date.now()
      touchState.value.lastTime = Date.now()
      touchState.value.touches = 1

      // 设置长按定时器
      touchState.value.longPressTimer = window.setTimeout(() => {
        onLongPress?.()
      }, LONG_PRESS_DURATION)
    } else if (touches.length === 2) {
      // 双指触摸 - 计算初始距离
      touchState.value.initialDistance = getDistance(touches[0], touches[1])
      touchState.value.touches = 2
      
      // 清除长按定时器
      if (touchState.value.longPressTimer) {
        clearTimeout(touchState.value.longPressTimer)
        touchState.value.longPressTimer = null
      }
    }
  }

  /**
   * 处理触摸移动
   */
  function handleTouchMove(event: TouchEvent) {
    const touches = event.touches
    
    if (touches.length === 1) {
      // 单指触摸 - 检测滑动
      const touch = touches[0]

      // 如果移动距离超过阈值，取消长按
      if (Math.abs(touch.clientX - touchState.value.startX) > 10 ||
          Math.abs(touch.clientY - touchState.value.startY) > 10) {
        if (touchState.value.longPressTimer) {
          clearTimeout(touchState.value.longPressTimer)
          touchState.value.longPressTimer = null
        }
      }

      touchState.value.lastX = touch.clientX
      touchState.value.lastY = touch.clientY
      touchState.value.lastTime = Date.now()
    } else if (touches.length === 2) {
      // 双指触摸 - 检测缩放
      const currentDistance = getDistance(touches[0], touches[1])
      const scale = currentDistance / touchState.value.initialDistance
      
      // 只在缩放变化超过一定阈值时触发
      if (Math.abs(scale - 1) > 0.1) {
        onPinch?.(scale)
      }
    }
  }

  /**
   * 处理触摸结束
   */
  function handleTouchEnd(event: TouchEvent) {
    const touches = event.changedTouches
    
    // 清除长按定时器
    if (touchState.value.longPressTimer) {
      clearTimeout(touchState.value.longPressTimer)
      touchState.value.longPressTimer = null
    }

    const endTime = Date.now()

    // 检测滑动
    if (endTime > touchState.value.startTime) {
      const deltaTime = endTime - touchState.value.startTime
      const velocityX = Math.abs(touchState.value.lastX - touchState.value.startX) / deltaTime
      const velocityY = Math.abs(touchState.value.lastY - touchState.value.startY) / deltaTime

      if (Math.abs(touchState.value.lastX - touchState.value.startX) > SWIPE_THRESHOLD && velocityX > SWIPE_VELOCITY) {
        if (touchState.value.lastX - touchState.value.startX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else if (Math.abs(touchState.value.lastY - touchState.value.startY) > SWIPE_THRESHOLD && velocityY > SWIPE_VELOCITY) {
        if (touchState.value.lastY - touchState.value.startY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    }

    // 重置触摸状态
    touchState.value.touches = touches.length
  }

  /**
   * 初始化手势监听
   */
  function initGestures() {
    const element = elementRef.value
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false })
  }

  /**
   * 清理手势监听
   */
  function cleanupGestures() {
    const element = elementRef.value
    if (!element) return

    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('touchcancel', handleTouchEnd)

    // 清除所有定时器
    if (touchState.value.longPressTimer) {
      clearTimeout(touchState.value.longPressTimer)
    }
    if (touchState.value.tapTimer) {
      clearTimeout(touchState.value.tapTimer)
    }
  }

  // 自动初始化和清理
  onMounted(() => {
    initGestures()
  })

  onUnmounted(() => {
    cleanupGestures()
  })

  return {
    touchState,
    initGestures,
    cleanupGestures,
  }
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0)
  )
}

/**
 * 获取设备类型
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth
  const touch = isTouchDevice()

  if (touch && width <= 640) {
    return 'mobile'
  } else if (touch && width <= 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * 防止页面滚动
 */
export function preventScroll(element: HTMLElement) {
  element.addEventListener('touchmove', (e: Event) => {
    e.preventDefault()
  }, { passive: false })
}

/**
 * 允许页面滚动
 */
export function allowScroll(element: HTMLElement) {
  element.addEventListener('touchmove', () => {
    // 不阻止默认行为
  }, { passive: true })
}