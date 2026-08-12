import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  ArchiveRestore,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { archiveProjectApi, listProjectsApi } from '@/api/projects'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { ConfirmDialog } from '@/components/kanban/ConfirmDialog'
import type { ProjectSummary } from '@/types/project'

type FilterMode = 'all' | 'active' | 'archived'

export function ProjectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<FilterMode>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<ProjectSummary | null>(null)

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjectsApi().then((res) => res.data),
  })

  const archiveMutation = useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      archiveProjectApi(id, isArchived),
    onSuccess: (_data, variables) => {
      toast.success(variables.isArchived ? 'Proyecto archivado' : 'Proyecto restaurado')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setArchiveTarget(null)
    },
    onError: () => toast.error('Error al actualizar el proyecto'),
  })

  const filtered = (projects || []).filter((p) => {
    if (filter === 'active') return !p.is_archived
    if (filter === 'archived') return p.is_archived
    return true
  })

  const openCreate = () => {
    setEditingProject(null)
    setIsFormOpen(true)
  }

  const openEdit = (project: ProjectSummary) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  return (
    <div className="h-[calc(100vh-48px)] bg-(--color-bg) text-white/60 flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-white/5 px-5 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-3.5 h-3.5 text-cyan-400/60" />
          <h1 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white">
            PROJECT_REGISTRY
          </h1>
          <span className="font-mono text-[9px] text-white/20">
            // {filtered.length} {filtered.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Filter tabs */}
          <div className="flex gap-1 border border-white/5 p-0.5">
            {(['all', 'active', 'archived'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] transition-all ${
                  filter === mode
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                    : 'text-white/30 border border-transparent hover:text-white/60'
                }`}
              >
                {mode === 'all' ? 'ALL' : mode === 'active' ? 'ACTIVE' : 'ARCHIVED'}
              </button>
            ))}
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-400 transition-all hover:bg-cyan-400/15 hover:border-cyan-400/50"
          >
            <Plus size={12} /> NEW_PROJECT
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 min-h-0 overflow-auto p-5">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="flex h-6 w-6 items-center justify-center border border-cyan-400/30">
              <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
              SCANNING_REGISTRY...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasProjects={(projects || []).length > 0} onCreate={openCreate} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => navigate(`/project/${project.id}/kanban`)}
                onEdit={() => openEdit(project)}
                onToggleArchive={() => setArchiveTarget(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        project={editingProject}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
      />

      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() =>
          archiveTarget &&
          archiveMutation.mutate({ id: archiveTarget.id, isArchived: !archiveTarget.is_archived })
        }
        isLoading={archiveMutation.isPending}
        title={archiveTarget?.is_archived ? '¿Restaurar proyecto?' : '¿Archivar proyecto?'}
        description={
          archiveTarget?.is_archived
            ? `"${archiveTarget?.name}" volverá a aparecer como un proyecto activo.`
            : `"${archiveTarget?.name}" se ocultará del listado activo. Podrás restaurarlo cuando quieras.`
        }
        confirmText={archiveTarget?.is_archived ? 'Restaurar' : 'Archivar'}
        variant={archiveTarget?.is_archived ? 'info' : 'warning'}
      />
    </div>
  )
}

/* ─────────────── Sub-components ─────────────── */

function ProjectCard({
  project,
  onOpen,
  onEdit,
  onToggleArchive,
}: {
  project: ProjectSummary
  onOpen: () => void
  onEdit: () => void
  onToggleArchive: () => void
}) {
  return (
    <div
      onClick={onOpen}
      className={`group relative cursor-pointer border border-white/5 bg-white/2 p-4 transition-all hover:border-white/10 hover:bg-white/3 ${
        project.is_archived ? 'opacity-60' : ''
      }`}
    >
      <div className="absolute left-0 top-0 h-px w-6 bg-cyan-400/40 transition-all group-hover:w-10 group-hover:bg-cyan-400" />

      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-8 w-8 items-center justify-center border border-white/10 font-mono text-[9px] font-bold text-white/40 transition-all group-hover:border-cyan-400/30 group-hover:text-cyan-400">
          {project.key}
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            title="Editar proyecto"
            className="flex h-6 w-6 items-center justify-center border border-white/5 text-white/30 transition-all hover:border-cyan-400/30 hover:text-cyan-400"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleArchive()
            }}
            title={project.is_archived ? 'Restaurar' : 'Archivar'}
            className="flex h-6 w-6 items-center justify-center border border-white/5 text-white/30 transition-all hover:border-amber-400/30 hover:text-amber-400"
          >
            {project.is_archived ? <ArchiveRestore size={11} /> : <Archive size={11} />}
          </button>
        </div>
      </div>

      <h3 className="mb-1 truncate text-sm font-semibold tracking-tight text-white/70 transition-colors group-hover:text-white">
        {project.name}
      </h3>
      <p className="mb-4 line-clamp-2 min-h-[2em] text-[11px] leading-relaxed text-white/25">
        {project.description || 'Sin descripción'}
      </p>

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-3 font-mono text-[8px] uppercase tracking-widest text-white/20">
          <span className="flex items-center gap-1">
            <Users size={10} /> {project.member_count ?? 0}
          </span>
          {project.is_archived && (
            <span className="border border-amber-400/20 bg-amber-400/5 px-1.5 py-0.5 text-amber-400/70">
              ARCHIVED
            </span>
          )}
        </div>
        <span className="font-mono text-[8px] uppercase tracking-wider text-white/15">
          {new Date(project.updated_at).toLocaleDateString('es-CO')}
        </span>
      </div>
    </div>
  )
}

function EmptyState({ hasProjects, onCreate }: { hasProjects: boolean; onCreate: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center border border-white/5">
        <div className="absolute left-0 top-0 h-px w-3 bg-cyan-400/50" />
        <FolderKanban className="h-6 w-6 text-white/10" />
      </div>
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          {hasProjects ? 'NO_MATCHING_PROJECTS' : 'NO_PROJECTS_DETECTED'}
        </p>
        <p className="mt-2 max-w-xs text-xs text-white/25">
          {hasProjects
            ? 'No hay proyectos que coincidan con el filtro actual.'
            : 'Inicia tu primera operación creando un proyecto para organizar el backlog y el equipo.'}
        </p>
      </div>
      {!hasProjects && (
        <button
          onClick={onCreate}
          className="flex items-center gap-2 border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-400 transition-all hover:bg-cyan-400/15 hover:border-cyan-400/50"
        >
          <Plus size={12} /> NEW_PROJECT
        </button>
      )}
    </div>
  )
}
