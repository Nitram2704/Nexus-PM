import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/Modal'
import { createProjectApi, updateProjectApi } from '@/api/projects'
import { getApiErrorMessage } from '@/lib/apiClient'
import type { ProjectSummary } from '@/types/project'

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  project?: ProjectSummary | null
  onSuccess: () => void
}

export function ProjectFormModal({ isOpen, onClose, project, onSuccess }: ProjectFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'EDIT_PROJECT' : 'NEW_PROJECT'}>
      {isOpen && <ProjectForm project={project} onClose={onClose} onSuccess={onSuccess} />}
    </Modal>
  )
}

const generateKey = (name: string) =>
  name
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase()

function ProjectForm({
  project,
  onClose,
  onSuccess,
}: {
  project?: ProjectSummary | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEdit = !!project
  const [name, setName] = useState(project?.name ?? '')
  const [key, setKey] = useState(project?.key ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [keyTouched, setKeyTouched] = useState(isEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    if (!keyTouched) setKey(generateKey(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = name.trim()
    const cleanKey = key.trim().toUpperCase()
    if (!cleanName || !cleanKey) return

    setIsSubmitting(true)
    try {
      if (isEdit && project) {
        await updateProjectApi(project.id, {
          name: cleanName,
          key: cleanKey,
          description: description.trim(),
        })
        toast.success('Proyecto actualizado')
      } else {
        await createProjectApi({
          name: cleanName,
          key: cleanKey,
          description: description.trim() || undefined,
        })
        toast.success('Proyecto creado')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al guardar el proyecto'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
          Nombre <span className="text-cyan-400">*</span>
        </label>
        <input
          className="w-full bg-white/3 border border-white/8 px-3 py-2 text-sm text-white/80 outline-none transition-colors focus:border-cyan-400/40"
          placeholder="Ej: Nexus Core"
          maxLength={100}
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
          Key <span className="text-cyan-400">*</span>
        </label>
        <input
          className="w-full bg-white/3 border border-white/8 px-3 py-2 font-mono text-sm uppercase tracking-widest text-cyan-400 outline-none transition-colors focus:border-cyan-400/40"
          placeholder="NEX"
          maxLength={10}
          required
          value={key}
          onChange={(e) => {
            setKeyTouched(true)
            setKey(e.target.value.toUpperCase())
          }}
        />
        <span className="font-mono text-[8px] uppercase tracking-widest text-white/15">
          Prefijo único para las tareas (ej: {key || 'NEX'}-1)
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
          Descripción
        </label>
        <textarea
          className="w-full min-h-[80px] resize-none bg-white/3 border border-white/8 px-3 py-2 text-sm text-white/80 outline-none transition-colors focus:border-cyan-400/40"
          placeholder="Objetivo del proyecto..."
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-white/8 bg-white/3 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 transition-all hover:border-white/15 hover:text-white/70"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !key.trim()}
          className="flex flex-1 items-center justify-center gap-2 border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400 transition-all hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting && <Loader2 size={12} className="animate-spin" />}
          {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}
