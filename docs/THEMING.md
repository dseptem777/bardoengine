# 🎨 Guía Maestra de Tematización (BardoEngine)

BardoEngine ahora soporta un sistema de tematización dinámica basada en datos. Cada juego puede definir su propia "piel" modificando el campo `theme` en su respectivo archivo `{storyId}.config.json`.

---

## 🛠️ Esquema del Objeto `theme`

Este es el objeto completo que podés incluir en tu configuración:

```json
{
  "theme": {
    "primaryColor": "#facc15",  // Color de acento (glows, botones, bordes activos)
    "bgColor": "#0a0a0a",       // Color de fondo principal
    "textColor": "#ffffff",     // Color del texto narrativo
    "typography": {
      "mainFont": "Inter, sans-serif",   // Fuente para el cuerpo del texto
      "headerFont": "Orbitron, sans-serif", // Fuente para títulos (H1-H6)
      "googleFonts": ["Inter", "Orbitron"] // Fuentes a cargar desde Google Fonts
    },
    "layout": {
      "statsPosition": { "top": 14, "left": 4 },     // Posición HP/Stats (en unidades rem)
      "inventoryPosition": { "top": 14, "right": 4 }, // Posición Inventario (en unidades rem)
      "playerMaxWidth": "800px",                     // Ancho máximo del contenedor de texto
      "textAlignment": "left"                        // Alineación: "left", "center", "right", "justify"
    },
    "uiStyle": {
      "borderRadius": "12px", // Redondeado de bordes (botones, paneles)
      "borderWidth": "2px"    // Grosor de bordes
    }
  }
}
```

---

## 🔗 Variables CSS Inyectadas

El motor traduce automáticamente la configuración a las siguientes variables CSS globales en `:root`:

| Variable | Descripción |
| :--- | :--- |
| `--bardo-accent` | Controla colores de resaltado y efectos de brillo (glow). |
| `--bardo-bg` | Color de fondo de la aplicación. |
| `--bardo-text` | Color principal del texto. |
| `--bardo-font-main` | Fuente aplicada al `body`. |
| `--bardo-font-header` | Fuente aplicada a los encabezamientos. |
| `--stats-top/left` | Coordenadas del panel de estadísticas. |
| `--inventory-top/right` | Coordenadas del panel de inventario. |
| `--player-max-width` | El ancho máximo del área de lectura. |
| `--player-text-align` | Cómo se justifica el bloque de texto. |
| `--ui-border-radius` | Consistencia estética en botones y paneles. |

---

## ✨ Características Especiales

### 1. Carga Dinámica de Fuentes
Si agregás nombres de fuentes en `googleFonts`, el motor inyectará automáticamente un `<link>` a Google Fonts al cargar el juego. No necesitás importar nada en el CSS manualmente.

### 2. Transiciones Fluidas (Phase B.75)
Al cambiar de un juego a otro (por ejemplo, de *Serruchín* a *Apnea*), los colores y fuentes no saltan bruscamente. Hay una transición de **0.5s** para una experiencia premium.

### 3. Prevención de Flicker
El motor bloquea el renderizado (muestra una pantalla negra de carga) hasta que las variables CSS están correctamente aplicadas. Esto evita ver el tema "default" por una fracción de segundo.

### 4. Modo Fallback (Phase B.8)
Si un juego no tiene definido el objeto `theme`, el motor utiliza automáticamente los valores por defecto (Amarillo Bardo / Negro) sin romperse ni quedarse trabado.

---

## 🚀 Ejemplos de Uso

### 🩸 Estética Horror (*Serruchín*)
- **Fuentes**: "Creepster" (Google Fonts).
- **Colores**: Fondo Negro, Acento Rojo Sangre.
- **UI**: Bordes cuadrados (`0px`) para una sensación de rigidez y peligro.

### 🛰️ Estética Sci-Fi (*Centinelas*)
- **Fuentes**: "Orbitron" y "JetBrains Mono".
- **Colores**: Fondo Azul Oscuro Profundo, Acento Púrpura Real.
- **Layout**: Texto centrado y paneles con gran radio de borde (`20px`) para una estética "futurista/glass".
