import { useState } from 'react'
import { Loader2, UserCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/Modal'
import { updateProfileApi } from '@/api/auth'
import { getApiErrorMessage } from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/auth'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuthStore()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="USER_PROFILE">
      {isOpen && user && <ProfileForm user={user} onUpdate={updateUser} onClose={onClose} />}
    </Modal>
  )
}

function ProfileForm({
  user,
  onUpdate,
  onClose,
}: {
  user: User
  onUpdate: (user: User) => void
  onClose: () => void
}) {
  const [firstName, setFirstName] = useState(user.first_name || '')
  const [lastName, setLastName] = useState(user.last_name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await updateProfileApi({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: bio.trim(),
        avatar: avatar.trim() || null,
      })
      onUpdate(res.data)
      toast.success('Perfil actualizado')
      onClose()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al actualizar el perfil'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-white/3 border border-white/8 px-3 py-2 text-sm text-white/80 outline-none transition-colors focus:border-cyan-400/40'
  const labelClass = 'font-mono text-[9px] uppercase tracking-[0.2em] text-white/30'

  return (
    <>
      <div className="mb-5 flex items-center gap-3 border border-white/5 p-3">
        {avatar ? (
          <img
            src={avatar}
            alt="avatar"
            className="h-12 w-12 border border-cyan-400/20 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center border border-white/10">
            <UserCircle2 className="h-5 w-5 text-white/20" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white/80">
            {user.first_name} {user.last_name}
          </p>
          <p className="truncate font-mono text-[9px] uppercase tracking-widest text-white/25">
            {user.email}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Nombre</label>
            <input
              className={inputClass}
              maxLength={150}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Apellido</label>
            <input
              className={inputClass}
              maxLength={150}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Bio</label>
          <textarea
            className={`${inputClass} min-h-[70px] resize-none`}
            placeholder="Rol, especialidad, contexto..."
            maxLength={300}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Avatar URL</label>
          <input
            className={inputClass}
            type="url"
            placeholder="https://..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
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
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400 transition-all hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting && <Loader2 size={12} className="animate-spin" />}
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </>
  )
}
