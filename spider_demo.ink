// ═══════════════════════════════════════════════════════
// INFESTACIÓN — Tech Demo: Arañas continuas + Stats
// ═══════════════════════════════════════════════════════

VAR spider_survived = false
VAR new_game_plus = false
VAR fuerza = 10
VAR magia = 10
VAR sabiduria = 10
VAR hp = 100

-> intro

=== intro ===
# clear

Dos meses sin trabajo. Tres meses de alquiler atrasado.

El anuncio decía: "Explorador de cuevas. Sin experiencia necesaria. Pago inmediato."

No preguntaste más. Firmaste. Te dieron una antorcha, un mapa ilegible y un empujón hacia la oscuridad.

+ [Entrar a la cueva] -> cueva_entrada

=== cueva_entrada ===
# clear
# SPIDER_START: difficulty=slow, fuerza={fuerza}, magia={magia}, sabiduria={sabiduria}

La boca de la cueva te traga.

Adentro, el aire cambia. Huele a humedad vieja y a algo dulce, como fruta podrida.

Tus ojos se acostumbran a la penumbra. Las paredes están húmedas, cubiertas de una sustancia blancuzca que al principio confundís con moho.

No es moho.

Son telarañas. Finas, casi invisibles. Te pegan los dedos cuando las tocás.

+ [Avanzar con cuidado, apartando las telarañas] -> pasillo_1_lento
+ [Avanzar rápido, no les des importancia] -> pasillo_1_rapido

=== pasillo_1_lento ===

Vas despejando el camino con la mano libre. Las telarañas son sorprendentemente resistentes — tirás y rebotan como gomas elásticas.

Algo te cae en el hombro. Pequeño. Liviano.

Lo sacudís antes de mirar. Cuatro patas negras desaparecen entre las grietas.

# stat:sabiduria:+2

Con paciencia, avanzás unos metros más sin incidentes.

+ [Seguir adelante] -> pasillo_2

=== pasillo_1_rapido ===

Caminás derecho, ignorando los hilos que se te pegan en la cara y en los brazos. ¿Qué pueden hacerte unas telarañas?

Tropezás con algo blando. Mirás para abajo.

Es un pájaro. O era. Está envuelto en seda blanca como un regalo macabro. Solo se ve el pico, abierto en un grito silencioso.

# stat:hp:-5
# stat:fuerza:+2

Te raspaste la rodilla contra una roca al tropezar. [-5 HP]

+ [Seguir adelante] -> pasillo_2

=== pasillo_2 ===
# SPIDER_DIFFICULTY: normal

El pasillo se ensancha. Tu antorcha ilumina un espacio más grande — una especie de cámara natural con estalactitas que cuelgan como dientes.

Algo se mueve arriba. Muchas cosas se mueven arriba.

El techo está cubierto de arañas. Cientos. Todas inmóviles excepto por un leve temblor de patas.

Te están mirando.

+ [Quedarte quieto. No respirar.] -> pasillo_2_quieto
+ [Correr. CORRER.] -> pasillo_2_correr
+ [Levantar la antorcha hacia el techo] -> pasillo_2_fuego

=== pasillo_2_quieto ===

Te congelás.

Los segundos pasan como horas. Sentís las patas en el borde lejano de tu percepción — una en la nuca, otra en el tobillo. Explorándote.

No. Te. Muevas.

Después de un tiempo que parece infinito, pierden el interés. Se alejan.

# stat:sabiduria:+3

Tu corazón late como si quisiera escaparse. Pero estás entero.

+ [Seguir adelante, despacio] -> bifurcacion

=== pasillo_2_correr ===

Corrés.

Las arañas reaccionan al movimiento. Empiezan a caer — como gotas de una lluvia negra. Te golpean la cabeza, los hombros, la espalda.

# stat:hp:-10
# stat:fuerza:+3

Sentís mordeduras diminutas en el cuello. Las arrancás de la piel mientras corrés. [-10 HP]

Llegás al otro lado jadeando, cubierto de marcas rojas.

+ [Seguir adelante] -> bifurcacion

=== pasillo_2_fuego ===

Levantás la antorcha hacia ellas.

El fuego las espanta — se desarman como una nube de humo negro, corriendo en todas direcciones por las paredes. 

Pero la reacción en cadena activa a las más grandes. Las que estaban más abajo, escondidas entre las rocas.

# stat:hp:-5
# stat:magia:+3

Una del tamaño de tu mano te muerde en la muñeca antes de desaparecer. [-5 HP]

La antorcha las mantuvo a raya, pero esta cueva tiene más niveles de lo que pensabas.

+ [Seguir adelante] -> bifurcacion

=== bifurcacion ===
# SPIDER_DIFFICULTY: fast
# clear

El camino se divide.

A la izquierda: un pasaje estrecho. Las paredes están completamente cubiertas de telarañas gruesas como cortinas. Tendrías que abrirte paso a los manotazos.

A la derecha: un túnel amplio con agua estancada hasta los tobillos. Ves un brillo tenue al fondo — algo incrustado en la roca.

Recto: una grieta en la pared, apenas lo suficientemente ancha para pasar de costado. Del otro lado se escucha un zumbido grave, como un ventilador lejano.

+ [Izquierda — las telarañas] -> tunel_telaranas
+ [Derecha — el agua] -> tunel_agua
+ [Recto — la grieta] -> tunel_grieta

=== tunel_telaranas ===

Empezás a arrancar las telarañas con las manos. Son pegajosas, resistentes. Cada tirón libera más arañas que corren por tus brazos.

Tu antorcha se engancha en una red gruesa. Tirás pero no cede.

# stat:hp:-8

Las arañas se suben por el mango de la antorcha hasta tus dedos. Mordeduras secas, rápidas, como agujas. [-8 HP]

Finalmente arrancás la antorcha y cruzás al otro lado. Tus brazos tienen marcas como si te hubieran tatuado.

# stat:fuerza:+5

Pero ahora sabés que podés soportar sus ataques. [+5 Fuerza]

+ [Continuar] -> camara_nido

=== tunel_agua ===

El agua está fría. Muerta. Cosas flotan en la superficie — cuerpos de insectos envueltos en seda, como pequeños sarcófagos.

El brillo al fondo es un cristal incrustado en la roca. Cuarzo, probablemente.

+ [Tocar el cristal] -> tunel_agua_cristal
+ [Ignorarlo, seguir caminando] -> camara_nido

=== tunel_agua_cristal ===

Cuando tocás el cristal, se hunde. Un mecanismo antiguo suena detrás de la pared.

Algo cambia en el agua. Las arañas acuáticas — no sabías que existían — salen de debajo de la superficie como burbujas oscuras.

# stat:hp:-5
# stat:magia:+5
# stat:sabiduria:+3

Te muerden los tobillos bajo el agua. [-5 HP]

Pero el cristal pulsa con una luz tenue. Sentís algo conectarse. [+5 Magia, +3 Sabiduría]

+ [Continuar] -> camara_nido

=== tunel_grieta ===

Te metés de costado por la grieta. Las paredes te aprietan el pecho.

El zumbido es más fuerte acá. No es un ventilador — son alas. Miles de insectos pequeños atrapados en telarañas, vibrando.

# stat:sabiduria:+4

Entendés algo: las arañas no solo cazan. Cultivan. Esto es una granja. [+4 Sabiduría]

A mitad de camino, la grieta se estrecha aún más. Tu antorcha roza las telarañas del techo y prende fuego a la seda.

# stat:hp:-3

El humo te quema los ojos y te asfixia por un momento. [-3 HP]

Salís al otro lado tosiendo, pero con información valiosa.

+ [Continuar] -> camara_nido

=== camara_nido ===
# SPIDER_DIFFICULTY: extreme
# clear

El Nido.

No hay otra forma de describirlo. Una caverna enorme, iluminada por una fosforescencia verdosa de hongos que crecen entre capas de telarañas.

En el centro, una estructura de seda del tamaño de un auto — el nido principal. Se mueve. Respira.

Y entre vos y la salida al otro lado, el suelo es una alfombra viviente de arañas. Miles.

{ fuerza >= 15: Tu fuerza te da confianza. Podés apartar esa masa a golpes si hace falta. }
{ magia >= 15: Sentís la resonancia del cristal. Las arañas se mueven más lento a tu alrededor. }
{ sabiduria >= 15: Sabés cómo se mueven. Ves los patrones en el caos. Podés esquivarlas. }

La puerta de hierro oxidado está a veinte metros.

+ [Cruzar. AHORA.] -> check_final
+ [Buscar otro camino alrededor] -> rodeo_nido

=== rodeo_nido ===

Bordeás la cámara pegado a la pared, buscando un camino alternativo.

No hay otro camino. Solo el nido, las arañas y la puerta.

# stat:hp:-5

Mientras buscabas, tres arañas grandes te encontraron a vos. [-5 HP]

+ [Cruzar. No hay opción.] -> check_final

=== check_final ===
# SPIDER_CHECK: 8
# SPIDER_STOP

+ [→] -> resultado

=== resultado ===
# clear

{ spider_survived:
    Corrés.
    
    Las arañas crujen bajo tus pies. Se te suben por las piernas pero las sacudís sin parar. 
    
    Llegás a la puerta. Tus manos temblorosas giran la manija de hierro. Se abre.
    
    La luz del sol te golpea la cara como un beso. El aire limpio entra en tus pulmones.
    
    Atrás, en la oscuridad, ves el brillo de cientos de ojos diminutos mirándote desde las sombras.
    
    Saliste. 
    
    Apenas.
    
    🔥 ¡SOBREVIVISTE!

- else:
    Corrés, pero no lo suficiente.
    
    Las arañas te cubren. Las sentís en la cara, en la boca, en los ojos.
    
    Caés. La antorcha rueda por el suelo y se apaga.
    
    En la oscuridad total, sentís cómo te envuelven en seda. Despacio. Con paciencia.
    
    La puerta estaba tan cerca.
    
    # stat:hp:-25
    
    🕸️ CAÍSTE. [-25 HP]
}

-> fin

=== fin ===

---

*🕷️ INFESTACIÓN — Tech Demo*
*Sistema de arañas continuo integrado con stats y narrativa.*

Mataste arañas mientras jugabas, y tus decisiones afectaron tus stats. El resultado final dependió de cuántas aplastaste durante toda la historia.

{ fuerza >= 15: 💪 Tu fuerza fue considerable. }
{ magia >= 15: ✨ Desbloqueaste poder mágico. }
{ sabiduria >= 15: 📖 Tu sabiduría te dio ventaja. }

HP final: {hp}

+ [Volver a jugar] -> intro
