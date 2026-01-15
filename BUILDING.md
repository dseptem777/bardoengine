# 🎮 BardoEngine - Guía de Build para Desarrolladores

Esta guía explica cómo crear builds standalone de juegos usando BardoEngine.

---

## 📁 Estructura del Proyecto

```
bardoengine/
├── src/
│   ├── stories/              # Historias y configs por juego
│   │   ├── serruchin.json          # Historia compilada
│   │   ├── serruchin.config.json   # ⭐ Config del juego
│   │   ├── partuza.json
│   │   └── partuza.config.json
│   ├── config/
│   │   └── loadGameConfig.js       # Loader de configs
│   └── story-config.json     # Config generado en build (no editar)
├── scripts/
│   ├── build-game.cjs        # Script interactivo de build
│   └── encrypt-story.cjs     # Encripta historias para producción
├── src-tauri/
│   ├── tauri.conf.json       # Config de Tauri (auto-generado en build)
│   └── target/release/bundle/nsis/  # 📦 Instaladores generados
└── public/
    ├── sounds/               # Efectos de sonido
    └── music/                # Música de fondo
```

---

## ⚙️ Configuración de Juegos

### Archivo: `src/stories/{storyId}.config.json`

Cada juego tiene su propio archivo de configuración JSON:

```json
{
  "title": "Serruchín",
  "version": "1.0.0",
  "stats": {
    "enabled": true,
    "definitions": [...],
    "onZero": {...}
  },
  "inventory": {
    "enabled": true,
    "maxSlots": 5,
    "categories": ["herramientas", "trofeos"]
  },
  "items": {
    "serruchin": { "name": "Serrucho", "icon": "🪚", ... }
  }
}
```

### Campos de Build

| Campo | Descripción | Usado en |
|-------|-------------|----------|
| `title` | Nombre del juego | Instalador, ventana, tauri.conf.json |
| `version` | Versión semver | Instalador, info del .exe |
| `stats` | Definición de estadísticas | Sistema de stats in-game |
| `inventory` | Config de inventario | Sistema de inventario in-game |
| `items` | Definición de items | Inventario, descripción de objetos |

---

## 🔨 Proceso de Build

### Comando

```powershell
npm run build-game
```

### Qué hace el script:

1. **Lista historias disponibles** con su versión y título
2. **Te pide elegir** cuál empaquetar
3. **Actualiza `tauri.conf.json`** con el title/version del gameConfig
4. **Encripta la historia** (protección del contenido)
5. **Compila Tauri** → genera instalador NSIS

### Output

El instalador queda en:
```
src-tauri/target/release/bundle/nsis/
```

Archivo: `{GameTitle}_{version}_x64-setup.exe`

---

## 📝 Checklist Pre-Build

Antes de hacer un build de producción:

- [ ] Actualizar `version` en `gameConfig.js`
- [ ] Verificar `title` correcto
- [ ] Tener todos los assets (sonidos, música) en `public/`
- [ ] Probar el juego en dev mode (`npm run dev`)
- [ ] Commitear todos los cambios

---

## 🔢 Versionado

Usamos **Semantic Versioning** (semver):

```
MAJOR.MINOR.PATCH
  │     │     └── Bugfixes
  │     └──────── Nuevas features (backwards compatible)
  └────────────── Breaking changes / releases mayores
```

Ejemplos:
- `0.1.0` → Alpha/Beta
- `1.0.0` → Primera release pública
- `1.1.0` → Nuevo contenido agregado
- `1.1.1` → Bugfix

---

## 🎵 Assets de Audio

### Sonidos (SFX)
- Ubicación: `public/sounds/`
- Formato: `.mp3`
- Registro: `src/hooks/useAudio.js` → `SOUNDS`

### Música
- Ubicación: `public/music/`
- Formato: `.mp3`
- Registro: `src/hooks/useAudio.js` → `MUSIC`

---

## 🔐 Encriptación

Las historias se encriptan automáticamente durante el build para proteger el contenido narrativo. El script `encrypt-story.cjs` maneja esto.

**Nota:** La encriptación es para ofuscación básica, no seguridad criptográfica.

---

## 🐛 Troubleshooting

### "Rust not found"
```powershell
# Instalar Rust
winget install Rustlang.Rust.MSVC
# Reiniciar terminal
```

### "No encontré config para 'X'"
Asegurate de que el juego tenga `title` y `version` en `gameConfig.js`.

### Build muy lento
El primer build de Tauri tarda ~5-10 min porque compila Rust. Los siguientes son más rápidos.

---

## 📚 Referencias

- [Tauri Docs](https://tauri.app/v1/guides/)
- [Ink Scripting](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md)
- [Semver](https://semver.org/)
