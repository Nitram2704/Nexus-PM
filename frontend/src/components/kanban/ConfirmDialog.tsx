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
          padding: 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-modal-cancel:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }
        .btn-modal-confirm {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-danger { background: #ef4444; }
        .btn-danger:hover:not(:disabled) { background: #dc2626; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
        .btn-warning { background: #f59e0b; }
        .btn-warning:hover:not(:disabled) { background: #d97706; box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
        .btn-spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  )
}
