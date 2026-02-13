**# 1. Tipografía** 

**## Fuentes** 

**Font principal: Inter** ([Google Fonts](https://fonts.google.com/specimen/Inter)) Títulos, Cuerpo

**Secundaria: Merriweather** ([Google Fonts]()) Resaltar de texto o palabras IA

**## Escala Tipográfica** 
**H1** — 32px (2rem) · Bold (700) · 120% Títulos de página principales (ej. "Dashboard") **H2** — 24px (1.5rem) · SemiBold (600) · 130% Títulos de sección (ej. "Resumen de Ventas") 
**H3** — 20px (1.25rem) · Medium (500) · 140% Títulos de tarjeta (ej. "Últimos Leads") **Body** — 16px (1rem) · Regular (400) · 150% Texto general, párrafos de lectura **Small** — 14px (0.875rem) · Regular (400) · 150% Metadatos, fechas, pie de foto **Button** — 14px (0.875rem) · SemiBold (600) · 100% Texto dentro de botones (siempre mayúscula inicial)

**## 2.Colores**

**Primary base:**
- 400 → #60A5FA

**### Escala Tonal **
- 100 → [#DFEDFE]
- 200 → [#B0D2FC]
- 300 → [#88BCFB]
- 400 → #60A5FA (Base)
- 500 → [#5694E1]
- 600 → [#487CBB]
- 700 → [#355B8A]

Uso:
- Botones primarios
- Enlaces principales
- Acciones clave
- Elementos protagonistas

Reglas:
- Solo existe un Primary dominante.
- Todas las variaciones deben derivar del 500.

---

**## 2. Secondary **

Secondary base:
- 400→ #34D399

**### Escala Tonal **
- 100 → [#D6F6EB]
- 200 → [#9AE9CC]
- 300 → [#67DEB2]
- 400 → #34D399 (Base)
- 500 → [#2FBE8A]
- 600 → [#279E73]
- 700 → [#1D7454]

Uso:
- Acciones secundarias
- Elementos complementarios
- Componentes activos no críticos

Reglas:
- No debe competir visualmente con el Primary.
- No reemplaza al Primary en CTAs principales.

---

**## 3. Colores Estructurales**

Estos colores sostienen la interfaz y no compiten con Primary ni Secondary.

**### Base Oscura**
- #0A2540  
Uso: fondos profundos, secciones dark, texto fuerte.

**### Superficie Profunda**
- #355452  
Uso: tarjetas oscuras, contenedores, bloques secundarios.

**### Teal Neutro**
- #75C9C8  
Uso: elementos de apoyo, fondos intermedios, divisores suaves.

---

**## 4. Fondos y Superficies Suaves**

Colores ligeros para respiración visual y jerarquía.

**### Cian Claro**
- #67E8F9  
Uso: fondos destacados suaves.

**### Aqua Muy Suave**
- #CCFBF1  
Uso: backgrounds amplios, tarjetas claras.

**### Amarillo Suave**
- #FEF3C7  
Uso: fondos cálidos ligeros.

---

**## 5. Accent (Énfasis Controlado)**

- #FAD19E  

Uso:
- Badges
- Highlights
- Micro detalles
- Indicadores sutiles

Reglas:
- Uso limitado.
- No utilizar en grandes superficies.
- No competir con Primary ni Secondary.

---

**## Reglas Generales del Sistema**

- Existe 1 Primary dominante.
- Existe 1 Secondary complementario.
- Accent es de uso controlado.
- Los colores estructurales no deben utilizarse como botones principales.
- Los colores semánticos (success, warning, error, info) se definen en una paleta independiente.
- Mantener coherencia jerárquica y consistencia visual en todos los componentes

**## 3. Iconografía** - **Librería:** [Solar Icon Set](https://icones.js.org/collection/solar) - **Variantes disponibles:** - Outline (Lineal) - variante principal - Bold Duotone - variante alternativa - **Estilo principal:** Outline (Lineal) - **Grosor de trazo (Stroke):** 1.5px - **Radio de esquina (Corner Radius):** Rounded (Redondeado). Evita esquinas rectas agresivas - **Grid base:** 24×24px - **Color por defecto:** - `#64748B` (Slate 500) para estados inactivos - `#131313` (Onyx) para estados activos

**## 4. Layout y estructura**

**### 4.1 Grid**

Todas las medidas de espacio y tamaño deben ser múltiplos de **8** (o **4** para detalles finos).

**Escala de Espaciado (Spacing Tokens):**
- **4px (xs):** Espacio mínimo entre icono y texto.
- **8px (sm):** Separación interna en botones.
- **16px (md):** Separación estándar entre elementos de una tarjeta.
- **24px (lg):** Separación entre tarjetas.
- **32px (xl):** Separación entre secciones internas.
- **48px (2xl):** Separación de secciones mayores.

**Grid de Columnas (Desktop – 1440px):**
- **Columnas:** 12 (estándar flexible)
- **Gutter (calle):** 24px
- **Margin (lateral):** 48px
- **Max-width contenedor:** 1152px (centrado)

---

**### 4.2 Espaciado**

**Unidad base:**
- **Max-width:** 1152px (`max-w-6xl`)
- **Padding horizontal:**  
  - 24px (móvil)  
  - 48px (desktop)
- **Padding vertical estándar:** 96px (`py-24`)
- **Hero:** Min-height = viewport − navbar (124px)

**Escala de espaciado:**
- 4, 8, 16, 24, 32
**
# Componentes Base**

---

**## Botones**

**### Forma**
- Full Rounded

**### Estructura**
- Contenedor
- Texto
- Icono (opcional)

**### Tamaños**
- Small
- Medium
- Large

**### Estados**
- Default
- Hover
- Active / Pressed
- Disabled
- Loading

**### Tipos**
- Primary
- Secondary
- Tertiary
- Ghost / Text

---

**## Cards**

**### Forma**
- Rounded

**### Estructura**
- Contenedor
- Header (opcional)
- Body
- Footer (opcional)

**### Tipos**
- Informativa
- Interactiva
- Acción
- Resumen / Métricas

**### Estados**
- Default
- Hover
- Selected
- Disabled


