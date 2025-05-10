import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Shift } from '@/types/supabase'

// GET /api/shifts/[id] - obtener un turno por id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const { data, error } = await supabase.from('shifts').select('*').eq('id', id).single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  return NextResponse.json(data)
}

// PUT /api/shifts/[id] - actualizar un turno
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await req.json()
  const { name, start_time, end_time, is_active } = body

  // Validación básica
  if (!name || !start_time || !end_time) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }
  if (start_time >= end_time) {
    return NextResponse.json({ error: 'El horario de inicio debe ser menor al de fin' }, { status: 400 })
  }

  // Validar solapamiento de turnos activos (excluyendo el actual)
  const { data: overlapping, error: overlapError } = await supabase
    .from('shifts')
    .select('*')
    .eq('is_active', true)
    .neq('id', id)
    .lt('start_time', end_time)
    .gt('end_time', start_time)
  if (overlapError) {
    return NextResponse.json({ error: overlapError.message }, { status: 500 })
  }
  if (overlapping && overlapping.length > 0) {
    return NextResponse.json({ error: 'El turno se solapa con otro turno activo' }, { status: 409 })
  }

  // Actualizar el turno
  const { data: updated, error: updateError } = await supabase
    .from('shifts')
    .update({ name, start_time, end_time, is_active })
    .eq('id', id)
    .select()
    .single()
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  return NextResponse.json(updated)
}

// DELETE /api/shifts/[id] - eliminar un turno
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const { error } = await supabase.from('shifts').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
} 