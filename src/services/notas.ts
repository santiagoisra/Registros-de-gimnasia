import { supabase } from '@/lib/supabase'
import type { Nota } from '@/types'

// Mapeo entre los nombres del modelo y la base de datos
function mapNotaFromDB(dbNota: Record<string, unknown>): Nota {
  return {
    id: dbNota.id as string,
    alumnoId: dbNota.alumno_id as string,
    fecha: dbNota.fecha as string,
    contenido: dbNota.contenido as string,
    tipo: dbNota.tipo as Nota['tipo'],
    visibleEnReporte: dbNota.visible_en_reporte as boolean,
  }
}

export async function getNotasPorAlumno(alumnoId: string) {
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data ? data.map(mapNotaFromDB) : []
}

export async function createNota(nota: Omit<Nota, 'id'>) {
  // Mapear los campos del modelo al formato de la base de datos
  const dbNota: Record<string, unknown> = {
    alumno_id: nota.alumnoId,
    fecha: nota.fecha,
    contenido: nota.contenido,
    tipo: nota.tipo,
    visible_en_reporte: nota.visibleEnReporte,
  }
  const { data, error } = await supabase
    .from('notas')
    .insert([dbNota])
    .select()
    .single()

  if (error) throw error
  return data ? mapNotaFromDB(data) : null
}

export async function updateNota(id: string, nota: Partial<Nota>) {
  const dbNota: Record<string, unknown> = {
    contenido: nota.contenido,
    tipo: nota.tipo,
    visible_en_reporte: nota.visibleEnReporte,
  }
  const { data, error } = await supabase
    .from('notas')
    .update(dbNota)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data ? mapNotaFromDB(data) : null
}

export async function deleteNota(id: string) {
  const { error } = await supabase
    .from('notas')
    .delete()
    .eq('id', id)

  if (error) throw error
}