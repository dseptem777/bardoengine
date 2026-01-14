// ---------------------------------------------------------
// PROYECTO: BardoEngine - Tu nombre en clave es Partuza
// FORMATO: Ink (Inkle Studios)
// ---------------------------------------------------------
VAR clave_a = 0
VAR clave_b = 0
VAR clave_c = 0
-> p1

=== p1 ===
Despiertas en un sillón del living, abrazado a una botella de whisky vacía. Tienes una mancha blancuzca en tu remera... En la planta de tu pie dice con marcador indeleble: 'puto el que lee'. Te miras al espejo: Eres Marley. # shake # play_sfx:resaca # bg:living_sucio # stat:hp:-10 # stat:cordura:-5

* [¿Sos Bob Marley?] -> p102
* [¿Sos Marley de Teleshow?] -> p32

=== p102 ===
¡Bob Marley está muerto, gil! Te quedas mirando el techo hasta que el hambre te consume. # flash_red # bg:cielo
-> END

=== p32 ===
Te acomodas tus rubias mechas lacias... Un paparazzi de la revista Escándalo te saca una foto en el baño. Lo obligas a punta de Magnum 44 a limpiar todo. Al salir, encuentras un catálogo de Coto y un sobre misterioso y llamativo. # play_sfx:paparazzi # bg:banio # stat:karma:+5

* [Tomar el catálogo de Coto] -> p4
* [Agarrar el sobre misterioso] -> p115

=== p4 ===
¡Qué divertido, un catálogo de supermercado! Lees las ofertas de acelga y pepitas. Te pones de buen humor para ir al súper. # bg:catalogo # inv:add:catalogo_coto

* [Ir al Supermercado] -> p6
* [Hacer el pedido por internet] -> p16

=== p6 ===
Llegas al súper. En la góndola de lácteos te encuentras con Jacinto 'Probeta' Rattin, un viejo conocido que insiste en que lo ayudes a conseguir helio para un experimento 'revolucionario'. # bg:supermercado # play_sfx:super_ambience

* [Ayudar a Jacinto a buscar helio] -> p45
* [Ignorarlo y comprar una Quilmes] -> p8

=== p8 ===
La Quilmes está caliente. Tu decepción es tan grande que decides que el mundo debe terminar. Te vas a dormir. # flash_blue
-> END

=== p45 ===
Jacinto te lleva a un depósito secreto detrás de las fiambreras. 'El helio está en esas garrafas', dice señalando unas latas de conserva sospechosas.
~ clave_a = 10
# bg:deposito

* [Abrir las latas con los dientes] -> p50
* [Usar un abrelatas profesional] -> p51

=== p50 ===
Te rompes un premolar tratando de morder el metal. El dolor es tan intenso que empiezas a hablar en arameo. Jacinto se asusta, piensa que estás poseído y huye. Te desangras lentamente entre lácteos. FIN. # flash_red # stat:hp:-100 # stat:cordura:-50
-> END

=== p51 ===
El gas sale con un silbido. Tu voz se vuelve finita, como si hubieras tragado una flauta dulce. Jacinto se ríe tanto que le da un paro cardiorrespiratorio. # pitch_high

* [Tratar de reanimarlo] -> p60
* [Robarle la billetera y huir] -> p61

=== p60 ===
Le haces RCP al ritmo de 'Stayin' Alive'. Jacinto revive y te regala un frasco con 'polvo de estrellas'.
~ clave_c = 20
# play_sfx:disco # stat:karma:+10 # inv:add:polvo_estrellas
-> p120

=== p61 ===
Huyes con la billetera. Al abrirla solo hay una foto de un hámster y un ticket de un videoclub de 1994. La culpa te persigue por el resto de tus días hasta que te haces monje tibetano. FIN.
-> END

=== p16 ===
Prendes la compu. El sitio de Coto tarda años en cargar porque estás usando Dial-Up. Te distraes mirando fotos de modelos polacas en pelotas en un sitio que se llama 'Polaquitas'.

* [Volver al catálogo] -> p4
* [Apagar todo y salir a caminar] -> p22

=== p22 ===
Caminas por la calle y te cruzas con un control de alcoholemia. El oficial te pide que sopes el aparatito. # play_sfx:sirena_poli

* [Soplar con todas tus fuerzas] -> p25
* [Decir que sos Marley y que vas a lo de Su] -> p26

=== p25 ===
El aparatito explota por el exceso de vapores etílicos. El oficial te mira con un respeto religioso. 'Usted es una leyenda, señor'. Te regala un cupón para una parrillada libre. FIN. # flash_yellow
-> END

=== p26 ===
'¿Y a mí qué me importa?', dice el oficial mientras te pone los ganchos. Pasas la noche en el calabozo cantando temas de Paulina Rubio. FIN.
-> END

=== p115 ===
El sobre es una invitación VIP para una fiesta en el Planetario con los Chemical Brothers. Dice que debes llevar 'sustancias' y un colador. # bg:sobre # play_sfx:invitacion # inv:add:sobre_misterioso

* [Ir a la fiesta de una] -> p120
* [Llamar a tu tía para ver si tiene un colador] -> p119

=== p119 ===
Tu tía te atiende y te dice que los Chemical Brothers son 'unos chicos muy educados' y que ya les prestó el colador ayer. Te da la dirección trasera del Planetario.
~ clave_b = 5
-> p120

=== p120 ===
En el Planetario el ambiente está pesadísimo. Los Chemical Brothers están mezclando música con una licuadora llena de tuercas. # flash_multi # shake # bg:planetario

* [Tomar el trago de color verde flúor] -> p125
* [Preguntar si tienen una Sprite] -> p130

=== p125 ===
El trago sabe a detergente y gloria. De repente, tus brazos se convierten en parlantes de 15 pulgadas. Te conviertes en el alma de la fiesta y los Chemical te contratan como equipo de sonido humano. FIN. # play_sfx:victory # stat:hp:+20 # stat:cordura:-20 # stat:karma:+15
-> END

=== p130 ===
Los Chemical Brothers te miran con asco infinito. 'No hay Sprite, careta', te dicen a coro. Te sacan del Planetario de una patada en el orto. Terminas comiendo un choripán en el carrito de la esquina, solo y triste. FIN.
-> END
