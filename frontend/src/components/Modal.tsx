import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEsc)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-1 h-1 bg-cyan-400" />
            <h2 className="modal-title">{title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 6, 23, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          background: var(--color-surface);
          border: 1px solid rgba(255, 255, 255, 0.08);
          width: 100%;
          max-width: ${maxWidth};
          position: relative;
          animation: modal-fade-in 0.2s ease-out;
        }
        .modal-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 6px;
          height: 1px;
          background: var(--color-primary);
        }
        .modal-header {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-title {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-text-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .modal-close-btn {
          background: none;
          border: 1px solid transparent;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          padding: 4px;
        }
        .modal-close-btn:hover {
          color: var(--color-text-primary);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .modal-body {
          padding: 20px 18px;
        }
        @keyframes modal-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
