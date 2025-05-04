import { supabase } from '@/lib/supabase'
import type { HistorialPrecio, EstadisticasPrecios } from '@/types'

// Mapeo entre los nombres del modelo y la base de datos
function mapHistorialPrecioFromDB(dbPrecio: Record<string, unknown>): HistorialPrecio {
  return {
    id: dbPrecio.id as string,
    servicio: dbPrecio.servicio as string,
    precio: dbPrecio.precio as number,
    fechaInicio: dbPrecio.fecha_inicio as string,
    fechaFin: dbPrecio.fecha_fin as string | null,
    notas: dbPrecio.notas as string | undefined,
    activo: dbPrecio.activo as boolean,
    moneda: dbPrecio.moneda as HistorialPrecio['moneda'],
    tipoServicio: dbPrecio.tipo_servicio as HistorialPrecio['tipoServicio'],
    descuento: dbPrecio.descuento as HistorialPrecio['descuento'],
    incrementoProgramado: dbPrecio.incremento_programado as HistorialPrecio['incrementoProgramado'],
    historialCambios: dbPrecio.historial_cambios as HistorialPrecio['historialCambios'],
    createdAt: dbPrecio.created_at as string | undefined,
    updatedAt: dbPrecio.updated_at as string | undefined,
  }
}

// Función para obtener todos los precios históricos
export async function getHistorialPrecios(options?: {
  servicio?: string;
  fecha?: string;
  soloActivos?: boolean;
  tipoServicio?: HistorialPrecio['tipoServicio'];
  moneda?: HistorialPrecio['moneda'];
  conDescuento?: boolean;
}) {
  try {
    let query = supabase.from('historial_precios').select('*')

    if (options?.servicio) {
      query = query.eq('servicio', options.servicio)
    }

    if (options?.fecha) {
      query = query.lte('fecha_inicio', options.fecha)
        .or(`fecha_fin.is.null,fecha_fin.gt.${options.fecha}`)
    }

    if (options?.soloActivos) {
      query = query.eq('activo', true)
    }

    if (options?.tipoServicio) {
      query = query.eq('tipo_servicio', options.tipoServicio)
    }

    if (options?.moneda) {
      query = query.eq('moneda', options.moneda)
    }

    if (options?.conDescuento) {
      query = query.not('descuento', 'is', null)
    }

    const { data, error } = await query.order('fecha_inicio', { ascending: false })

    if (error) throw error

    return data ? data.map(mapHistorialPrecioFromDB) : []
  } catch (error) {
    console.error('Error al obtener el historial de precios:', error)
    throw error
  }
}

// Función para obtener el precio vigente de un servicio en una fecha específica
export async function getPrecioVigente(servicio: string, fecha: string = new Date().toISOString()) {
  try {
    const { data, error } = await supabase
      .from('historial_precios')
      .select('*')
      .eq('servicio', servicio)
      .eq('activo', true)
      .lte('fecha_inicio', fecha)
      .or(`fecha_fin.is.null,fecha_fin.gt.${fecha}`)
      .order('fecha_inicio', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    return data ? mapHistorialPrecioFromDB(data) : null
  } catch (error) {
    console.error('Error al obtener el precio vigente:', error)
    throw error
  }
}

// Función para crear un nuevo registro de precio
export async function createHistorialPrecio(precio: Omit<HistorialPrecio, 'id'>) {
  try {
    // Si es un precio activo, desactivar los precios anteriores del mismo servicio
    if (precio.activo) {
      const precioAnterior = await getPrecioVigente(precio.servicio)
      
      if (precioAnterior) {
        await supabase
          .from('historial_precios')
          .update({ 
            activo: false, 
            fecha_fin: precio.fechaInicio,
            historial_cambios: [
              ...(precioAnterior.historialCambios || []),
              {
                fecha: new Date().toISOString(),
                precioAnterior: precioAnterior.precio,
                precioNuevo: precio.precio,
                motivo: precio.notas
              }
            ]
          })
          .eq('id', precioAnterior.id)
      }
    }

    const { data, error } = await supabase
      .from('historial_precios')
      .insert({
        servicio: precio.servicio,
        precio: precio.precio,
        fecha_inicio: precio.fechaInicio,
        fecha_fin: precio.fechaFin,
        notas: precio.notas,
        activo: precio.activo,
        moneda: precio.moneda,
        tipo_servicio: precio.tipoServicio,
        descuento: precio.descuento,
        incremento_programado: precio.incrementoProgramado,
        historial_cambios: precio.historialCambios || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return mapHistorialPrecioFromDB(data)
  } catch (error) {
    console.error('Error al crear el registro de precio:', error)
    throw error
  }
}

// Función para actualizar un registro de precio
export async function updateHistorialPrecio(id: string, precio: Partial<Omit<HistorialPrecio, 'id'>>) {
  try {
    const precioActual = await supabase
      .from('historial_precios')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => data ? mapHistorialPrecioFromDB(data) : null)

    if (!precioActual) throw new Error('Precio no encontrado')

    const historialCambios = [...(precioActual.historialCambios || [])]
    if (precio.precio && precio.precio !== precioActual.precio) {
      historialCambios.push({
        fecha: new Date().toISOString(),
        precioAnterior: precioActual.precio,
        precioNuevo: precio.precio,
        motivo: precio.notas
      })
    }

    const { data, error } = await supabase
      .from('historial_precios')
      .update({
        servicio: precio.servicio,
        precio: precio.precio,
        fecha_inicio: precio.fechaInicio,
        fecha_fin: precio.fechaFin,
        notas: precio.notas,
        activo: precio.activo,
        moneda: precio.moneda,
        tipo_servicio: precio.tipoServicio,
        descuento: precio.descuento,
        incremento_programado: precio.incrementoProgramado,
        historial_cambios: historialCambios,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return mapHistorialPrecioFromDB(data)
  } catch (error) {
    console.error('Error al actualizar el registro de precio:', error)
    throw error
  }
}

// Función para eliminar un registro de precio
export async function deleteHistorialPrecio(id: string) {
  try {
    const { error } = await supabase
      .from('historial_precios')
      .delete()
      .eq('id', id)

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error al eliminar el registro de precio:', error)
    throw error
  }
}

// Función para obtener análisis de tendencias de precios
export async function getPreciosTendencia(
  servicio: string, 
  fechaInicio: string, 
  fechaFin: string,
  options?: {
    tipoServicio?: HistorialPrecio['tipoServicio'];
    moneda?: HistorialPrecio['moneda'];
  }
): Promise<{ precios: HistorialPrecio[]; estadisticas: EstadisticasPrecios }> {
  try {
    let query = supabase
      .from('historial_precios')
      .select('*')
      .eq('servicio', servicio)
      .gte('fecha_inicio', fechaInicio)
      .lte('fecha_inicio', fechaFin)

    if (options?.tipoServicio) {
      query = query.eq('tipo_servicio', options.tipoServicio)
    }

    if (options?.moneda) {
      query = query.eq('moneda', options.moneda)
    }

    const { data, error } = await query.order('fecha_inicio', { ascending: true })

    if (error) throw error

    const precios = data ? data.map(mapHistorialPrecioFromDB) : []
    
    // Calcular estadísticas
    const stats: EstadisticasPrecios = {
      promedio: 0,
      minimo: 0,
      maximo: 0,
      variacionPorcentual: 0,
      tendenciaMensual: [],
      proyeccionProximoMes: undefined
    }

    if (precios.length > 0) {
      // Estadísticas básicas
      stats.promedio = precios.reduce((sum, p) => sum + p.precio, 0) / precios.length
      stats.minimo = Math.min(...precios.map(p => p.precio))
      stats.maximo = Math.max(...precios.map(p => p.precio))
      
      if (precios.length >= 2) {
        const primerPrecio = precios[0].precio
        const ultimoPrecio = precios[precios.length - 1].precio
        stats.variacionPorcentual = ((ultimoPrecio - primerPrecio) / primerPrecio) * 100
      }

      // Tendencia mensual
      const preciosPorMes = precios.reduce((acc, precio) => {
        const mes = precio.fechaInicio.substring(0, 7) // YYYY-MM
        if (!acc[mes]) {
          acc[mes] = { suma: 0, cantidad: 0, cambios: 0 }
        }
        acc[mes].suma += precio.precio
        acc[mes].cantidad++
        if (precio.historialCambios?.length) {
          acc[mes].cambios += precio.historialCambios.length
        }
        return acc
      }, {} as Record<string, { suma: number; cantidad: number; cambios: number }>)

      stats.tendenciaMensual = Object.entries(preciosPorMes)
        .map(([mes, datos]) => ({
          mes,
          promedio: datos.suma / datos.cantidad,
          cantidadCambios: datos.cambios
        }))
        .sort((a, b) => a.mes.localeCompare(b.mes))

      // Proyección para el próximo mes
      if (stats.tendenciaMensual.length >= 3) {
        const ultimosTresMeses = stats.tendenciaMensual.slice(-3)
        const variacionPromedio = ultimosTresMeses.reduce((acc, curr, i, arr) => {
          if (i === 0) return acc
          return acc + ((curr.promedio - arr[i-1].promedio) / arr[i-1].promedio)
        }, 0) / (ultimosTresMeses.length - 1)

        const ultimoPrecio = ultimosTresMeses[ultimosTresMeses.length - 1].promedio
        stats.proyeccionProximoMes = ultimoPrecio * (1 + variacionPromedio)
      }
    }

    return {
      precios,
      estadisticas: stats
    }
  } catch (error) {
    console.error('Error al obtener tendencias de precios:', error)
    throw error
  }
}

// Función para verificar y notificar incrementos programados
export async function verificarIncrementosProgramados(): Promise<HistorialPrecio[]> {
  try {
    const fechaActual = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('historial_precios')
      .select('*')
      .eq('activo', true)
      .contains('incremento_programado', [{ notificado: false }])

    if (error) throw error

    const preciosConIncrementos = data ? data.map(mapHistorialPrecioFromDB) : []
    const preciosParaActualizar: HistorialPrecio[] = []

    for (const precio of preciosConIncrementos) {
      const incrementosPendientes = precio.incrementoProgramado?.filter(
        inc => !inc.notificado && inc.fecha <= fechaActual
      )

      if (incrementosPendientes?.length) {
        const incrementosActualizados = precio.incrementoProgramado?.map(inc => ({
          ...inc,
          notificado: inc.fecha <= fechaActual ? true : inc.notificado
        }))

        await supabase
          .from('historial_precios')
          .update({ incremento_programado: incrementosActualizados })
          .eq('id', precio.id)

        preciosParaActualizar.push(precio)
      }
    }

    return preciosParaActualizar
  } catch (error) {
    console.error('Error al verificar incrementos programados:', error)
    throw error
  }
}