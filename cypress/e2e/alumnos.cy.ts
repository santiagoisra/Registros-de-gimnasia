describe('Gestión de Alumnos', () => {
  it('puede dar de alta un alumno', () => {
    cy.visit('/alumnos');
    cy.contains('Nuevo Alumno').click();
    cy.get('input#nombre').type('JuanitoTest');
    cy.get('select#sede').select('Plaza Arenales');
    cy.get('form').submit();
    // Verifica que el modal se cierre y aparezca el alumno en la lista (ajustar si hay feedback visual)
    cy.contains('Alumno creado', { timeout: 5000 }).should('exist');
  });
}); 