module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'next',
    'next/core-web-vitals'
  ],
  rules: {
    // Puedes agregar reglas personalizadas aquí
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}; 