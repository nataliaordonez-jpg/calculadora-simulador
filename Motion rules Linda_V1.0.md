# Motion Rules — Linda

Animaciones exclusivas del producto Linda.
Estas reglas definen cómo se comporta el motion dentro de la experiencia.
Cursor debe seguir esta estructura y reglas exactamente.

---

## Estructura base de las animaciones

Cada animación DEBE documentarse con:

1. Nombre de la animación
2. Momento de la experiencia
3. Componentes compatibles
4. Interacción
5. Tipo
6. Dirección
7. Colores
8. Propiedades de animación
9. Keyframes
10. Reglas de uso

Cada animación corresponde a un momento narrativo

## Momentos narrativos de Linda

Los momentos narrativos definen CUÁNDO Linda existe en la interfaz.
Solo aplican cuando hay una acción de IA o una manifestación sutil de Linda.

Cada animación pertenece a UN solo momento narrativo.
No se permiten cruces entre momentos.

### 1. Acción
Inicio de una acción de IA activada por el usuario.

### 2. Proceso o carga
IA en ejecución, el resultado aún no está disponible.

### 3. Resultado
La IA finaliza y entrega un output visible.

### 4. Sugerencia o manifestacion proactiva
Linda propone acciones o insights o da información de forma proactiva.
Linda tiene manifestaciones sutiles en un momento determinado o cuando el usuario interactua con esa sugerencia.
---

#### **Qué comunica esta animación**
Que el usuario esta interactuando con el componente de sugerencia

Que se está iniciando una capacidad de IA

Que la acción no es genérica del sistema, sino propia de Linda

-
#### **Reglas de uso**
Las animaciones solo se usan en relación a manifestaciones de linda

No se usa en acciones genéricas del sistema

No se modifica la animación base

---

### Animación: HOVER — Gradient Motion

#### Momento de la experiencia
- Acción

#### Componentes compatibles
- Button
  - Light
  - Fill
  - Flat

#### Interacción
- Hover (pasar el cursor sobre el componente)

#### Tipo
- linear-gradient

#### Dirección
- 90deg (izquierda a derecha)

#### Colores
- opcion 1 en 0%
- #opción 2 en 50%
- #opcion 1 en 100%

#### Background size
- 200% 100%

#### Propiedades de animación
- Nombre: gradient-shift
- Duración: 3s
- Timing function: linear
- Iteraciones: infinite

### Animación: CLICK — Gradient Motion (Fast)

#### Momento de la experiencia
- Acción

#### Componentes compatibles
- Button
  - Light
  - Fill

#### Interacción
- Click / Active (cuando el usuario hace click en el componente)

#### Tipo
- linear-gradient

#### Dirección
- 90deg (izquierda a derecha)

#### Colores
- #opción 1 en 0%
- #opción 2 en 50%
- #opción 1 en 100%

#### Background size
- 200% 100%

#### Propiedades de animación
- Nombre: gradient-shift
- Duración: 0.6s
- Timing function: linear
- Iteraciones: infinite (solo durante el click)
- Duración del estado: 600ms antes de ejecutar la acción

### Animación: HOVER o LOADING - border-line-reveal

#### Momento de la experiencia
- Proceso o carga

#### Componentes compatibles
- **Botones**
  - fill
  - bordered

#### Interacción
- Hover (cuando el usuario pasa el mouse por el componente)
-Loading (cuando Linda está procesando una consulta)

#### Tipo
- Scale reveal (transform: scale)
- Animación secuencial con delays
- Fade out (opacity)

#### Dirección
- Líneas horizontales: se expanden desde los extremos (izquierda / derecha según transform-origin)

Líneas verticales: se expanden desde arriba o abajo según transform-origin

#### Colores
Fondo base: transparent
Líneas: white
Borde base: color 1
Fondo en hover: color 2

#### Background size
- no aplica

#### Propiedades de animación
- Nombre: border-line-reveal
- Duración: 1s
- Timing function: ease (por defecto)
- Delays:
Primer grupo (líneas verticales): 0.5s
Segundo grupo (líneas horizontales completas): 0.9s
Estado inicial:
transform: scale(0)
opacity: 1

### Animación: HOVER - border-slide-down

#### Momento de la experiencia
- Sugerencia o manifestacion proactiva

#### Componentes compatibles
- Cards
  - Bordes de las cards

#### Interacción
- Hover (cuando el usuario pasa el mouse por el componente)

#### Tipo
- Sliding Gradient

#### Dirección
- 180deg = dirección vertical hacia abajo

#### Colores
- #opción 1 en 0%
- #opción 2 en 50%
- #opción 1 en 100%

#### Background size
- 200% 100%

#### Propiedades de animación
- Nombre: border-slide-down
- Duración: 5s
- Timing function: linear
- Iteraciones: infinite (solo durante el hover)
- Duración del estado: 300ms (fade in/out de opacity al entrar/salir del hover)

### Animación: HOVER cursor-spotlight

#### Momento de la experiencia
- Sugerencia o manifestacion proactiva

#### Componentes compatibles
- Cards

#### Interacción
- Hover (cuando el usuario pasa el mouse por el componente)

#### Tipo
- Gradiente radial interactivo que sigue el cursor

#### Dirección
- tiene dirección radial omnidireccional (desde el centro hacia afuera en todas direcciones)

#### Colores
- #opción 1 en 0%
- #opción 2 en 50%
- #opción 1 en 100%

#### Tamaño del gradiente: 200px de radio (circle)

#### Propiedades de animación
- Nombre: border-slide-down
- Duración: 5s
- Timing function: ease (por defecto en transition-opacity)
- Iteraciones: continuo mientras el cursor se mueva dentro de la card
- Duración del estado: 300ms (fade in al entrar hover, fade out al salir)

