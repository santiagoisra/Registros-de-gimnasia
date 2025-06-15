import { supabase } from '@/lib/supabase'
import { Cita, CitaFilters } from '@/types'
import type { CitaStats } from '@/hooks/useCitas'

export interface TimeSlot {
  time: string
  available: boolean
  conflicts?: string[]
}

export interface ConflictInfo {
  id: string
  title: string
  time: string
  type: 'overlap' | 'buffer' | 'capacity'
  severity: 'low' | 'medium' | 'high'
}

const tableName = 'citas'

const transformCita = (data: Record<string, unknown>): Cita => {
  return {
    id: data.id as string,
    title: data.title as string,
    date: new Date(data.date as string),
    time: data.time as string,
    duration: data.duration as number,
    student_id: data.student_id as string,
    status: data.status as 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show',
    type: data.type as 'individual' | 'group' | 'evaluation' | 'consultation',
    notes: data.notes as string | undefined,
    recurring: data.recurring as boolean,
    recurringtype: data.recurringtype as 'daily' | 'weekly' | 'monthly' | undefined,
    recurringend: data.recurringend ? new Date(data.recurringend as string) : undefined,
    maxcapacity: data.maxcapacity as number,
    buffertime: data.buffertime as number,
    created_at: new Date(data.created_at as string),
    updated_at: new Date(data.updated_at as string)
  }
}

export const citasService = {

  async getAll(): Promise<Cita[]> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id, title, date, time, duration, student_id, status, type, notes, recurring, recurringtype, recurringend, maxcapacity, buffertime, created_at, updated_at')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error

      return data.map(transformCita)
    } catch (error) {
      console.error('Error fetching citas:', error)
      throw new Error('Error al obtener las citas')
    }
  },

  async getFiltered(filters?: CitaFilters): Promise<Cita[]> {
    try {
      let query = supabase
        .from(tableName)
        .select(`
          id, title, date, time, duration, student_id, status, type, notes, recurring, recurringtype, recurringend, maxcapacity, buffertime, created_at, updated_at
        `)

      // Aplicar filtros
      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.studentId && filters.studentId !== 'all') {
        query = query.eq('student_id', filters.studentId)
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      const { data, error } = await query
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error

      return data.map(transformCita)
    } catch (error) {
      console.error('Error fetching filtered citas:', error)
      throw new Error('Error al obtener las citas filtradas')
    }
  },

  async getByDateRange(
    startDate: Date, 
    endDate: Date, 
    filters?: CitaFilters
  ): Promise<Cita[]> {
    const dateFilters = {
      ...filters,
      dateRange: { start: startDate, end: endDate }
    }
    return citasService.getFiltered(dateFilters)
  },

  async getById(id: string): Promise<Cita | null> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          id, title, date, time, duration, student_id, status, type, notes, recurring, recurringtype, recurringend, maxcapacity, buffertime, created_at, updated_at
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return null

      return transformCita(data)
    } catch (error) {
      console.error('Error fetching cita by id:', error)
      throw new Error('Error al obtener la cita')
    }
  },

  async create(citaData: Partial<Cita>): Promise<Cita> {
    try {
      // Validar disponibilidad antes de crear
      if (citaData.date && citaData.time) {
        const dateTime = new Date(`${citaData.date.toISOString().split('T')[0]}T${citaData.time}`)
        const isAvailable = await citasService.checkAvailability(
          dateTime,
          citaData.duration || 60,
          citaData.buffertime || 15
        )
        
        if (!isAvailable.available) {
          throw new Error('El horario seleccionado no está disponible')
        }
      }

      // Crear objeto de inserción sin incluir campos auto-generados
      const insertData = {
        title: citaData.title,
        date: citaData.date?.toISOString().split('T')[0],
        time: citaData.time,
        duration: citaData.duration || 60,
        student_id: citaData.student_id,
        status: citaData.status || 'scheduled',
        type: citaData.type || 'individual',
        notes: citaData.notes,
        recurring: citaData.recurring || false,
        recurringtype: citaData.recurringtype,
        recurringend: citaData.recurringend?.toISOString().split('T')[0],
        maxcapacity: citaData.maxcapacity || 1,
        buffertime: citaData.buffertime || 15
      }

      // Filtrar campos undefined/null que no deberían enviarse
      Object.keys(insertData).forEach(key => {
        if (insertData[key as keyof typeof insertData] === undefined || insertData[key as keyof typeof insertData] === null) {
          delete insertData[key as keyof typeof insertData]
        }
      })

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select(`
          id, title, date, time, duration, student_id, status, type, notes, recurring, recurringtype, recurringend, maxcapacity, buffertime, created_at, updated_at
        `)
        .single()

      if (error) throw error

      // Si es recurrente, crear las citas adicionales
      if (citaData.recurring && citaData.recurringtype && citaData.recurringend) {
       await citasService.createRecurringCitas(transformCita(data), citaData.recurringend)
      }

      return transformCita(data)
    } catch (error) {
      console.error('Error creating cita:', error)
      throw new Error(error instanceof Error ? error.message : 'Error al crear la cita')
    }
  },

  async update(id: string, citaData: Partial<Cita>): Promise<Cita> {
    try {
      // Validar disponibilidad si se cambia fecha/hora
      if (citaData.date && citaData.time) {
        const dateTime = new Date(`${citaData.date.toISOString().split('T')[0]}T${citaData.time}`)
        const isAvailable = await citasService.checkAvailability(
          dateTime,
          citaData.duration || 60,
          citaData.buffertime || 15,
          id // Excluir la cita actual
        )
        
        if (!isAvailable.available) {
          throw new Error('El horario seleccionado no está disponible')
        }
      }

      const { data, error } = await supabase
        .from(tableName)
        .update({
          ...citaData,
          date: citaData.date?.toISOString().split('T')[0],
          recurringend: citaData.recurringend?.toISOString().split('T')[0]
        })
        .eq('id', id)
        .select(`
          id, title, date, time, duration, student_id, status, type, notes, recurring, recurringtype, recurringend, maxcapacity, buffertime, created_at, updated_at
        `)
        .single()

      if (error) throw error

      return transformCita(data)
    } catch (error) {
      console.error('Error updating cita:', error)
      throw new Error(error instanceof Error ? error.message : 'Error al actualizar la cita')
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting cita:', error)
      throw new Error('Error al eliminar la cita')
    }
  },

  async getStats(): Promise<CitaStats> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0]
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        .toISOString().split('T')[0]

      // Total de citas del mes
      const { count: totalCitas } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)

      // Citas de hoy
      const { count: citasHoy } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('date', today)

      // Citas pendientes (scheduled y confirmed)
      const { count: citasPendientes } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .in('status', ['scheduled', 'confirmed'])
        .gte('date', today)

      // Conflictos (simplificado - citas que se solapan)
      const conflictos = await citasService.getConflictsCount()

      const totalCitasValue = totalCitas || 0
      const citasHoyValue = citasHoy || 0
      const citasPendientesValue = citasPendientes || 0
      
      return {
        totalCitas: totalCitasValue,
        citasHoy: citasHoyValue,
        citasPendientes: citasPendientesValue,
        conflictos,
        utilizacion: totalCitasValue ? Math.round((citasHoyValue / totalCitasValue) * 100) : 0
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      throw new Error('Error al obtener las estadísticas')
    }
  },

  async checkAvailability(
    dateTime: Date,
    duration: number,
    buffertime: number,
    excludeCitaId?: string
  ): Promise<{ available: boolean; conflicts: ConflictInfo[] }> {
    try {
      const date = dateTime.toISOString().split('T')[0]
      const startTime = dateTime.toTimeString().slice(0, 5)
      const endTime = new Date(dateTime.getTime() + duration * 60000)
        .toTimeString().slice(0, 5)

      let query = supabase
        .from(tableName)
        .select('*')
        .eq('date', date)
        .neq('status', 'cancelled')

      if (excludeCitaId) {
        query = query.neq('id', excludeCitaId)
      }

      const { data: existingCitas, error } = await query

      if (error) throw error

      const conflicts: ConflictInfo[] = []

      for (const cita of existingCitas) {
        const citaStart = cita.time
        const citaEnd = new Date(
          new Date(`${date}T${cita.time}`).getTime() + cita.duration * 60000
        ).toTimeString().slice(0, 5)

        // Verificar solapamiento
        if (citasService.timesOverlap(startTime, endTime, citaStart, citaEnd)) {
          conflicts.push({
            id: cita.id,
            title: cita.title,
            time: citaStart,
            type: 'overlap',
            severity: 'high'
          })
        }

        // Verificar buffer time
        const bufferStart = new Date(
          new Date(`${date}T${citaStart}`).getTime() - buffertime * 60000
        ).toTimeString().slice(0, 5)
        const bufferEnd = new Date(
          new Date(`${date}T${citaEnd}`).getTime() + buffertime * 60000
        ).toTimeString().slice(0, 5)

        if (citasService.timesOverlap(startTime, endTime, bufferStart, bufferEnd)) {
          conflicts.push({
            id: cita.id,
            title: cita.title,
            time: citaStart,
            type: 'buffer',
            severity: 'medium'
          })
        }
      }

      return {
        available: conflicts.length === 0,
        conflicts
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      throw new Error('Error al verificar disponibilidad')
    }
  },

  async getConflicts(date: Date): Promise<ConflictInfo[]> {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const { data: citas, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('date', dateStr)
        .neq('status', 'cancelled')
        .order('time')

      if (error) throw error

      const conflicts: ConflictInfo[] = []

      for (let i = 0; i < citas.length; i++) {
        for (let j = i + 1; j < citas.length; j++) {
          const cita1 = citas[i]
          const cita2 = citas[j]

          const end1 = new Date(
            new Date(`${dateStr}T${cita1.time}`).getTime() + cita1.duration * 60000
          ).toTimeString().slice(0, 5)

          if (citasService.timesOverlap(cita1.time, end1, cita2.time, cita2.time)) {
            conflicts.push({
              id: `${cita1.id}-${cita2.id}`,
              title: `${cita1.title} vs ${cita2.title}`,
              time: cita2.time,
              type: 'overlap',
              severity: 'high'
            })
          }
        }
      }

      return conflicts
    } catch (error) {
      console.error('Error getting conflicts:', error)
      throw new Error('Error al obtener conflictos')
    }
  },

  async export(filters?: CitaFilters, format: 'csv' | 'ical' = 'csv'): Promise<string> {
    try {
      const citas = await citasService.getFiltered(filters)

      if (format === 'csv') {
        return citasService.exportToCSV(citas)
      } else {
        return citasService.exportToICal(citas)
      }
    } catch (error) {
      console.error('Error exporting citas:', error)
      throw new Error('Error al exportar las citas')
    }
  },

  async createRecurringCitas(baseCita: Cita, endDate: Date): Promise<void> {
    const citas: Partial<Cita>[] = []
    const currentDate = new Date(baseCita.date)
    currentDate.setDate(currentDate.getDate() + citasService.getRecurringInterval(baseCita.recurringtype!))

    while (currentDate <= endDate) {
      citas.push({
        ...baseCita,
        id: undefined,
        date: new Date(currentDate),
        created_at: undefined,
        updated_at: undefined
      })

      currentDate.setDate(currentDate.getDate() + citasService.getRecurringInterval(baseCita.recurringtype!))
    }

    if (citas.length > 0) {
      const citasToInsert = citas.map(cita => {
        const citaData = {
          ...cita,
          date: cita.date?.toISOString().split('T')[0]
        }
        
        // Eliminar campos que no deben enviarse a la base de datos
        delete citaData.id
        delete citaData.created_at
        delete citaData.updated_at
        
        // Filtrar campos undefined/null
        Object.keys(citaData).forEach(key => {
          const data = citaData as Record<string, unknown>
          if (data[key] === undefined || data[key] === null) {
            delete data[key]
          }
        })
        
        return citaData
      })
      
      const { error } = await supabase
        .from(tableName)
        .insert(citasToInsert)

      if (error) throw error
    }
  },

  getRecurringInterval(type: string): number {
    switch (type) {
      case 'daily': return 1
      case 'weekly': return 7
      case 'monthly': return 30
      default: return 7
    }
  },

  async getConflictsCount(): Promise<number> {
    try {
      const conflicts = await citasService.getConflicts(new Date())
      return conflicts.length
    } catch {
      return 0
    }
  },

  timesOverlap(
    start1: string, 
    end1: string, 
    start2: string, 
    end2: string
  ): boolean {
    return start1 < end2 && start2 < end1
  },

  exportToCSV(citas: Cita[]): string {
    const headers = [
      'ID', 'Título', 'Fecha', 'Hora', 'Duración', 'Alumno', 
      'Estado', 'Tipo', 'Notas', 'Recurrente'
    ]

    const rows = citas.map(cita => [
      cita.id,
      cita.title,
      cita.date.toLocaleDateString(),
      cita.time,
      `${cita.duration} min`,
      cita.alumnos ? `${cita.alumnos.nombre} ${cita.alumnos.apellido}` : '',
      cita.status,
      cita.type,
      cita.notes || '',
      cita.recurring ? 'Sí' : 'No'
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  },

  exportToICal(citas: Cita[]): string {
    const events = citas.map(cita => {
      const startDateTime = new Date(`${cita.date.toISOString().split('T')[0]}T${cita.time}`)
      const endDateTime = new Date(startDateTime.getTime() + cita.duration * 60000)

      return [
        'BEGIN:VEVENT',
        `UID:${cita.id}@gimnasia.app`,
        `DTSTART:${citasService.formatICalDate(startDateTime)}`,
        `DTEND:${citasService.formatICalDate(endDateTime)}`,
        `SUMMARY:${cita.title}`,
        `DESCRIPTION:${cita.notes || ''}`,
        `STATUS:${cita.status.toUpperCase()}`,
        'END:VEVENT'
      ].join('\n')
    })

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Gimnasia App//ES',
      ...events,
      'END:VCALENDAR'
    ].join('\n')
  },

  formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
}