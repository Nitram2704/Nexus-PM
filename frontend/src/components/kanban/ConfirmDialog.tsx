import { Modal } from '../Modal'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  isLoading = false
}: ConfirmDialogProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="text-red-500" size={32} />,
          btn: 'btn-danger'
        }
      case 'warning':
        return {
          icon: <AlertCircle className="text-amber-500" size={32} />,
          btn: 'btn-warning'
        }
      default:
        return {
          icon: <AlertCircle className="text-blue-500" size={32} />,
          btn: 'btn-primary'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-3 bg-opacity-10 rounded-full">
          {styles.icon}
        </div>
        <p className="text-secondary mb-8 leading-relaxed">
          {description}
        </p>
        
        <div className="flex w-full gap-3">
          <button 
            className="btn-modal-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`btn-modal-confirm ${styles.btn}`} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="btn-spinner-sm"></span>
                Procesando...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        .text-secondary { color: var(--color-text-secondary); }
        .btn-modal-cancel {
          flex: 1;
          padding: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--color-text-primary);
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .btn-modal-cancel:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255,255,255,0.15);
        }
        .btn-modal-confirm {
          flex: 1;
          padding: 8px;
          border: 1px solid;
          color: white;
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .btn-danger { background: rgba(244, 63, 94, 0.15); border-color: rgba(244, 63, 94, 0.3); color: #fb7185; }
        .btn-danger:hover:not(:disabled) { background: rgba(244, 63, 94, 0.25); border-color: rgba(244, 63, 94, 0.5); }
        .btn-warning { background: rgba(251, 191, 36, 0.15); border-color: rgba(251, 191, 36, 0.3); color: #fbbf24; }
        .btn-warning:hover:not(:disabled) { background: rgba(251, 191, 36, 0.25); border-color: rgba(251, 191, 36, 0.5); }
        .btn-spinner-sm {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: currentColor;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  )
}
