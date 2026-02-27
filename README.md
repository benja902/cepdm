# CEPREVAL PREP — MVP v1

Plataforma de preparación para el examen de admisión **UNHEVAL/CEPREVAL**.
UI estilo HUD sci-fi/Valorant. Stack: Next.js 14 App Router · TypeScript · TailwindCSS · Framer Motion · Supabase.

---

## Configuración rápida

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → New project.
2. Anota: **Project URL** y **anon public key** (Settings → API).

### 3. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Crear esquema de base de datos

En el **SQL Editor** de Supabase, ejecuta el contenido de:

```
supabase/schema.sql
```

Esto crea todas las tablas, índices, RLS policies y el trigger `recalc_mastery`.

### 5. Poblar con datos de muestra

En el mismo SQL Editor, ejecuta:

```
supabase/seed.sql
```

Esto inserta:
- 3 cursos (Álgebra, Aptitud Verbal, Inglés)
- Todas las unidades y subtemas del árbol oficial
- 10 preguntas de muestra por curso (30 total)

### 6. Activar Email Auth en Supabase

- Authentication → Providers → Email: **Enable**
- En proveedores, asegúrate que "Confirm email" esté desactivado para dev rápido, o configura un email provider (SendGrid, Resend, etc.)

### 7. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Estructura de rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/auth/login` | Login / Registro |
| `/app/dashboard` | Campo base (stats + acceso cursos) |
| `/app/courses` | Lista de cursos |
| `/app/courses/[courseSlug]` | Árbol de unidades y subtemas con mastery |
| `/app/topics/[topicId]/practice` | Modo práctica MCQ |
| `/app/reports` | Reporte de rendimiento por subtema |

---

## Estructura de carpetas

```
cepDM/
├── app/
│   ├── (auth)/login/          # Login + registro
│   ├── (app)/                 # Rutas protegidas
│   │   ├── layout.tsx         # Check de auth + HUD layout
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── courses/           # Lista y detalle de cursos
│   │   │   └── [courseSlug]/  # Árbol de unidades/subtemas
│   │   ├── topics/
│   │   │   └── [topicId]/practice/  # Sesión de práctica
│   │   └── reports/           # Reportes de rendimiento
│   ├── globals.css            # TailwindCSS + custom classes HUD
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   └── hud/
│       ├── HudLayout.tsx      # Wrapper con fondo y transiciones
│       ├── Navbar.tsx         # Barra de navegación HUD
│       └── HudPanel.tsx       # Panel angular reutilizable
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Cliente browser (createBrowserClient)
│   │   └── server.ts          # Cliente servidor (createServerClient)
│   ├── types.ts               # Tipos TypeScript compartidos
│   └── utils.ts               # cn(), formatTime(), colores por curso
├── supabase/
│   ├── schema.sql             # DDL + RLS + trigger mastery
│   └── seed.sql               # Datos iniciales (cursos, preguntas)
├── middleware.ts              # Protección de rutas /app/*
├── tailwind.config.ts         # Palette Valorant: valo.*
├── next.config.ts
└── .env.local.example
```

---

## Modelo de base de datos

```
courses ──< units ──< topics ──< questions
                                     │
                               attempts (user_id, question_id, selected_option, is_correct, time_ms)
                                     │
                           trigger → mastery (user_id, topic_id, mastery_score)
```

**mastery_score** se recalcula automáticamente con el trigger `recalc_mastery` en cada insert de `attempts`.
Algoritmo: promedio de aciertos sobre los últimos 20 intentos del usuario por topic.

---

## Siguiente iteración (v2)

- Añadir más preguntas por subtema desde solucionario oficial
- Modo examen simulado (tiempo total, mezcla de cursos)
- Tutor con explicaciones enriquecidas (LaTeX para álgebra)
- Leaderboard opcional
- Notifications de racha diaria

---

## Dependencias clave

| Paquete | Uso |
|---------|-----|
| `next@14` | App Router, Server Components |
| `@supabase/ssr` | Auth + DB con cookies |
| `framer-motion` | Animaciones de página, progreso, feedback |
| `tailwindcss` | Paleta HUD `valo.*` |
| `@radix-ui/*` | Primitivos accesibles (dropdowns, tooltips, etc.) |
| `lucide-react` | Iconografía |
