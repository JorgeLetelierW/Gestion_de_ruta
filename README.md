# Gestión de Ruta JLW - React + TypeScript + Tailwind + Vite

Migración modular del visor HTML original a una aplicación React. Mantiene la visual principal de ruta, carga de archivos Excel, capas de infraestructura, trabajos, clima, ríos, tooltip y estados manuales de trabajos.

## Ejecutar

npm install
npm run dev

## Acceso y seguridad (desarrollo/test)

- Al abrir cualquier ruta de la app, primero se muestra una landing con módulo de inicio de sesión.
- La autenticación valida **usuario + tipo de usuario + contraseña** contra una base local en **IndexedDB**.
- Usuario admin inicial (solo para desarrollo/test):
  - usuario: `admin`
  - contraseña: `admin1234`

## Base de datos de usuarios (IndexedDB)

- Nombre de DB: `gestion-ruta-users-db`
- Tabla (object store): `users`
- Campos: `username`, `role`, `passwordHash`, `createdAt`, `updatedAt`
- Las contraseñas se guardan como hash SHA-256.

### Cómo usarla en la app

1. Inicia sesión con el usuario administrador.
2. Abre menú **Usuarios**.
3. Desde ahí puedes:
   - Crear usuarios (con rol Administrador/Supervisor/Visor).
   - Editar rol y/o contraseña de usuarios existentes.
   - Eliminar usuarios (con resguardos para no dejar el sistema sin admin).

> Solo el rol **Administrador** puede acceder al módulo de Usuarios y modificar esta base.

## Estructura incluida

src/components, src/pages, src/services, src/hooks, src/types, src/assets y App.tsx con enrutamiento principal.
