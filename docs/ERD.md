# Diagrama Entidad-Relación (ERD) y Documentación de Base de Datos

## Entidades principales

### alumnos
- **id**: UUID, PK
- **created_at**: timestamp, default now()
- **nombre**: text, NOT NULL
- **apellido**: text
- **email**: text
- **telefono**: text
- **sede**: text, NOT NULL, ('Plaza Arenales', 'Plaza Terán')
- **activo**: boolean, default TRUE
- **alertas_activas**: boolean, default TRUE
- **fecha_ultima_asistencia**: date
- **dias_consecutivos_asistencia**: integer, default 0
- **estado_pago**: text, ('al_dia', 'pendiente', 'atrasado')
- **shift_id**: UUID, FK → shifts(id)

### asistencias
- **id**: UUID, PK
- **created_at**: timestamp, default now()
- **alumno_id**: UUID, FK → alumnos(id), ON DELETE CASCADE
- **fecha**: date, NOT NULL
- **sede**: text, NOT NULL, ('Plaza Arenales', 'Plaza Terán')

### pagos
- **id**: UUID, PK
- **created_at**: timestamp, default now()
- **alumno_id**: UUID, FK → alumnos(id), ON DELETE CASCADE
- **monto**: numeric, NOT NULL
- **fecha_pago**: date, NOT NULL
- **mes**: integer, NOT NULL
- **año**: integer, NOT NULL
- **metodo_pago**: text, NOT NULL, ('Efectivo', 'Transferencia', 'Mercado Pago')
- **estado**: text, ('Pagado', 'Pendiente'), default 'Pagado'

### historial_precios
- **id**: UUID, PK
- **alumno_id**: UUID, FK → alumnos(id), ON DELETE CASCADE
- **precio**: numeric, NOT NULL
- **fecha_desde**: date, NOT NULL
- **fecha_hasta**: date

### notas
- **id**: UUID, PK
- **alumno_id**: UUID, FK → alumnos(id), ON DELETE CASCADE
- **fecha**: date, NOT NULL
- **contenido**: text, NOT NULL
- **tipo**: text, NOT NULL, ('Ausencia', 'Lesión', 'Vacaciones', 'General')
- **visible_en_reporte**: boolean, default FALSE

### shifts
- **id**: UUID, PK
- **name**: text, NOT NULL
- **start_time**: time, NOT NULL
- **end_time**: time, NOT NULL
- **is_active**: boolean, default TRUE
- **created_at**: timestamp, default now()

## Relaciones
- **alumnos** 1---* **asistencias** (alumno_id)
- **alumnos** 1---* **pagos** (alumno_id)
- **alumnos** 1---* **historial_precios** (alumno_id)
- **alumnos** 1---* **notas** (alumno_id)
- **shifts** 1---* **alumnos** (shift_id)

## Constraints y reglas
- Chequeos de dominio en campos de texto (sede, estado_pago, metodo_pago, tipo, estado)
- ON DELETE CASCADE en todas las FK de alumno_id
- Índices:
  - `idx_alumnos_shift_id` en alumnos(shift_id)
  - `idx_shifts_active_time` en shifts(is_active, start_time, end_time)

## Notas
- No hay stored procedures ni triggers definidos en el script.
- Todas las tablas usan UUID como PK.
- Las fechas usan timestamp o date según corresponda.

---

**Este archivo debe mantenerse actualizado ante cualquier cambio en la estructura de la base de datos.** 