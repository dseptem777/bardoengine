# SFX Prompts — Centinelas

SFX pendientes de producción para el polish UX (Bloque 1).
Destino: `public/sounds/` como `.mp3`.

---

## chapter_break_in.mp3
**Uso**: `ChapterBreakOverlay` — se dispara al abrir la pantalla de capítulo.
**Fallback actual**: `sting_horror.mp3`
**Descripción del sonido deseado**: Golpe dramático de orquesta + reverb largo (tipo "título de película"). 1-2 segundos. Oscuro, grandioso, con decay. Piensa en una campana grave o un impact hit de trailer.
**ElevenLabs / Freesound**: buscar "cinematic impact hit dark" o "dramatic chapter title sting".

---

## chapter_break_out.mp3
**Uso**: `ChapterBreakOverlay` — se dispara al cerrar (dismiss) la pantalla de capítulo.
**Fallback actual**: `sting_moral.mp3`
**Descripción del sonido deseado**: Resolución suave, tipo "continuamos". Shorter que el in. Podría ser un sweep descendente + reverb tail, o un acorde de cuerdas que se disuelve. 0.5-1 segundo.
**ElevenLabs / Freesound**: buscar "cinematic whoosh out" o "orchestral resolution sting".

---

## Notas de implementación

- `stinger_magia.mp3`, `stinger_fuerza.mp3`, `stinger_conocimiento.mp3` ya existen en `public/sounds/` y se usan en los 4 grupos de GENJUTSU_BREAK (cap 2b).
- Los stingers de UI (`pasos_monstruo`, `clic_arma`, `puerta`) usan archivos existentes a volumen reducido (0.18 × sfxVolume).
- `playStinger()` en `useAudio.js` crea un Howl one-shot y lo unloadea en `onend` — no crashea si el archivo no existe (Howler loga warning).

---

## TODOs — Bloque 3 (Acoplamiento Audio-VFX por Capítulo)

### escape_sting.mp3
**Uso**: `keymash_arrastre_exito` — al escapar exitosamente de la morgue al final del Cap 1.
**Fallback actual**: `jumpscare_a/b.mp3` (rotación aleatoria)
**Descripción del sonido deseado**: Stinger de alivio-victoria. 1-2 segundos. Acorde de cuerdas ascendente o brass hit con decay corto. Sensación de "lo logré". Contrast con el horror previo — debe sonar esperanzador pero todavía tenue.
**ElevenLabs / Freesound**: buscar "orchestral escape sting" o "relief victory short sting".

---

### spider_screech.mp3
**Uso**: `boveda` — justo al activarse el SPIDER_START, el primer encuentro con las arañas gigantes.
**Fallback actual**: `rugido_monstruo_a/b.mp3` (rotación aleatoria)
**Descripción del sonido deseado**: Chillido agudo y metálico de arácnido demoníaco. 0.5-1 segundo. Alto en frecuencias altas, con reverb de caverna. Piensa en una silla metálica sobre piso de mármol amplificada y distorsionada.
**ElevenLabs / Freesound**: buscar "giant spider screech" o "demonic insect shriek cave reverb".

---

### roar_amplified.mp3
**Uso**: `cueva_pelea_fuerza` y `cueva_pelea_normal` — al inicio del boss fight con las arañas.
**Fallback actual**: `rugido_monstruo_c/d.mp3` (rotación aleatoria)
**Descripción del sonido deseado**: Rugido bestial amplificado con distorsión y sub-bass. 1-2 segundos. Más grave y amenazante que spider_screech — este es el boss, no un monstruo ordinario. Con reverb de cueva profunda.
**ElevenLabs / Freesound**: buscar "monster boss roar deep cave" o "amplified beast roar sub bass".

---

### relief_sting.mp3
**Uso**: `regreso_orfanato` — justo después del SPIDER_STOP, al terminar la infestación.
**Fallback actual**: `sting_moral.mp3`
**Descripción del sonido deseado**: Stinger de respiro/alivio. 0.5-1 segundo. Tono más cálido que escape_sting. Cuerdas suaves o piano con decay. No debe sonar victorioso — es alivio de supervivencia, no triunfo.
**ElevenLabs / Freesound**: buscar "relief sting subtle" o "survival relief short music sting".

---

### vampiro_appear.mp3
**Uso**: `cap2b_vampiro_hablar` — al inicio del encuentro con el Vampiro Superior en el cementerio.
**Fallback actual**: `groan_long.mp3`
**Descripción del sonido deseado**: Sonido de presencia sobrenatural. Bajo rumble con reverb largo + un elemento etéreo (cuerdas en armónicos o theremin). 2-3 segundos. Debe sentirse como algo antiguo e inhumano aproximándose. No un jumpscare — es amenaza lenta.
**ElevenLabs / Freesound**: buscar "vampire presence ambient sting" o "supernatural entity low rumble ethereal".
