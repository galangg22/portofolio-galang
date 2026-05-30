import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminAuthenticated } from '@/lib/auth';
import { NextResponse } from 'next/server';

const TABLES = ['projects', 'project_images', 'designs', 'design_images', 'videos', 'skills'];

function guard(table) {
  if (!TABLES.includes(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  return null;
}

async function authed() {
  return isAdminAuthenticated();
}

export async function GET(req, { params }) {
  const { table } = await params;
  const bad = guard(table);
  if (bad) return bad;
  const { searchParams } = new URL(req.url);
  let query = supabaseAdmin.from(table).select('*').order('sort_order').order('created_at', { ascending: false });
  for (const key of ['project_id', 'design_id', 'id']) {
    const v = searchParams.get(key);
    if (v) query = query.eq(key, v);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req, { params }) {
  const { table } = await params;
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bad = guard(table);
  if (bad) return bad;
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from(table).insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req, { params }) {
  const { table } = await params;
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bad = guard(table);
  if (bad) return bad;
  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { data, error } = await supabaseAdmin.from(table).update(fields).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req, { params }) {
  const { table } = await params;
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bad = guard(table);
  if (bad) return bad;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
