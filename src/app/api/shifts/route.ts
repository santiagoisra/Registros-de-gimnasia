import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/shifts - listar todos los turnos
export async function GET() {
  const { data, error } = await supabase.from('shifts').select('*').order('start_time', { ascending: true })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

// POST /api/shifts - crear un nuevo turno
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, start_time, end_time, is_active = true } = body

  // Validación básica
  if (!name || !start_time || !end_time) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }
  if (start_time >= end_time) {
    return NextResponse.json({ error: 'El horario de inicio debe ser menor al de fin' }, { status: 400 })
  }

  // Validar solapamiento de turnos activos
  const { data: overlapping, error: overlapError } = await supabase
    .from('shifts')
    .select('*')
    .eq('is_active', true)
    .or(`(start_time,lt.${end_time}),and(end_time,gt.${start_time})`)
  if (overlapError) {
    return NextResponse.json({ error: overlapError.message }, { status: 500 })
  }
  if (overlapping && overlapping.length > 0) {
    return NextResponse.json({ error: 'El turno se solapa con otro turno activo' }, { status: 409 })
  }

  // Crear el turno
  const { data: created, error: createError } = await supabase
    .from('shifts')
    .insert([{ name, start_time, end_time, is_active }])
    .select()
    .single()
  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }
  return NextResponse.json(created, { status: 201 })
} 