describe('Registro de Asistencias', () => {
  it('puede registrar una asistencia para un alumno existente', () => {
    // 1. Crear un alumno por UI
    cy.visit('/alumnos');
    cy.contains('Nuevo Alumno').click();
    cy.get('input#nombre').type('AlumnoAsistenciaTest');
    cy.get('select#sede').select('Plaza Arenales');
    cy.get('form').submit();
    cy.contains('Alumno creado', { timeout: 5000 }).should('exist');

    // Espera 2 segundos para asegurar que el alumno esté disponible en asistencias
    cy.wait(2000);

    // 2. Ir a asistencias y esperar que el alumno aparezca en el select
    cy.visit('/asistencias');
    cy.reload();
    cy.get('select#alumno').should('exist');
    cy.get('select#alumno option').contains('AlumnoAsistenciaTest').invoke('val').then((alumnoId) => {
      cy.get('select#alumno').select(alumnoId || '');
      cy.get('input#fecha').should('exist').invoke('val').then((fechaHoy) => {
        cy.get('select#sede').select('Plaza Arenales');
        cy.contains('button', 'Presente').click();
        cy.get('form').submit();
        cy.contains('Asistencia registrada', { timeout: 5000 }).should('exist');
      });
    });
  });
}); 