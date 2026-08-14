import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  thumbnails: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ],
  certificates: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
}

// Allowed file extensions
const ALLOWED_EXTENSIONS = {
  thumbnails: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  certificates: ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
}

// Validate session from cookie
function validateSession(req) {
  const session = req.cookies.get('admin_session')?.value
  if (!session) return false
  
  if (!process.env.ADMIN_PASSWORD) return false
  
  const expectedSession = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD).update('admin_session_salt').digest('hex')
  return session === expectedSession
}

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars
    .replace(/\.{2,}/g, '_') // Prevent directory traversal
    .substring(0, 100) // Limit length
}

export async function POST(req) {
  try {
    // Authentication check
    if (!validateSession(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await req.formData().catch(() => null)
    if (!form) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = form.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Empty file not allowed' }, { status: 400 })
    }

    // Validate bucket
    const bucket = form.get('bucket') ?? 'thumbnails'
    const ALLOWED_BUCKETS = ['thumbnails', 'certificates']
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES[bucket]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES[bucket].join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file extension
    const originalExt = file.name.split('.').pop()?.toLowerCase()
    if (!originalExt || !ALLOWED_EXTENSIONS[bucket]?.includes(`.${originalExt}`)) {
      return NextResponse.json(
        { error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS[bucket].join(', ')}` },
        { status: 400 }
      )
    }

    // Generate secure filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const sanitizedOriginal = sanitizeFilename(file.name.split('.')[0])
    const filename = `${timestamp}-${randomString}-${sanitizedOriginal}.${originalExt}`

    // Validate filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Ensure bucket exists in Supabase Storage
    const { data: bucketData, error: getBucketError } = await supabaseAdmin.storage.getBucket(bucket)
    if (getBucketError || !bucketData) {
      console.log(`Bucket "${bucket}" not found, creating automatically...`)
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_MIME_TYPES[bucket]
      })
      if (createBucketError && !createBucketError.message?.includes('already exists')) {
        console.error('Failed to create bucket:', createBucketError)
      }
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filename, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600'
      })

    if (error) {
      console.error('Upload error:', error)
      
      // Return detailed error for debugging
      return NextResponse.json(
        { 
          error: 'Failed to upload file',
          details: error.message,
          errorObj: error
        },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename)
    
    if (!urlData?.publicUrl) {
      console.error('Failed to get public URL')
      return NextResponse.json(
        { error: 'Failed to generate file URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: urlData.publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload handler error:', error)
    return NextResponse.json(
      { 
        error: 'An error occurred during file upload',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}