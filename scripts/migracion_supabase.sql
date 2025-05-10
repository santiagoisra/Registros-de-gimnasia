-- Migración inicial para Supabase: gestión de alumnos, asistencias, pagos, historial de precios y notas

-- Tabla alumnos
CREATE TABLE alumnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  nombre TEXT NOT NULL,
  apellido TEXT,
  email TEXT,
  telefono TEXT,
  sede TEXT CHECK (sede IN ('Plaza Arenales', 'Plaza Terán')) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  alertas_activas BOOLEAN DEFAULT TRUE,
  fecha_ultima_asistencia DATE,
  dias_consecutivos_asistencia INTEGER DEFAULT 0,
  estado_pago TEXT CHECK (estado_pago IN ('al_dia', 'pendiente', 'atrasado')),
  shift_id UUID REFERENCES shifts(id)
);

-- Tabla asistencias
CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  sede TEXT CHECK (sede IN ('Plaza Arenales', 'Plaza Terán')) NOT NULL
);

-- Tabla pagos
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL,
  fecha_pago DATE NOT NULL,
  mes INTEGER NOT NULL,
  año INTEGER NOT NULL,
  metodo_pago TEXT CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Mercado Pago')) NOT NULL,
  estado TEXT CHECK (estado IN ('Pagado', 'Pendiente')) DEFAULT 'Pagado'
);

-- Tabla historial_precios
CREATE TABLE historial_precios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  precio NUMERIC NOT NULL,
  fecha_desde DATE NOT NULL,
  fecha_hasta DATE
);

-- Tabla notas
CREATE TABLE notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  contenido TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('Ausencia', 'Lesión', 'Vacaciones', 'General')) NOT NULL,
  visible_en_reporte BOOLEAN DEFAULT FALSE
);

-- Tabla shifts (turnos)
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Agregar columna shift_id a alumnos
ALTER TABLE alumnos ADD COLUMN shift_id UUID REFERENCES shifts(id);

-- Índices para optimización
CREATE INDEX idx_alumnos_shift_id ON alumnos(shift_id);
CREATE INDEX idx_shifts_active_time ON shifts(is_active, start_time, end_time);