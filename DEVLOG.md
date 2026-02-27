# CEPREVAL PREP — Devlog

App de preparación para el examen de admisión UNHEVAL/CEPREVAL con UI estilo Valorant HUD.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (strict) |
| Base de datos | Supabase (PostgreSQL + Auth) |
| Estilos | TailwindCSS 3 con tema HUD personalizado |
| Animaciones | Framer Motion 11 |
| UI Primitives | Radix UI (accordion, dialog, dropdown, progress, tabs, toast) |
| Iconos | Lucide React |
| Deploy | Vercel (recomendado) |

---

## Qué se construyó

### 1. Landing page (`/`)

Página pública con:
- Hero con animaciones Framer Motion (fade-in, slide-up)
- Vista previa de los 3 cursos disponibles
- Sección de features del sistema
- CTA para registro/login
- Sin datos de Supabase — completamente estática

---

### 2. Autenticación (`/auth/login`)

- Login y registro en un solo formulario con tabs
- Email + contraseña via Supabase Auth
- Al autenticarse, redirige a `/app/dashboard`
- Middleware protege todas las rutas `/app/*` — usuarios no autenticados son redirigidos a login automáticamente

**Middleware (`middleware.ts`):**
- Revisa sesión en cada request a `/app/*`
- Si no hay sesión → redirect a `/auth/login`
- Si hay sesión en `/auth/*` → redirect a `/app/dashboard`

---

### 3. Dashboard (`/app/dashboard`)

Stats generales del usuario:
- Total de intentos
- Precisión global (% correctas)
- Mastery promedio (0–100%)
- Temas dominados (mastery ≥ 80%)
- Acceso rápido a los 3 cursos
- Últimas 10 preguntas respondidas (actividad reciente)

---

### 4. Cursos (`/app/courses`)

Vista de tarjetas con todos los cursos disponibles:
- Álgebra
- Aptitud Verbal
- Inglés

Cada tarjeta muestra el progreso del usuario en ese curso (% de preguntas correctas basado en todos sus intentos).

---

### 5. Detalle de curso (`/app/courses/[courseSlug]`)

Árbol jerárquico: **Curso → Unidades → Temas**

Para cada tema muestra:
- Mastery score (0–100%) con color según nivel
- Cantidad de preguntas disponibles
- Botón para ir a practicar
- Primer unidad expandida por defecto

**Niveles de mastery:**
| Score | Label | Color |
|-------|-------|-------|
| ≥ 80% | DOMINADO | Verde |
| ≥ 60% | AVANZADO | Dorado |
| ≥ 30% | EN PROGRESO | Cyan |
| > 0% | INICIADO | Muted |
| 0% | SIN INTENTOS | Gris |

---

### 6. Práctica (`/app/topics/[topicId]/practice`)

Sesión de preguntas de opción múltiple completa:
- Preguntas mezcladas aleatoriamente al cargar
- 5 opciones (A–E) por pregunta
- Timer por pregunta (visible en UI)
- Al seleccionar muestra: correcto/incorrecto + explicación
- Al terminar todas las preguntas:
  - Resumen de sesión (correctas, tiempo promedio, nueva mastery)
  - Botón para reiniciar con nuevas preguntas mezcladas
- Guarda cada intento en Supabase → trigger recalcula mastery automáticamente

---

### 7. Reportes (`/app/reports`)

Analítica de rendimiento del usuario:
- Stats globales (total intentos, precisión, tiempo promedio, temas dominados)
- Filtro por curso
- Tabla por tema con: precisión, intentos, tiempo promedio, mastery score
- Ordenable por columna

---

## Diseño UI — Valorant HUD Theme

### Paleta de colores

```
valo.bg:       #0a0e14  — fondo principal
valo.surface:  #0f1923  — superficies
valo.panel:    #131b24  — paneles
valo.accent:   #00d4ff  — cyan (color primario)
valo.red:      #ff4655  — errores, incorrecto
valo.green:    #39d264  — éxito, correcto
valo.gold:     #f5a623  — advertencia, progreso medio
valo.text:     #ecf0f5  — texto principal
valo.muted:    #7b8fa8  — texto secundario
```

### Componentes HUD

**`HudLayout`** — Wrapper global de todas las páginas protegidas:
- Fondo con grid de puntos (background pattern CSS)
- Gradiente radial tipo "hero glow"
- Transiciones de página con Framer Motion (pageTransition)
- Incluye `<Navbar>`

**`Navbar`** — Barra de navegación superior:
- Logo CEPREVAL con icono de escudo
- Links: Dashboard / Cursos / Reportes
- Indicador de link activo (borde cyan inferior)
- Avatar + botón logout (dropdown)

**`HudPanel`** — Panel reutilizable:
- Bordes angulares con `clipPath` estilo HUD
- Variantes de color (accent, red, green, gold)
- Efecto glow en hover/focus

### Efectos visuales
- `glow-accent`, `glow-red`, `glow-green`, `glow-gold` — sombras luminosas
- `animate-pulse-glow` — pulsación suave en elementos activos
- `animate-flicker` — parpadeo para efectos de "pantalla"
- Scrollbar personalizado (color y tamaño reducido)

---

## Base de datos (Supabase)

### Esquema

```sql
courses       -- Cursos (id, name, slug, order, icon)
units         -- Unidades de cada curso (course_id, name, slug, order)
topics        -- Temas de cada unidad (unit_id, name, slug, order)
questions     -- Preguntas MCQ (topic_id, course_id, prompt_text, options_json,
               --   correct_option, explanation_json, difficulty)
attempts      -- Intentos del usuario (user_id, question_id, selected_option,
               --   is_correct, time_ms, created_at)
mastery       -- Mastery por tema (user_id, topic_id, mastery_score)
```

### Seguridad (Row Level Security)

- `courses`, `units`, `topics`, `questions` — lectura pública
- `attempts` — el usuario solo lee/escribe sus propios intentos
- `mastery` — el usuario solo lee/escribe su propio mastery

### Trigger automático

```sql
-- Después de cada insert en attempts:
-- recalcula mastery_score = promedio de correctness de los últimos 20 intentos
-- para ese (user_id, topic_id) específico
CREATE TRIGGER recalc_mastery
AFTER INSERT ON attempts
...
```

---

## Arquitectura — Refactor de rendimiento

### Problema original (Server Components)

```
Usuario navega → Next.js server → Supabase (us-east-1) → Next.js → Browser
```
- Cada navegación: 3–6 segundos
- Doble salto de red en cada página
- El servidor de Next.js hacía queries a Supabase en cada request

### Solución implementada (Client Components)

```
Usuario navega → Shell estático (instantáneo) → Browser → Supabase
```

**Qué cambió:**
- Todos los `page.tsx` de `/app/*` pasaron a ser re-exports simples:
  ```tsx
  export { default } from "./DashboardClient";
  ```
- Todos los Client Components ahora se auto-fetchean con `useEffect`:
  ```tsx
  export default function DashboardClient() {
    const [data, setData] = useState(null);
    useEffect(() => {
      createClient().from("courses").select("*").then(setData);
    }, []);
    if (!data) return <Skeleton />;
    // render
  }
  ```
- `CourseDetailClient` y `PracticeSessionClient` usan `useParams()` para leer parámetros de ruta

**Resultado:**
```
○ /app/courses    → ESTÁTICO (shell pre-renderizado)
○ /app/dashboard  → ESTÁTICO
○ /app/reports    → ESTÁTICO
ƒ /app/courses/[courseSlug]       → Dinámico (ruta con parámetro)
ƒ /app/topics/[topicId]/practice  → Dinámico (ruta con parámetro)
```

- Navegación **instantánea** — el layout ya está cacheado en el browser
- Skeleton aparece **inmediatamente** sin esperar al servidor
- Data llega en ~200–400ms directo de Supabase
- `middleware.ts` sigue protegiendo las rutas (auth no se saltó)

---

## Estructura de archivos

```
D:\cepDM\
├── app/
│   ├── layout.tsx                    # Root layout (fonts, metadata)
│   ├── page.tsx                      # Landing page (pública)
│   ├── globals.css                   # Tailwind + estilos base + scrollbar
│   ├── app/                          # Rutas protegidas
│   │   ├── layout.tsx                # Solo renderiza <HudLayout>
│   │   ├── loading.tsx               # Skeleton raíz
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # re-export
│   │   │   ├── DashboardClient.tsx   # stats, cursos, actividad reciente
│   │   │   └── loading.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx              # re-export
│   │   │   ├── CoursesClient.tsx     # tarjetas de cursos
│   │   │   ├── loading.tsx
│   │   │   └── [courseSlug]/
│   │   │       ├── page.tsx          # re-export
│   │   │       ├── CourseDetailClient.tsx  # árbol unidades/temas + mastery
│   │   │       └── loading.tsx
│   │   ├── topics/
│   │   │   └── [topicId]/practice/
│   │   │       ├── page.tsx          # re-export
│   │   │       ├── PracticeSessionClient.tsx  # sesión MCQ completa
│   │   │       └── loading.tsx
│   │   └── reports/
│   │       ├── page.tsx              # re-export
│   │       ├── ReportsClient.tsx     # analítica por tema
│   │       └── loading.tsx
│   └── auth/login/
│       └── page.tsx                  # login + registro
│
├── components/
│   └── hud/
│       ├── HudLayout.tsx             # wrapper con grid BG + animaciones
│       ├── Navbar.tsx                # barra de navegación
│       └── HudPanel.tsx             # panel con bordes angulares
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # createBrowserClient (client components)
│   │   └── server.ts                 # createServerClient (middleware/server)
│   ├── types.ts                      # interfaces TypeScript
│   └── utils.ts                      # cn(), formatTime(), masteryColor(), etc.
│
├── supabase/
│   ├── schema.sql                    # DDL completo + RLS + trigger
│   └── seed.sql                      # 3 cursos + unidades + temas + 30 preguntas
│
├── middleware.ts                     # protección de rutas /app/*
├── tailwind.config.ts                # tema Valorant personalizado
├── next.config.ts
├── .env.local.example
└── README.md
```

---

## Setup inicial

1. Clonar repositorio
2. ```bash
   npm install
   ```
3. Crear proyecto en [supabase.com](https://supabase.com)
4. Copiar `.env.local.example` → `.env.local` y llenar:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. En el SQL Editor de Supabase, ejecutar en orden:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
6. En Supabase → Authentication → Providers: habilitar **Email**
7. ```bash
   npm run dev
   ```

---

## Deploy a Vercel

1. Subir código a GitHub (repositorio privado recomendado)
2. Entrar a [vercel.com](https://vercel.com) → New Project → importar repo
3. En **Environment Variables** agregar:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
4. Deploy → Vercel detecta Next.js automáticamente, zero config
5. Agregar el dominio de Vercel en Supabase → Authentication → URL Configuration → Site URL

---

## Datos actuales

- **3 cursos**: Álgebra, Aptitud Verbal, Inglés
- **~30 preguntas** de muestra (seed.sql)
- Las preguntas reales del banco CEPREVAL se agregan en la tabla `questions` via Supabase Dashboard o scripts SQL

---

## Próximos pasos posibles

- [ ] Poblar banco de preguntas completo desde clave de respuestas oficial
- [ ] Modo examen simulacro (tiempo fijo, preguntas mixtas de todos los cursos)
- [ ] Soporte LaTeX para preguntas de álgebra (`react-katex` o `mathjax`)
- [ ] Sistema de rachas (días consecutivos de práctica)
- [ ] Migrar Supabase a región São Paulo para reducir latencia desde Perú
