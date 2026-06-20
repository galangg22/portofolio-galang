import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'

const WHITELIST = ['projects', 'project_images', 'designs', 'design_images', 'videos', 'skills']

function notAllowed() {
  return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
}

export async function GET(req, { params }) {
  const { table } = await params
  if (!WHITELIST.includes(table)) return notAllowed()

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  let query = supabaseAdmin.from(table).select('*').order('sort_order').order('created_at', { ascending: false })
  if (id) query = query.eq('id', id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req, { params }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { table } = await params
  if (!WHITELIST.includes(table)) return notAllowed()

  const body = await req.json()
  const { data, error } = await supabaseAdmin.from(table).insert(body).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req, { params }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { table } = await params
  if (!WHITELIST.includes(table)) return notAllowed()

  const { id, ...body } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await supabaseAdmin.from(table).update(body).eq('id', id).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { table } = await params
  if (!WHITELIST.includes(table)) return notAllowed()

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin.from(table).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}