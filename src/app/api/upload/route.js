import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file')
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const bucket = form.get('bucket') ?? 'thumbnails'
  const ALLOWED_BUCKETS = ['thumbnails', 'certificates']
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, file, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename)
  return NextResponse.json({ url: data.publicUrl })
}