-- Crear tabla de citas
CREATE TABLE IF NOT EXISTS public.citas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60, -- duración en minutos
    student_id UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
    type VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'group', 'evaluation', 'consultation')),
    notes TEXT,
    recurring BOOLEAN NOT NULL DEFAULT false,
    recurringType VARCHAR(10) CHECK (recurringType IN ('daily', 'weekly', 'monthly')),
    recurringEnd DATE,
    maxCapacity INTEGER NOT NULL DEFAULT 1,
    bufferTime INTEGER NOT NULL DEFAULT 15, -- tiempo de buffer en minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_citas_date ON public.citas(date);
CREATE INDEX IF NOT EXISTS idx_citas_student_id ON public.citas(student_id);
CREATE INDEX IF NOT EXISTS idx_citas_status ON public.citas(status);
CREATE INDEX IF NOT EXISTS idx_citas_type ON public.citas(type);
CREATE INDEX IF NOT EXISTS idx_citas_date_time ON public.citas(date, time);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_citas_updated_at
    BEFORE UPDATE ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad (ajustar según necesidades)
CREATE POLICY "Usuarios pueden ver todas las citas" ON public.citas
    FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden insertar citas" ON public.citas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar citas" ON public.citas
    FOR UPDATE USING (true);

CREATE POLICY "Usuarios pueden eliminar citas" ON public.citas
    FOR DELETE USING (true);

-- Comentarios para documentación
COMMENT ON TABLE public.citas IS 'Tabla para gestionar las citas/appointments del sistema';
COMMENT ON COLUMN public.citas.title IS 'Título o descripción de la cita';
COMMENT ON COLUMN public.citas.date IS 'Fecha de la cita';
COMMENT ON COLUMN public.citas.time IS 'Hora de inicio de la cita';
COMMENT ON COLUMN public.citas.duration IS 'Duración de la cita en minutos';
COMMENT ON COLUMN public.citas.student_id IS 'ID del alumno asociado a la cita';
COMMENT ON COLUMN public.citas.status IS 'Estado actual de la cita';
COMMENT ON COLUMN public.citas.type IS 'Tipo de cita (individual, grupal, evaluación, consulta)';
COMMENT ON COLUMN public.citas.notes IS 'Notas adicionales sobre la cita';
COMMENT ON COLUMN public.citas.recurring IS 'Indica si la cita es recurrente';
COMMENT ON COLUMN public.citas.recurringType IS 'Tipo de recurrencia (diaria, semanal, mensual)';
COMMENT ON COLUMN public.citas.recurringEnd IS 'Fecha de fin para citas recurrentes';
COMMENT ON COLUMN public.citas.maxCapacity IS 'Capacidad máxima para citas grupales';
COMMENT ON COLUMN public.citas.bufferTime IS 'Tiempo de buffer entre citas en minutos';