<script lang="ts">
import { toast } from 'vue-sonner'
import { h } from 'vue'
import { XIcon } from '@lucide/vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
}

const showToast = (type: ToastType, message: string, options?: ToastOptions) => {
  const getVar = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const baseStyle = {
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
  } as const

  const styleMap = {
    success: { ...baseStyle, backgroundColor: getVar('--toast-success-bg'), color: getVar('--toast-text-color') },
    error: { ...baseStyle, backgroundColor: getVar('--toast-error-bg'), color: getVar('--toast-text-color') },
    warning: { ...baseStyle, backgroundColor: getVar('--toast-warning-bg'), color: getVar('--toast-text-color') },
    info: { ...baseStyle, backgroundColor: getVar('--toast-info-bg'), color: getVar('--toast-text-color') },
  } as const

  const config = {
    style: styleMap[type],
    duration: options?.duration ?? 3000,
    action: {
      label: h(XIcon, { class: 'size-4' }),
      onClick: () => toast.dismiss(),
    },
  }

  switch (type) {
    case 'success':
      toast.success(message, config)
      break
    case 'error':
      toast.error(message, config)
      break
    case 'warning':
      toast.warning(message, config)
      break
    case 'info':
    default:
      toast(message, config)
  }
}

export const AppToast = {
  show: showToast,
  success: (message: string, options?: ToastOptions) => showToast('success', message, options),
  error: (message: string, options?: ToastOptions) => showToast('error', message, options),
  warning: (message: string, options?: ToastOptions) => showToast('warning', message, options),
  info: (message: string, options?: ToastOptions) => showToast('info', message, options),
}
</script>
