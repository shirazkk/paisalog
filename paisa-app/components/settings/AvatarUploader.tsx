'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { Camera, Loader2 } from 'lucide-react'

interface AvatarUploaderProps {
  currentUrl: string | null
  userId: string
  displayName: string
  onUpload: (newUrl: string) => void
}

export function AvatarUploader({ currentUrl, userId, displayName, onUpload }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      // Auto-save the new avatar URL to profile
      const res = await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, avatarUrl: data.publicUrl }),
      })

      if (!res.ok) throw new Error('Failed to update profile')

      onUpload(data.publicUrl)
      showToast('Profile picture updated ✓', 'success')
    } catch (error) {
      showToast('Error updating profile picture!', 'error')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <label htmlFor="avatar" style={{ cursor: 'pointer', display: 'block' }}>
        <div
          className="avatar"
          style={{ width: '64px', height: '64px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}
        >
          {currentUrl ? (
            <img src={currentUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' }}>
              <Camera size={24} color="#9ca3af" />
            </div>
          )}
          {uploading && (
             <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={24} className="animate-spin" />
             </div>
          )}
        </div>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  )
}
