// ═══════════════════════════════════════════════════════
// EL OCASO EN EL MUSEO DEL SUR — Tech Demo
// Scroll Friction + Boss Fight + Visual Damage Persistence
// ═══════════════════════════════════════════════════════

VAR fuerza = 10
VAR magia = 10
VAR sabiduria = 10
VAR hp = 100
VAR boss_hp = 100
VAR boss_defeated = false
VAR boss_phase = 0
VAR scroll_locked = false
VAR arrebatados_count = 0
VAR death_count = 0
VAR minigame_result = -1

-> intro

=== intro ===
# clear

El Museo de Ciencias Naturales del Sur. Medianoche.

Tu radio crepita: "Centinela, tenemos una Brecha Clase 3 en el ala arqueológica. Un Umbrío está intentando abrir un portal al Uku Pacha usando la energía de la Momia de Salta."

La seguridad del museo ya cayó. Los guardias están en trance, con los ojos blancos y murmurando en quechua antiguo.

Sos el último Centinela disponible en la zona.

+ [Entrar al museo] -> museo_entrada
+ [Pedir refuerzos] -> sin_refuerzos

=== sin_refuerzos ===

"No hay refuerzos, Centinela. Jesús está conteniendo otra brecha en Tucumán. Estás solo."

La radio se corta. El silencio del museo te traga.

+ [Entrar al museo] -> museo_entrada

=== museo_entrada ===
# clear
# ARREBATADOS_START: count=2, fuerza={fuerza}

La puerta principal está entreabierta. Adentro, el aire huele a tierra mojada y a algo metálico, como sangre vieja.

Las luces de emergencia parpadean en rojo. Entre las sombras, ves movimiento — figuras translúcidas que se arrastran por las paredes.

Son Arrebatados. Almas de conquistadores y saqueadores, atrapadas en el lodo del tiempo. El Umbrío las está usando como barrera.

Sentís el texto pesado. Cada paso te cuesta más.

+ [Avanzar hacia la Galería Principal] -> galeria_1
+ [Buscar un camino alternativo] -> camino_lateral

=== camino_lateral ===

Bordeás el hall central por un pasillo de servicio. Está oscuro, pero al menos no hay Arrebatados aquí.

Encontrás una puerta de mantenimiento que da a la galería.

# stat:sabiduria:+2

Tu cautela te recompensa. [+2 Sabiduría]

+ [Entrar a la galería] -> galeria_1

=== galeria_1 ===
# ARREBATADOS_ADD: 2
# clear

La Galería de Historia Natural. Vitrinas rotas, huesos de dinosaurios proyectando sombras grotescas.

Los Arrebatados son más densos aquí. Sus murmullos llenan el aire:

"ORO... NECESITAMOS MÁS ORO..."

"ESTA TIERRA ES NUESTRA POR DERECHO DE CONQUISTA..."

Cada palabra que lees se siente más pesada que la anterior.

+ [Abrirte paso a la fuerza] -> galeria_fuerza
+ [Buscar un patrón en sus movimientos] -> galeria_sabiduria
+ [Intentar dispersarlos con energía] -> galeria_magia

=== galeria_fuerza ===

Empujás a través de la masa de Arrebatados. Sus manos fantasmales te agarran pero tu determinación es más fuerte.

# stat:fuerza:+3
# stat:hp:-10

Te rasguñan el alma. [-10 HP, +3 Fuerza]

+ [Seguir adelante] -> galeria_2

=== galeria_sabiduria ===

Observás sus patrones. Se mueven en espiral, siguiendo líneas invisibles en el suelo — líneas ley, probablemente.

Si te movés entre las espirales, podés pasar sin contacto.

# stat:sabiduria:+4

Tu mente ve lo que los ojos no pueden. [+4 Sabiduría]

+ [Seguir adelante] -> galeria_2

=== galeria_magia ===

Concentrás tu energía ancestral y proyectás un pulso de luz. Los Arrebatados retroceden, chillando en idiomas muertos.

Pero el esfuerzo te deja mareado.

# stat:magia:+4
# stat:hp:-5

[-5 HP, +4 Magia]

+ [Seguir adelante] -> galeria_2

=== galeria_2 ===
# ARREBATADOS_ADD: 3
# clear

Sala de Arqueología Andina. Aquí está la vitrina de la Momia de Salta — vacía. El vidrio está cubierto de escarcha negra.

Y al fondo de la sala, lo ves.

El Umbrío. Un hombre joven con ojos como pozos de brea, flotando a treinta centímetros del suelo. Entre sus manos, un portal púrpura palpita como un corazón enfermo.

La Momia de Salta está suspendida dentro del portal, brillando con una energía antigua.

"Ah, un Centinela," dice, sin mover los labios. "Llegás tarde."

# ARREBATADOS_STOP

+ [Enfrentarlo] -> boss_intro

=== boss_intro ===
# clear
# BOSS_START: name=amaru, hp=100
# UI_EFFECT: cold_blue

AMARU, EL TEJEDOR DE SOMBRAS

"¿Sabés lo que hay del otro lado, Centinela? El Uku Pacha. El mundo de abajo. Y esta momia es la llave."

El museo empieza a deformarse. Las paredes se estiran, el techo se aleja, el piso se ondula.

"No vas a poder ni leer lo que viene."

{ fuerza >= 15: Tu fuerza te da la voluntad de resistir la distorsión. }
{ sabiduria >= 15: Tu sabiduría te permite ver a través de sus ilusiones. }
{ magia >= 15: Tu magia resuena contra la suya, debilitando sus hechizos. }

+ [Resistir] -> boss_fase_1

=== boss_fase_1 ===
# BOSS_PHASE: 1
# clear

FASE I: EL PASILLO INFINITO

El museo se transforma en un corredor sin fin. Caminás, pero el pasillo se repite. El mismo cuadro, la misma vitrina, la misma grieta en la pared.

"Vas a caminar por siempre, Centinela. Como los Arrebatados. Atrapado en un loop."

La voz de Amaru resuena desde todas las direcciones.

Pero algo no está bien. Uno de los textos tiene un brillo diferente. Algo que no pertenece al loop.

{ sabiduria >= 15: Tu sabiduría te ayuda: el error es más visible para vos. Buscá el texto con un color distinto y clickealo. }
{ sabiduria < 15: Buscá con cuidado: hay un texto con un color ligeramente diferente. Clickealo para romper el ciclo. }

Encontrá la errata en el texto y clickeala para romper el hechizo.

+ [Buscar la errata...] -> boss_fase_1_check

=== boss_fase_1_check ===
# BOSS_DAMAGE: 30

¡LO ENCONTRASTE!

El corredor se quiebra como un espejo. Amaru retrocede, sorprendido.

"Imposible... ¿cómo viste a través de mi trama?"

# flash_white
# shake

+ [Avanzar a la siguiente fase] -> boss_fase_2

=== boss_fase_2 ===
# BOSS_PHASE: 2
# clear

FASE II: LAS MANOS DE SOMBRA

Amaru gruñe. De las sombras de los márgenes del museo, emergen manos. Decenas de manos oscuras que se extienden hacia vos.

"Si no puedo atraparte en el loop, te voy a arrastrar al Uku Pacha directamente."

Las manos intentan agarrar la interfaz. Sentís cómo el control se te escapa.

¡SACUDÍ EL MOUSE RÁPIDAMENTE PARA LIBERARTE DE LAS MANOS!

Si dejás de sacudir, las manos te atrapan y el scroll se bloquea.

+ [Resistir las manos] -> boss_fase_2_check

=== boss_fase_2_check ===
# BOSS_DAMAGE: 30

¡Te liberaste!

Las manos se retraen, chillando. Amaru escupe sangre negra.

"Tenés... fuerza. Pero no la suficiente."

# shake
# flash_white

+ [Enfrentar la fase final] -> boss_fase_3

=== boss_fase_3 ===
# BOSS_PHASE: 3
# clear

FASE III: EL COLAPSO DE LA REALIDAD

Amaru levanta ambas manos. El espacio mismo empieza a comprimirse. Las paredes se cierran sobre vos.

"Si no puedo atraparte ni arrastrarte... voy a APLASTARTE."

El viewport se achica. Tu mundo se reduce píxel a píxel.

Pero hay grietas en la realidad de Amaru — portales pequeños que pulsan con luz violeta. Cada uno es una debilidad en su hechizo.

¡CLICKEÁ LOS PORTALES VIOLETA QUE APARECEN EN EL TEXTO PARA DAÑAR A AMARU!

Si el espacio llega a cero, morís.

+ [Atacar los portales] -> boss_fase_3_check

=== boss_fase_3_check ===
# BOSS_CHECK
# BOSS_STOP

{ boss_defeated:
    -> victoria
- else:
    -> derrota
}

=== victoria ===
# clear
# UI_EFFECT: none
# flash_white
# shake

¡AMARU HA CAÍDO!

El Tejedor de Sombras se desintegra en un remolino de sombras. Su último grito resuena por los pasillos vacíos del museo.

"Esto... no termina... aquí..."

La Momia de Salta cae suavemente al suelo, intacta. El portal al Uku Pacha se cierra con un estallido de luz púrpura.

Los Arrebatados se desvanecen como niebla al amanecer. Los guardias despiertan, confundidos.

Tu radio crepita: "Centinela, ¿status?"

"Brecha sellada. El Umbrío fue neutralizado. La pieza está segura."

Silencio.

"Buen trabajo, Centinela."

---

VICTORIA

HP final: {hp}

{ fuerza >= 15: Tu fuerza fue decisiva en la batalla. }
{ sabiduria >= 15: Tu sabiduría te permitió ver a través de las ilusiones. }
{ magia >= 15: Tu magia debilitó los hechizos del enemigo. }

*Tech Demo: El Ocaso en el Museo del Sur*
*Sistemas: Scroll Friction + Boss Fight (3 fases) + Visual Damage*

+ [Volver a jugar] -> intro

=== derrota ===
# clear
# VISUAL_DAMAGE: grayscale=0.3
# UI_EFFECT: blur_vignette

El espacio se cierra.

Tu mundo se comprime hasta que no queda nada. La oscuridad te envuelve como un sarcófago.

~ death_count = death_count + 1

"Bienvenido al Uku Pacha, Centinela. Ahora sos uno de los nuestros."

Lo último que escuchás son los murmullos de los Arrebatados, dándote la bienvenida a la eternidad.

APLASTADO POR LA REALIDAD

Muerte #{death_count}

# stat:hp:-25

[-25 HP]

+ [Intentar de nuevo (el daño persiste...)] -> intro
+ [Purificar tu esencia (Hard Reset)] -> hard_reset

=== hard_reset ===
# VISUAL_DAMAGE: reset
# clear

Concentrás lo último de tu energía ancestral. La oscuridad retrocede.

Tu visión se aclara. El daño al tejido de la realidad se restaura.

Empezás de cero, limpio. Como si nada hubiera pasado.

...Pero vos sabés que pasó.

+ [Comenzar de nuevo] -> intro
