import React, { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Edit2, Trash2, ArrowRight, Eraser } from 'lucide-react'
import type { Column } from '@/types/project'

interface ColumnMenuProps {
  column: Column
  otherColumns: Column[]
  onRename: (newName: string) => void
  onClear: () => void
  onMoveAll: (targetColumnId: string) => void
  onDelete: () => void
  isLoading?: boolean
}

export function ColumnMenu({ column, otherColumns, onRename, onClear, onMoveAll, onDelete, isLoading = false }: ColumnMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(column.name)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsRenaming(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim() && newName !== column.name) {
      onRename(newName.trim())
    }
    setIsRenaming(false)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className={`column-menu-btn ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        title="Opciones de columna"
      >
        {isLoading ? <div className="btn-spinner-xs" /> : <MoreHorizontal size={18} />}
      </button>

      {isOpen && (
        <div className="column-dropdown">
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} className="p-3">
              <input
                autoFocus
                className="rename-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => setIsRenaming(false)}
              />
            </form>
          ) : (
            <div className="flex flex-col py-1">
              <button 
                className="dropdown-item" 
                onClick={() => setIsRenaming(true)}
                disabled={isLoading}
              >
                <Edit2 size={14} /> <span>Renombrar</span>
              </button>
              
              <button 
                className="dropdown-item" 
                onClick={() => { onClear(); setIsOpen(false); }}
                disabled={column.tasks.length === 0 || isLoading}
              >
                <Eraser size={14} /> <span>Limpiar columna</span>
              </button>

              {otherColumns.length > 0 && (
                <div className="dropdown-submenu">
                  <div className={`dropdown-item dropdown-item--has-sub ${isLoading ? 'opacity-50' : ''}`}>
                    <ArrowRight size={14} /> <span>Mover todo a...</span>
                  </div>
                  {!isLoading && (
                    <div className="submenu-content">
                      {otherColumns.map(col => (
                        <button 
                          key={col.id} 
                          className="dropdown-item dropdown-item--sub"
                          onClick={() => { onMoveAll(col.id); setIsOpen(false); }}
                        >
                          {col.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="dropdown-divider" />
              
              <button 
                className="dropdown-item dropdown-item--danger" 
                onClick={() => { onDelete(); setIsOpen(false); }}
                disabled={column.is_done_column || isLoading}
              >
                <Trash2 size={14} /> <span>Eliminar columna</span>
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .btn-spinner-xs {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .column-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 200px;
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
          z-index: 100;
          margin-top: 8px;
          overflow: hidden;
          animation: dropdownSlide 0.2s ease-out;
        }

        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .dropdown-item:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.15);
          color: var(--color-text-primary);
        }

        .dropdown-item:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .dropdown-item--danger:hover {
          background: rgba(239, 68, 68, 0.15) !important;
          color: #fca5a5 !important;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          margin: 4px 0;
        }

        .rename-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--color-accent);
          border-radius: 6px;
          padding: 6px 10px;
          color: white;
          font-size: 0.8125rem;
          outline: none;
        }

        .dropdown-submenu {
          position: relative;
        }

        .submenu-content {
          display: none;
          position: absolute;
          right: 100%;
          top: 0;
          width: 160px;
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin-right: 4px;
          box-shadow: -5px 5px 15px rgba(0,0,0,0.3);
        }

        .dropdown-submenu:hover .submenu-content {
          display: block;
        }

        .dropdown-item--sub {
          padding: 8px 12px;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  )
}
