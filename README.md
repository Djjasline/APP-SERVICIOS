# APP Servicios ASTAP

Aplicación web interna para gestionar informes técnicos, inspecciones, mantenimientos, operaciones, bodega, cotizaciones, repositorios, notificaciones y comunicación de servicios ASTAP.

## Stack

- React 19
- Vite 7
- React Router 8, importado como `react-router-dom` mediante alias de Vite
- Supabase Auth, Database, Storage, Realtime, Edge Functions y Push Subscriptions
- Tailwind CSS 3
- Generación de PDF con `jspdf`, `html2canvas` y `html2pdf.js`
- PWA con Service Worker propio en `public/sw.js`

## Requisitos

- Node.js 20.x
- npm
- Proyecto Supabase configurado con las tablas y políticas SQL de `supabase/sql`

## Instalación

1. Copia las variables de entorno:

```powershell
Copy-Item .env.example .env
```

2. Configura `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_publica
VITE_VAPID_PUBLIC_KEY=tu_vapid_public_key_opcional
```

`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son obligatorias. La app falla de forma explícita si faltan para evitar conectarse por accidente a otro proyecto.

3. Instala dependencias:

```powershell
npm install
```

4. Levanta desarrollo:

```powershell
npm run dev
```

En PowerShell, si la política local bloquea `npm.ps1`, usa `npm.cmd run dev`.

## Scripts

- `npm run dev`: servidor Vite local.
- `npm run build`: build de producción en `dist`.
- `npm run preview`: preview local del build.
- `npm test`: pruebas con `node --test`.

## Estructura

- `src/index.jsx`: entrada real de la aplicación.
- `src/App.jsx`: inicializa rutas y hooks globales.
- `src/Routes.jsx`: rutas protegidas, módulos y vistas PDF.
- `src/context`: autenticación, tema y estado compartido.
- `src/services`: acceso a Supabase y lógica de negocio.
- `src/app`: módulos por área: vehículos, agua, petróleo, operaciones y repositorios.
- `src/components`: componentes compartidos.
- `src/hooks`: hooks de autoguardado, notificaciones y opciones.
- `src/constants`: textos, permisos y configuración compartida.
- `supabase/sql`: scripts de tablas, RLS y políticas.
- `public/sw.js`: Service Worker para PWA, cache y push notifications.

## Módulos

- Vehículos: informes, inspecciones, mantenimientos, protocolos, configurador Vactor y cotizador.
- Agua, Industria y Petróleo: informes técnicos por área.
- Operaciones: liberación, recepción, registro de herramientas y bodega.
- Repositorios: manuales, marcas, entrenamientos y enlaces técnicos.
- Admin: permisos de registros y boletines.
- Comunicación: notificaciones, push notifications y chat interno.

## Deploy En Netlify

El proyecto usa `netlify.toml` con build `npm run build`, publicación de `dist`, fallback SPA y headers de seguridad.

Configura estas variables en Netlify antes del deploy:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_VAPID_PUBLIC_KEY`, si se usan push notifications

Después de cambiar variables de entorno, haz redeploy del sitio.

## Documentación

- [Control de bodega y despacho de repuestos](docs/proyecto-bodega-repuestos.md)
