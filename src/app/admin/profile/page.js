"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useToast } from '../components/ToastProvider'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default function ProfileAdmin() {
  const [profile, setProfile] = useState({
    full_name: '',
    availability_status: 'available',
    cv_url: '',
    avatar_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [tableMissing, setTableMissing] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        if (error.code === 'PGRST205' || error.code === 'PGRST116') {
          // Table doesn't exist or row doesn't exist
          if (error.code === 'PGRST205') setTableMissing(true)
        } else {
          toast.error('Gagal memuat profil: ' + error.message)
        }
      } else if (data) {
        setProfile(data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const payload = { ...profile, id: 1 }
      
      let res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (res.status === 404) {
        res = await fetch('/api/admin/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      
      const resData = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        if (resData.details && resData.details.includes('relation "profile" does not exist')) {
          setTableMissing(true)
          throw new Error('Tabel profile belum dibuat di database.')
        }
        throw new Error(resData.error || 'Terjadi kesalahan saat menyimpan')
      }
      
      toast.success('Profil berhasil disimpan!')
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan profil: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (file, bucket, stateSetter, urlField) => {
    if (!file) return
    stateSetter(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload')
      }

      setProfile(prev => ({ ...prev, [urlField]: data.url }))
      toast.success('File berhasil diunggah')
    } catch (err) {
      console.error(err)
      toast.error('Gagal mengunggah file: ' + err.message)
    } finally {
      stateSetter(false)
    }
  }

  if (tableMissing) {
    return (
      <div className="max-w-3xl mx-auto mt-8 bg-red-900/20 border border-red-500/50 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-red-400 mb-4">Tabel Database Belum Tersedia</h2>
        <p className="text-gray-300 mb-4">
          Anda perlu membuat tabel <code className="bg-black/50 px-2 py-1 rounded">profile</code> di Supabase sebelum dapat menggunakan fitur ini. Silakan jalankan SQL berikut di SQL Editor Supabase Anda:
        </p>
        <pre className="bg-black p-4 rounded-lg overflow-x-auto text-sm text-gray-300 font-mono mb-4">
{`CREATE TABLE profile (
  id INT PRIMARY KEY DEFAULT 1,
  full_name TEXT NOT NULL,
  availability_status TEXT DEFAULT 'available',
  cv_url TEXT,
  avatar_url TEXT
);

INSERT INTO profile (id, full_name, availability_status) 
VALUES (1, 'Galang Pramudito', 'available');

-- Aktifkan RLS jika diperlukan
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON profile FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON profile FOR ALL USING (auth.role() = 'authenticated');`}
        </pre>
        <button 
          onClick={fetchProfile}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          Saya Sudah Menjalankan SQL
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Profil & CV</h1>
      </div>

      <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        
        {/* Foto Profil */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Foto Profil (Avatar)</label>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <i className="ri-user-line text-3xl text-gray-500"></i>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <input 
                type="url" 
                value={profile.avatar_url || ''} 
                onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
                placeholder="https://... atau upload file"
              />
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'thumbnails', setUploadingAvatar, 'avatar_url')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingAvatar}
                />
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={uploadingAvatar}
                >
                  <i className={uploadingAvatar ? "ri-loader-4-line animate-spin" : "ri-upload-2-line"}></i>
                  {uploadingAvatar ? 'Mengunggah...' : 'Upload Foto'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tersedia */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Status Ketersediaan</label>
          <select 
            value={profile.availability_status || 'available'} 
            onChange={(e) => setProfile({...profile, availability_status: e.target.value})}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
          >
            <option value="available">Tersedia untuk Internship & Freelance</option>
            <option value="freelance_only">Hanya Freelance</option>
            <option value="internship_only">Hanya Internship</option>
            <option value="unavailable">Tidak Tersedia Saat Ini</option>
          </select>
        </div>

        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Nama Lengkap (Ditampilkan di Hero)</label>
          <input 
            type="text" 
            value={profile.full_name || ''} 
            onChange={(e) => setProfile({...profile, full_name: e.target.value})}
            required
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
            placeholder="Galang Pramudito"
          />
        </div>

        {/* CV PDF */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Curriculum Vitae (PDF)</label>
          <div className="flex flex-col gap-3">
            <input 
              type="url" 
              value={profile.cv_url || ''} 
              onChange={(e) => setProfile({...profile, cv_url: e.target.value})}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
              placeholder="https://... atau upload PDF"
            />
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'certificates', setUploadingCv, 'cv_url')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingCv}
                />
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={uploadingCv}
                >
                  <i className={uploadingCv ? "ri-loader-4-line animate-spin" : "ri-upload-2-line"}></i>
                  {uploadingCv ? 'Mengunggah...' : 'Upload PDF'}
                </button>
              </div>
              {profile.cv_url && (
                <a 
                  href={profile.cv_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:text-white transition-colors flex items-center gap-1"
                >
                  <i className="ri-external-link-line"></i> Lihat PDF saat ini
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-3 bg-accent hover:bg-indigo-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <><i className="ri-loader-4-line animate-spin"></i> Menyimpan...</>
            ) : (
              <><i className="ri-save-line"></i> Simpan Profil</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
