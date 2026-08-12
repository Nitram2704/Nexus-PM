import { useState } from 'react'
import { Crown, Loader2, Trash2, UserPlus, Users, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { inviteMemberApi, removeMemberApi, updateMemberRoleApi } from '@/api/projects'
import { ConfirmDialog } from '@/components/kanban/ConfirmDialog'
import { getApiErrorMessage } from '@/lib/apiClient'
import type { Member, MemberRole, Project } from '@/types/project'

interface TeamPanelProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onChanged: () => void
}

export function TeamPanel({ isOpen, onClose, project, onChanged }: TeamPanelProps) {
  if (!isOpen || !project) return null
  return <TeamPanelContent project={project} onClose={onClose} onChanged={onChanged} />
}

const INVITABLE_ROLES: MemberRole[] = ['admin', 'developer', 'viewer']

function TeamPanelContent({
  project,
  onClose,
  onChanged,
}: {
  project: Project
  onClose: () => void
  onChanged: () => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MemberRole>('developer')
  const [isInviting, setIsInviting] = useState(false)
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const members = project.members || []

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim()
    if (!cleanEmail) return
    setIsInviting(true)
    try {
      await inviteMemberApi(project.id, cleanEmail, role)
      toast.success('Miembro invitado')
      setEmail('')
      setRole('developer')
      onChanged()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al invitar al miembro'))
    } finally {
      setIsInviting(false)
    }
  }

  const handleRoleChange = async (member: Member, newRole: MemberRole) => {
    if (member.role === newRole) return
    setBusyMemberId(member.id)
    try {
      await updateMemberRoleApi(project.id, member.user, newRole)
      toast.success('Rol actualizado')
      onChanged()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al actualizar el rol'))
    } finally {
      setBusyMemberId(null)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setIsRemoving(true)
    try {
      await removeMemberApi(project.id, removeTarget.user)
      toast.success('Miembro removido')
      setRemoveTarget(null)
      onChanged()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al remover al miembro'))
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[900] bg-[#020617]/70 backdrop-blur-sm" onClick={onClose} />

      <aside className="fixed right-0 top-0 z-[950] flex h-full w-full max-w-md flex-col border-l border-white/8 bg-(--color-surface)">
        {/* Header */}
        <header className="relative flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="absolute left-0 top-0 h-px w-6 bg-cyan-400/50" />
          <div className="flex items-center gap-3">
            <Users className="h-3.5 w-3.5 text-cyan-400/60" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white">
              TEAM_ROSTER
            </h2>
            <span className="font-mono text-[9px] text-white/20">// {members.length}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center border border-transparent p-1 text-white/30 transition-all hover:border-white/8 hover:text-white"
            aria-label="Cerrar panel de equipo"
          >
            <X size={16} />
          </button>
        </header>

        {/* Invite form */}
        <form onSubmit={handleInvite} className="border-b border-white/5 p-4">
          <div className="mb-2 font-mono text-[8px] uppercase tracking-[0.25em] text-white/20">
            // INVITAR_OPERADOR
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="email"
              required
              placeholder="email@equipo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/3 border border-white/8 px-3 py-2 font-mono text-xs text-white/80 outline-none transition-colors placeholder:text-white/15 focus:border-cyan-400/40"
            />
            <div className="flex gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as MemberRole)}
                className="flex-1 bg-white/3 border border-white/8 px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-white/60 outline-none transition-colors focus:border-cyan-400/40 [&>option]:bg-[#0a0f1e]"
              >
                {INVITABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.toUpperCase()}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isInviting || !email.trim()}
                className="flex items-center gap-2 border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-400 transition-all hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isInviting ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                INVITAR
              </button>
            </div>
          </div>
        </form>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto p-3">
          {members.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Users className="h-6 w-6 text-white/10" />
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/20">
                SIN_MIEMBROS
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((member) => {
                const isOwner = member.role === 'owner'
                const isBusy = busyMemberId === member.id
                return (
                  <div
                    key={member.id}
                    className="group relative border border-white/5 bg-white/2 p-3 transition-colors hover:border-white/10"
                  >
                    <div className="absolute left-0 top-0 h-px w-3 bg-cyan-400/30" />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-white/10 font-mono text-[8px] font-bold text-cyan-400/70">
                          {(member.user_name || member.user_email)
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-white/70">
                            {member.user_name || member.user_email}
                          </p>
                          <p className="truncate font-mono text-[8px] uppercase tracking-widest text-white/20">
                            {member.user_email}
                          </p>
                        </div>
                      </div>

                      {isOwner ? (
                        <span className="flex shrink-0 items-center gap-1.5 border border-amber-400/20 bg-amber-400/5 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-widest text-amber-400/80">
                          <Crown size={10} /> OWNER
                        </span>
                      ) : (
                        <div className="flex shrink-0 items-center gap-1.5">
                          {isBusy && <Loader2 size={11} className="animate-spin text-cyan-400" />}
                          <select
                            value={member.role}
                            disabled={isBusy}
                            onChange={(e) => handleRoleChange(member, e.target.value as MemberRole)}
                            className="bg-white/3 border border-white/8 px-1.5 py-1 font-mono text-[8px] uppercase tracking-widest text-white/50 outline-none transition-colors focus:border-cyan-400/40 disabled:opacity-40 [&>option]:bg-[#0a0f1e]"
                          >
                            {INVITABLE_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r.toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setRemoveTarget(member)}
                            disabled={isBusy}
                            title="Remover miembro"
                            className="flex h-6 w-6 items-center justify-center border border-white/5 text-white/25 transition-all hover:border-rose-400/30 hover:text-rose-400 disabled:opacity-40"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        isLoading={isRemoving}
        title="¿Remover miembro?"
        description={`${removeTarget?.user_name || removeTarget?.user_email || 'Este usuario'} perderá el acceso al proyecto "${project.name}".`}
        confirmText="Remover"
        variant="danger"
      />
    </>
  )
}
