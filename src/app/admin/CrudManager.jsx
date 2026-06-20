'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

// Sub-komponen untuk Related Images (misal: project_images, design_images)
function RelatedImages({ parentId, table, foreignKey, label, addLabel, hasCaption = false }) {
  const [images, setImages] = useState([])
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImageCaption, setNewImageCaption] = useState('')
  const [newImageDescription, setNewImageDescription] = useState('')
  const [newImageLoading, setNewImageLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!parentId) return
    
    const fetchImages = async () => {
      const res = await fetch(`/api/admin/${table}`)
      if (!res.ok) return
      const data = await res.json()
      setImages(data.filter(img => img[foreignKey] === parentId).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
    }
    
    fetchImages()
  }, [parentId, table, foreignKey])
  
  const refetchImages = async () => {
    if (!parentId) return
    const res = await fetch(`/api/admin/${table}`)
    if (!res.ok) return
    const data = await res.json()
    setImages(data.filter(img => img[foreignKey] === parentId).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
  }

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
      const fileInput = document.getElementById('newRelatedImage')
      if (fileInput) fileInput.value = null
    }
  }

  const handleUpdateImage = async (id, updates) => {
    await fetch(`/api/admin/${table}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    await fetchImages()
  }

  const handleDeleteImage = async (id) => {
    if (!confirm('Hapus gambar ini?')) return
    await fetch(`/api/admin/${table}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await fetchImages()
  }

  if (!parentId) return null

  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-purple-500/30">
      <h3 className="text-xl font-semibold text-purple-400 mb-4">{label}</h3>
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
                      value={img.caption || ''} onChange={(e) => handleUpdateImage(img.id, { caption: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Deskripsi</label>
                    <textarea className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-md text-white text-sm" rows={2}
                      value={img.description || ''} onChange={(e) => handleUpdateImage(img.id, { description: e.target.value })} />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Urutan</label>
                <input type="number" className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
                  value={img.sort_order || 0} onChange={(e) => handleUpdateImage(img.id, { sort_order: parseInt(e.target.value) || 0 })} />
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
            <input type="file" id="newRelatedImage" accept="image/*"
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
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {newImageLoading && <i className="ri-loader-4-line animate-spin"></i>}
          {addLabel}
        </button>
      </div>
    </div>
  )
}

// Komponen utama CrudManager
export default function CrudManager({ table, fields, columns, relatedSection = null }) {
  const [data, setData] = useState([])
  const [formData, setFormData] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileToUpload, setFileToUpload] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/${table}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const items = await res.json()
        setData(items)
      } catch (err) {
        setError(err.message)
      }
      setLoading(false)
    }
    
    fetchData()
  }, [table])
  
  const refetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/${table}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const items = await res.json()
      setData(items)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
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
        throw new Error(errorData.error || 'Submission failed')
      }
      await refetchData()
      setFormData({})
      setEditingId(null)
      setFileToUpload(null)
      document.querySelectorAll('input[type="file"]').forEach(input => { input.value = '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    const formattedItem = item.tags ? { ...item, tags: item.tags.join(', ') } : { ...item }
    setFormData(formattedItem)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        throw new Error(errorData.error || 'Deletion failed')
      }
      await refetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setFormData({})
    setEditingId(null)
    setFileToUpload(null)
    document.querySelectorAll('input[type="file"]').forEach(input => { input.value = '' })
  }

  const renderField = (field) => {
    if (field.showWhen && !field.showWhen(formData)) return null
    const value = formData[field.key] ?? ''

    let inputElement
    switch (field.type) {
      case 'text':
        inputElement = (
          <input type="text" name={field.key}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            value={value} onChange={handleInputChange} required={field.required} placeholder={field.placeholder} disabled={loading || uploadLoading} />
        )
        break
      case 'textarea':
        inputElement = (
          <textarea name={field.key} rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            value={value} onChange={handleInputChange} required={field.required} placeholder={field.placeholder} disabled={loading || uploadLoading} />
        )
        break
      case 'url':
        inputElement = (
          <div className="flex items-center">
            <input type="url" name={field.key}
              className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              value={value} onChange={handleInputChange} required={field.required} placeholder={field.placeholder} disabled={loading || uploadLoading} />
            {value && (
              <a href={value} target="_blank" rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-r-md flex items-center">
                <i className="ri-external-link-line"></i>
              </a>
            )}
          </div>
        )
        break
      case 'number':
        inputElement = (
          <input type="number" name={field.key}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:outline-none"
            value={value} onChange={handleInputChange} required={field.required} disabled={loading || uploadLoading} />
        )
        break
      case 'date':
        inputElement = (
          <input type="date" name={field.key}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:outline-none"
            value={value} onChange={handleInputChange} required={field.required} disabled={loading || uploadLoading} />
        )
        break
      case 'select':
        inputElement = (
          <select name={field.key}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:outline-none"
            value={value} onChange={handleInputChange} required={field.required} disabled={loading || uploadLoading}>
            <option value="">Pilih {field.label}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
        break
      case 'checkbox':
        inputElement = (
          <input type="checkbox" name={field.key}
            className="h-5 w-5 text-purple-500 bg-gray-700 border-gray-600 rounded"
            checked={!!value} onChange={handleInputChange} disabled={loading || uploadLoading} />
        )
        break
      case 'tags':
        inputElement = (
          <div className="w-full">
            <input type="text" name={field.key}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none mb-2"
              value={Array.isArray(value) ? value.join(', ') : value}
              onChange={handleInputChange} placeholder="Pisahkan dengan koma: tag1, tag2, tag3" disabled={loading || uploadLoading} />
            {Array.isArray(formData[field.key]) && formData[field.key].length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {formData[field.key].map((tag, index) => (
                  <span key={index} className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center">
                    {tag}
                    <button type="button" onClick={() => {
                      setFormData((prev) => ({ ...prev, [field.key]: prev[field.key].filter((_, i) => i !== index) }))
                    }} className="ml-1 text-white hover:text-red-300">&times;</button>
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
          <div className="flex flex-col">
            {imageUrl && (
              <div className="mb-3 relative w-48 h-32 bg-gray-600 rounded-md overflow-hidden">
                <Image src={imageUrl} alt="Preview" fill sizes="192px" className="object-cover" />
                <button type="button" onClick={() => handleRemoveImage(field.key)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full">
                  <i className="ri-delete-bin-line text-xs"></i>
                </button>
              </div>
            )}
            <input type="file" name={field.key} accept="image/*, application/pdf"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
              onChange={(e) => handleFileChange(e, field.key)} disabled={loading || uploadLoading} />
            {uploadLoading && fileToUpload?.fieldKey === field.key && (
              <p className="text-purple-400 text-sm mt-1">Uploading...</p>
            )}
          </div>
        )
        break
      }
      default:
        inputElement = null
    }

    return (
      <div key={field.key} className="mb-4">
        <label htmlFor={field.key} className="block text-sm font-medium text-gray-300 mb-1.5">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {inputElement}
      </div>
    )
  }

  const getBadgeColor = (type) => {
    switch (type) {
      case 'web': return 'bg-blue-600'
      case 'bot': return 'bg-green-600'
      case 'android': return 'bg-emerald-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-purple-400 mb-6">
        Manage {table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, ' ')}
      </h1>

      {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}

      {/* Form Section */}
      <div className="bg-gray-800 p-6 rounded-lg border border-purple-500/30 mb-8">
        <h2 className="text-xl font-semibold text-purple-300 mb-4">{editingId ? 'Edit Item' : 'Add New'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {fields.map(renderField)}
          <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-4">
            {editingId && (
              <button type="button" onClick={handleCancelEdit}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md text-sm disabled:opacity-50 min-h-[44px]"
                disabled={loading || uploadLoading}>
                Cancel
              </button>
            )}
            <button type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md text-sm disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
              disabled={loading || uploadLoading}>
              {(loading || uploadLoading) && <i className="ri-loader-4-line animate-spin"></i>}
              {editingId ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>

      {/* Related Section (e.g., Project Images, Design Images) */}
      {relatedSection && editingId && relatedSection.showWhen(formData) && (
        <RelatedImages
          parentId={editingId}
          table={relatedSection.table}
          foreignKey={relatedSection.foreignKey}
          label={relatedSection.label}
          addLabel={relatedSection.addLabel}
          hasCaption={relatedSection.hasCaption}
        />
      )}

      {/* Data List Section */}
      <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-purple-500/30">
        <h2 className="text-xl font-semibold text-purple-300 mb-4">
          Existing {table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, ' ')}
        </h2>
        {loading ? (
          <p className="text-gray-400">Loading data...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400">No data found.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-lg">
                <thead>
                  <tr className="bg-gray-600 text-gray-200 uppercase text-xs">
                    {columns.map((col) => (
                      <th key={col} className="py-3 px-4 text-left">{col.replace(/_/g, ' ')}</th>
                    ))}
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300 text-sm">
                  {data.map((item) => (
                    <tr key={item.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                      {columns.map((col) => (
                        <td key={col} className="py-3 px-4 text-left whitespace-nowrap">
                          {col === 'type' ? (
                            <span className={`py-1 px-2.5 rounded-full text-xs font-semibold text-white ${getBadgeColor(item[col])}`}>
                              {item[col]}
                            </span>
                          ) : col === 'featured' ? (
                            item[col] ? '✅' : '—'
                          ) : col === 'issue_date' ? (
                            item[col] ? new Date(item[col]).toLocaleDateString() : '—'
                          ) : (
                            String(item[col] ?? '—').substring(0, 50)
                          )}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md text-xs">
                            <i className="ri-edit-line"></i>
                          </button>
                          <button onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-md text-xs">
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {data.map((item) => (
                <div key={item.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  {/* Title/Main Field */}
                  <div className="mb-3">
                    <h3 className="font-bold text-white text-base mb-1">
                      {item[columns[0]] ?? 'Untitled'}
                    </h3>
                    {columns.slice(1).map((col) => (
                      <div key={col} className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                        <span className="text-gray-500 font-medium capitalize">{col.replace(/_/g, ' ')}:</span>
                        {col === 'type' ? (
                          <span className={`py-0.5 px-2 rounded-full text-xs font-semibold text-white ${getBadgeColor(item[col])}`}>
                            {item[col]}
                          </span>
                        ) : col === 'featured' ? (
                          item[col] ? '✅' : '—'
                        ) : col === 'issue_date' ? (
                          item[col] ? new Date(item[col]).toLocaleDateString() : '—'
                        ) : (
                          <span className="truncate">{String(item[col] ?? '—').substring(0, 40)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-600">
                    <button onClick={() => handleEdit(item)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center gap-2">
                      <i className="ri-edit-line text-lg"></i>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center gap-2">
                      <i className="ri-delete-bin-line text-lg"></i>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}