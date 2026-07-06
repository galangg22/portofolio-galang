'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import DragDropList from '@/app/admin/components/DragDropList'
import { useToast } from '@/app/admin/components/ToastProvider'
import { useSafeNavigation } from '@/app/admin/hooks/useNavigation'

// Sub-komponen untuk Related Images (misal: project_images, design_images)
function RelatedImages({ parentId, table, foreignKey, label, addLabel, hasCaption = false }) {
  const [images, setImages] = useState([])
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImageCaption, setNewImageCaption] = useState('')
  const [newImageDescription, setNewImageDescription] = useState('')
  const [newImageLoading, setNewImageLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const { redirectToLogin } = useSafeNavigation()
  const fileInputRef = useRef(null)
  const updateTimerRef = useRef({})

  // Memoize fetch function to prevent recreating on every render
  const fetchImages = useCallback(async (isMountedRef) => {
    if (!parentId) return
    
    try {
      const res = await fetch(`/api/admin/${table}`, { credentials: 'include' })
      
      if (!isMountedRef.current) return
      
      if (res.status === 401) {
        redirectToLogin()
        return
      }
      
      if (!res.ok) {
        console.error(`Failed to fetch ${table}:`, res.status, res.statusText)
        return
      }
      
      const data = await res.json()
      if (isMountedRef.current) {
        setImages(data.filter(img => img[foreignKey] === parentId).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error(`Error fetching ${table}:`, err)
      }
    }
  }, [parentId, table, foreignKey, redirectToLogin])

  useEffect(() => {
    const isMountedRef = { current: true }
    
    fetchImages(isMountedRef)
    
    return () => {
      isMountedRef.current = false
    }
  }, [fetchImages])
  
  const refetchImages = useCallback(async () => {
    if (!parentId) return
    
    const isMountedRef = { current: true }
    
    try {
      const res = await fetch(`/api/admin/${table}`, { credentials: 'include' })
      
      if (!isMountedRef.current) return
      
      if (res.status === 401) {
        redirectToLogin()
        return
      }
      
      if (!res.ok) {
        console.error(`Failed to refetch ${table}:`, res.status, res.statusText)
        return
      }
      
      const data = await res.json()
      if (isMountedRef.current) {
        setImages(data.filter(img => img[foreignKey] === parentId).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error(`Error refetching ${table}:`, err)
      }
    }
  }, [parentId, table, foreignKey, redirectToLogin])

  const handleImageUpload = async (file) => {
    setNewImageLoading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }
      const { url } = await res.json()
      return url
    } catch (err) {
      setUploadError(err.message)
      return null
    } finally {
      setNewImageLoading(false)
    }
  }

  const handleAddImage = async () => {
    if (!parentId || !newImageFile) {
      setUploadError('Please select an image first.')
      return
    }
    const imageUrl = await handleImageUpload(newImageFile)
    if (!imageUrl) return

    const newImageData = {
      [foreignKey]: parentId,
      image_url: imageUrl,
      sort_order: images.length,
    }
    if (hasCaption) {
      if (!newImageCaption) { setUploadError('Caption is required.'); return }
      newImageData.caption = newImageCaption
      newImageData.description = newImageDescription
    }

    const res = await fetch(`/api/admin/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newImageData),
    })
    if (!res.ok) {
      const errData = await res.json()
      setUploadError(errData.error || 'Failed to add image')
    } else {
      await refetchImages()
      setNewImageFile(null)
      setNewImageCaption('')
      setNewImageDescription('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUpdateImage = useCallback(async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/${table}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, ...updates }),
      })
      if (res.status === 401) {
        redirectToLogin()
        return
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error(`Failed to update ${table}:`, errData)
      }
      await refetchImages()
    } catch (err) {
      console.error(`Error updating ${table}:`, err)
    }
  }, [table, redirectToLogin, refetchImages])

  // Debounced version for text inputs (caption, description)
  const handleDebouncedUpdate = useCallback((id, updates) => {
    const key = `${id}-${Object.keys(updates).join(',')}`
    if (updateTimerRef.current[key]) {
      clearTimeout(updateTimerRef.current[key])
    }
    // Optimistically update local state
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img))
    // Debounce the API call
    updateTimerRef.current[key] = setTimeout(() => {
      handleUpdateImage(id, updates)
      delete updateTimerRef.current[key]
    }, 600)
  }, [handleUpdateImage])

  const handleDeleteImage = useCallback(async (id) => {
    if (!confirm('Hapus gambar ini?')) return
    try {
      const res = await fetch(`/api/admin/${table}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })
      if (res.status === 401) {
        redirectToLogin()
        return
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error(`Failed to delete ${table}:`, errData)
      }
      await refetchImages()
    } catch (err) {
      console.error(`Error deleting ${table}:`, err)
    }
  }, [table, redirectToLogin, refetchImages])

  if (!parentId) return null

  return (
    <div className="mt-6 p-5 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-medium text-gray-200 mb-4">{label}</h3>
      {uploadError && <p className="text-red-400 mb-4 text-sm">{uploadError}</p>}

      <div className="space-y-4 mb-6">
        {images.map((img) => (
          <div key={img.id} className="flex flex-col md:flex-row items-start gap-4 bg-gray-700 p-4 rounded-md border border-gray-600">
            <div className="flex-shrink-0 w-20 h-20 relative bg-gray-600 rounded-md overflow-hidden">
              {img.image_url ? (
                <Image src={img.image_url} alt="Thumbnail" fill sizes="80px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <i className="ri-image-edit-line text-2xl"></i>
                </div>
              )}
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {hasCaption && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Caption</label>
                    <input type="text" className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                      value={img.caption || ''} onChange={(e) => handleDebouncedUpdate(img.id, { caption: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Deskripsi</label>
                    <textarea className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-md text-white text-sm" rows={2}
                      value={img.description || ''} onChange={(e) => handleDebouncedUpdate(img.id, { description: e.target.value })} />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Urutan</label>
                <input type="number" className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                  value={img.sort_order || 0} onChange={(e) => handleDebouncedUpdate(img.id, { sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end">
                <button onClick={() => handleDeleteImage(img.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1">
                  <i className="ri-delete-bin-line"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-700 p-4 rounded-md border border-gray-600">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Tambah Baru</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Upload Gambar</label>
            <input type="file" ref={fileInputRef} accept="image/*"
              className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              onChange={(e) => setNewImageFile(e.target.files[0])} disabled={newImageLoading} />
          </div>
          {hasCaption && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Caption</label>
                <input type="text" className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                  value={newImageCaption} onChange={(e) => setNewImageCaption(e.target.value)} placeholder="Contoh: Halaman Pembayaran" disabled={newImageLoading} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Deskripsi</label>
                <textarea className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-md text-white text-sm" rows={2}
                  value={newImageDescription} onChange={(e) => setNewImageDescription(e.target.value)} placeholder="Contoh: Mendukung GoPay, OVO, QRIS via Midtrans" disabled={newImageLoading} />
              </div>
            </>
          )}
        </div>
        <button onClick={handleAddImage} disabled={newImageLoading || !newImageFile || (hasCaption && !newImageCaption)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {newImageLoading && <i className="ri-loader-4-line animate-spin"></i>}
          {addLabel}
        </button>
      </div>
    </div>
  )
}

// Komponen utama CrudManager
export default function CrudManager({ table, fields, columns, relatedSection = null, filterField = null, featuredLimit = null }) {
  const [data, setData] = useState([])
  const [formData, setFormData] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedFilterValue, setSelectedFilterValue] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileToUpload, setFileToUpload] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  // Use custom hooks
  const toast = useToast()
  const { redirectToLogin } = useSafeNavigation()

  useEffect(() => {
    if (filterField && filterField.options && filterField.options.length > 0) {
      if (selectedFilterValue === 'all' || !filterField.options.some(opt => String(opt.value) === String(selectedFilterValue))) {
        setSelectedFilterValue(filterField.options[0].value)
      }
    }
  }, [filterField, selectedFilterValue])

  useEffect(() => {
    let isMounted = true // Track if component is still mounted
    
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/admin/${table}`, { credentials: 'include' })
        
        if (!isMounted) return // Don't update state if unmounted
        
        if (res.status === 401) {
          setError('Session expired. Please login again.')
          toast.error('Session expired. Please login again.')
          setTimeout(() => {
            if (isMounted) redirectToLogin()
          }, 2000)
          return
        }
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
          const errorMsg = [
            errorData.error || `Failed to fetch: ${res.status} ${res.statusText}`,
            errorData.details ? `Details: ${errorData.details}` : null
          ].filter(Boolean).join('\n')
          throw new Error(errorMsg)
        }
        
        const items = await res.json()
        if (isMounted) setData(items)
      } catch (err) {
        console.error('Fetch error:', err)
        if (isMounted) setError(err.message || 'Failed to load data')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchData()
    
    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [table])
  
  const refetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/${table}`, { credentials: 'include' })
      
      if (res.status === 401) {
        setError('Session expired. Please login again.')
        setTimeout(() => {
          redirectToLogin()
        }, 2000)
        return
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        const errorMsg = [
          errorData.error || `Failed to fetch: ${res.status} ${res.statusText}`,
          errorData.details ? `Details: ${errorData.details}` : null
        ].filter(Boolean).join('\n')
        throw new Error(errorMsg)
      }
      
      const items = await res.json()
      setData(items)
    } catch (err) {
      console.error('Refetch error:', err)
      setError(err.message || 'Failed to reload data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (name === 'tags') {
      setFormData((prev) => ({ ...prev, [name]: value.split(',').map(tag => tag.trim()).filter(Boolean) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e, fieldKey) => {
    setFileToUpload({ file: e.target.files[0], fieldKey })
  }

  const handleImageUpload = async (file, fieldKey) => {
    setUploadLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }
      const { url } = await res.json()
      setFormData((prev) => ({ ...prev, [fieldKey]: url }))
      setFileToUpload(null)
      return url
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setUploadLoading(false)
    }
  }

  const handleRemoveImage = (fieldKey) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let dataToSubmit = { ...formData }

    // Client-side validation
    const requiredFields = fields.filter(f => f.required && (!f.showWhen || f.showWhen(dataToSubmit)))
    for (const field of requiredFields) {
      const value = dataToSubmit[field.key]
      if (!value || (typeof value === 'string' && !value.trim())) {
        setLoading(false)
        const errorMsg = `${field.label} is required`
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }
    }

    // Validate URLs if present
    const urlFields = ['demo_url', 'play_store_url', 'apk_url', 'repo_url', 'credential_link', 'video_url', 'github_url', 'thumbnail_url', 'cover_image_url']
    for (const urlField of urlFields) {
      const urlValue = dataToSubmit[urlField]
      if (urlValue && typeof urlValue === 'string' && urlValue.trim()) {
        try {
          new URL(urlValue.trim())
        } catch {
          setLoading(false)
          const errorMsg = `Invalid URL format for ${urlField.replace(/_/g, ' ')}`
          setError(errorMsg)
          toast.error(errorMsg)
          return
        }
      }
    }

    // Sanitize string inputs (trim whitespace)
    for (const key in dataToSubmit) {
      if (typeof dataToSubmit[key] === 'string') {
        dataToSubmit[key] = dataToSubmit[key].trim()
      }
    }

    // Handle image upload if a new file is selected
    if (fileToUpload) {
      const imageUrl = await handleImageUpload(fileToUpload.file, fileToUpload.fieldKey)
      if (!imageUrl) { setLoading(false); return }
      dataToSubmit = { ...dataToSubmit, [fileToUpload.fieldKey]: imageUrl }
    }

    // Filter out fields hidden by showWhen
    const visibleKeys = new Set(fields.filter(f => !f.showWhen || f.showWhen(dataToSubmit)).map(f => f.key))
    const cleanData = {}
    for (const key of Object.keys(dataToSubmit)) {
      if (visibleKeys.has(key) || key === 'id') cleanData[key] = dataToSubmit[key]
    }

    const method = editingId ? 'PUT' : 'POST'
    try {
      const res = await fetch(`/api/admin/${table}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...cleanData } : cleanData),
      })
      if (!res.ok) {
        const errorData = await res.json()
        const errorMsg = [
          errorData.error || 'Submission failed',
          errorData.details ? `Details: ${errorData.details}` : null
        ].filter(Boolean).join('\n')
        throw new Error(errorMsg)
      }
      await refetchData()
      toast.success(editingId ? 'Item updated successfully' : 'Item created successfully')
      setFormData({})
      setEditingId(null)
      setFileToUpload(null)
      setShowForm(false)
      // Remove direct DOM manipulation
      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach(input => { input.value = '' })
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    const formattedItem = Array.isArray(item.tags) 
      ? { ...item, tags: item.tags.join(', ') } 
      : { ...item }
    setFormData(formattedItem)
    setShowForm(true)
    // Smooth scroll to top with RAF for better performance
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus item ini?')) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/${table}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        const errorMsg = [
          errorData.error || 'Deletion failed',
          errorData.details ? `Details: ${errorData.details}` : null
        ].filter(Boolean).join('\n')
        throw new Error(errorMsg)
      }
      await refetchData()
      toast.success('Item deleted successfully')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFromDrag = async (updatedItems) => {
    try {
      // Prepare items for batch update (only id, sort_order, featured)
      const items = updatedItems.map(item => {
        // Ensure all required fields exist
        if (!item.id && item.id !== 0) {
          console.error('Item missing id:', item)
          throw new Error('Item missing id')
        }
        
        // Tables that have a `featured` column
        const tablesWithFeatured = ['projects', 'designs', 'videos', 'certificates']
        
        const itemData = {
          id: item.id,
          sort_order: item.sort_order ?? 0,
        }
        
        // Only include `featured` for tables that have the column
        if (tablesWithFeatured.includes(table)) {
          itemData.featured = item.featured ?? false
        }
        
        return itemData
      })

      // Debug logging (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.log('Sending batch update:', items)
      }

      const res = await fetch(`/api/admin/${table}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      if (!res.ok) {
        let errorData
        const contentType = res.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await res.json()
        } else {
          const text = await res.text()
          errorData = { error: text || `HTTP ${res.status}` }
        }
        
        console.error('Batch update failed:', { status: res.status, statusText: res.statusText, errorData })
        throw new Error(errorData.error || `Batch update failed: ${res.statusText}`)
      }

      const result = await res.json()
      if (process.env.NODE_ENV === 'development') {
        console.log('Batch update success:', result)
      }

      // Silently refetch to sync state
      await refetchData()
      toast.success(`Updated ${items.length} items`)
    } catch (err) {
      toast.error('Drag update failed: ' + err.message)
      throw err // Re-throw to let DragDropList handle revert
    }
  }

  const handleCancelEdit = () => {
    setFormData({})
    setEditingId(null)
    setFileToUpload(null)
    setShowForm(false)
    document.querySelectorAll('input[type="file"]').forEach(input => { input.value = '' })
  }

  const renderField = (field) => {
    if (field.showWhen && !field.showWhen(formData)) return null
    const value = formData[field.key] ?? ''

    // Shared input classes
    const inputClasses = "w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

    let inputElement
    switch (field.type) {
      case 'text':
        inputElement = (
          <div className="space-y-1.5">
            <input 
              type="text" 
              name={field.key}
              id={field.key}
              className={inputClasses}
              value={value} 
              onChange={handleInputChange} 
              required={field.required} 
              placeholder={field.placeholder} 
              disabled={loading || uploadLoading}
              aria-required={field.required}
              aria-label={field.label}
            />
            {field.suggestions && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {field.suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, [field.key]: sug }))
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                      value === sug 
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' 
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200 hover:bg-gray-700'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
        break
      case 'textarea':
        inputElement = (
          <textarea 
            name={field.key} 
            id={field.key}
            rows={4}
            className={inputClasses}
            value={value} 
            onChange={handleInputChange} 
            required={field.required} 
            placeholder={field.placeholder} 
            disabled={loading || uploadLoading}
            aria-required={field.required}
            aria-label={field.label}
          />
        )
        break
      case 'url':
        inputElement = (
          <div className="flex items-stretch gap-2">
            <input 
              type="url" 
              name={field.key}
              id={field.key}
              className={`flex-grow ${inputClasses}`}
              value={value} 
              onChange={handleInputChange} 
              required={field.required} 
              placeholder={field.placeholder} 
              disabled={loading || uploadLoading}
              aria-required={field.required}
              aria-label={field.label}
            />
            {value && (
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Open URL in new tab"
              >
                <i className="ri-external-link-line text-lg" aria-hidden="true"></i>
              </a>
            )}
          </div>
        )
        break
      case 'number':
        inputElement = (
          <input 
            type="number" 
            name={field.key}
            id={field.key}
            className={inputClasses}
            value={value} 
            onChange={handleInputChange} 
            required={field.required} 
            disabled={loading || uploadLoading}
            aria-required={field.required}
            aria-label={field.label}
          />
        )
        break
      case 'date':
        inputElement = (
          <input 
            type="date" 
            name={field.key}
            id={field.key}
            className={inputClasses}
            value={value} 
            onChange={handleInputChange} 
            required={field.required} 
            disabled={loading || uploadLoading}
            aria-required={field.required}
            aria-label={field.label}
          />
        )
        break
      case 'select':
        inputElement = (
          <select 
            name={field.key}
            id={field.key}
            className={inputClasses}
            value={value} 
            onChange={handleInputChange} 
            required={field.required} 
            disabled={loading || uploadLoading}
            aria-required={field.required}
            aria-label={field.label}
          >
            <option value="">Pilih {field.label}</option>
            {field.options.map((option) => {
              const val = typeof option === 'object' ? option.value : option
              const label = typeof option === 'object' ? option.label : option
              return (
                <option key={val} value={val}>{label}</option>
              )
            })}
          </select>
        )
        break
      case 'checkbox':
        inputElement = (
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              name={field.key}
              id={field.key}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-1 focus:ring-blue-500 cursor-pointer"
              checked={!!value} 
              onChange={handleInputChange} 
              disabled={loading || uploadLoading}
              aria-label={field.label}
            />
            <span className="text-gray-300 group-hover:text-white transition-colors">Enable</span>
          </label>
        )
        break
      case 'tags':
        inputElement = (
          <div className="w-full space-y-3">
            <input 
              type="text" 
              name={field.key}
              id={field.key}
              className={inputClasses}
              value={Array.isArray(value) ? value.join(', ') : value}
              onChange={handleInputChange} 
              placeholder="Pisahkan dengan koma: tag1, tag2, tag3" 
              disabled={loading || uploadLoading}
              aria-label={field.label}
            />
            {Array.isArray(formData[field.key]) && formData[field.key].length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData[field.key].map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1 bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-600"
                  >
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, [field.key]: prev[field.key].filter((_, i) => i !== index) }))
                      }} 
                      className="ml-0.5 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <i className="ri-close-line" aria-hidden="true"></i>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )
        break
      case 'image': {
        const imageUrl = formData[field.key]
        inputElement = (
          <div className="flex flex-col gap-3">
            {imageUrl && (
              <div className="relative w-full max-w-xs h-40 bg-gray-800 rounded-lg overflow-hidden border border-gray-600 group">
                <Image src={imageUrl} alt="Preview" fill sizes="384px" className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(field.key)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5"
                    aria-label="Remove image"
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true"></i>
                    Remove
                  </button>
                </div>
              </div>
            )}
            <input 
              type="file" 
              name={field.key}
              id={field.key}
              accept="image/*, application/pdf"
              className="w-full px-3 py-2 bg-gray-800 border border-dashed border-gray-600 hover:border-gray-500 rounded-lg text-white text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-700 file:text-gray-200 file:text-sm transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => handleFileChange(e, field.key)} 
              disabled={loading || uploadLoading}
              aria-label={`Upload ${field.label}`}
            />
            {uploadLoading && fileToUpload?.fieldKey === field.key && (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <i className="ri-loader-4-line animate-spin" aria-hidden="true"></i>
                <span>Uploading...</span>
              </div>
            )}
          </div>
        )
        break
      }
      default:
        inputElement = null
    }

    return (
      <div key={field.key} className="space-y-2">
        <label htmlFor={field.key} className="block text-sm font-medium text-gray-400">
          {field.label}
          {field.required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>
        {inputElement}
      </div>
    )
  }

  const getBadgeColor = (type) => {
    switch (type) {
      case 'web': return 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
      case 'bot': return 'bg-green-600/20 text-green-300 border border-green-500/30'
      case 'android': return 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
      default: return 'bg-gray-600/20 text-gray-300 border border-gray-500/30'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'web': return 'ri-window-line'
      case 'bot': return 'ri-robot-line'
      case 'android': return 'ri-android-line'
      default: return 'ri-code-box-line'
    }
  }

  const filteredData = filterField && selectedFilterValue !== 'all'
    ? data.filter(item => String(item[filterField.key]) === String(selectedFilterValue))
    : data

  return (
    <div className="relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <i className="ri-database-2-line text-blue-400"></i>
            </div>
            {table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, ' ')}
          </h1>
          <p className="text-gray-400 text-sm mt-2 ml-13">Kelola dan atur struktur data {table} Anda.</p>
        </div>
        {!showForm && !editingId && (
          <button
            onClick={() => {
              const initialForm = {}
              if (filterField && selectedFilterValue !== 'all') {
                initialForm[filterField.key] = selectedFilterValue
              }
              setFormData(initialForm)
              setShowForm(true)
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95"
            aria-label="Add new item"
          >
            <i className="ri-add-line text-lg"></i>
            Tambah Baru
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-950/50 border border-red-800/60 rounded-xl px-5 py-4 shadow-sm" role="alert" aria-live="assertive">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <i className="ri-error-warning-fill text-red-400 text-lg"></i>
            </div>
            <div>
              <h3 className="text-red-400 font-semibold text-sm">Terjadi Kesalahan</h3>
              <p className="text-sm text-red-300/80 whitespace-pre-wrap mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Master-Detail Split Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start relative">
        
        {/* Main List Column (Master) */}
        <div className={`w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${(showForm || editingId) ? 'xl:w-7/12' : 'w-full'}`}>
          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-700 overflow-hidden shadow-lg">
            <div className="px-6 py-5 border-b border-gray-700 bg-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <i className="ri-list-check-2 text-gray-400"></i>
                Daftar Konten 
                <span className="px-2 py-0.5 rounded-md bg-gray-700 text-gray-300 text-xs ml-2">{filteredData.length} item</span>
              </h2>
              
              {filterField && (
                <div className="flex flex-wrap gap-1.5 bg-gray-900/80 p-1.5 rounded-xl border border-gray-700 shadow-inner">
                  {filterField.options.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedFilterValue(opt.value)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        String(selectedFilterValue) === String(opt.value)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-blue-400">
                  <i className="ri-loader-4-line animate-spin text-4xl mb-4"></i>
                  <span className="text-gray-400 font-medium text-sm animate-pulse">Memuat data...</span>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-700 rounded-xl m-2 bg-gray-800/30">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700 mb-4 shadow-inner">
                    <i className="ri-inbox-2-line text-3xl text-gray-500"></i>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Data Kosong</h3>
                  <p className="text-gray-500 text-sm max-w-xs text-center">Belum ada konten untuk kategori ini. Klik "Tambah Baru" untuk memulai.</p>
                </div>
              ) : (
                <DragDropList
                  data={filteredData}
                  onUpdate={handleUpdateFromDrag}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getBadgeColor={getBadgeColor}
                  getTypeIcon={getTypeIcon}
                  columns={columns}
                  featuredLimit={featuredLimit}
                />
              )}
            </div>
          </div>
        </div>

        {/* Form Column (Detail Panel) */}
        {(showForm || editingId) && (
          <div className="w-full xl:w-5/12 bg-gray-800/90 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl xl:sticky xl:top-24 overflow-hidden transform-gpu animate-in slide-in-from-right-8 fade-in duration-500 ease-out">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-700 bg-gray-900/40">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingId ? (
                  <><i className="ri-edit-box-line text-blue-400"></i> Edit Konten</>
                ) : (
                  <><i className="ri-add-box-line text-emerald-400"></i> Tambah Baru</>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  handleCancelEdit()
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-red-500/80 transition-all border border-gray-700"
                aria-label="Tutup form"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {(() => {
                  // Group fields by their 'group' property
                  const groupedFields = fields.reduce((acc, field) => {
                    const group = field.group || 'Informasi Umum';
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(field);
                    return acc;
                  }, {});

                  return Object.entries(groupedFields).map(([groupName, groupFields]) => {
                    // Check if group has any visible fields based on showWhen logic
                    const visibleFields = groupFields.filter(f => !f.showWhen || f.showWhen(formData));
                    if (visibleFields.length === 0) return null;

                    return (
                      <div key={groupName} className="bg-gray-900/30 rounded-xl border border-gray-700/50 overflow-hidden shadow-sm">
                        <div className="px-5 py-3 bg-gray-800/80 border-b border-gray-700/50 flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{groupName}</h3>
                        </div>
                        <div className="p-5 flex flex-col gap-5">
                          {groupFields.map((field) => {
                            const rendered = renderField(field);
                            if (!rendered) return null;
                            return (
                              <div key={field.key} className="w-full">
                                {rendered}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
                
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowForm(false)
                      handleCancelEdit()
                    }}
                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 font-medium rounded-xl text-sm transition-all disabled:opacity-50"
                    disabled={loading || uploadLoading}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                    disabled={loading || uploadLoading}
                  >
                    {(loading || uploadLoading) ? (
                      <i className="ri-loader-4-line animate-spin text-lg"></i>
                    ) : (
                      <i className="ri-save-3-line text-lg"></i>
                    )}
                    <span>{editingId ? 'Simpan Perubahan' : 'Buat Konten'}</span>
                  </button>
                </div>
              </form>

              {/* Related Section (e.g., Project Images) */}
              {relatedSection && editingId && relatedSection.showWhen(formData) && (
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                      <i className="ri-image-line text-purple-400"></i>
                    </div>
                    <h3 className="text-white font-semibold">Galeri & Media</h3>
                  </div>
                  <RelatedImages
                    parentId={editingId}
                    table={relatedSection.table}
                    foreignKey={relatedSection.foreignKey}
                    label={relatedSection.label}
                    addLabel={relatedSection.addLabel}
                    hasCaption={relatedSection.hasCaption}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}