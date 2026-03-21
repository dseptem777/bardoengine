# Plan: Capítulo 2B — El Nuevo Amanecer

## Contexto

El capítulo 2B es un camino alternativo al 2A. El jugador elige uno u otro en `inter_misiones`. El contenido viene de `docs/centinelas/crudos/Capitulo 2B.txt` (1012 líneas de texto crudo con problemas de encoding). La historia trata sobre investigar ataques de Vampiros Superiores a familias en Costa Alegre, rastrear su nido en un cementerio, y enfrentar un ritual de sacrificio de bebés.

## Archivos a modificar

1. **`centinelas.ink`** — Agregar variables (top), fix stub `prox_mision_2`, append ~1300 líneas de Cap 2B
2. **`src/stories/centinelas.config.json`** — Agregar 7 items nuevos al inventario

## Variables nuevas (agregar después de línea 30)

```ink
VAR tiene_teoria_vampiros = false
VAR tiene_favor_tuco = false
VAR uso_favor_tuco = false
VAR tiene_cementerio_correcto = false
VAR tiene_teoria_sacrificio = false
VAR vampiro_muerto = false
VAR sin_guardias = false
VAR todos_guardias_mueren = false
VAR algunos_guardias_sobreviven = false
VAR final_con_tuco = false
VAR traumado = false
VAR bebe_muerto = false
VAR paso_tiempo_casa = 0
VAR llegaste_tarde_2b = 0
```

## Items nuevos (config)

| ID | Nombre | Icono | Categoría |
|----|--------|-------|-----------|
| `teoria_vampiros` | Teoría: Vampiros Superiores | 🧛 | documentos |
| `favor_tuco` | Favor del Sgto. Tuco | 📞 | claves |
| `cementerio_correcto` | Pista: Lomas de Paz | 🗺️ | documentos |
| `teoria_sacrificio` | Teoría: Sacrificio de Bebés | 📜 | documentos |
| `cruz_plata` | Cruz de Plata | ✝️ | items |
| `placa_amor` | Placa de Amor | 💌 | items |
| `buda_oro` | Buda de Oro | 🪷 | items |

## Fix del stub (líneas 1099-1102)

```ink
=== prox_mision_2 ===
Vas a la escena del crimen. Algo huele a ritual desde aquí.
-> capitulo_2b
```

## Estructura del capítulo (~85 knots, 14 secciones)

### 1. Entrada + Preparación (7 knots)
- `capitulo_2b` — Entry: `~ capitulo_actual = "Cap. 2 — El nuevo amanecer"`, `# inv:clear_mission`, `# music:city_ambient`
- 6 opciones de prep (pick 1, `*` sticky):
  - `cap2b_prep_expediente` → `# inv:add:teoria_vampiros`, `~ tiene_teoria_vampiros = true`
  - `cap2b_prep_fuerza` → `# stat:fuerza:+5`
  - `cap2b_prep_conocimiento` → `# stat:conocimiento:+5`
  - `cap2b_prep_magia` → `# stat:magia:+5`
  - `cap2b_prep_tuco` → `# inv:add:favor_tuco`, `~ tiene_favor_tuco = true`
  - `cap2b_prep_descanso` → `# stat:hp:+5`
- Todos convergen en `cap2b_llegada_casa`

### 2. Llegar a la casa + Entrar (6 knots)
- `cap2b_llegada_casa` — Descripción del barrio, patrulla policial
- `cap2b_entrar_opciones` — Hub (5 opciones, soborno usa `*`, resto `+`):
  - `cap2b_entrar_techos` — Trepar (fuerza<20: -5hp, >=20: safe)
  - `cap2b_entrar_tuco` — Favor Tuco (`{tiene_favor_tuco and not uso_favor_tuco}`, consume favor)
  - `cap2b_entrar_soborno` — FALLA, vuelve a opciones
  - `cap2b_entrar_invisible` — `# REQUIRES: magia >= 30`
  - `cap2b_entrar_policia` — Fingir ser policía, funciona
- Todos convergen en `cap2b_dentro_casa`

### 3. Investigación de la casa — HUB (6 knots)
- `cap2b_dentro_casa` — Hub con counter `paso_tiempo_casa`. Al llegar a 3 → `cap2b_araca_la_cana`
- 5 habitaciones (cada una incrementa `paso_tiempo_casa`):
  - `cap2b_casa_zaguan` — Cuerpo niño. Con `teoria_vampiros`: marcas de colmillos. Con `conocimiento>=20`: foto → `cementerio_correcto`
  - `cap2b_casa_cocina` — Cuerpo adulto. Con `teoria_vampiros`: marcas vampíricas
  - `cap2b_casa_bano` — Nada útil (trampa de tiempo)
  - `cap2b_casa_ninos` — Cuna vacía. Con `conocimiento>=25`: `teoria_sacrificio`
  - `cap2b_casa_padres` — Cuerpo en cama. Con `teoria_vampiros`: marcas vampíricas
- `cap2b_araca_la_cana` — Policías llegan, forzar salida

### 4. Escapar de la casa (12 knots)
- `cap2b_escapar_opciones` — Hub (4 métodos):
  - `cap2b_escapar_techos` — `# REQUIRES: fuerza >= 25`
  - `cap2b_escapar_invisible` — `# REQUIRES: magia >= 30` → sub-choice robar carpeta (→ `cementerio_correcto`) o no
  - `cap2b_escapar_escondite` — 3 sub-opciones (cama/bañera/plantas), TODAS fallan → comisaría
  - `cap2b_escapar_correr` — fuerza>=20: safe, <20: -10hp
- Escapar exitoso → `cap2b_investigacion`

### 5. Comisaría — si te atrapan (6 knots)
- `cap2b_comisaria` — `~ llegaste_tarde_2b += 1`. 3 opciones:
  - `cap2b_comisaria_esperar` — Pierde tiempo (`~ llegaste_tarde_2b += 1` extra)
  - `cap2b_comisaria_tuco` — Usa favor Tuco (si disponible)
  - `cap2b_comisaria_enriquez` — Llama a Enriquez
- Todos → `cap2b_en_la_calle` — Encuentro con Tuco (3 respuestas de diálogo, check fuerza<25: -5hp por piña)
- → `cap2b_investigacion`

### 6. Elegir cementerio (8 knots)
- `cap2b_investigacion` — Reflexión en la playa
- `cap2b_elegir_cementerio` — Hub:
  - `cap2b_cementerio_pista` — `{tiene_cementerio_correcto}` → Enriquez confirma → directo a Lomas
  - `cap2b_cementerio_lomas` — Correcto → `cap2b_lomas_de_paz`
  - `cap2b_cementerio_recuerdo` — INCORRECTO, `~ llegaste_tarde_2b += 1`, vuelve
  - `cap2b_cementerio_municipal` — INCORRECTO, encuentro con góticos (3 sub-opciones), `+= 1`, vuelve

### 7. Lomas de Paz — Entrar al cementerio (8 knots)
- `cap2b_lomas_de_paz` — Descripción, guardias con escopetas
- `cap2b_entrar_lomas` — Hub (7 opciones, `jefe` usa `*`, resto `+`):
  1. `cap2b_lomas_hechizo` — `# REQUIRES: magia >= 25` → `sin_guardias`
  2. `cap2b_lomas_trepar` — `# REQUIRES: fuerza >= 25`
  3. `cap2b_lomas_alcantarilla` — `# REQUIRES: conocimiento >= 25`
  4. `cap2b_lomas_tuco` — Favor Tuco (si disponible)
  5. `cap2b_lomas_atacar` — Violencia → `sin_guardias`
  6. `cap2b_lomas_jefe` — Fingir ser jefe, FALLA, vuelve
  7. `cap2b_lomas_abuelita` — Mentira de la abuelita, funciona
- Todos → `cap2b_entre_criptas`

### 8. Encuentro con vampiro (8 knots)
- `cap2b_entre_criptas` — Recorrido, avistan silueta vampírica
- `cap2b_encuentro_vampiro` — Hub (4 opciones):
  1. `cap2b_vampiro_atacar` — fuerza<25: minigame + -10hp + `vampiro_muerto`, >=25: kill directo + `vampiro_muerto`
  2. `cap2b_vampiro_hablar` — Minigame
  3. `cap2b_vampiro_seguir` — Sigilo, encuentra cubil directamente
  4. `cap2b_vampiro_trampa` — `# REQUIRES: conocimiento >= 25`, captura vampiro:
     - `cap2b_trampa_dejar` — Sol lo mata → `vampiro_muerto`
     - `cap2b_trampa_liberar` — Minigame, ataca → `vampiro_muerto`
     - `cap2b_trampa_convertirse` — conocimiento>=25: sobrevive -50hp, <25: **MUERTE**
- Todos (menos muerte) → `cap2b_frente_cubil`

### 9. Frente al cubil (8 knots)
- `cap2b_frente_cubil` — Tormenta, 2 vampiros guardianes, llanto de bebé
- `cap2b_cubil_opciones` — Hub (6 opciones):
  1. `cap2b_cubil_fuerza` — `# REQUIRES: fuerza >= 30` → combate épico
  2. `cap2b_cubil_magia` — `# REQUIRES: magia >= 30` → bolas de fuego
  3. `cap2b_cubil_tunel` — `# REQUIRES: conocimiento >= 30` → túnel desde cripta vecina
  4. `cap2b_cubil_guardias` — `{not sin_guardias}` → sub: entrar durante pelea (`todos_guardias_mueren`) o ayudar (`algunos_guardias_sobreviven`)
  5. `cap2b_cubil_tuco` — Favor Tuco (si disponible) → camioneta policial
  6. `cap2b_cubil_improvisar` — Sin plan → minigame
- Todos → `cap2b_dentro_cubil`

### 10. Dentro del cubil (7 knots)
- `cap2b_dentro_cubil` — Descripción interior (lámpara roja, ajedrez, posters 80s)
- `cap2b_pasillo_horror` — Choice: prender luz o seguir a oscuras
  - `cap2b_pasillo_luz` — Horror completo (intestinos, órganos, runas en sangre). Con conocimiento>=25: lee el ritual
  - `cap2b_pasillo_oscuras` — No ve los detalles
- `cap2b_monticulos` — Elegir objeto religioso (4 opciones):
  - `cap2b_monticulo_placa` → `# inv:add:placa_amor`
  - `cap2b_monticulo_cruz` → `# inv:add:cruz_plata`
  - `cap2b_monticulo_buda` → `# inv:add:buda_oro`
  - `cap2b_monticulo_patear` → nada
- → `cap2b_ritual_final`

### 11. Ritual final — LA CONFRONTACIÓN (12 knots)
- `cap2b_ritual_final` — Escena del ritual. Check `llegaste_tarde_2b >= 2`:
  - Late: 6 bebés muertos, 1 sobrevive (horror extremo)
  - A tiempo: 7 bebés vivos pero heridos
- `cap2b_ritual_opciones` — **10 opciones** (la más grande del juego):
  1. `cap2b_ritual_fuerza` — `# REQUIRES: fuerza >= 30` → -10hp, éxito
  2. `cap2b_ritual_magia` — `# REQUIRES: magia >= 30` → lanzallamas, éxito
  3. `cap2b_ritual_diagrama` — `# REQUIRES: conocimiento >= 30` → modificar diagrama, -5hp, éxito
  4. `cap2b_ritual_matar_bebe` — Matar al bebé → `traumado`, vampiros mueren por caos energético
  5. `cap2b_ritual_tuco` — `{tiene_favor_tuco and not uso_favor_tuco}` → policía irrumpe, `final_con_tuco`
  6. `cap2b_ritual_cruz` — `# REQUIRES: inv:cruz_plata` → poder divino, éxito
  7. `cap2b_ritual_buda` — `# REQUIRES: inv:buda_oro` → FALLA → **MUERTE**
  8. `cap2b_ritual_placa` — `# REQUIRES: inv:placa_amor` → FALLA → **MUERTE**
  9. `cap2b_ritual_musica` — Celular a todo volumen, La Marcha de San Lorenzo → éxito caótico
  10. `cap2b_ritual_sangre` — Sangrar sobre diagrama → FALLA → **MUERTE**
- Éxitos → `cap2b_epilogo`
- Muertes → `ESTÁS MUERTO.` + `-> END`

### 12. Epílogo (1 knot)
- `cap2b_epilogo` — Amanecer, condicional:
  - `{todos_guardias_mueren}` → cuerpos de guardias, culpa
  - `{algunos_guardias_sobreviven}` → guardias sentados, vivos
  - `{final_con_tuco}` → Tuco recostado contra pared, herido
  - `{traumado}` → breakdown mental, llanto, sedación
  - `{llegaste_tarde_2b >= 2}` → 1 bebé sobreviviente en brazos
  - `{llegaste_tarde_2b < 2 and not traumado}` → 7 bebés salvados, Enriquez con bebé en brazos
  - `FIN DEL EPISODIO.` → `-> END`

## Convenciones clave

- **sabiduría en el doc = conocimiento en el engine**
- **Encoding**: Reescribir todo en UTF-8 con español argentino (voseo)
- **Favor Tuco**: Track con `tiene_favor_tuco` + `uso_favor_tuco`. Al usar: `~ uso_favor_tuco = true`, `# inv:remove:favor_tuco`
- **paso_tiempo_casa**: Counter 0→3, check al inicio del hub
- **llegaste_tarde_2b**: Counter, >=2 = final con bebés muertos
- **Minigames**: `# MINIGAME: type=qte` en 4 encuentros vampíricos
- **Muertes**: 4 caminos de muerte total (buda, placa, sangre, conversión vampírica sin conocimiento)
- **Diálogo NPC**: prefijo `\-`
- **Music**: `city_ambient` (barrio), `misterio_ambient` (investigación), `terror_ambient` (cementerio/cubil)

## Secuencia de implementación

1. Crear branch `feature/capitulo-2b`
2. Agregar variables al top de `centinelas.ink`
3. Agregar items a `centinelas.config.json`
4. Fix `prox_mision_2` stub → `-> capitulo_2b`
5. Escribir Cap 2B en secciones (append después de línea 2110), compilando y testeando entre secciones
6. Compilar: `node compile-ink.cjs centinelas.ink src/stories/centinelas.json`
7. Test completo con `npm run dev`
8. Version bump 0.4.1 → 0.5.0

## Verificación

### Automatizada
1. `node compile-ink.cjs centinelas.ink src/stories/centinelas.json` — zero errors de compilación
2. Revisar JSON compilado — verificar que todos los knots existan y los diverts apunten correctamente
3. Revisión de lógica — variables, conditions, tags bien formados, no hay knots huérfanos

### Manual (playtest con `npm run dev`)
1. Prep choices → stats/items correctos
2. Hub de casa → counter funciona, 3 visitas fuerza salida
3. Escape → comisaría funciona, favor Tuco se consume
4. Cementerios → wrong ones incrementan late counter
5. Ritual → 10 opciones, 3 muertes, items requeridos
6. Epílogo → flags condicionales muestran texto correcto
