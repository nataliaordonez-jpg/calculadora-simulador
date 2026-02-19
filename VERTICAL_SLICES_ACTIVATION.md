# Vertical Slices UI - Activación Automática en Cursor

Este documento explica cómo las Cursor Rules están configuradas para que **todas las nuevas funcionalidades automáticamente sigan Vertical Slices UI**.

## 🎯 Estado Actual: COMPLETAMENTE ACTIVADO

Las reglas de Vertical Slices UI están **100% operativas** y se aplicarán automáticamente cuando los desarrolladores trabajen en el código.

## 📋 Archivos de Reglas Configurados

### 1. `architecture.mdc` - **SIEMPRE ACTIVO** ⚡

**Ubicación:** `.cursor/rules/rapid_development/architecture.mdc`

**Configuración:**
```yaml
alwaysApply: true
globs: ["src/**/*.ts", "src/**/*.tsx"]
```

**Qué hace:**
- ✅ Se aplica **automáticamente** a TODOS los archivos TypeScript/TSX
- ✅ Contiene las reglas de Arquitectura Hexagonal completas
- ✅ Incluye sección 2.4: "Vertical Slices UI" con estructura completa
- ✅ Incluye sección 2.5: "Migración de UI Plana a Vertical Slices"
- ✅ Incluye referencias a `social-networks` como ejemplo

**Contenido clave:**
- Estructura de directorios de Vertical Slices
- Principios fundamentales (cohesión, independencia, shared explícito)
- Cuándo crear un nuevo slice
- Cuándo usar `_shared/`
- Convenciones de nombres
- Patrones de importación/exportación
- Guía de migración paso a paso

### 2. `vertical_slices_ui_guidelines.mdc` - **ACTIVACIÓN CONTEXTUAL** 🎨

**Ubicación:** `.cursor/rules/rapid_development/vertical_slices_ui_guidelines.mdc`

**Configuración:**
```yaml
alwaysApply: false
globs: ["src/**/ui/**/*.ts", "src/**/ui/**/*.tsx"]
triggerPatterns: [
  "vertical slice",
  "vertical slicing",
  "ui structure",
  "ui organization",
  "organize ui",
  "refactor ui",
  "slice",
  "crear slice",
  "nuevo slice",
  "new slice",
  "components organization",
  "feature ui",
  "ui architecture"
]
```

**Qué hace:**
- ✅ Se activa cuando se trabaja en archivos dentro de `ui/`
- ✅ Se activa cuando se mencionan palabras clave relacionadas con UI
- ✅ Proporciona guías detalladas y ejemplos extensos

**Contenido clave:**
- Comparación detallada: Tradicional vs Vertical Slices
- Casos de uso específicos con ejemplos reales
- Framework de decisiones de diseño
- Patrones comunes (4 patrones documentados)
- Anti-patrones a evitar (4 anti-patrones documentados)
- Guía de migración completa (7 pasos)
- Estrategias de testing
- FAQs y mejores prácticas

## 🚀 Cómo Funcionan las Reglas Automáticamente

### Escenario 1: Creando una Nueva Feature

**El desarrollador hace:**
```typescript
// 1. Crea nueva carpeta
mkdir src/analytics

// 2. Empieza a crear la estructura UI
mkdir src/analytics/ui
```

**Cursor automáticamente:**
1. ✅ Lee `architecture.mdc` (porque `alwaysApply: true`)
2. ✅ Sugiere estructura de Vertical Slices UI
3. ✅ Muestra ejemplos de `social-networks`
4. ✅ Recomienda crear `_shared/`, slices, y `pages/`

### Escenario 2: Creando Componentes UI

**El desarrollador hace:**
```typescript
// Empieza a trabajar en src/analytics/ui/
touch src/analytics/ui/components/chart.tsx
```

**Cursor automáticamente:**
1. ✅ Lee `architecture.mdc` (siempre activo)
2. ✅ Lee `vertical_slices_ui_guidelines.mdc` (porque está en `ui/`)
3. ✅ Sugiere: "¿Este componente pertenece a un slice específico?"
4. ✅ Recomienda: "Si se usa en múltiples slices, considerar `_shared/`"

### Escenario 3: Usuario Pregunta sobre UI

**El desarrollador pregunta:**
> "¿Cómo organizo los componentes de mi nueva feature?"

**Cursor automáticamente:**
1. ✅ Detecta palabras clave: "organizo", "componentes", "feature"
2. ✅ Activa `vertical_slices_ui_guidelines.mdc`
3. ✅ Proporciona guía completa de Vertical Slices UI
4. ✅ Muestra ejemplos de `social-networks`
5. ✅ Sugiere estructura específica basada en el contexto

### Escenario 4: Refactorizando UI Existente

**El desarrollador pregunta:**
> "Quiero refactorizar la UI de clients/"

**Cursor automáticamente:**
1. ✅ Detecta palabra clave: "refactorizar", "UI"
2. ✅ Activa ambos archivos de reglas
3. ✅ Proporciona guía de migración paso a paso (Sección 2.5)
4. ✅ Muestra cómo `social-networks` fue migrado
5. ✅ Sugiere comandos específicos para mover archivos

## 📊 Cobertura de las Reglas

### Alcance de `architecture.mdc`

```
✅ src/**/*.ts        - Todos los archivos TypeScript
✅ src/**/*.tsx       - Todos los archivos TSX (React)
✅ Cualquier feature  - Login, users, analytics, etc.
✅ Cualquier capa     - domain, application, infrastructure, ui
```

**Cuándo se aplica:** SIEMPRE (alwaysApply: true)

### Alcance de `vertical_slices_ui_guidelines.mdc`

```
✅ src/**/ui/**/*.ts   - Archivos TS dentro de ui/
✅ src/**/ui/**/*.tsx  - Archivos TSX dentro de ui/
✅ Cuando se mencionan keywords relacionados con UI/slices
```

**Cuándo se aplica:** Contextualmente (archivos en ui/ o keywords)

## 🎓 Ejemplo Simplificado

Cuando creas una nueva feature, Cursor automáticamente sugiere la estructura de Vertical Slices. Ver ejemplos detallados en `vertical_slices_ui_guidelines.mdc`.

## ✅ Verificación Rápida

Pregunta a Cursor: *"¿Cómo organizo la UI de mi feature?"*  
**Debe mencionar:** Vertical Slices UI y mostrar ejemplo de social-networks.

## 📚 Referencias

- **Implementación:** `src/social-networks/ui/`
- **Guías completas:** Ver archivos `.mdc` en este directorio

## 🎉 Resumen

### ✅ Las Reglas Están ACTIVAS y FUNCIONANDO

1. **`architecture.mdc`** - SIEMPRE activo para todos los archivos TS/TSX
2. **`vertical_slices_ui_guidelines.mdc`** - Activo para archivos UI y keywords
3. **Ejemplo de referencia** - `social-networks` completamente documentado
4. **Activación automática** - Sin necesidad de configuración adicional

### 🚀 Próximos Pasos para el Equipo

1. **Familiarizarse** con `src/social-networks/ui/` como ejemplo
2. **Aplicar** a nuevas features automáticamente (Cursor ayudará)
3. **Migrar** features existentes usando las guías
4. **Compartir** experiencias y mejoras

---

**Fecha de activación:** Diciembre 2024
**Estado:** ✅ PRODUCTIVO
**Próxima revisión:** Enero 2025

