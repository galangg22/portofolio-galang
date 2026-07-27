'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }, [removeToast])

  const success = useCallback((message, duration) => {
    return addToast({ message, type: 'success', duration })
  }, [addToast])

  const error = useCallback((message, duration) => {
    return addToast({ message, type: 'error', duration })
  }, [addToast])

  const info = useCallback((message, duration) => {
    return addToast({ message, type: 'info', duration })
  }, [addToast])

  const warning = useCallback((message, duration) => {
    return addToast({ message, type: 'warning', duration })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ success, error, info, warning, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleRemove = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 200)
  }, [toast.id, onRemove])

  const typeStyles = {
    success: 'border-green-800/60 bg-green-950/80',
    error: 'border-red-800/60 bg-red-950/80',
    warning: 'border-yellow-800/60 bg-yellow-950/80',
    info: 'border-blue-800/60 bg-blue-950/80',
  }

  const typeTextColor = {
    success: 'text-green-300',
    error: 'text-red-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300',
  }

  const typeIcons = {
    success: 'ri-check-line',
    error: 'ri-error-warning-line',
    warning: 'ri-alert-line',
    info: 'ri-information-line',
  }

  return (
    <div
      className={`
        ${typeStyles[toast.type]} 
        border rounded-lg
        px-3 py-2.5 flex items-center gap-2.5
        pointer-events-auto backdrop-blur-sm
        transition-all duration-200
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      <i className={`${typeIcons[toast.type]} ${typeTextColor[toast.type]}`} aria-hidden="true"></i>
      <p className="flex-1 text-gray-200 text-sm leading-snug">{toast.message}</p>
      <button
        onClick={handleRemove}
        className="text-gray-500 hover:text-gray-300 transition-colors p-0.5"
        aria-label="Close notification"
      >
        <i className="ri-close-line text-sm"></i>
      </button>
    </div>
  )
}
