---
description: Ship — yo (Claude) escribo el changelog y corro el script atómico
---

## Ship workflow (BardoEngine)

Cuando el usuario diga "ship", "shippealo a dev", "ship a dev", etc., el flujo es:

### Paso 1 — YO escribo el bullet del CHANGELOG
**El usuario NO escribe changelogs. Yo los escribo siempre.**

Mirá `git diff HEAD --name-only` para ver qué cambió en esta feature branch desde dev.

- Si hay archivos del **engine** (cualquier cosa que no sea Centinelas): editar `CHANGELOG.md` y prepend al tope una entrada con la próxima versión, fecha de hoy, y 1-3 bullets describiendo el cambio. Mirá las entradas previas del archivo para copiar el formato exacto.
- Si hay archivos de **Centinelas** (`centinelas.ink`, `src/stories/centinelas*`, `src-tauri/resources/story-config.json`, `docs/centinelas/**`): editar `docs/centinelas/CHANGELOG.md` con la misma lógica.
- Si cambian ambos, escribir bullets en ambos changelogs.

Redactá los bullets vos mismo a partir del diff, en español, claros y orientados al usuario final (no jerga técnica innecesaria).

### Paso 2 — Correr el script atómico
```
powershell -ExecutionPolicy Bypass -File scripts/ship.ps1 -Bump <patch|minor>
```

- **patch** (default): bug fixes, ajustes.
- **minor**: nuevas features, archivos nuevos significativos.

El script hace TODO lo mecánico:
1. Detecta qué cambió (engine vs Centinelas) y bumpea sólo eso.
2. Valida que escribiste el changelog correspondiente.
3. Corre `npm run test:run` (aborta si fallan).
4. Bumpea las versiones de los archivos correctos.
5. Stagea, commitea (`chore(release): vX.Y.Z`), checkout dev, merge --no-ff, push origin dev, vuelve a la feature branch.

Si algo falla, el script imprime exactamente qué fue y qué hacer. No improvises pasos manuales — corregí lo que el script pide y volvé a correrlo.

### Modo dry-run
Si querés ver el plan sin ejecutar nada:
```
powershell -ExecutionPolicy Bypass -File scripts/ship.ps1 -Bump patch -DryRun
```

### Reglas no negociables
- **El usuario NO escribe el changelog.** Yo lo escribo basándome en el diff. Si el usuario me corrige el texto, lo edito y vuelvo a correr.
- **No saltear pasos manualmente.** El script es la única fuente de verdad. Si veo que falla en algún step, arreglo la causa y reintento.
- **NUNCA** usar `--no-verify`, force-push, ni saltar tests.
- **NUNCA** shippear desde `main` ni `dev` directamente — siempre desde una feature branch.

### Si el working tree está limpio
El script aborta con "Nada para shippear". Si el usuario insiste, probablemente está confundido — preguntale qué quería cambiar.
