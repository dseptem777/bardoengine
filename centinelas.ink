// ---------------------------------------------------------
// PROYECTO: Centinelas del Sur
// MOTOR: BardoEngine
// CONTENIDO: Capítulo 0 (Orígenes) + Capítulo 1 + Intermisión 1
// ---------------------------------------------------------

VAR nombre_personaje = ""
VAR apodo_personaje = ""
VAR magia = 0
VAR fuerza = 0
VAR conocimiento = 0
VAR hp = 100
VAR entrada_temprana = false
VAR tiene_fotos = false
VAR tiene_mano = false
VAR tiene_descripcion = false
VAR new_game_plus = false
VAR amistad_jesus = 0
VAR amistad_abuela = 0
VAR visito_cura = false
VAR tiene_info_belen = false
VAR tiene_machete = false
VAR tiene_info_demoniaca = false
VAR sabe_algo_sigue = false
VAR llego_a_tiempo = false
VAR puso_trampas = false
VAR madre_alegria_vive = true
VAR juan_vive = false
VAR rapido_morgue = false
VAR capitulo_actual = ""
VAR misiones_completadas = 0
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
VAR willpower = 100
VAR sometimiento = 0
VAR willpower_passed = false
VAR spider_survived = false
VAR minigame_result = -1
VAR genjutsu_stat_used = ""
VAR genjutsu_willpower = 0
VAR habitacion_img = ""

// Cap 3 — Museo
VAR item_enojo_enriquez = false
VAR belen_sobrevive = false
VAR cabral_al_museo = false
VAR voz_conocida = false
VAR momia_robada = true
VAR espiaste_lab = false

-> capitulo_0

// Stat principal del personaje (prioridad en empate: magia > fuerza > conocimiento)
=== function stat_principal() ===
{
- magia >= fuerza and magia >= conocimiento:
    ~ return "magia"
- fuerza >= conocimiento:
    ~ return "fuerza"
- else:
    ~ return "conocimiento"
}

=== capitulo_0 ===
~ capitulo_actual = "Cap. 0 — Orígenes"
# music:misterio_ambient
¿Cómo comienza tu historia?

* [Con una explosión de magia] -> origen_magia
* [Con un combate que no puedo ganar] -> origen_combate
* [Buscando conocimiento prohibido] -> origen_conocimiento

// =========================================================
// ORIGEN 1: EXPLOSIÓN DE MAGIA
// =========================================================

=== origen_magia ===
# music:escuela_ambient
# achievement:unlock:centinela_magica
El reloj nunca se movió tan rápido. Y eso que estaba en clase de matemática con el Profesor Schmit, que siempre se convertía en un torneo de bostezos y ronquidos.

Jorge había prometido que me iba a esperar después de clase para matarme a golpes, desde principio de año venía haciéndome la vida imposible pero esta vez sus palabras habían tenido una entonación especial. Filosas.
# next
\-¿Qué pensás hacer? – Me susurró Julieta desde el pupitre de al lado.

La pregunta era una idiotez. Jorge medía un metro noventa y pesaba más de cien kilos. Yo no llegaba a la mitad mojado. Simplemente no se podía hacer nada, era como una fuerza de la naturaleza. Como querer pelear contra un tsunami o un terremoto.

- Salir y dejar que me mate a golpes. Con un poco de suerte vuelvo como fantasma y lo puedo acosar.
\- No me estás tomando en serio – Julieta arrugó la nariz, como hacía cada vez que se enojaba, haciendo que sus gruesos anteojos negros enmarquen sus ojos.

\- No hay nada que pueda hacer. Ni hay nadie que le interese ayudarme. El psicópata prendió fuego mi mochila hace un mes en la cafetería y los profesores se limitaron a regañarlo. Con un poco de suerte me rompo algo y puedo demandar a la escuela.

\- Es una escuela pública, la provincia está quebrada.

\- Ves. La opción de morir y volver como fantasma para acosarlo no es tan mala entonces.

\- Tengo una idea – Julieta se inclinó para susurrarme algo.

Sus labios rozaron mi oreja y durante un momento sentí un rayo de energía que recorría mi cuerpo. Lamentaba ser tan cobarde, en todos los aspectos. En otra realidad salía al patio, dejaba KO a Jorge de un golpe y me besaba con Julieta sobre el cuerpo flácido del bully.

\- Escapate. No se lo espera. Es viernes, de acá al lunes se le va a bajar los humos y todo va a volver a la normalidad.

* [La idea es buena. Cualquier castigo por escaparme va a ser menor que lo que me quiere hacer Jorge.] -> magia_escapar
* [No, si no me enfrento a esto ahora la semana próxima va a ser peor.] -> magia_enfrentar

=== magia_escapar ===
# music:escuela_ambient
\- Oka, ¿y qué hago? ¿Tenés un mapa secreto del colegio? ¿Hay que arrastrarse por ductos de aire?

\- Vos seguime la corriente – dijo Julieta mientras se ponía una pastilla en el ojo y me guiñaba.

En menos de cinco minutos estaba tirada en el piso, temblando, mientras espuma le salía por la boca.

# shake
El cincuenta por ciento de mis compañeros estaban gritando que estaba teniendo un ataque de epilepsia (conocía a Julieta desde los 5 años, no era epiléptica) y el otro cincuenta por ciento estaba sacando fotos con su celular. El cien por ciento era inútil, lo cual no me sorprendió. El Profesor Schmit intentó continuar la clase, como si calcular el área de un cilindro podría de alguna forma solucionarlo todo.

Era mi oportunidad. Me paré y grité "¡voy a buscar a la enfermera!".
Y simplemente corrí.
# next
Era increíblemente fácil. El Profesor Schmit se limitó a emitir una onomatopeya que tenía un sentido afirmativo.

En uno de los pasillos me crucé al Director pero bastó decirle "voy por la enfermera" para dejarlo clavado en el lugar. Era mi palabra mágica.

Llegué a la puerta, estaba abierta. Raro, alguna clase habría salido antes por la falta de algún docente. La provincia se estaba prendiendo fuego, la mayoría tenía menos ganas de estar en el colegio que nosotros.

No le presté atención. Crucé la puerta, libre. Indemne.

Y ahí estaba, como mi plaga bíblica personal… Jorge.

# play_sfx:tension
\- ¿Vos también saliste temprano, rarito?

-> magia_confrontacion

=== magia_enfrentar ===
# music:escuela_ambient
# shake # play_sfx:golpe
Defensa arriba. Mentón abajo. Eso era todo el entrenamiento que tenía para el combate. Es una lástima que lo había sacado de ver películas de boxeo de los ochenta.

El primer golpe pasó directo entre mis brazos y chocó en mi rostro. Dolor, humillación, el mundo se sentía como una calesita borracha.

¿En qué momento terminé en el piso?
# next: Te golpean
-> magia_confrontacion

=== magia_confrontacion ===
# music:escuela_ambient
# shake # flash_red # play_sfx:golpe
Intenté ponerme en posición fetal. No sirvió. Cada golpe era una explosión de dolor que se expandía por todo mi ser. Mi cuerpo temblaba, todo su cableado estaba mal, la adrenalina me sobrecargaba pero no podía pelear ni tenía adónde correr. La única opción que me quedaba era seguir tirado en el piso esperando que todo termine rápido.
# next: Otro golpe
# shake # flash_red # play_sfx:golpe
¿De nuevo de pie? ¿Por qué? Solo escucho un pitido en un oído y de fondo los gritos roncos de mis compañeros de clase. Quieren sangre, son como animales carroñeros desesperados por alimentarse de mi dolor, de las sobras que les deje Jorge.

Entre el mar de rostros está Julieta, llorando. Debería hacer algo.
# next: No te distraigas
# flash_red
Mi sangre en el piso. Esperaba más, y más roja, menos espesa. Creo que estoy disociando pero está bien. Debo escapar de mi cuerpo. Mi cuerpo es para que Jorge haga lo que quiera.
# next: Enojate. Deja de ser tan cobarde.
Creo que fue un grito de Julieta lo que me devolvió a mi cuerpo. Que se vaya todo a la mierda, me voy a ir con gloria al menos.

Extendí mi mano hacia Jorge en un intento de ¿parar sus golpes? ¿ahorcarlo? ¿mostrar que tenía espíritu de lucha?

Pero eso no fue lo relevante. Ahí lo sentí por primera vez. Empieza como una pequeña sensación de ingravidez en el estómago que se expande por todo el cuerpo.

Luego tus entrañas se licuan, es raro pero no doloroso. Como si tu cuerpo se estuviera preparando para purgarse.

# shake # flash_red # play_sfx:explosion_magica
Recuerdo el grito. Y toda esa energía (mi energía) saliendo por mi mano y mi boca.

# flash_yellow
Lo que viene después son flashes. La mancha de sangre donde antes había estado Jorge. Una compañera gritando, bañada en tripas. El dolor de garganta, creo que no pude hablar durante una semana. Las tardes en la cama del hospital.

Lo lógico es que me estén esperando un ejército de policías, jueces, periodistas. Pero todo se había desvanecido. Ni una noticia.

Ni siquiera una tumba para Jorge, y eso que pregunté.

El Faro me había encontrado.

~ apodo_personaje = "Chispa"
# stat:magia:+20 # stat:fuerza:+10 # stat:conocimiento:+10
# next
# play_sfx:stinger_magia
# CHAPTER_BREAK: title=Chispa, subtitle=Capítulo 0 — Orígenes, image=title_magia.jpg
-> intermision

// =========================================================
// ORIGEN 2: COMBATE IMPOSIBLE
// =========================================================

=== origen_combate ===
# music:horror_ambient
# achievement:unlock:centinela_combate
Mierda. Mierda. Mierda. La manija de la puerta se resbalaba en mi mano. Escucho a alguien llorar en el piso de arriba de la cabaña y yo no puedo abrir la puta puerta.

Me miro las manos. Están húmedas. Sangre. ¿De quién es esta sangre? ¿Miguel? ¿Claudia?

Intento limpiarme la sangre en el pantalón pero no sirve para nada, solo logré crear dos grandes manchas marrones en mis rodillas.

# play_sfx:pasos_monstruo
Pasos arriba. Pesados. Irregulares.
# next
Dios, es… es…
# next: No pienses en eso
* [Debo subir por las llaves. Estoy casi seguro que están en la habitación de María y Esteban.] -> combate_subir
* [Que se joda todo, yo solo quiero salir. Voy a saltar por una de las ventanas.] -> combate_ventana

=== combate_subir ===
# music:horror_ambient
La escalera es de madera y chilla en cuanto pongo mi pie en el primer escalón. Espero un segundo. En mi cabeza se repite el eco de los gritos de mi amigo agonizando, pero no pasa nada.

Por las dudas me saco las zapatillas, ato los cordones, y me las cuelgo al cuello. No sé si sirve o no, pero ser precavido no me va a matar.

(Lo que me va a matar es esa… cosa… que está en el piso de arriba alimentándose de mis amigos. Mierda.)

Cada escalón es una ruleta rusa. Un quejido de la madera, una posibilidad de morir.

Pero llego arriba de todo.

# flash_red
Lo veo por el rabillo del ojo. Su piel verdosa para camuflarse con el musgo y los tentáculos, húmedos y fuertes, abrazando el cadáver de lo que fue mi amigo.
# next: Cierra los ojos
PorfavorPorFavorPorFavor. No Quiero Morir.
# next: Abrí los ojos y avanza
Él está ahí pero no quiero mirarlo. Temo mirarlo y que sienta mis ojos recorriendo su cuerpo. Avanzo lentamente por el pasillo, como un ratón, como una presa. Amortigua mi avance el ruido de alimentación. De esa cosa comiéndose a mi amigo.
# next
Pero llego al cuarto de María y Esteban. Por suerte la puerta está abierta, esperándome.

El cuarto está completamente ordenado. La normalidad es insultante, como si la cabaña no le hubiese afectado nada de lo que pasó.

Solo se ven unas hojas que entraron por la ventana, que sigue abierta.

Cuando todo se fue al carajo Esteban intentó escapar tirándose por ahí. Una caída de 4 metros. Suena poco, pero su tobillo no opinó igual.

Las llaves estaban sobre el escritorio. Era cuestión de agarrarlas e irme.

Vuelvo sigilosamente al pasillo.

No está. El pasillo está vacío. Solo dejó el cadáver de ¿Carla? No importa, mantengo la imagen en el rabillo del ojo y avanzo. Escalera. Puerta y libertad.

Me muevo con toda la pausa posible pero mi corazón está a punto de estallar dentro de mi pecho. ¿Se podrán escuchar mis latidos? ¿Es lo que me va a delatar?

La escalera no se queja mientras bajo. Meto la llave y abro la puerta con un pequeño click.
# next
# play_sfx:rugido_monstruo
Pero escucho otro ruido atrás mío, justo en la cima de la escalera. No tengo que voltearme para saber qué es. Eso… está listo para cazarme.

-> combate_persecucion

=== combate_ventana ===
# music:horror_ambient
# shake # play_sfx:vidrio_roto
Salto por la ventana en una explosión de madera y vidrio. Y ruido, mucho ruido. No tengo que darme vuelta para saber que… eso… notó mi presencia.

-> combate_persecucion

=== combate_persecucion ===
# music:chase_ambient
Correr por el bosque no es tan fácil. Las ramas azotan tu rostro y las raíces amenazan tus tobillos.

Aparte no hay camino. Todo lo que estamos acostumbrados a usar en la ciudad para guiarnos (calles, esquinas, avenidas) no existe, con suerte algún parche de tierra a la vista o unas hierbas dobladas que dan cuenta de un sendero.

Pero no importa. Mi corrida no tenía lógica. Era una huida hacia la nada. Atrás mío escuchaba el golpeteo irregular de la criatura persiguiéndome, una mezcla entre correr y caminar dependiendo si prefería avanzar en dos extremidades o si también usaba el apéndice que salía de su torso (¿brazo? ¿pierna? ¿bra-na?) para impulsarse.

# shake
Una raíz casi me hace perder el equilibrio. Trastabillo y siento sus ¿tentáculos? rozando el borde de mi camisa. Debo seguir. Puro instinto. Debo correr rápido.
# next: Corre rápido!
# shake # flash_red
Pero no fue suficiente. Antes de darme cuenta estaba con la cabeza en el piso sufriendo una oleada de dolor que superó a la carga de adrenalina en mi cuerpo.

Recordaba los gritos de dolor de mi amigo muriendo en el piso de arriba de la cabaña. Le temía a la muerte, le temía más al dolor. Pero simplemente no podía más.
# play_sfx:disparo # flash_yellow
El ruido hizo eco por todo el bosque. La… cosa… chilló atrás mío. Sonó como estática de radio a todo volumen, como el ruido original del universo. Y sentí la tierra temblar abajo mío cuando su cuerpo cayó al piso.

Los agentes de "El Faro" habían llegado. Una hora antes, y todos mis amigos seguirían vivos. Unos minutos después, y yo sería un cadáver.

Me levanté con una misión. Yo sería quien llegaría siempre una hora antes.

~ apodo_personaje = "Madrugador"
# stat:magia:+10 # stat:fuerza:+20 # stat:conocimiento:+10
# next
# play_sfx:stinger_fuerza
# CHAPTER_BREAK: title=Madrugador, subtitle=Capítulo 0 — Orígenes, image=title_fuerza.jpg
-> intermision

// =========================================================
// ORIGEN 3: CONOCIMIENTO PROHIBIDO
// =========================================================

=== origen_conocimiento ===
# music:misterio_ambient
# achievement:unlock:centinela_conocimiento
\- No sé si me siento cómodo robando un libro.

\- No lo pienses tanto como que lo estamos robando, prefiero decir que lo estamos liberando – dijo Julieta mientras su sonrisa dejaba ver los hoyuelos que me metieron en tantos problemas.

Estábamos en la terraza del edificio, desde nuestra posición la ciudad de noche era un mar de luz, ruido y velocidad. En el edificio de al lado estaba la Mansión de los Ayacucho Olavarría quienes tenían la suficiente fortuna como para tener la mayor colección de obras sobrenaturales de este lado del Ecuador.

En su biblioteca estaba "La Última Colección", donde se recopilaban las profecías nunca publicadas de Solari Parravicini.

\- Pensalo así, antes que amanezca vamos a estar en nuestra habitación leyendo profecías secretas. Preferentemente desnudos. – Me animó Julieta.

\- Espero que tenga información sobre los números de la lotería. O al menos dónde invertir en bolsa. O tal vez solo son un montón de dibujos raros y palabras crípticas que sirven para que cada lector le dé el significado que quiere.

\- Ahhh – escuché a Julieta quejarse atrás mío – Siempre con lo mismo. Ya sé cuál es tu postura respecto a las profecías.

* [Están escritas en piedra. Solo queda aceptarlas y ver cómo usar el conocimiento para surfear lo que vendrá.] -> conocimiento_accion
* [El futuro es siempre cambiante. La mera idea de observarlo lo cambia. Sirven más como curiosidad histórica.] -> conocimiento_accion

=== conocimiento_accion ===
# music:misterio_ambient
Bueno, dejemos de dar vueltas y pasemos a la acción.

Entre las dos terrazas había una distancia de cinco metros. Llevábamos meses practicando para saltar esa distancia. Pero las prácticas habían sido sobre tierra, en cambio ahora teníamos una caída de 50 metros que hacía ver todo más real.
# next: Tomar carrera y saltar
# shake # play_sfx:aterrizaje
Caí haciendo un escándalo sobre el techo. Julieta a mi lado lo hizo con un mayor nivel de gracia. Mientras yo era una bolsa de papas ella era una felina.

Al fin del techo estaba la puerta que daba a la escalera de servicio, y la cual contaba con el mejor sistema de seguridad que el dinero podía comprar.

\- Por suerte hace semanas vengo estudiando un Hex en el libro negro exacto para esta situación – dijo Julieta mientras sacaba un pequeño cristal de su morral y empezaba a recitar algo en un idioma desconocido, con cierto aire a Asia Central.

# play_sfx:magia_hex
Julieta terminó de hablar e inmediatamente lo sentimos. El atronador silencio que se da cuando el ruido de fondo de cientos de maquinarias, que uno está acostumbrado a tolerar, de repente se detiene.

\- Un simple Hex – dijo mientras me volvió a mostrar la sonrisa y los hoyuelos problemáticos.

# flash_dark
Segundos después, ese silencio se fue expandiendo y a nuestro alrededor vimos como la oscuridad se iba comiendo a toda la ciudad. Dejándola silenciosa y sin energía eléctrica.

Como es común en estos casos, el silencio duró unos segundos para dar paso a una cacofonía de insultos y golpes de cacerolas.

\- Tal vez pronuncié mal alguna palabra – dijo Julieta poniendo cara de una nena atrapada en una travesura.

* [Viendo los mapas noto que una habitación de este piso tiene una caja fuerte. Sería interesante hacerle una visita.] -> conocimiento_caja
* [Mantengamos todo fácil. Directo a la biblioteca.] -> conocimiento_biblioteca

=== conocimiento_caja ===
# music:misterio_ambient
Lo importante es que ya no había sistema de seguridad, así que me podía poner tranquilo con mis ganzúas a trabajar para abrir la puerta.

Avanzás por la mansión. Las cámaras de seguridad, ya sin energía, están en cada esquina apuntando hacia el piso. Cadáveres de ojos tecnológicos ya sin nada que hacer.

Unos pequeños destellos de luz de luna se filtran entre las cortinas que tapan la mayoría de las ventanas. Suficiente luz para no chocarte con ningún mueble.

El lugar está en silencio. No hay pasos de guardias nerviosos ni gritos de gente quejándose. Te sorprende que el lugar no esté lleno de personas o tenga un plan para este tipo de imprevistos.

Pero bueno, los Ayacucho Olavarría son obscenamente ricos y ese tipo de personas tiende a ser intocable. Eso les da un sentimiento de seguridad y soberbia que puede convertirse en una debilidad.

Abrís lentamente la puerta de la habitación a la par que una ráfaga de viento mueve la cortina y deja entrar un poco de luz.

Esta habitación denota dinero. Dinero viejo, el que viene con estilo y reglas de etiqueta. Llegás a notar en una esquina una cama con dosel, una pared decorada con una sucesión de cuadros que tranquilamente podrían tener su propia ala en el Museo de Bellas Artes, y una estatua de mármol de Venus naciendo (¿Quién diantres tiene una estatua en su pieza?).

\- Antes de irme quiero probar esa cama – susurra Julieta atrás tuyo, mientras en su voz se denota la mezcla de emoción y temor que caracteriza una buena aventura.

\- Debemos ser rápidos e ir al punto.

\- Siempre decís lo mismo – su risa rebota por el lugar y te da temor que alguien la escuche.

Mientras la parte racional de tu cerebro intenta forzar la caja fuerte, el resto empieza a pensar cómo gastar el dinero que todavía no conseguiste. Te imaginás tomando un daiquiri en algún lugar con arena blanca y aguas cristalinas mientras Julieta, por puro hábito, intenta estafar a algún turista gringo gordo y tonto.
# next: A hacerse rico
# play_sfx:caja_fuerte
Una vez abierta la caja fuerte no te encontrás con oro o pilas de dólares. Solamente hay un paquete con (considerable) cantidad de cocaína, una pistola (agradecés tener guantes para no dejar tus huellas digitales en lo que seguramente es un arma asesina) y un pequeño relicario con la foto de quien suponés que es la madre del dueño de la mansión.

# play_sfx:puerta
Entonces escuchás la puerta abriéndose detrás de ti.
# next: Te das vuelta
-> conocimiento_confrontacion

=== conocimiento_biblioteca ===
# music:misterio_ambient
Después de abrir la puerta de la biblioteca y esperar unos segundos para escuchar si había alguien dando vueltas, no quedó otra opción que prender la linterna. La biblioteca está ubicada en el corazón de la mansión, un cuarto de dos pisos más grande que cualquier casa que conocés.

Te basta un recorrido de los estantes con la linterna para darte cuenta que no tenés la más mínima idea de cómo vas a hacer para encontrar el libro que estás buscando.

\- Mi abuela tenía razón. Tendrías que haber hecho el curso de bibliotecaria – susurra Julieta atrás tuyo.
# next
\- Nunca hubieses aprobado, no te podés quedar callada más de cinco minutos.

\- Nunca te escuché quejarte antes – su risa rebota por el lugar y te da temor que alguien la escuche.

Julieta camina hacia uno de los estantes del fondo con una seguridad sorprendente mientras va contando los pasos.

\- Es curioso – dice Julieta – en los planos esta habitación es unos metros más larga. No soy tan idiota como para no saber detectar una pared falsa.

Acto seguido empieza a sacar todos los libros de ese estante hasta que, a la par que una pequeña pila de libros descansa a sus pies como cadáveres de pequeños entes del conocimiento, se escucha un click.

# play_sfx:puerta_secreta
Un estante se mueve unos centímetros y deja una puerta al descubierto.
# next: Misión completa
La habitación es pequeña. Solo contiene un pequeño atril en el cual está colocada "La Última Colección" donde se recopilaban las profecías nunca publicadas de Solari Parravicini.

El cuarto pequeño y de madera te hace acordar a un ataúd. Instintivamente te colocás delante de Julieta mientras pensás en la necesidad de buscar por trampas o alarmas secretas.

# play_sfx:puerta
Entonces escuchás la puerta abriéndose detrás de ti.

-> conocimiento_confrontacion

=== conocimiento_confrontacion ===
# music:misterio_ambient
El heredero de los Ayacucho Olavarría está en el marco de la puerta. A pesar de que son dos contra uno (y él está vestido solamente con una bata y unas pantuflas) en su rostro hay una sonrisa de diversión, como un padre que está jugando a un juego con su hijo que sabe que fácilmente puede ganar.

# play_sfx:magia_oscura
Antes que te des cuenta su mano recorre un patrón extraño en el aire mientras pronuncia unas palabras. Las palabras no tienen sentido, al menos no en el área de lo racional, pero algo en tu cerebro las entiende.

# shake
De repente estás completamente inmovilizado. Tu cuerpo se encuentra duro y se niega a responder cualquier orden. Hasta respirar, algo tan mecánico y natural, se vuelve complicado. Como si un gran peso estuviera oprimiendo tu pecho.

\- ¿Qué tenemos acá? ¿Ratoncitos que salieron de su cueva para mordisquear mis pertenencias?

* [Intentás moverte. No vas a ser vencido por una persona con bata y pantuflas.] -> conocimiento_resistir
* [No hacés nada. Veamos qué pasa.] -> conocimiento_esperar

=== conocimiento_resistir ===
# music:misterio_ambient
# shake
Te esforzás por moverte, pero solo conseguís un punzante dolor de cabeza que se vuelve cada vez más filoso. El pánico empieza a carcomerte. ¿Qué pasa si nunca más recupero el control de mi cuerpo? ¿Moriré de inanición?

Intentás alguno de los ejercicios de respiración que te enseñó Julieta para contener el miedo pero ni siquiera tenés control de cómo respirás.

Estás encerrado en tu cuerpo, con tu miedo como único compañero de celda.

-> conocimiento_final

=== conocimiento_esperar ===
# music:misterio_ambient
Ayacucho Olavarría sale de tu campo de visión, ni siquiera podés mover tu ojo para ver adónde va. Tu vista está clavada en el marco de la puerta, ahora vacía, y en la nuca de Julieta.

Lo escuchás caminar, canturrear algo, un poco de ruido de vidrio. La incertidumbre te vuelve loco, estás completamente consciente de que estás totalmente a su merced.
# next
-> conocimiento_final

=== conocimiento_final ===
# music:misterio_ambient
Ayacucho Olavarría vuelve a aparecer en tu campo de visión, con una copa de Brandy en la mano.

\- A ver qué tenemos acá, y qué provecho le podemos sacar a esta situación.

Da una vuelta alrededor de Julieta, apreciándola como quien analiza comprar un mueble caro o un departamento de lujo.

Luego se da vuelta y te mira con el mismo desprecio que se guarda para algo que se tira a la basura.

\- Para ella se me ocurren un par de usos, pero vos no me aportás nada realmente…
# next
# play_sfx:magia_oscura
De nuevo, sus manos hacen un firulete en el aire mientras sus labios se mueven. Las palabras no son procesadas por tu cerebro consciente, pero generan su efecto.
// TODO: crudo label "EFECTO DE CAIDA / ROTURA / CRASHEO" — revisar VFX como evento al click
# shake # flash_dark # play_sfx:crasheo
Luego todo, simplemente… se rompe.
# next
No recordás mucho de lo que pasó después. Durante la mayor parte de un año estuviste ocupado volviendo a aprender cosas básicas. Como caminar y como hablar.

Hasta tuvieron que volver a enseñarte cómo usar tus esfínteres.
# next
De Julieta no tuviste más noticias. En cuanto pudiste volver a usar tus dedos intentaste ponerte en contacto con amigos en común pero ella se desvaneció del mapa.

Parece que los agentes de "El Faro" recorren rutinariamente los neuropsiquiátricos. A veces hay poca diferencia entre una esquizofrenia y haber corrido la cortina para ver el mundo sobrenatural que se esconde detrás.

Ellos te ofrecieron un trabajo y una nueva oportunidad y no pensás desperdiciarla. Es más, tal vez hasta tengas espacio para la venganza.

~ apodo_personaje = "Ratoncito"
# stat:magia:+10 # stat:fuerza:+10 # stat:conocimiento:+20
# next
# play_sfx:stinger_conocimiento
# CHAPTER_BREAK: title=Ratoncito, subtitle=Capítulo 0 — Orígenes, image=title_conocimiento.jpg
-> intermision

// =========================================================
// INTERMISIÓN 0: HUB DE COSTA ALEGRE
// =========================================================

=== intermision ===
~ capitulo_actual = "Intermisión"
// Determine room image from origin × trauma × max stat
{
- apodo_personaje == "Chispa" && traumado && magia >= 40: ~ habitacion_img = "hab_magia_max_trauma"
- apodo_personaje == "Chispa" && magia >= 40:             ~ habitacion_img = "hab_magia_max"
- apodo_personaje == "Chispa" && traumado:                ~ habitacion_img = "hab_magia_trauma"
- apodo_personaje == "Chispa":                            ~ habitacion_img = "hab_magia"
- apodo_personaje == "Madrugador" && traumado && fuerza >= 40: ~ habitacion_img = "hab_fuerza_max_trauma"
- apodo_personaje == "Madrugador" && fuerza >= 60:             ~ habitacion_img = "hab_fuerza_max"
- apodo_personaje == "Madrugador" && traumado:                ~ habitacion_img = "hab_fuerza_trauma"
- apodo_personaje == "Madrugador":                            ~ habitacion_img = "hab_fuerza"
- apodo_personaje == "Ratoncito" && traumado && conocimiento >= 40: ~ habitacion_img = "hab_conocimiento_max_trauma"
- apodo_personaje == "Ratoncito" && conocimiento >= 40:             ~ habitacion_img = "hab_conocimiento_max"
- apodo_personaje == "Ratoncito" && traumado:                ~ habitacion_img = "hab_conocimiento_trauma"
- apodo_personaje == "Ratoncito":                            ~ habitacion_img = "hab_conocimiento"
}
# CHAPTER_BREAK: title=Costa Alegre, subtitle=Intermisión, image={habitacion_img}.jpg, music=city_ambient
# music:city_ambient

// ---- Texto contextual según progreso ----
{
- misiones_completadas == 0:
    Costa Alegre es una importante ciudad con costas al Atlántico Sur. Durante el verano es un centro vacacional importante pero, durante el resto del año, la industria pesquera y la presencia de una Universidad garantiza que se mantenga poblada.
    # next
    En esta ciudad, haciéndose pasar por un olvidado edificio administrativo en el fondo del campus universitario (ahí donde el pasto bien cortado deja espacio a la maleza) se encuentra uno de los cuarteles de "El Faro".

    "Marcando un camino seguro para la humanidad", ese es su lema. En igual parte estudiosos y milicia, "El Faro" se encarga de monitorear todas las amenazas sobrenaturales que se ciernan sobre la humanidad y, cuando se vuelven muy peligrosas, asegurar que lleguen a un final.

    Sus agentes son de los más variopintos, desde intelectuales que son la personificación de "la curiosidad mató al gato" hasta víctimas de seres sobrenaturales que están cobrando su venganza. Algunos son verdaderos monstruos buscando la redención.
    # next
    # next
    Y, claro, también estás vos.
- misiones_completadas == 1:
    Te despertás a las tres de la mañana. Hace un par de días te acosa una pesadilla donde te estás ahogando en un mar de sangre y sentís, rozando tus pies, que una gran entidad marina está dando vueltas. Jugando con vos, esperando el momento para atacar.
    Ya que tu psiquis se niega a dejarte dormir, decidís verlo como una mejora y hacer más cosas. Tu departamento nunca estuvo tan limpio. Aprovechás para hacer ejercicio, meditar para centrar tu mente y leer todos los libros que pudiste pedir prestados de la sede de El Faro.
    # next
    En tu pasada misión pudiste entregar la mano de un cadáver que había sido usado como sacrificio humano. Esperabas que con ese elemento, un concilio de científicos y magos pueda rastrear a la secta que está detrás de todo en un extraño pacto con seres que habitan en el fondo del mar.
    Sea lo que sea que los genios de El Faro decidan hacer, iba a tomar tiempo. Sin duda vas a tener algunas otras misiones urgentes para entretenerte hasta que haya una nueva pista sobre la secta.
}

# next
Abrís la ventana de tu departamento y entra un poco de aire acompañado por el olor a sal del agua salada. El viento trae unos gritos de diversión y alegría.
Te queda un poco de tiempo para tu siguiente misión. Tal vez podés hacer algo antes de ir.
¿Qué querés hacer?

// ---- Opciones del hub ----

+ [Bajar a la playa] -> intermision_playa

+ [Recorrer el filo entre lo normal y lo sobrenatural # REQUIRES: misiones_completadas >= 1]
{
- misiones_completadas == 1: -> inter_tarot
}

+ [Ayudar a un aliado # REQUIRES: misiones_completadas >= 1]
{
- misiones_completadas == 1: -> inter_jesus
}

+ [Ir a la enfermería # REQUIRES: misiones_completadas >= 1] -> inter_enfermeria

+ [No hay razón para dar vueltas. Ir directo a mi siguiente misión]
{
- misiones_completadas == 0: -> capitulo_1
- misiones_completadas >= 1: -> inter_misiones
}

=== intermision_playa ===
# music:playa_ambient
{
- misiones_completadas == 0:
    Bajás a la playa y disfrutás un poco del sol golpeando tu cuerpo. Cuando el calor se vuelve insoportable podés ir al mar a refrescarte un poco.

    Te sumás con un par de desconocidos a jugar un partido de volley en la arena y terminás la jornada tomando un trago en la barra de un bar costero viendo el horizonte.

    La vida es buena. Pero no podés ignorar que a lo lejos se ven, amenazantes, un frente de nubes de tormentas.
- misiones_completadas == 1:
    El mar está picado hoy y lo acompaña una garúa. La mayoría de las personas en la playa son turistas que, a pesar del clima, quieren hacer valer su dinero y vienen a sentir un poco de arena entre los dedos de los pies.
    # next
    A cincuenta metros notás que el mar devolvió algo. Tu visión se vuelve de túnel y lo notás. Otro cuerpo con las horribles marcas de tortura y la extraña escritura que acompaña a los sacrificios humanos. ¿Cómo puede ser que nadie está gritando? ¿Llamando a la policía? Una pareja camina a su lado como si nada, un par de niños está corriendo atrás de un vendedor de churros...
    # shake
    ¡¿ESTÁN TODOS CIEGOS?!
    # next
    Te refregás los ojos durante unos minutos y volvés a ver bien. Es solo un tronco con un poco de algas marinas.
    Este trabajo está empezando a afectar tu salud mental.
}
# next
{
- misiones_completadas == 0: -> capitulo_1
- misiones_completadas >= 1: -> inter_misiones
}

=== capitulo_1 ===
~ capitulo_actual = "Cap. 1 — Un cadáver sin nombre"
# CHAPTER_BREAK: title=Un cadáver sin nombre, subtitle=Capítulo 1, image=title_cap1_cadaver.jpg, music=misterio_ambient
# inv:clear_mission
# achievement:unlock:primer_caso
# music:misterio_ambient
La sede de "El Faro" estaba en el fondo de un predio universitario. A esa hora de la noche era un mundo aparte. A lo lejos se escuchaban los ruidos de algunos universitarios, festejando haber aprobado alguna materia o pensando a qué fiesta ir más tarde.

+ [Me gustaría ser como ellos]
+ [Ingenuos. Todo su conocimiento es una sombra de la verdad]

- Cómo seas. Estaba frente a la puerta de la sede de "El Faro". Una mole sin ventanas con una puerta gigante de dos hojas. En una se veía un Faro gigante emanando su luz y en la otra se representaba un mar embravecido.
# next
Más tiempo pasás mirando la puerta más te das cuenta de figuras raras entre las olas. Ojos. Manos. Colmillos. Cosas que no podés definir. Te preguntás qué pensarán los estudiantes que se alejan (a fumar un porro o tener algo de intimidad) cuando ven esta puerta.
# next
Faltan cinco minutos para la hora en que te citaron para darte una misión de campo. Hasta ahora solo te estuviste encargado de tareas menores y misiones de apoyo. 
¿Qué hacés?

+ [Espero hasta la hora pactada] -> entrada_puntual
+ [Al mal trago darle prisa. Abro la puerta] -> entrada_temprana_k

=== entrada_puntual ===
~ entrada_temprana = false
-> hall_central

=== entrada_temprana_k ===
~ entrada_temprana = true
-> hall_central

=== hall_central ===
# music:escuela_ambient
El hall central es un cuarto gigante, en el cual en el piso está representado el mismo logo que la puerta. A pesar de que el edificio no tiene ventanas el clima es agradable y no está viciado.
# shake
No es necesario ser un gran practicante de magia para darse cuenta de la gran cantidad de magia defensiva que hay en el lugar. Lo sentís como un dejo de gusto amargo en tu boca.
# next
El único ruido proviene del escritorio de la secretaria, la Sra. Enríquez, que está tipeando algo en su máquina de escribir.

+ [¿Por qué no pasamos a computadoras?]
    { entrada_temprana:
        — El tiempo no es una construcción social que todos intentamos acatar. En especial cuando se realiza tareas complejas. Y todas las tareas de El Faro son complejas.
        Enríquez te da una mirada que te hace sospechar que el título de "secretaria" es menospreciar la totalidad de su capacidad.
        Intentás justificarte pero levanta la mano para callarte. Un gesto simple pero efectivo.
        — Tal vez la hora de tu llegada era clave y al adelantarte arruinaste todo. Que no se repita, por favor.
    - else:
        Enríquez deja de tipear y te mira por encima de sus anteojos.
    }
    — Yo ya trabajaba acá cuando cualquier mago de todo por dos pesos intentaba mezclar la protección astral con internet. Después del incidente del 2007 pasé a medios totalmente analógicos.
    -> mision_profe

+ [Toser un poco hasta que ella se fije en vos]
    Enríquez te mira. Mira el reloj. Y te ignora hasta la hora exacta en la cual fuiste citado.
    — Guardián, voy a asegurarme de descontar de su próximo sueldo las sumas necesarias para comprarle un reloj.
    -> mision_profe

=== mision_profe ===
# music:misterio_ambient
- — El Profesor lo espera en el piso de arriba para darle su primera misión de campo. Por favor, no la arruine. Ya llené un formulario con sus datos y no quiero perder tiempo destruyendo el formulario… y llenando los formularios correspondientes para justificar la destrucción de documentación.
# next
El Profesor, Enríquez. Ninguno era un nombre real. Todos los guardianes de El Faro usan alias para proteger su vida civil.
Vos también. ¿Cuál es?
# next
# input:nombre_personaje:Tu nombre en clave...
# next
— Bienvenido {nombre_personaje}. Lo estaba esperando.
El Profesor tiene una barba tan tupida como calva es su cabeza, usa un saco con pitucones y está fumando una pipa. No sabés si el hombre se convirtió en el alias o si es el apodo mejor puesto en la historia de la humanidad.
# next
La oficina del profesor es pequeña y acogedora. Estantes con libros van del piso al techo y el grueso de la habitación está ocupado por su escritorio de caoba.
Tal vez sea la alfombra y el techo rojo, pero algo te da la sensación de que estás dentro de algo vivo. Cómo un corazón. Hasta sentís un palpitar rítmico a lo lejos.

+ [Usar magia para espiar que pasa]
    { magia >= 20: 
        Intentás sintonizar con el pulso del lugar, pero una mano mental te empuja suavemente.
    }
    — No lo hagas — dice el profesor con un tono tranquilo mientras te guiña el ojo — mejor no ser tan curioso. Menos cuando se es el gato.
    -> tema_cadaveres

+ [Fijarse si hay un patrón en el orden de los libros]
    { conocimiento >= 20:
        Notás que los lomos forman una secuencia geométrica, pero es demasiado compleja para descifrarla rápido.
    }
    — No lo hagas — dice el profesor con un tono tranquilo mientras te guiña el ojo — mejor no ser tan curioso. Menos cuando se es el gato.
    -> tema_cadaveres

+ [Mejor no arruinarla frente al jefe]
    Decidís mantener la compostura. El Profesor asiente, satisfecho con tu disciplina.
    -> tema_cadaveres

=== tema_cadaveres ===
# music:misterio_ambient
— Hace tiempo que están apareciendo cadáveres en las playas de Costa Alegre, horribles cadáveres – El Profesor se toma unos momentos para fumar de su pipa – su piel denota un patrón de dolor. Alguien se toma el trabajo de marcar signos y runas en su cuerpo antes de degollarlos y arrojarlos al mar.
— ¿Pudimos adivinar de qué se trata en base a las runas? – Te mordés la lengua en cuanto terminás de hacer la pregunta.
# next
— Tenemos un equipo trabajando en eso. Alguien tira los cadáveres marcados al mar…. y el mar los devuelve. Pueden ser marcas para que lo que sea que vive en el fondo del mar detecte al cuerpo. Tal vez una especie de ritual, o un diálogo.
— ¿Un diálogo en la piel de un cadáver?
— Cadáveres que hasta no hace tanto eran personas – El Profesor te mira a los ojos y sube un tono la voz – Es nuestra ciudad, las personas que debemos cuidar, y alguien los está sacrificando.
# next
Muchas cosas acechan a los humanos. Nuestros fluidos, nuestra carne, nuestras emociones. Para la mayoría de los seres sobrenaturales no estamos en la cima de la pirámide alimenticia.
Aun así, los sacrificios humanos son un gran NO. Generalmente significa que algo consiguió armar una organización de humanos que lo apoye y está acumulando poder. Sea lo que sea, ya te imaginás yendo directo a la cueva oscura y llevarlos ante la justicia.
# next
— Tu trabajo es recolectar información en el campo. El día de ayer apareció un nuevo cuerpo en la costa y fue llevado a la morgue de la ciudad. Hasta ahora es un NN, sería de gran ayuda que vayas y nos consigas cualquier tipo de información.
Estamos teniendo problemas con los cuerpos, muchos tienen la tendencia a desaparecer.
— ¿Cómo que se levantan y andan?
— Como que alguien se los lleva. Hasta ahora perdimos tres cuerpos. Uno retirado por una figura misteriosa, los otros dos arrancados de las ambulancias.
# next
Tu primera misión. Sacrificios humanos, cadáveres, figuras misteriosas. ¿Estás a la altura?

+ [Obviamente. Llegó mi momento de brillar.] -> en_la_morgue
+ [No, voy a terminar muerto.]
    — Disculpe Profesor, pero esta misión suena un poco peligrosa para mí. ¿No sería conveniente que usted arregle el problema?
    El Profesor suspira. — La ventaja de estar en esta oficina es que podés tener el plano general. Créame guardián, cuando yo salgo es para algo más importante. Vaya a la morgue y vuelva con un informe que no me haga arrepentir.
    -> en_la_morgue
+ [Pedir ayuda antes de salir] -> pedir_ayuda

=== pedir_ayuda ===
# music:misterio_ambient
— Tenemos tres guardianes en la sede que podrían ayudarte...
+ [Hablar con Enríquez (Sabiduría)] -> ayuda_enriquez
+ [Entrenar con Cabral (Fuerza)] -> ayuda_cabral
+ [Visitar a Mary Shelley (Magia)] -> ayuda_shelley

=== ayuda_enriquez ===
# music:misterio_ambient
# achievement:unlock:conociste_enriquez
Antes de salir pasás por su escritorio. Ella sigue tipeando en su máquina de escribir en un claro intento de ignorarte. Cada paso que das, tipea con más fuerza.
— Perdón — tenés que levantar la voz para ganarle al quejido mecánico de las teclas — Voy a salir a mi primer misión de campo y El Profesor recomendó…
# next
— Que te brinde el 101 de cómo hacemos las cosas en El Faro. Era altamente probable, no sos tan especial.
Enríquez termina su frase sacando un libro grueso de uno de los cajones. Al caer sobre el escritorio el golpe hace eco por todo el edificio. No podés obviar que el libro tiene el grueso de una guía telefónica. Una guía telefónica de una ciudad poblada.
# next
Hojeás el libro y hay capítulos enteros dedicados a "Abrir cerraduras", "Anatomía humana e inhumana" y "Alimentar a animales salvajes". Rápidamente te das cuenta de que El Faro tiene un manual y recomendaciones para casi cualquier acción.
También notás que todas las recomendaciones en ese manual son de palabras que empiezan con A.
— Tranquilo — dice Enríquez mientras no puede contener una sonrisa — El manual que corresponde a la letra X es bastante más corto.
# next
Leés sobre la sabiduría de los anteriores Guardianes de El Faro. Aprendés mucho de sus aciertos y forma de hacer las cosas. Aprendés más de las notas al pie que dan cuenta de sus errores.
# stat:conocimiento:+5
# next: En la morgue
-> en_la_morgue

=== ayuda_cabral ===
# music:misterio_ambient
# achievement:unlock:conociste_cabral
El campo de entrenamiento se encuentra en el subsuelo del edificio. Es una mezcla ecléctica entre un dojo, un gimnasio y un campo de tiro ubicado aún más abajo. Cabral se encuentra de espaldas pero, en cuanto ponés un pie en el dojo, se da cuenta de tu presencia.
— Bienvenido Guardián. Es tu primera vez en el campo de entrenamiento, así que la tradición dicta que tengamos un sparring amistoso.
# next
Cabral no parece gran cosa, un hombre pequeño de piel oliva que parece evitar el contacto visual. No podés ignorar que una de las mangas de su judogi cuelga vacía. No sabías que había perdido un brazo en el ejercicio de su deber. Eso explica que uno de los mejores Guardianes haya terminado asignado a la base.
Es un manco, esto no va a ser difícil.
# next
Es difícil. Eso es lo que pensás la tercera vez que Cabral te tira al piso. Para la quinta vez, que terminás hecho un bollo sobre vos mismo luego de que una certera patada en el esternón te dejó sin aire, recibís una buena dosis de humildad.
# next
— Buen entrenamiento Guardián. Vamos a tomar unos mates y descansar un poco. Aunque no te des cuenta aprendiste mucho hoy. Y yo aprendí de vos, así que voy a poder adaptar un entrenamiento para fortalecer tus ventajas y enseñarte a esconder tus debilidades.
# next
Cabral te somete a una sesión de entrenamiento completa. Practican un par de golpes y terminan con una pequeña visita al campo de tiro. Te sentís más preparado para enfrentarte a lo que sea.
# stat:fuerza:+5
# next: En la morgue
-> en_la_morgue

=== ayuda_shelley ===
# music:misterio_ambient
# achievement:unlock:conociste_shelley
Antes de abrir la puerta del laboratorio te golpea una mezcla fuerte de olor a desinfectante, propio de cualquier hospital, con una mezcla de hierbas que no podés descifrar pero te parecen más propias de la cocina de una abuela.
Adentro el cuadro es aún más caótico. Mientras en una esquina tenés equipo médico moderno, en la otra hay cristales y pentagramas. En una de las camillas se encuentra un cuerpo (tapado por una sábana por suerte) y por el bulto que se puede ver, notás que no es algo humano.
# next
— ¿Sos el nuevo conejillo de indias? — una voz chillona llama tu atención. Mary Shelley sale detrás de un biombo. Lo primero que te sorprende es lo joven que es. La mujer no puede tener más de treinta años y ya es una mente respetada.
Una mente respetada que viaja en un cuerpo de metro cincuenta y tiene un pelo caótico donde pelean mechones azules, rosas y lo que suponés que es un color castaño natural.
# next
— Buenos días, estoy por salir a mi primer misión de campo y pasaba a ver si había algo que tenías ganas de probar, algo que tal vez me pueda dar una ventaja en la misión.
— Eso también me sirve — Mary Shelley te pasa un formulario que firmás sin ver — Genial, muy bien que firmaste todas las formas. Si te llega a pasar algo voy a intentar revivirte por todos los medios posibles. Y si llegás a morir tu cuerpo pasa a ser propiedad del Ministerio.
# next
Mary Shelley te clava una aguja llena de una sustancia de un verde antinatural que no te inspira confianza. Según dice, es una sustancia ya probada para relajar barreras psicológicas y culturales. Una de las grandes dificultades para acceder a la magia en el mundo moderno es que subconsciente estamos educados para rechazarla. Esta inyección soluciona eso.
# next
Luego del mareo inicial te sentís mejor que nunca. Tus sentidos se sienten más despejados y estás plenamente consciente de todo rincón de tu cuerpo. Te da la impresión de que toda tu vida estabas cargando un peso extra invisible y ya no está.
# stat:magia:+5
# next: A la morgue
-> en_la_morgue

=== en_la_morgue ===
# music:terror_ambient
El palacio de justicia era, bueno, un palacio. Una mole de diez pisos de mármol y cemento donde alguien había decidido agregar una serie de gárgolas a medio camino que miraban de forma amenazante a la Avenida.
La morgue judicial se encontraba en algún lugar de este edificio. Por suerte El Faro les daba a sus guardianes una identificación relativamente vaga que permitía hacerse pasar por agentes de alguna organización gubernamental. Eso, una buena camisa y caminar rápido, era suficiente para engañar a todos los policías que estaban vigilando el lugar a esa hora de la madrugada.
# next
Las entrañas de la bestia eran… pobres. La mayoría del mobiliario parecía más viejo que vos y la mitad de las lamparitas titilaban de cansancio. Nadie se había molestado en poner un mapa así que tuviste que preguntar dos veces la dirección (a un empleado ojeroso que caminaba un pasillo oscuro y a un empleado de limpieza que evitaba hacer su trabajo).
Aparentemente la morgue judicial estaba en el segundo subsuelo, pero para llegar a ese subsuelo había que tomar una escalera que por alguna razón empezaba en el segundo piso. Solo esperabas no tener que salir huyendo de ese lugar, era un verdadero laberinto.
# next
Por fin llegaste. La puerta de la morgue estaba al final de un pasillo largo, donde esperaba un escritorio con un agente gordo de la policía cuya doble papada estaba iluminada por la luz de su celular.
Aun así, preferiste avanzar a pasos lentos y ruidosos. El policía no parecía la gran cosa pero la escopeta que estaba apoyada contra la pared, a distancia de su brazo, encomendaba respeto.
Por suerte la identificación que te había otorgado El Faro bastó para pasar por el control.
# next
La morgue, en esencia, es un depósito pero para cadáveres. Frente a la puerta había un escritorio con una computadora.
A la izquierda había un par de camillas (vacías por suerte) y una serie de instrumentos médicos. Al fondo había una pared llena de pequeñas puertas del piso al techo. Si algo te había enseñado el cine, es que esas eran las cámaras frigoríficas donde se depositaban los cuerpos.
Lo que no esperabas es que sean tantas. ¿Cómo ibas a hacer para encontrar el cuerpo?

+ [Rastrear energía mágica residual] -> buscar_magia
+ [Hackear la computadora del forense] -> buscar_sabiduria
+ [Abrir todas las puertas a lo bruto] -> buscar_fuerza

=== buscar_magia ===
# music:terror_ambient
Cerrás los ojos y te relajás. Ponés tu mente en blanco y dejás que la energía de la habitación te hable. Obviamente la morgue no tiene una buena energía, la sentís golpear contra tu piel, como alquitrán que repta hacia tu nariz. Te disociás un poco, la esencia es sentir la energía pero sin dejarte controlar por ella.
# next
{
  - magia >= 25:
    Te llega un grito. Dolor, miedo, rabia. Es alguien que sufrió una mala muerte. Su energía es tan fuerte como una tormenta, pero tu voluntad es aún más fuerte. Hacés un movimiento con tu mano para que el gesto refuerce tu poder mental y cortás las malas energías en seco. Nada se puede esconder de vos. ¡Lo encontraste!
    -> frente_al_cadaver(true)
  - else:
    Te llega un grito. Dolor, miedo, rabia. Es alguien que sufrió una mala muerte. Su energía es tan fuerte como una tormenta, intentás concentrarte pero es como avanzar contra una ventisca. Sentís la energía golpeando contra tu cuerpo, como un millón de agujas que se clavan en tu piel.
    # next
    Mientras tanto, algo está pasando en el pasillo fuera de la morgue. El agente de policía está levantando la voz mientras discute con alguien. Una voz grave y amenazante. Esperás poder terminar antes que esto se vuelva un problema.
    Pasan cinco minutos, tal vez diez. ¡Lo encontraste!
    -> frente_al_cadaver(false)
}

=== buscar_sabiduria ===
# music:terror_ambient
Te sentás frente a la computadora y le das al botón de encendido. La computadora tarda varios minutos en arrancar dado que posiblemente sea más vieja que vos, pero eso te da tiempo para estudiar el escritorio del forense a ver si hay alguna pista que te pueda ayudar para averiguar su clave.
# next
{
  - conocimiento >= 25:
    Un post-it en el tacho de basura con unos números garabateados. Sin duda la vieja contraseña. Tardás unos segundos en inferir cuál puede ser la nueva. Una vez adentro de la computadora todo te resulta intuitivo, rápidamente comprendés cómo navegar por el programa que utiliza el Poder Judicial de la Provincia.
    El expediente del NN tiene la poca información que el gobierno juntó sobre el cadáver. Las fotos y el informe del forense no brindan información muy diferente a la que ya tenía El Profesor. Pero te da la ubicación exacta de la puerta en la cual se encuentra el cadáver. Es solo cuestión de abrir y ver.
    -> frente_al_cadaver(true)
  - else:
    La gente siempre usa tres o cuatro contraseñas iguales. "Amor", "123", "fecha de nacimiento". Lamentablemente ninguna funciona. Golpeás el teclado en frustración y das vuelta el escritorio buscando alguna pista. Al último te das cuenta de que en el tacho de basura hay un viejo post-it con unos números garabateados. La vieja contraseña.
    Lamentablemente no estás en tu mejor momento y tardás bastante en entender el patrón y descifrar cuál es la nueva.
    # next
    Mientras tanto, algo está pasando en el pasillo fuera de la morgue. El agente de policía está levantando la voz mientras discute con alguien. Una voz grave y amenazante. Esperás poder terminar antes que esto se vuelva un problema.
    Pasan cinco minutos, tal vez diez. ¡Lo encontraste!
    -> frente_al_cadaver(false)
}

=== buscar_fuerza ===
# music:terror_ambient
Empezás a abrir las puertas de los contenedores. La primera se abre lentamente, metés tu mano y sale… el cadáver de un anciano que tiene toda la pinta de haber muerto por dos tiros en el pecho. Principalmente porque tiene dos orificios gigantes en el pecho. Una parte de vos esperaba tener suerte en el primer intento, pero parece que esto va a tardar un tiempo.
# next
{
  - fuerza >= 25:
    Le ponés velocidad, abrís una puerta y ya estás pasando a la siguiente. Lo encarás como una sesión de entrenamiento funcional, sin duda no le das a los otros cuerpos el respeto que merecen. Sentadilla, estirar el brazo, tirar, mirar. Siguiente.
    Es frío y brutal. Pero funciona. En casi una de las últimas puertas encontrás al cadáver que buscabas.
    -> frente_al_cadaver(true)
  - else:
    La verdad es que es un trabajo engorroso. Las puertas más bajas requieren que te pongas en cuclillas y dos veces tenés que alejarte y contener las ganas de vomitar que se cocinan en la boca de tu estómago y queman por tu esófago. No tenías ni idea de que moría tanta gente en Costa Alegre.
    # next
    Mientras tanto, algo está pasando en el pasillo fuera de la morgue. El agente de policía está levantando la voz mientras discute con alguien. Una voz grave y amenazante. Esperás poder terminar antes que esto se vuelva un problema.
    Pasan cinco minutos, tal vez diez. ¡Lo encontraste!
    -> frente_al_cadaver(false)
}

=== frente_al_cadaver(rapido) ===
# music:terror_ambient
# next
Esta vez sí te dedicás a ver el cuerpo. No es bonito. Los cuerpos sacados del fondo del mar nunca lo son. Pero lo que hicieron en su carne antes de morir es peor. Su pecho tiene tres renglones de una ¿escritura? Símbolo tras símbolo, casi sin espacio entre ellos, como un niño que escribe en una hoja y teme quedarse sin espacio.
Uno de sus brazos fue directamente desollado y su carne tiene la muestra de haber sido quemada. Como cuando se marca al ganado.
No podés dejar de notar un corte en su estómago, como una sonrisa que va de costilla a costilla. Una fea herida.
# next
Sacás las fotos de rigor de todas las marcas y te tomás unos segundos para mirar el cuerpo. Alguien tiene que ser consciente de todo el horror que sufrió. Va a ser una carga que vas a llevar por siempre pero la tomás sin dudar, cuando muere una persona debe doler, debe importar.
Aparte, esperás que en algún momento tengas la posibilidad de devolverle una parte del dolor a quien hizo esto.
# inv:add:fotos_profundo
~ tiene_fotos = true
{ rapido:
    # play_sfx:tension
    Mientras tanto, algo está pasando en el pasillo fuera de la morgue. El agente de policía está levantando la voz mientras discute con alguien. Una voz grave y amenazante. Esperás poder terminar antes que esto se vuelva un problema.
}
{ not rapido:
    La discusión de afuera de la morgue se convirtió en una discusión a toda regla. Los argumentos se convierten en gritos y, si bien la puerta te impide entender qué se está diciendo, es claro que la violencia está cerca.
}
# next
Girás para irte y notás, sobre una de las camillas, una sierra médica. Una idea llega a tu cabeza. Con una mano se pueden hacer muchas cosas: El Faro tiene acceso a bases de datos donde tal vez encontraría información para identificar al NN. Y los Guardianes con mayor talento sobrenatural también podrían hacer algo. Si bien no sirve para una Mano de Gloria (la persona no fue ahorcada) tal vez se puede convocar al espíritu para obtener cierta información.
# next: Tomas la sierra
Agarrás fuerte la mano y empezás a serruchar. Por suerte no hay sangre ni gritos, pero la carne resulta más dura de lo que esperabas.
# next: Corta, corta. Corta
Estás por la mitad del camino, el hueso ya se asoma entre la carne. Tu camisa está completamente transpirada, resultó ser más trabajo del que esperabas.
{ not rapido:
    # play_sfx:disparos_escopeta # shake
    En el pasillo se escuchan tiros. Dos disparos de escopeta. Una pausa y un tercer disparo. No querés saber qué sobrevive a dos disparos de escopeta. Lo último que escuchás es al oficial de policía gritando y un ruido sordo. A pesar de que nunca lo viviste antes, algo animal dentro tuyo te dice que es el ruido de un cuerpo cayendo al piso. Los problemas se acercan.
}
# next: Un corte más
Usás tu peso para darle más poder a la sierra y seguís cortando. El hueso cede (esperás nunca enfrentarte a alguien que use esta arma) y la mano está, valga la redundancia, en tu mano.
Esperás que en El Faro puedan hacer algo con esto.
# inv:add:mano_nn
~ tiene_mano = true
Ahora, hay que buscar una forma de salir de la morgue.

{ rapido:
    + [Escapar por el ducto de ventilación del techo] -> escape_ducto
}
+ [Esconderme dentro de un frigorífico] -> escape_escondite
+ [Preparar una trampa] -> escape_trampa
+ [Soy un Guardián. Lo que entre se va a encontrar con una verdadera pelea] -> pelea_monstruo

=== escape_ducto ===
# music:terror_ambient
Amontonás un par de camillas, unas cajas de suplementos médicos que parecen sólidas y unos gabinetes. De alguna forma terminás con una pirámide de dudosa estabilidad que te deja a los pies de la entrada al ducto de aire.
Trepás por tu obra arquitectónica. Casi cuando estás por rozar la entrada al ducto de aire escuchás a la estructura crujir debajo de vos.
# next
Pero resiste. Un poco. Lo suficiente para que saques la rejilla del ducto y te metas por este. En cuanto la mitad de tu cuerpo ya está ahí, la pirámide colapsa en un montón de pedazos que se reparten por el piso de la morgue.
Tus piernas quedan colgando, insitamente pataleando en el aire buscando dónde hacer pie.
# next: Fuerza de brazo
Clavás tus dedos en una pequeña grieta y hacés fuerza. Fuerza con tus brazos, fuerza con tu estómago. Toda la energía posible para meterte dentro del ducto. Transpirás y todo tu cuerpo tiembla por el shock de adrenalina.
Pero lo lográs.
# play_sfx:disparos_escopeta # shake
En el pasillo se escuchan tiros. Dos disparos de escopeta. Una pausa y un tercer disparo. No querés saber qué sobrevive a dos disparos de escopeta. Lo último que escuchás es al oficial de policía gritando y un ruido sordo. A pesar de que nunca lo viviste antes, algo animal dentro tuyo te dice que es el ruido de un cuerpo cayendo al piso.
# next
El que hizo el ducto de aire nunca vio una película en su vida. En lugar de ser un pasillo cómodo donde alguien se puede arrastrar con un aspecto épico resulta ser un tubo angosto, oscuro, plagado de telarañas y moho. A lo lejos escuchás pequeñas patas recorrer el metal, huyendo de tu presencia, pero preferís no pensar en qué es.
# play_sfx:puerta_destruida
Abajo, en la morgue, la puerta sale volando de sus goznes a la par que se escucha un grito animal mientras algo grande y pesado se arrastra destruyendo con su avance las partes de la pirámide que te permitió subir acá.
Esa es toda la motivación que necesitabas. Ya no importan la oscuridad, la suciedad ni que tengas que achicarte. Solo hay que avanzar.
# next
El ducto de aire te deja en algún lugar del primer piso. Te arrastrás para salir y te pasás la mano por la ropa, intentando sacarte la suciedad. Pensás cómo hacer también para recuperar algo de orgullo, pero por tu cabeza pasa el recuerdo de lo que sea que entró a la morgue y te das cuenta de que estar vivo es más importante.
Aparte, en tu morral se siente el peso de la mano del NN. Eso es más que suficiente para decir que tu primera misión de campo fue un éxito.
# next
Antes de darte cuenta te encontrás en tu auto, con la llave puesta en la cerradura de encendido y el morral con la mano del NN en el asiento de acompañante.

+ [Enfilo directo a El Faro] -> final_morgue_exito
+ [Espero agazapado a ver qué sale del edificio] -> observar_monstruo

=== observar_monstruo ===
# music:terror_ambient
Eso no se hace esperar. La puerta del Palacio de Justicia se abre y las luces del edificio dejan ver una silueta.
Es enorme, muy por encima de los dos metros y cada extremidad es del tamaño de tu torso.
Usa un sobretodo que le tapa todo el cuerpo junto con una bufanda que le oculta el rostro, lo cual es una locura con este calor. A medida que avanza podés notar más detalles.
# next
En el pullover en su pecho se notan los múltiples orificios de entrada de los tiros de escopeta, aunque no hay sangre.
En su espalda, debajo del sobretodo, se nota algo similar a una joroba.
Su piel es grisácea y dura. En sus manos esto es aún más notorio, terminando cada dedo en una garra oscura.
Sus ojos son negros como la noche y su mandíbula está inclinada hacia adelante, como si saliera del resto de su rostro.
# inv:add:descripcion_profundo
~ tiene_descripcion = true
# next
Con la mayor cautela que podés, sacás un par de fotos del ser mientras avanza hasta la esquina. Luego te retirás con el auto yendo para el lado contrario, a pesar de que no sea el camino más adecuado.
# inv:add:fotos_profundo
-> final_morgue_exito

=== escape_escondite ===
# music:terror_ambient
Dás una vuelta por la morgue pero no hay muchos lugares para esconderse. Abajo del escritorio parecía muy infantil.
La idea llega condimentada con una pizca de ironía, el mejor lugar para esconderse es en los privados donde guardan los cadáveres.
Solo esperás que no sea premonitorio.
# next: Entras a uno
El lugar es frío e incómodo, apenas tenés espacio para mover el cuerpo. "Seguramente los cadáveres no se quejan". Tenés que hacer fuerza para controlar una risa morbosa. Seguro es tu cerebro intentando bajarle la gravedad a la situación.
# play_sfx:puerta_destruida
# shake
Alguien patea la puerta de la morgue y la manda volando contra el escritorio que se parte al medio. El monitor de la computadora cae de frente y emite un quejido electrónico. Qué suerte que no elegiste ese escondite.
# next: Esperas
Dejaste la puerta de tu escondite entreabierta. Intentás mirar qué es lo que entró a la morgue, qué cosa sobrevivió a unos tiros de escopeta. Por la rendija obtenés poca información. Es gigante (más de dos metros) y parece más robusto que un jugador de rugby, su espalda esconde algún tipo de joroba y sus manos no son humanas. Una piel gris y dura que termina en garras negras en lugar de dedos.
# inv:add:descripcion_profundo
~ tiene_descripcion = true
# next
Calculás que está frente al cuerpo del NN. Ya no podés verlo así que te centrás en escuchar. Solo lamentás que tu corazón esté tan desbocado.
Escuchás ropa moviéndose (¿Él sacándose la bufanda que tapa su rostro?) y un ruido que hace estremecer todo tu cuerpo, como piel siendo desgarrada.
Luego empieza un sonido que puede ser tanto diente contra diente como filo contra filo.

+ [Asomarte a ver qué pasa] -> escondite_asomarse
+ [Quedarte quieto donde estás] -> escondite_quedarse

=== escondite_asomarse ===
# music:horror_ambient
Lentamente tomás lo que puede ser la peor decisión de tu vida y te asomás un poco. Lo ves de costado, la comisura de su boca va de oreja a oreja (textualmente) y su mandíbula se ensanchó hacia adelante dejando ver una hilera de dientes filosos y encorvados. Te hace pensar en un tiburón.
Se está... comiendo... el cadáver... # play_sfx:sting_horror
Ya terminó con los dos brazos y está por mandarse la cabeza y el torso en una sola mordida.
Entrás para adentro de tu escondite poniendo las manos en tu boca para contener el grito.
-> apnea_escondite

=== escondite_quedarse ===
# music:horror_ambient
Esperás cinco minutos. La mole se vuelve a mover, escuchás el poco mobiliario que sigue en pie quejándose y ser destruido por su peso.
Y luego esperás cinco minutos más. Diez minutos. Hasta que la sensación de miedo abandona tu cuerpo.
# next
Te arrastrás para salir de tu escondite. El cadáver NN ya no está ahí. Esa... cosa... se lo comió.
Al menos recuperaste una mano, mejor ir para El Faro a ver qué pueden hacer con eso.
-> final_morgue_exito

=== apnea_escondite ===
# MINIGAME: type=apnea, waves=3, autostart=true, result=apnea_escondite_resultado

-> apnea_escondite_resultado

=== apnea_escondite_resultado ===
{ minigame_result:
    - 1: -> apnea_escondite_exito
    - else: -> apnea_escondite_fallo
}

=== apnea_escondite_exito ===
# music:misterio_ambient
La criatura se retira. Esperás una eternidad más para estar seguro. Te arrastrás para salir. El cadáver del NN ya no está. Esa cosa se lo comió.
Al menos recuperaste una mano, mejor ir para El Faro a ver qué pueden hacer con eso.
-> final_morgue_exito

=== apnea_escondite_fallo ===
# stop_music
# shake # flash_red # play_sfx:jumpscare
La puerta del privado se abre de golpe. Garras oscuras se cierran alrededor de tu tobillo y te sacan arrastrando.
Lo último que ves es esa boca inmensa abriéndose de oreja a oreja.
MORISTE. FIN DEL JUEGO.
-> END

=== escape_trampa ===
# music:terror_ambient
Tenés unos minutos para improvisar una emboscada, sea lo que sea que está ahí afuera acaba de matar a un policía, así que es peligroso y no debés contenerte para atacar. Tu gran ventaja es que hay una sola puerta de entrada.
# next: Preparas tu trampa
{
  - stat_principal() == "magia":
    # play_sfx:magia_oscura
    La magia de combate generalmente es improvisada. Uno debe trabajar con lo que tiene. Pero estás en una morgue así que lo que tenés es sangre, muertos y partes de cuerpos. Cosas bastante potentes para improvisar.
    Hacés un símbolo justo delante de la puerta; quien entre y lo pise sufrirá una dosis pura de dolor.
  - stat_principal() == "fuerza":
    # play_sfx:clic_arma
    Tirás al piso tu bolso de armas y te despedís de tu fiel escopeta. Te toma cinco minutos de bricolaje para preparar todo pero dejás armada una trampa tan básica como letal.
    Quien abra el mecanismo recibirá directo en la cara un disparo calibre 12/70. Suficiente para que termine con el cerebro en un frasco aparte.
  - else:
    Rebuscás entre las cosas que tenés en tu morral. Cables, pinzas y demás elementos para hacer un puente eléctrico. Conectás la manija de la puerta a la corriente eléctrica; quien ponga la mano ahí va a recibir inmediatamente 220 voltios.
}
# next: Se abre la puerta
# play_sfx:puerta_destruida # shake
El ser que entra es masivo, algo más de dos metros y con extremidades más gruesas que tu torso. Su piel es gris, sus ojos negros y sin expresión y sus dedos terminan en garras.
Su boca es demasiado grande, con un mentón extendido hacia adelante, y aparenta tener una joroba.
Hay dos cosas que aprendés. Eso no es humano y tiene una anormal resistencia al dolor. Tu trampa meramente lo aturdió.
# inv:add:descripcion_profundo
~ tiene_descripcion = true

+ [Aprovecho que está distraído y huyo] -> final_morgue_escape
+ [Quien golpea primero golpea dos veces. A tirarle con todo] -> pelea_monstruo

=== pelea_monstruo ===
# music:terror_ambient
Atacás con toda tu furia. Una vez que vaciás el cargador de la pistola tomás un hacha de tu mochila, una mole con un mango pesado de madera y un filo de metal que promete violencia. Cargás mientras de tu garganta sale un grito primal de combate.
# next
La piel de la entidad es más dura que el cemento. Las balas rebotaron peligrosamente y el hacha se quebró con el tercer golpe. Eso ni intentó cubrirse, solo sigue tus movimientos con la vista como quien está intentando matar a una mosca molesta.
# next
Esa cosa viene leyendo tus movimientos y te tira un zarpazo. Cada uno de sus dedos es tan afilado como un bisturí y es curvo, para clavarse en la carne y llevarse un pedazo.
{
  - fuerza >= 25:
    # stat:hp:-25 # flash_red # shake
    Tu guardia se ve destrozada. Es increíble que algo tan grande se mueva tan rápido. De puro reflejo te tirás para atrás. Tu brazo izquierdo cede, ya sin fuerza, mientras a tus pies ves un chorro de tu sangre.
  - else:
    # stat:hp:-50 # flash_red # shake
    El golpe te sorprende, de repente estás tirado en el piso. Primero sentís algo húmedo que se expande por tu pecho. Luego tu pecho libera una dosis de dolor que se escapa como un grito por tu garganta. El corte va de tu hombro izquierdo a tu cintura derecha. Te levantás con las piernas temblando y una sensación de levedad en tu cuerpo.
}
# next
Todavía no estás a la altura de este enemigo. En este contexto sobrevivir es una victoria. Tal vez si juntás más información, la próxima vez sepas su punto débil. Al fin y al cabo todo tiene un punto débil, ¿no es verdad?

+ [Mejor huir y prepararme para la siguiente batalla] -> final_morgue_escape
+ [Cargo con un cuchillo directo a su ojo] -> pelea_final_cuchillo

=== pelea_final_cuchillo ===
# music:terror_ambient
# flash_red # shake
El ataque es épico. El ataque es valiente. Pero el ataque es inútil. La entidad es más alta que vos, retrocede un poco y sube la cabeza, haciendo que tu ataque rebote contra su mejilla.
# next
Entonces te muerde. Durante unos segundos el mundo es un borrón de imágenes y velocidad. Todo tu torso explota de dolor.
# achievement:unlock:mordio_profundo
Luego se calma y te encontrás en el piso. Todo está húmedo y sentís lentamente cómo tu cuerpo se empieza a sentir frío y ajeno, como algo sobre lo cual ya no tenés control.
Estás muriendo. Y en tu primera misión de campo. Deberías sentir vergüenza o indignación pero ya no tenés energías como para sentir algo. Solo sueño…
# next
FIN DE TU HISTORIA.
-> END

=== encuentro_monstruo ===
# music:terror_ambient
La entidad te encuentra antes de que puedas escapar. Sus ojos negros se clavan en vos.
+ [Luchar por tu vida] -> pelea_monstruo
+ [Intentar huir desesperadamente] -> final_morgue_escape

=== final_morgue_escape ===
# music:terror_ambient
Con la poca energía que te queda amagás para un lado y rápidamente cambiás de dirección. Corrés por el pasillo de entrada a la morgue, a los metros te caés de cara al piso.
# next
Ves a tus pies, te resbalaste con el cadáver del oficial de policía que cuidaba la morgue. Su cuerpo ahora es una masa de carne picada, sangre y horror. Solo se distingue que fue un hombre por los jirones de su uniforme.
El miedo te funciona como combustible, salís huyendo. Primero animalmente, en cuatro patas, y luego en dos como corresponde.
# next
El Palacio de Justicia es gigante pero está vacío. Sabés que en un lugar giraste mal, pero no importa, escuchás atrás a la entidad que te persigue. Cada uno de sus pasos retumba como un bombo.
Ya no es posible retroceder. Hay que seguir corriendo, nada más importa. Ganarle al cansancio y seguir. Un minuto de vida más, un paso más. Todo es precioso.
# next
{
  - fuerza >= 25:
    Llegás a la puerta y corrés hasta tu auto. Estás arrancando cuando el ser arranca la puerta del edificio.
    Arrancás a toda velocidad cuando carga hacia el vehículo, el vidrio trasero explota en un millón de pedazos pero su garra roza el vacío.
    Te dirigís a El Faro a toda velocidad. Cuando te fijás por tu espejo retrovisor, la entidad se quedó en mitad de la calle, desafiante.
    -> final_morgue_exito
  - else:
    # stat:hp:-10
    Nunca le vas a ganar, estás muy herido y vas dejando un rastro de sangre. Ves la puerta de salida al final del pasillo. Treinta metros. Nada más.
    Pero tus piernas ya no responden. Te caés de rodillas y el impacto contra las baldosas frías te arranca un gemido.
    -> keymash_arrastre
}

=== keymash_arrastre ===
# MINIGAME: type=crawl, autostart=true, result=keymash_arrastre_resultado

-> keymash_arrastre_resultado

=== keymash_arrastre_resultado ===
{ minigame_result:
    - 1: -> keymash_arrastre_exito
    - else: -> keymash_arrastre_fallo
}

=== keymash_arrastre_exito ===
# music:misterio_ambient
Abrís la puerta del auto con dedos que ya casi no sentís. Arrancás. No mirás atrás.
Te dirigís a El Faro.
-> final_morgue_exito

=== keymash_arrastre_fallo ===
# stop_music
# flash_red
MORISTE. FIN DEL JUEGO.
-> END

=== final_morgue_exito ===
# achievement:unlock:morgue_sin_mordisco
# music:misterio_ambient
Entraste al edificio de El Faro y la Sra. Enríquez continuaba sentada en su escritorio tipeando en la máquina de escribir. Dejás la mano del NN sobre su escritorio, que estaba en una bolsa marrón que fue adquiriendo un tono negruzco.
Enríquez te mira, mira al bulto apestoso que dejaste en su escritorio, y comienza a tipear con más fuerza la máquina de escribir.
# next: De vuelta en El Faro
— El Profesor te espera en su despacho — te dice con el mismo tono entrecortado con el cual golpea las teclas.
Mientras subís a hablar con El Profesor, escuchás cómo tira un poco de desinfectante sobre su escritorio.
# next
— ¡Felicitaciones! — El Profesor te sorprende con un abrazo de oso que impregna tu ropa de un olor a tabaco que sospechás que nunca vas a poder sacar — Volver de una misión de campo siempre es una victoria. Me gustaría escuchar tu reporte de la misión mientras todavía lo tenés fresco.

+ [Dar un informe frío y profesional]
    El Profesor te escucha atentamente mientras fuma su pipa.
    — Sí, suena a una primera misión de campo — es su balance una vez que terminás.
+ [Aprovechar para tirarte flores. Si yo no hablo bien de mí nadie más lo va a hacer]
    El Profesor te escucha atentamente mientras fuma su pipa.
    — Sí, suena a una primera misión de campo — es su balance una vez que terminás.
+ [Llorar desconsoladamente]
    El Profesor te escucha atentamente mientras fuma su pipa.
    — Sí, suena a una primera misión de campo — es su balance una vez que terminás.

- # next: Terminando la reunión
El Profesor se para dejando en claro que la reunión ha terminado.
— La mano fue una buena idea, vamos a poner a todos nuestros profesionales a buscar información sobre la posible víctima. Con lo poco que sabemos de las víctimas seguramente nos va a dar una punta para trabajar.
{ tiene_fotos or tiene_descripcion:
    # next
    — Profesor, ¿qué me puede decir de la criatura que me encontré? Es claro que la enviaron por el cuerpo y podría volver a encontrarla.
    — Sin duda era un Profundo — cuando El Profesor nota que esa respuesta por sí sola no basta decide continuar la explicación.
    # next: El Profesor se explaya
    — Existen lugares donde la frontera entre nuestro mundo y otros planos es más frágil. Lugares donde, con un poco de fuerza, se puede trasladar las barreras de la realidad. La mayoría de esos lugares fueron destruidos, sea de forma consciente o por la voracidad humana de extenderse en todas direcciones. Algunos pocos fueron contenidos, o al menos están vigilados.
    # next: Continúa monologando
    — El fondo del mar, por ser un clima altamente hostil, es uno de los pocos lugares donde esas barreras no están controladas. Los Profundos son seres de otros planos que pasaron esa barrera y viven en nuestro fondo marino. Durante generaciones se cruzaron, de forma voluntaria o no, con los humanos generando unos híbridos que pueden actuar en la superficie como sus embajadores, agentes y campeones.
    Atento al tipo de ritual, sospecho que los sacrificios humanos están relacionados con una secta que los adora o, al menos, busca algo de ellos.
    # next: Un consejo
    — Si te volvés a encontrar con una entidad así, intentá que abra la boca. Es imposible atravesar su piel pero, si le disparás dentro de la boca, son tan débiles como mojarritas.
}
# next
Volvés a tu casa agotado pero... ¿feliz? Sobreviviste tu primera misión de campo y de forma exitosa. Pero sospechás que estás en el principio de algo más grande. Todavía no sabés la identidad del NN ni tenés ningún dato sobre la secta que está detrás de los sacrificios humanos.
Un escalofrío de terror entra en tu mente, algo dentro tuyo sabe que tarde o temprano te vas a volver a enfrentar a la entidad que te cruzaste en la morgue.
# next
Pero esos son problemas para el {nombre_personaje} del futuro. Ahora te toca dormir.
# next
# stat:misiones_completadas:+1
-> intermision

=== inter_tarot ===
# music:misterio_ambient
# achievement:unlock:fuiste_tarotista
Salís a caminar y te dejás llevar, por el flujo de energías, por las pequeñas señales que hay en todas las ciudades. Cuando hay una bifurcación basta lanzar una moneda al aire para saber por dónde seguir.
Antes de darte cuenta, estás en la periferia de la ciudad.
# next
Es de noche pero la mayoría de las farolas de la calle no funcionan, solo una en la esquina está parpadeando. Vas hacia ella y mirás el camino. De nuevo, otra farola parpadeando a lo lejos. Seguís el circuito y terminás frente a una casa pintada de un verde loro, con la puerta abierta. Al lado hay una pizarra que dice "Tarot. Lectura de Cartas. Adivine su futuro".
De las entrañas de la casa se siente fluir, pesado y electrificante, un poco de poder real.
# next: Entrás en la casa
En el fondo hay una anciana esperándote detrás de una mesa con una baraja de cartas en la mano. Con una sola mirada te das cuenta de que en un pasado ella fue hermosa pero, aún más importante, aprendió cómo ser elegante en su vejez. Un pañuelo con arabescos adorna su cabeza, dejando escapar una larga melena canosa que parece platinada.
Sus ojos, verdes como joyas, están encuadrados con un delineado pronunciado que se alarga hacia las sienes. Cada movimiento que hace es acompañado por el tintineo de cientos de collares, pulseras y cadenas plateadas que decoran todo su cuerpo.
# next
Nunca te habían tirado las cartas antes. Raro. Ella se pasa un momento largo pasando su mirada entre las cartas y vos.
— Te voy a dar un consejo, gurí. Pasaron dos mil años desde que el Nazareno recorrió estas tierras, pero sus símbolos tienen poder todavía. Si la situación se pone pesada, no dudes en usarlo.
# next
Salís a la calle con más dudas que respuestas. Pensando si lo que te dijo la tarotista te va a servir de verdad.
-> inter_misiones

=== inter_jesus ===
# music:misterio_ambient
Te llega un mensaje de que un Guardián está con una misión complicada y podría necesitar una mano. Te subís a tu auto y manejás hasta los puertos de la ciudad a toda la velocidad posible, esperando que El Faro tenga una ayuda monetaria para pagar las multas de tránsito adquiridas en el ejercicio del deber.
# next
El Guardián está apoyado contra una pared. La luz de la luna ilumina su piel cobriza aunque su rostro está escondido detrás de una maraña de pelo oscuro. A pesar de que la noche trajo un viento frío del mar, el Guardián está en cuero y descalzo, usando solamente un pantalón corto de fútbol.
# next
— El Faro me envía, soy {nombre_personaje}.
— Un gusto, soy Jesús.
— ¿Jesús?
— El mismo.
— Perdona, pero vi muchas cosas raras en el último tiempo, así que tengo que preguntarlo...
— No, no, no soy ese Jesús. Solamente tenía una madre muy religiosa.
# next
Jesús rápidamente te explica la situación. En el galpón del frente hay un vampiro que hace tiempo viene rastreando. El problema es que también está con un humano, una pobre persona sometida a su control mental y adicta a la sensación excitante que genera la mordida de vampiro.
{ conocimiento >= 20:
    Sabés que esa es una respuesta evolutiva de los vampiros para asegurar el sometimiento de su presa y, en caso de querer esconder el ataque, el humano relaciona la sensación de placer que recibe con un acto sexual ilícito y no hace más preguntas.
}
Como si fuese poco, la persona es la madre de dos hijos que la están esperando. Jesús les prometió que iba a tomar todas las medidas necesarias para que su madre regrese.
# next
— El problema Guardián, es que la sutileza no es mi fuerte.
Cuando termina de decir esta frase Jesús deja caer su pantalón con un simple movimiento y su cuerpo comienza a cambiar.
Su piel se rasga y quiebra ante el crecimiento de la masa muscular que esconde. Su altura de repente superó los dos metros. De su cabeza surgió un ruido de "crack" (que por lo general no pronostica nada bueno) mientras sus ojos se movían a los costados de la cabeza para dar pie a un hocico.
Antes de darte cuenta su nueva masa muscular ya se estaba cubriendo con una fina y hermosa capa de pelo dorado con manchas negras.
# next
— Eres un hombre jaguar, un Yaguareté Abá — decís marcando lo obvio. Toda la respuesta que recibís es un leve ronroneo.
De un salto Jesús se sube al techo de una casa y empieza a acercarse al galpón por los techos.
Parece que te toca a vos elegir el enfoque del ataque.

+ [Ataque frontal. Jesús por el techo y yo por la puerta] -> jesus_frontal
+ [La fuerza no siempre es la respuesta. Toco el timbre y genero una distracción] -> jesus_distraccion
+ [Sigilo. Darle la vuelta al galpón y buscar otra entrada] -> jesus_sigilo

=== jesus_frontal ===
# music:misterio_ambient
Cargás contra la puerta del galpón. Abajo tuyo una sombra pasa volando, Jesús saltando de un techo directo al techo del galpón. Le das una patada fuerte a la puerta esperando sacarla volando pero tiembla en su lugar, haciendo un ruido seco que hace eco por toda la manzana. Creo que acabás de anunciar tu llegada.
# next
Forcejeás con la puerta intentando abrirla, de adentro del galpón se escucha el ruido de vidrios rotos y pelea. Después de unos segundos que parecen eternos la puerta cede un poco, lo cual te da espacio para hacer palanca y abrirla definitivamente.
# next
En el piso notás el cadáver de una mujer de unos treinta años, su garganta desgarrada, la típica señal de un vampiro que decidió dejar seca a una persona sin ninguna sutileza. En mitad del galpón, entre la nube de polvo que dejaron los escombros de la pelea, ves al Yaguareté Abá arrancando la cabeza del vampiro de una mordida.
# next
Jesús vuelve a su forma humana y mira decepcionado el cadáver a tus pies.
— Creo que pudimos hacer eso mucho mejor — hay amargura y crítica en sus palabras y, a pesar de que usa el plural, sabés que van dirigidas a vos.
# achievement:unlock:juan_salvado
-> inter_misiones

=== jesus_distraccion ===
# music:misterio_ambient
Caminás directo a la puerta del galpón, con paso firme, querés que el vampiro sepa que estás viniendo. Que no te considere una amenaza. De ser posible, que te piense como un delivery de comida a domicilio.
Tocás el timbre al lado de la puerta y esperás.
# next
La puerta se entreabre y ves la cara de una mujer de unos treinta años. Sus ojos están vidriosos y enmarcados por las ojeras correspondientes. Su piel estaba reseca y quebradiza. Los signos claros de una persona que había sufrido repetidas mordidas de un vampiro.
— ¿Qué... necesitás? — su voz era quebradiza y le resultaba complicado sacar dos palabras por la garganta.
# next
Nunca mentiste tanto y tan rápido. Tu coche se había quedado sin batería. También tu celular. Necesitabas ayuda de un buen samaritano y ella parecía la persona indicada (esa era la mayor mentira, esa parecía alguien que necesitaba una buena comida y una semana de sueño).
En algún momento del discurso, notás por el rabillo del ojo cómo una sombra cae dentro del galpón.
# next
Un rugido y ruidos de combate. La mujer deja la puerta para ir a ayudar a su vampiro. En menos de un minuto Jesús, de nuevo en forma humana, te está abriendo la puerta.
El vampiro es una montaña de polvo en una esquina del galpón (notás que también hay un poco de polvo en los labios de Jesús, preferís no profundizar eso).
La mujer está sentada contra una de las paredes, con un poco de sangre brotando de una herida superficial de un brazo.
— Bueno, pudo haber salido mejor, pero pudo haber salido mucho peor. Muchas gracias compañero.
# stat:amistad_jesus:+1
# achievement:unlock:juan_salvado
-> inter_misiones

=== jesus_sigilo ===
# music:misterio_ambient
Te agachás y buscás las sombras para acercarte sin ser visto. Por suerte el destino ayuda a tu misión y unas nubes tapan la luna oscureciendo la calle.
Llegás al galpón, colocás tu mano contra la pared y empezás a darle la vuelta buscando una entrada secundaria.
# next
La mayoría de las ventanas están tapadas con hojas de periódico pero notás una que se encuentra entreabierta, seguramente para que pase un poco de aire, y más que suficiente para que espíes adentro.
El vampiro se encuentra de espaldas, sentado sobre una silla gamer que funciona como trono, rodeado de pilas de cosas robadas. Ropa, zapatillas, electrodomésticos. La mujer está dando vueltas acomodando las cosas.
Te preguntás si Jesús está cerca y, en ese mismo momento, escuchás un leve maullido proveniente del techo del galpón.
# next
Esperás varios minutos, suficiente para que tu pantorrilla se queje. Pero ves que la mujer se aleja del vampiro. Tal vez a buscar más cosas, tal vez a hacer sus necesidades. Lo importante es que es una oportunidad. Abrís un poco más la ventana y te estrujás para entrar.
Esperás que Jesús entienda lo que hay que hacer y avanzás hacia donde se fue la mujer.
# next
La mujer grita cuando la tackleás e inmovilizás en el suelo. Atrás tuyo se escucha un rugido y un ruido de pelea que dura unos segundos.
La mujer patalea, llora y te araña. Te promete la muerte de formas horribles mientras se retuerce en su llanto. El síndrome de abstinencia va a ser horrible pero está viva. Y eso siempre es una promesa de futuro.
— Lo logramos — Jesús aparece atrás tuyo de forma humana — gracias Guardián, nunca olvidaré esto.
# stat:amistad_jesus:+2
# achievement:unlock:juan_salvado
-> inter_misiones

=== inter_enfermeria ===
# music:misterio_ambient
Mary Shelley da un gritito de alegría cuando pasás a verla a El Faro. Siendo la médica oficial (y también chamán y científica loca) le toca a ella realizarte las curaciones necesarias.
Utiliza una mezcla de medicina occidental junto con hierbas, cantos y rituales extraños.
— Lindo cuerpo — dice para sí misma mientras te sutura una herida — si morís intentá por favor mantener las extremidades pegadas al torso que es un tedio volver a conectar los nervios y las venas.
— ¿Eso significa que si muero me pueden revivir? — preguntás. Toda la respuesta que recibís es una risa que no te da mucha seguridad.
# stat:hp:+20
# next
-> inter_misiones

=== inter_misiones ===
# music:misterio_ambient
El Faro te informó de dos situaciones que se están dando y sería conveniente que un Guardián se ponga a investigar. Aun así, el tiempo es tirano y es imposible hacer las dos misiones a la vez. Vas a tener que elegir qué es más importante.

+ [PEQUEÑOS INOCENTES — Ir a un orfanato donde desaparecieron dos niños] -> prox_mision_1
+ [EL NUEVO AMANECER — Una familia asesinada con marcas de ritual] -> prox_mision_2

=== prox_mision_1 ===
# music:misterio_ambient
Te dirigís al orfanato. El destino de esos niños depende de vos.
-> capitulo_2a

=== prox_mision_2 ===
# music:misterio_ambient
Vas a la escena del crimen. Algo huele a ritual desde aquí.
-> capitulo_2b

// =========================================================
// CAPÍTULO 2A: PEQUEÑOS INOCENTES
// =========================================================

=== capitulo_2a ===
~ capitulo_actual = "Cap. 2 — Pequeños inocentes"
# CHAPTER_BREAK: title=Pequeños inocentes, subtitle=Capítulo 2, image=title_cap2a_inocentes.jpg, music=campo_ambient
# inv:clear_mission
# music:campo_ambient
Manejaste más de tres horas. A esta distancia el ruido y las luces de la ciudad son un espejismo lejano. El olor salado del mar fue cambiado por la frangancia de eucaliptos (y, vamos a confesarlo, por el pesado olor a bosta de vaca). Cada tanto, a lo lejos, se ve la silueta de un peón rural haciendo alguna tarea. Pero sin duda la población de ganado supera ampliamente a la humana.
Haces una parada en una estación de servicio al costado de la ruta, alrededor de tuyo hay una gran nada verde, hectáreas y hectáreas de tierras de cultivo.
# next
Desayunas en la estación de servicio, unas facturas ricas y una sustancia oscura que se empecinan en llamar café. Mientras tanto meditas sobre la última misión que te asignó El Faro. A unos kilómetros te vas a cruzar con un camino rural que lleva al Orfanato "Santa Inés", hace quince días había desaparecido un niño en su predio. Anoche había desaparecido el segundo. Vos estabas yendo para asegúrate que no desaparezca el tercero.
# next
Mientras tomas el ¿café? pensas en el panorama general. El Faro todavía no consiguió información sobre el NN que fue víctima de un sacrificio humano y no esperabas volver a estar en una misión de campo tan rápidamente. Aparte la situación te llegó de improviso así que no tuviste mucho tiempo para prepararte.
Por suerte, antes de salir a la ruta, tomaste una decisión acertada.

* [Pedí que me junten toda la información que tenían sobre la propiedad] -> cap2_prep_info
* [Tuve una última sesión de entrenamiento con Cabral] -> cap2_prep_fuerza
* [Seguí leyendo los manuales y regulaciones que me brinda Enriquez] -> cap2_prep_conocimiento
* [Hice una visita al laboratorio de Mary Shelley] -> cap2_prep_magia
* [Pedí que informen mi visita al cura a cargo de la institución] -> cap2_prep_cura

=== cap2_prep_info ===
# music:orfanato
El Faro todavía es reacio a informatizarse así que te terminan dando una carpeta gruesa con más de trescientos páginas. Parece que el orfanato funciona en ese predio hace solo 20 años.
Antes fue una institución psiquiátrica y, si retrocedemos en el tiempo, en la década del cincuenta fue un emprendimiento turístico: una estancia para vender una versión empaquetada de 48 horas de la vida que tenía la oligarquía argentina.
# next
En la carpeta había un par de notas periodistas sobre desapariciones. La prensa en su momento se había hecho un festín especulando sobre una red de tráfico de órganos que desaparecía a los internos del psiquiátrico para vender sus retinas. No era necesario leer mucho entre líneas para saber que el emprendimiento turístico había cerrado por razones parecidas.
Sea lo que sea que estaba pasando, ocurrió de forma cíclica en ese terreno.
-> frente_orfanato

=== cap2_prep_fuerza ===
# music:orfanato
Cabral sonrió cuando me vio entrar al mat. Y luego paso las siguientes horas intentando matarme de las formas más originales que se le ocurrieron. Hubo espadas, hubo golpes bajos. En un momento creo que tiró tierra en mis ojos.
\- Nunca vas a estar realmente listo para lo que viene, pero simplemente porque es imposible estar listo para todo. Lo mejor a lo que podes aspirar es a estar listo para la sorpresa e improvisar en el acto – Una vez terminado su discurso, Cabral me invitó a las típicas cervezas post entrenamiento.
# stat:fuerza:+5
-> frente_orfanato

=== cap2_prep_conocimiento ===
# music:orfanato
Enriquez volvió a tirar un libro grueso sobre su escritorio. Esta vez la letra era la F, lo cual me hacía dudar mucho sobre el mecanismo organizativo del El Faro.
Pero aun así había nutrida información sobre como falsificar documentos, hacer fotografías y, por alguna razón, un anexo entero sobre los hongos llamdo "Fungi" (que al parecer habían estado cerca de controlar el mundo en 1367 y 1865).
\- Siempre es importan leer sobre las acciones de los Guardianes más importantes de la antigüedad. Debería mentirte y decirte que, tal vez un día vos puedas poner tu propia entrada en el manual, pero no me parece correcto decir mentiras.
# stat:conocimiento:+5
-> frente_orfanato

=== cap2_prep_magia ===
# music:orfanato
En cuanto entre al laboratorio de Mary Shelley encontré la cabeza de un carnero negro colocada sobre una mesa, dentro de un pentagrama, y con una vela roja en su cabeza. Por alguna razón la cabeza estaba cantando "La Marsellesa" (con un mejor francés que el mio) y tenía una serie de electrodos pegados a su cabeza. Seguí el cableado con la vista y encontré a Mary Shelley muy interesada viendo los datos de un electroencefalograma en la pantalla.
La mire a ella, al experimento, y de nuevo a ella.
\- Te juro que todo esto es muy necesario – Dijo la Doctora con la voz de una niña atrapada en una travesura.
\- Prefiero no saber.
Aun así, se tomó un par de horas para profundizar mis conocimientos del mundo sobrenatural. Es increíble lo que se puede hacer con unos movimientos precisos, las palabras correctas y un poco de ayuda. Solo fue frustrante que la cabeza del carnero no dejó de cantar durante todo el proceso.
# stat:magia:+5
-> frente_orfanato

=== cap2_prep_cura ===
# music:orfanato
~ visito_cura = true
La tarea bajó por la cadena de mando de El Faro hasta llegar al encargado de hacer llamadas (por suerte yo ya no tenía que hacer eso). Un Guardián joven me informó que ya estaban avisados de mi llegada. Me esperaba un cura llamado Miguel Ponsatti.
-> frente_orfanato

// =========================================================
// FRENTE AL ORFANATO
// =========================================================

=== frente_orfanato ===
# achievement:unlock:elegir_orfanato
# next: Frente a la entrada del orfanato
# music:orfanato
El predio del Orfanato era gigante, rodeado por un muro de más de dos metros. Si bien no era tan sorprendente para mí, sin duda era una barrera infranqueable para un niño.
Al lado de la reja robusta, protegida por una fuerte cadena con un candado del tamaño de mi puño, había una estatua de una santa abrazada a un cordero.
Santa Inés (la placa a los pies me desasnó) era la santa patrona de la pureza, los jóvenes….y por alguna razón también de los jardineros, lo cual parecía una inteligente expansión del mercado.
# next
Espié entre las rejas. El predio era gigante. Calculé que era equivalente a diez manzanas. Sin duda había una medición más adecuada en hectáreas, pero era un chico de ciudad.
La mayoría del terreno era un bosque espeso, dejando despejado un pequeña terreno entre la puerta donde se encontraban los dos edificios principales. Una capilla y una casona gigante.
De chico hubiese matado por tener un bosque así para jugar.
# next
Toqué timbre y a los minutos una figura oscura se acercó a la reja. Al principio la figura oscura avanzando por el bosque me generó un reflejo de miedo. Luego vi que se trataba de una monja con un pesado hábito y una cadena con un juego de llaves atado a la cintura.
Cuando se acercó a la reja y note su rostro, seco como una pasa y con la impresión de nunca haber producido una sonrisa, tuve la impresión que mi reflejo de miedo no estuvo tan erróneo.
# next
\- Buen día hermana…
\- Madre – corrigió ella
\- Perdón – dije avergonzando por el error, maldita culpa cristiana en la que fui criado – Madre. Soy {nombre_personaje}, ¿Usted es?
\- La Madre Alegría – Dijo con un tono de voz gélido. La persona que le había puesto ese nombre tenia un sentido del humor muy morboso.
\- Me envían de El Faro para…
\- Si si. Ya se para lo que viene – comenzó a buscar una llave en el manojo que llevaba atado al cinto – una pérdida de su tiempo y del mío si me preguntan. La mayoría de estos chicos son casi salvajes, muchos nacidos del pecado, sin duda se fugaron a la ciudad.
\- Claro, Pero aun así…
\- Son las sobras. Esta mal decirlo en estos tiempos modernos, pero acá tenemos a los chicos de entre 8 y 14 años. Ya no son chicos y saben que nadie los va a adoptar.
\- Entiendo… – y deje la palabra en el aire sabiendo que la Madre Alegría igual me iba a interrumpir para continuar con su monologo
\- El último chico que desapareció, Juan, era un verdadero diablillo. Y eso que intente disciplinarlo varias veces – La Madre Alegría terminó este comentario con un movimiento en el aire similar a golpear a alguien con una regla, lo cual me hizo empatizar mucho con el chico.
# next
Durante el recorrido la Madrea Alegría me bajo la información principal. En el orfanato vivían unos cincuenta chicos, mitad mujeres y mitad varones. El último chico desaparecido era Juan y el anterior se llama Darío y ambos eran terribles (aunque sospecho que para la Madrea Alegría todos los chicos eran terribles).
Actualmente solo había tres adultos en el predio, ella, la Hermana Paciencia y el Cura Miguel Ponsatti, aunque los días de semana venían docentes de Costa Alegre a dar clases en el edificio.

{ visito_cura:
    -> cap2_con_cura
- else:
    -> cap2_sin_cura
}

// =========================================================
// CAMINO CON CURA
// =========================================================

=== cap2_con_cura ===
# music:orfanato
# next
La Madre Alegría te deja en la puerta de la Capilla. Se excusa mientras dice que el Padre Ponsatti te espera adentro.
En cuanto abrís la puerta, lo primero que notas es la energía que está recorriendo el aire. Si bien es desorganizada (silvestre es la palabra que te viene a la cabeza) te hace recordar un poco a la red de conjuros defensivos que hay en El Faro.
Con algunos espacios de adoración pasa estas cosas, o tal vez esta Capilla tiene la particularidad de tener una de las pocas reliquias reales en un mar de falsificaciones, pero lo importante es que es un lugar seguro
# next
La Capilla era una modesta construcción de piedra, con la típica sucesión de doble blancos de iglesia. En los costados, debajo de los clásicos mosaicos del vía crucis, se notaban una centenar de dibujos de niños de santos, vírgenes y Jesús. Tierno hasta que uno se daba cuenta que la mitad de ellos había sido comido por leones, hervido o decapitado.
\- Veo que se quedó mirando la obra de nuestros artistas locales. Tengo fe que alguno de esos chicos la pegue en grande – La voz del cura sonó atrás tuya, con un tono alegre.
# next
\- Le agradezco mucho por venir – El Cura te da la mano e invita a sentar en uno de los bancos de la Capilla – Estamos superados por este problema. Y eso que nuestros niños tienen problema, pero no sabemos cómo actuar ante algo así
\- ¿Y no contactaron a la policía?
\- Para lo policía es fácil, los chicos escaparon y se deben haber ido a Costa Alegre. Creo que buscaban una excusa para archivar el caso y poder ir a dormir la siesta. Dios los perdones
\- ¿Usted cree que los niños no escaparon? Perdone que sea tan brusco pero, después de conocer a la Madrea Alegría entiendo que un pre adolescente prefiera escapar.
\- La Madrea Alegría ladra más de lo que muerde. Y yo me aseguro de limitar su estilo pedagógico más arcaico.
\- Claro – dije sin mucha certeza – ¿Qué me puede decir de los chicos desaparecidos?
# next
\- A Dario sus compañeros les había apodado Tarzan – el Cura se perdió un rato en sus recuerdos antes de seguir – Pasaba la mayoría de su tiempo en el bosque que rodea los edificios. Tenía problemas para relacionarse con sus compañeros. Yo había iniciado un juego con él para integrarlo, donde si encontraba alguna planta u hongo que le llame la atención podría venir a la Capilla y yo le daba una clase de Ciencias Naturales.
\- ¿Y Juan? ¿El chico que desapareció ayer?
\- Inteligente, divertido, medio contestón pero es normal en los chicos inteligentes. Si quieres saber más sobre él te recomiendo que hables con Belén, esa niña es su mejor amiga.
\- Gracias Padre.
\- Aparte esto para usted – El Cura te pasa dos fotos pequeñas, como las de documento.
Pasa siempre lo mismo cuando uno tiene fotos de gente desaparecida, uno busca un dato en sus facciones, un secreto oculto atrás de sus pupilas que te permita descubrir dónde están, pero la foto nunca responde. Termine con las fotos de dos niños, Dario era cacheton y llevaba una gorra amarilla aun en la foto; Juan tenía un rostro anguloso y unos ojos claros que contrastaban con su piel oscura.
\- Intente que vuelven a casa, por favor – terminó el Cura antes de pararse para dar por terminada la reunión.
-> hall_orfanato

// =========================================================
// CAMINO SIN CURA
// =========================================================

=== cap2_sin_cura ===
# music:orfanato
# next
La Madre Alegría te hace entrar al hall central del edificio principal. En una esquina te observa una estatua gigante de Santa Inés mientras en las cerámicas del piso se forma el rostro de Jesús. La composición tan cristiana es cortada por pequeños detalles que delatan la presencia de niños, un par de juguetes repartidos por el piso, un dibujo infantil pegado al lado de la estatua. Por alguna razón alguien decidió atar una remera al pasamos de la escalera que lleva al primer piso.
# next
\- En el piso superior están las aulas, ahora cerradas, y así como los cuartos de las niñas y los niños. Si quiere puede subir y hacerles preguntas. Los castigue para que se queden en su habitación después de la broma que realizó Juan – La Madre Alegría señala la escalera.
\- Al fondo está el comedor y la cocina donde ahora se encuentra trabajando La Hermana Paciencia, a la derecha están los baños y las duchas y a la izquierda está mi oficina. Intente no molestarme mientras trabajo – Como punto final, ella se da vuelta y se dirige a su oficina, se escucha como pasa la llave.
-> hall_orfanato

// =========================================================
// HUB DE INVESTIGACIÓN
// =========================================================

=== hall_orfanato ===
# music:orfanato
{ hall_orfanato > 1:
    # next: Volvés al Hall Central
}
Estas solo en el hall central. ¿Cómo continuas tu investigación?

+ [Subo al cuarto de los niños] -> cuarto_ninos
+ [Subo al cuarto de las niñas] -> cuarto_ninas
+ [Voy al Comedor a hablar con la Hermana Paciencia] -> comedor_orfanato
+ {tiene_machete or tiene_info_demoniaca} [Voy al bosque a buscar la guarida] -> bosque_opciones
+ {not tiene_machete and not tiene_info_demoniaca} [Voy al bosque] -> bosque_sin_pistas
+ [Golpeo la puerta de la Capilla] -> capilla_cerrada
+ [Reviso los baños y las duchas] -> banos_opciones
+ [Voy a la oficina de la Madre Alegría] -> oficina_madre_opciones

// =========================================================
// CUARTO DE NIÑOS
// =========================================================

=== cuarto_ninos ===
# music:orfanato
Subís por la escalera hasta el primer piso. De un lado se ven un par de puertas abiertas que dan a unos salones de aulas improvisados. Del otro encontrás las puertas a los dos dormitorios. Con una completa falta de imaginación alguien decoró la puerta del cuarto de varones con una pelota azul.
Abrís la puerta y te encontrás en un cuarto con una decena de camas cucheta y una pila de chicos amontonados en una esquina. Están formados en un semi circulo y algo en el medio les llama la atención.
Por suerte parecen no haber notado tu presencia.

* [Mejor atraparlos con las manos en la masa. Te acercas con sigilo] -> ninos_sigilo
* [Seria irrespetuoso no hacer notar tu presencia. Al fin de cuentas, es su pieza] -> ninos_anunciarse

=== ninos_sigilo ===
# music:orfanato
Los chicos están absortos en lo suyo y no te notan llegar. Por encima de sus cabezas notas que armaron un coliseo improvisado. Alguien atrapó una araña (bastante grande, casi del tamaño de una mano) y la esta haciendo pelear con un escorpión. Parece que uno de los chicos levantó apuestas usando un sistema de tapas de botellas.
Repudiable, pero también muestra un gran espíritu emprendedor.
# next
Los chicos se dan vuelta y cierran fila tapando su juego. Saludas, te presentas e intentar usar todas tus habilidades para interactuar con niños. Por respuesta solo recibís miradas al piso, monosílabos y risas burlonas.
Tal vez no les gusto que los espíes. Y estas seguro que la Madre Alegría hizo todo lo posible para que no confíen en ningún adulto.
Antes de retirarte notas como la araña le ganó sin problema al escorpión, aprovechando su mayor envergadura atrapó a su rival y le inyectó una mordida letal en su cuerpo.
-> hall_orfanato

=== ninos_anunciarse ===
# music:orfanato
Los chicos se dan vuelta en cuestión de cinco minutos y forman una pared humana entre vos y lo que sea que estaban viendo. Saludas, te presentas e intentar usar todas tus habilidades para interactuar con niños. Por respuesta solo recibís miradas al piso, monosílabos y risas burlonas.
Son un grupo cerrado y están acostumbrados a desconfiar del mundo adulto. Y vos no hiciste nada para ganarte su lealtad o su aprecio.
Sin más opciones, no te queda más opción que salir y continuar tu investigación por otro lado.
-> hall_orfanato

// =========================================================
// CUARTO DE NIÑAS
// =========================================================

=== cuarto_ninas ===
# music:orfanato
Subís por la escalera hasta el primer piso. De un lado se ven un par de puertas abiertas que dan a unos salones de aulas improvisados. Del otro encontrás las puertas a los dos dormitorios. El cuarto de mujeres esta individualizado por una corona rosa (aunque no entendés la relación entre las chicas y apoyar posturas opresivas que fueron dejadas de lado hace más de dos siglos).
Al entrar te encontrás con una un caos organizado. Un par de camas cuchetas se utilizaron como paredes para construir un fuerte. Cuatro chicas están recorriendo el lugar jugando un juego que, desde afuera, parece centrarse en hacer mucho ruido y correr peligrosamente cerca de los objetos con bordes filosos.
Otras juegan a saltar la soga, el elástico o saltar sobre la cama. Todo esta escena te pone serias dudas sobre la viabilidad de la paternidad.
# next
Te presentas y de repente tenes medio centenar de ojos observándote y un silencio que es más amenazador que el ruido anterior. En cuanto contás quien sos y que estas haciendo da un paso adelante una chica. Tiene dos cotilas, pero están a diferente altura y apuntando en direcciones diferentes, aun así el aspecto logra que el aspecto parezca rebelde en lugar de desprolijo.
\- ¿Usted viene a buscar a Juan? – Te da una sonrisa que con un par de "ventanas" fruto de la caída de dientes de leches
\- Si, voy a hacer todo lo posible para que vuelva a casa. ¿Como te llamas petisa?
\- Belén, soy amiga de Juan
# next
Todas las chicas comienzas a reírse y la señalan mientras cantan "tiene novio, tiene novio". Raro, en un par de años van a estar dispuestos a sacarse los ojos para conseguir pareja. Aun así el canto no inhibe a Belén, quien se da vuelta al grito de "solo es mi amigo" mientras mueve la cabeza en todas las direcciones, rotando sus colitas como si fuesen nunchakus.
En menos de cinco minutos perdiste el control de la situación.

* [Se van a cansar. Es solo cuestión de esperar] -> ninas_esperar
* [Debo ganarme la confianza de Belén. Le doy una golosina] -> ninas_golosina

=== ninas_esperar ===
# music:orfanato
Tarde o temprano las chicas se cansan, solamente que toma más tiempo del que esperabas. Mucho mas tiempo del que esperabas,
Pero lentamente todas vuelven a sus juegos y te dejan hablar tranquilo con Belén.
-> en_privado_belen

=== ninas_golosina ===
# music:orfanato
\- Toma Belén – digo mientras le doy un caramelo que tenia guardado en el bolsillo.
\- La Madrea Alegria me dice que nunca acepte caramelos de extraños
\- Yo soy {nombre_personaje}, no soy un extraño.
\- ¿Y eso no me dice nada? Aparte es un nombre muy extraño si me preguntan – Belén cruza los brazos y resulta ser mas inteligente de lo que esperabas.
-> en_privado_belen

=== en_privado_belen ===
# music:misterio_ambient
~ tiene_info_belen = true
# next: En privado con Belén
Te llevas a la chica a un costado. Le sonreís, principalmente por que no vienen a tu cabeza palabras que sirvan en este momento. Tal vez después de esta misión puedas escribir un capitulo en los instructivos de El Faro respecto a cómo interactuar con niños y tener un enfoque pedagógico.
Le das espacio y la dejas hablar.
# next
\- Hay algo en el bosque señor – ella hace la típica pausa antes de decir "algo", es lo suficientemente grande para saber que nadie la va a tomar en serio si dice que hay "monstruos". Nadie salvo vos
\- Contame, que vieron con los chicos en el bosque
\- No sabemos. Es grande, grande como un colectivo, y rápido. Pero se mueve sin hacer ruido. A veces la vemos a lo lejos al atardecer, antes que la Madrea Alegría nos mande a dormir, ojos oscuros que nos observa entre los árboles, muchos ojos – Mientras habla las lágrimas se empiezan a amontonar en el costado de sus ojos, aun asi se mantiene valiente.
\- Tranquila, yo estoy acá exactamente para encargarme de eso. No me importa cuántos ojos tengan – Omitís decirle que te preocupa más que la cosa parece ser gigante, pero bueno, ella ya está suficientemente asustada por los dos
# next
\- Juan estaba seguro que eso se llevó a Darío, él siempre estaba en el bosque y una noche simplemente no volvió. Nosotros nos quejamos pero la Madre Alegría no quiso salir a buscarlos – la joven se lleva la mano a la mejilla – me pegó con una regla dado que le dije una mala palabra, pero estaba enojada. No lo dije a propósito, solo quería que salgamos a buscar a Darío.
\- ¿Así que Juan decidió ir a buscarlo el mismo? – Mierda que era valiente Juan, es más digno de ser un Guardián que muchos.
\- Si, pero lo pensó bien, estuvo recorriendo el bosque buscando donde está el escondido de…de ese animal. Cuando estuvo seguro, se metió a la cocina y le robó un cuchillo a la Hermana Esperanza – Belén puso la hermana en forma de O al darse cuenta lo que había confesado.
\- Te prometo que no solo voy a traer a Juan, sino que voy a traer también el cuchillo de la Hermana Esperanza asi le pide perdón y se lo devuelven.
# next
\- Por favor Señor, traiga a Juan de nuevo. Por favor – las lágrimas que se habían juntado en la esquina de sus ojos empezaron a escaparse.
\- Antes de salir, ¿Juan te dijo dónde estaba esta guarida?
\- No me dijo dónde estaba la guarida, pero me dejó un machete con el recorrido que hizo para llegar – Una sonrisa apareció empujando a las lágrimas.

* [Quedate tranquila, voy a hacer todo lo posible para traer a Juan de vuelta. Y también al cuchillo de la Hermana Esperanza] -> belen_respuesta
* [La próxima vez no tienen que hacer esto solo. Este es el numero de El Faro, si tienen problema, no duden en llamar] -> belen_respuesta
* [Ya paso mucho tiempo. No tengo confianza en que podamos encontrar a tu amigo con vida. Lo siento.] -> belen_respuesta

=== belen_respuesta ===
# music:misterio_ambient
~ tiene_machete = true
Las lágrimas que venía conteniendo se liberaron completamente y ella rompió en llanto.
Miras el machete que te dio con el recorrido para llegar a la guarida del monstruo. La letra del chico es una mezcla entre imprenta mayúscula y cursiva, y está llena de referencias como "a la derecha del árbol con forma de mano" y "seguir directo hasta la roca con forma de culo". Tal vez seguir estas instrucciones no va a ser tan fácil como parecía.
# inv:add:machete_bosque
-> hall_orfanato

// =========================================================
// COMEDOR
// =========================================================

=== comedor_orfanato ===
# music:orfanato
El comedor es un cuarto gigante con unas 6 mesas donde entran diez personas en cada una. Los chicos le dieron un aire a hogar poniendo un montón de dibujos en las paredes.
Te acercas a verlos, en la mayoría se ven a ellos jugando, en muchos en compañía del Padre Ponsatti o la Hermana Paciencia. Para sorpresa de nadie, no hay ni un dibujo de ellos jugando con la Madre Alegría.
Al final del cuarto se encuentra la barra, que conecta con la cocina. Miras por arriba y se ve una monja fortachona que está vaciando todos los cajones y poniendo su contenido sobre la barra, como si se tratará de la autopsia de un bazar
Te acercas, siguiendo de paso el camino de un olor de comida deliciosa que solo se logra cuando tenes en la cocina alguien que ostenta el título de abuela.
# next
\- Buenos días, soy {nombre_personaje}
\- Bienvenido – del fondo de la barra asoma la cabeza una Monja, tiene las mejillas coloradas por culpa del esfuerzo
\- ¿Hermana Paciencia no? – La Monja deja escapar una risita que te hace pensar que el nombre Alegría le correspondía más a ella
\- Si Si, y usted es la persona que vino a solucionar su problema. Por favor, tráigalos a casa. Lo de Juan paso ayer, estoy seguro que lo va a poder encontrar.
\- Le puedo preguntar hermana ¿Qué está haciendo?
\- Perdí uno de mis mejores cuchillos, estoy seguro que hace un par de días lo había guardado en el cajón de siempre.
\- Veo que no puedo descartar duendes entonces – dije riendo
\- Completamente no – contesta la Hermana Paciencia completamente seria.
# next
Le haces el interrogatorio de rigor. No parece darte mucha información sobre los niños. Darío, el primer niño que desapareció, era medio solitario y pasaba la mayoría del tiempo solo en el bosque. También era fanático del arroz con atún, aunque no sabes mucho como ese dato te va a ayudar en la investigación.
Juan en cambio es un chico bonachón, que muchas veces la ayudaba a lavar los platos a cambio de algún dulce, pero parece que no se los comía sino que se los regalaba a una amiga llamada Belén
# next
\- Antes de irse ¿Le puedo ofrecer un poco del guiso que estoy preparando para el almuerzo? – La Hermana Paciencia saca la tapa de una olla y la habitación se inunda de un olor que solo podes describir como olor a infancia y seguridad.
\- No sería justo, estaría sacándole la comida a uno de los niños.
\- Está buscando a los niños, le vendría bien la energía extra – La Hermana Paciencia mira para abajo y hablar en un susurro – aparte hice voto de ayuno mientras dure la investigación así que sobra comida.

* [No confió en la Hermana Paciencia. Prefiero no ingerir ningún alimento que no haya preparado yo mismo.] -> comedor_no_comer
* [¡Comida gratis!. Si algo aprendí es que nunca se le dice que no a la comida gratis] -> comedor_comer

=== comedor_no_comer ===
# music:orfanato
Ella pone el cucharon en la olla y saca una sustancia amarillenta con un pedazo de carne de origen desconocido. Preferís decir no.
\- Una lástima – La Hermana Paciencia se ve frustrada – la comida esta tan deliciosa
\- Recuerde sus votos de ayuno hermana
\- Si, la próxima vez voy a hacer votos de silencio – Contesta mientras arroja el contenido del cucharon de nuevo a la olla.
-> hall_orfanato

=== comedor_comer ===
# music:orfanato_alegre
Ella pone el cucharon en la olla y te lo pasa. Te pones en la boca el guiso, del cual sobresale un jugoso pedazo de carne, e inmediatamente tu boca se llena de sabores deliciosos.
Hacer comida de verdad (no calentar una olla con agua para tirar algún producto comprado en un supermercado) requiere tiempo y esfuerzo. Son de las dos cosas más importantes que uno le puede regalar a la otra persona. Las energías se tienden a trasmitir a las cosas, y sin duda la Hermana Paciencia sabia como trasmitir esas energías a su comida.
Sentís como una oleada calor y energía se extiende desde tu estomago por el resto de tu cuerpo, preparándote para la tarea que tenes por delante.
# stat:hp:+5
-> hall_orfanato

// =========================================================
// BOSQUE
// =========================================================

=== bosque_sin_pistas ===
# music:playa_ambient
El Orfanato está rodeado por un bosque gigante. El terreno es espeso y al norte se vuelve levemente montañoso, aparte no parece haber ningún sendero que podría darte una pista.
Das un par de vueltas intentando buscar alguna pista pero te terminas perdiéndote por unos minutos, podes encontrar el regreso de nuevo solamente porque entre las ramas se logra ver la cruz que decorada el techo de la capilla.
Sin duda sos un chico de ciudad.
Necesitas más pistas para saber qué camino tomar en el bosque. Volves al Orfanato esperando buscar más información que te diga en qué dirección podrían haber ido los chicos.
-> hall_orfanato

=== bosque_opciones ===
# music:playa_ambient
+ [Seguir el camino que te dio Belén # REQUIRES: inv:machete_bosque] -> bosque_belen
+ [Rastrear la energía demoníaca con magia # REQUIRES: inv:info_invocacion_demoniaca, magia >= 15] -> bosque_magia
+ [Volver al orfanato] -> hall_orfanato

=== bosque_belen ===
# music:playa_ambient
El machete que te dio Belén está lleno de referencias que, a primer momento, parecen no tener ningún tipo de sentido. Caminas lentamente desde la puerta del Orfanato e intentas verlo todo desde los ojos de un niño. Ves el bosque desde otra perspectiva, todo es más grande y peligroso, pero a la vez más divertido y lleno de posibilidades.
# next
{ conocimiento < 20:
    ~ llego_a_tiempo = false
    Los niños te exasperan. Pasas veinte minutos buscando algo que en el itinerario de Juan aparece nombrado como "la asamblea de los enanos" hasta que encuentras un valle donde hay un montón de pequeñas piedras colocadas en lo que más o menos parece un círculo. La idea es medio descabellada pero decides que puede ser correcta. Y es así con cada marca en el itinerario, es obtusa, simbólica y te genera extremada desconfianza.
- else:
    ~ llego_a_tiempo = true
    Los niños son geniales. No podes dejar de reírte cuando encontrás lo que en el machete Juan llamó "los arboles amigos". Adelante tuyo hay dos árboles que crecieron tan cerca que sus ramas se mezclaron entre sí, dando la impresión que se están dando un abrazo. Sin duda adentro de cada joven hay un artista que luego se ahoga en un mar de hormonas durante la pubertad. En el camino te dispersas un poco, empezás a ver las cosas con los ojos de un niño y le pones vos también nombres graciosos a los accidentes del terreno.
}
Pero llegas. Parece una herida al costado de una loma, como si un gigante hubiese apuñado a la tierra. En su cima hay un sauce llorón y sus hojas, largas y caídas, tapan la entrada simple vista. Pero tu pelota de luz no se deja engañar.
En la entrada la luz se vuelva cada vez más intensa mientras la pelota pierde su forma, como si fuerzas invisibles la tirarían desde cada extremo. Antes de desaparecer en un fogonazo de luz, se convierte en una flecha que te señala hacia adentro.
# next: Te adentras en la oscuridad
-> cueva_entrada

=== bosque_magia ===
# music:horror_ambient
Los demonios no pertenecen a este plano, son un cuerpo ajeno. Infeccioso. Al igual que con una enfermedad, nuestra realidad pone a actuar un sistema inmunológico que permite detectarlos. Muchas de las señales son tan conocidas que ya forman parte del folclore natural como que la madera se pudra de forma repentina, el vuelo descoordinado de aves, o que los fuegos tomen una tonalidad verdosa.
La mayoría de esos signos requieren una larga presencia de los demonios en este plano pero, para quien está más en sintonía con el mundo espiritual, puede detectar señales más sutiles. Como seguir un mal olor en la cocina
# next
Durante el Concilio de Nicea también se llevó a cabo otro Concilio, secreto, para evaluar los nuevos dogmas para combatir los seres sobrenaturales en el marco de la nueva fe cristiana. Algunos Obispos creían que los demonios debían ser combatidos únicamente con rezos y reliquias sagradas (sospechosamente todos los que adhirieron a esta postura murieron en menos de una década refutándose a sí mismos entre rezos inútiles y reliquias falsas). Otros creían que los demonios no podían venir del infierno ya que el sacrificio de Jesus en la Cruz debería impedir esto. El Obispo de Córdoba insinuó que los demonios vienen de otros planos más allá del control de Dios, postura que le valió ser tildado de hereje por el Obispo de Cartago, quien le terminó rajando la cara con una navaja. Todos sabemos lo tensa que pueden ponerse los debates teológicos.
# next
Lo importante es que, después de rajas un par de caras y tildarse de herejes mutuamente, llegaron a un consenso. Un simple hechizo que es una de las primeras cosas que se enseña cuando uno tiene una educación más o menos formal.
Solo necesitas centrarte en vos mismos. El ritmo de tu respiración, la circulación de la sangre por tu cuerpo, las pequeñas sensaciones sobre tu piel (ese maldito pedazo de carne entre los dientes que te está volviendo loco).
El cuerpo es una representación pura de nuestro plano, hecho a la imagen de Dios, por lo tanto debería confrontar directamente con una entidad de otra realidad.
Una vez que sos uno con tu cuerpo, solo necesitas proyectar esa imagen mental en forma de energía y dejarla ir, para que busque lo que no corresponde.
# next
Te frustra un poco que la imagen mental que sale de ser uno con tu cuerpo sea una pelota de luz amarillenta, de bordes indefinidos, que flota de forma torpe a la altura de tu pecho.
Esperabas algo más agraciado. Al menos más humanoide. Tal vez si necesitas esas sesiones de psicoanálisis.
Con un pensamiento dejas ir a la pelota de luz, que empieza a flotar por el bosque buscando algo que no encaje.
# next: Comienza la cacería
{ magia < 25:
    ~ llego_a_tiempo = false
    La pelota recorre el bosque de forma indecisa, cambia de dirección y velocidad de forma azarosa. En un momento te hice dar dos vueltas alrededor del mismo Jacaranda y en otro pegó un giro repentino que te hace resbalar y caer de frente contra un charco de barro.
    Parece que tu pelota tiene muy mal sentido de orientación, o en una parte de tu árbol genealógico se cruzó un perro ansioso que salió a corretear por el bosque.
    Seguís avanzando atrás de ella mientras, en el cielo, ves como lentamente el Sol sigue su curso y los minutos se conviertan en horas.
- else:
    ~ llego_a_tiempo = true
    La pelota se dispara como un tiro. Para ser una representación energética de tu interior, tiene mucho mejor estado físico que el tuyo. Cuando hagas el informe de esto vas a omitir que caso te matas cuando una rama se cruzó entre tus pies.
    Pero es rápida, eso es lo que importa, hay un niño desaparecido y cada minuto cuenta. De alguna forma lograste trasladar a la pelota esa necesidad y está actuando acorde, con un vuelo tan feroz que levanta hojas y tuerza ramas en su camino.
    Después de unos minutos tus pulmones parecen estar en llamas, tu corazón golpea tu pecho como si intentara escapar y tu estomago lamenta que hayas comido algo.
}
Pero llegas. Parece una herida al costado de una loma, como si un gigante hubiese apuñado a la tierra. En su cima hay un sauce llorón y sus hojas, largas y caídas, tapan la entrada simple vista. Pero tu pelota de luz no se deja engañar.
En la entrada la luz se vuelva cada vez más intensa mientras la pelota pierde su forma, como si fuerzas invisibles la tirarían desde cada extremo. Antes de desaparecer en un fogonazo de luz, se convierte en una flecha que te señala hacia adentro.
# next: Te adentras en la oscuridad
-> cueva_entrada

// =========================================================
// CAPILLA (CERRADA)
// =========================================================

=== capilla_cerrada ===
# music:orfanato
Intentas abrir a puerta de la Capilla, el edificio vecino al Edificio Principal, pero está cerrado. Hay algo que te parece muy erróneo de tener la puerta de una iglesia cerrada, debería estar abierta todo el tiempo por si uno tiene una ¿urgencia religiosa?.
Golpeas durante un tiempo la puerta pero nadie respodne. Te da la impresión que no vas a lograr entrar.
-> hall_orfanato

// =========================================================
// BAÑOS
// =========================================================

=== banos_opciones ===
# music:horror_ambient
El baño esta antecedido por un cuarto gigante, el cual el orfanato usa medio como depósito y zona de guardado. Te sorprende un poco que desperdicien un espacio tan grande y no le hayan dado un uso más útil.
Los dos baños son gigantes, más propios de un club o un gimnasio que de una casa. Pero es entendible si se tiene en consideración que lo tienen que usar 25 chicos a la vez.

+ [Reviso a fondo el baño de varones] -> bano_varones
+ [Reviso a fondo el baño de mujeres] -> bano_mujeres
+ [Hay algo raro en el cuarto que antecede a los baños. Quiero revisarlo mejor] -> banos_deposito
+ [Son baños. No todo tiene un significado oculto] -> banos_nada

=== bano_varones ===
# music:horror_ambient
El baño no tiene muchas sorpresas. Duchas al fondo, privados a los costados, un gran espejo con varias bachas al frente. Te agrada notar que al menos hay jabón y papel higiénico.
Notas que una de las ventanas está abierta. Raro porque el año está entrando en una época de clima mas frio. Te basta darle una mirada a la ventana para darte cuenta que un niño puede fácilmente trepar y pasar por ahí.
Ambos niños eran varones, tiene sentido.
La pregunta que debes hacerte es ¿Se escaparon por ahí? ¿O algo entro y se los llevó?
-> hall_orfanato

=== bano_mujeres ===
# music:horror_ambient
El baño no tiene muchas sorpresas. Duchas al fondo, privados a los costados, un gran espejo con varias bachas al frente. Te agrada notar que al menos hay jabón y papel higiénico.
Tocas las paredes, revisas las ventanas, inclusive tirar el botón.
Aca no hay nada
-> hall_orfanato

=== banos_deposito ===
# music:horror_ambient
Es un cuarto demasiado grande para ser un mero depósito. Viviste en monoambientes más chicos que esto. Moves un par de cajas. Buscas mecanismos en las paredes. Como buen descubrimiento, viene un poco por azar.
Recorriendo el lugar te das cuenta que en un rincón el piso sede un poco. Tomas tu cuchillo y cortas la cortina (era horriblemente de mal gusto, contaba como un monstruo).
Una trampilla que lleva a un sótano, cerrada por una fuerte cadena con un candado. Todo tiene un aspecto vetusto y oxidado, te da la impresión de ser inclusive anterior al Orfanato

+ [Bueno, me tocará ver si encuentro una llave] -> sotano_buscar_llave
* [Esto no podes abrirlo con una ganzúa, pero si con un poco de ácido # REQUIRES: conocimiento >= 25] -> sotano_acido

=== sotano_buscar_llave ===
# music:horror_ambient
Lo importante es que, si vos no podes abrir esa trampilla, menos un chico. Aparte la cadena esta puesta de este lado asi que nada se pudo meter por ahí.
Hay que seguir investigando y estar atento a ver si encontras unas llaves
-> hall_orfanato

=== sotano_acido ===
# music:horror_ambient
Te tiemblan un poco las manos mientras sacas el frasco donde va el ácido. Respiras, te relajas y pones unas gotas en el mecanismo del candado.
Un olor potente e industrial inunda el ambiente, por suerte estas cerca de los baños y nadie se va a preguntar por olores extraños.
Dejas pasar unos minutos y forzas con un elemento el candado. Con el mecanismo carcomido, basta un simple empujón y se abre.
Cuando abrís la trampilla entra una ráfaga de aire estancado. Nadie estuvo acá en mucho tiempo. Pero no es solo aire viciado y polvo lo que hay, notas cierta energía residual. Pesada, oscura y filosa, como caminar descalzo sobre un lugar donde sabes que hay vidrio roto.
Alguien estuvo realizando magia oscura ahí abajo.
# next: Te adentras en el sótano
La trampilla dejaba al descubierto una escalera caracol de piedra, la misma se sentía húmeda al tacto, como infecta de humedad….o sudor.
Una red extensa de telas de arañas dificultaba el camino. A medida que las arrancaban tus manos se ponían cada vez más ásperas.
El descenso a la oscuridad, más largo de lo que esperaba, terminaba en una pequeña sala circular. Era difícil distinguir cuánto de ella era fruto del trabajo humano y cuánto una formación natural.
# next
En el centro de la sala había un pozo, un agujero oscuro y ominoso. Los primeros pasos casi te hacen trastabillar, es así cuando notas que toda la habitación está ligeramente desnivelada apuntando hacia el pozo. De repente te parece más oscuro, profundo y peligroso que antes.
Pero lo que más llama la atención no es el pozo sino las cuatro estatuas que están en cada uno de los puntos cardinales.
Cuando la luz de tu celular pasa por su silueta notas que su aspecto es extraño. Cómo si el escultor tendría solamente una idea aproximada y de oída de la anatomía humana
Cuellos demasiados largos. Dedos torcidos de forma peculiar. Torso con protuberancias. Enfocas los rostros con la linterna pero todos han sido vandalizados. Totalmente destruidos hasta dejar la cara convertida en una masa deforme de piedras
# next
Todo el lugar parece viejo. Más viejo que el orfanato, el psiquiátrico y el centro turístico. De la época de la colonia inclusive.
Tal vez uno de los niños lo encontró. Mientras miras al pozo, preferís no pensar en la otra opción posible.

+ [Estudio las estatuas para ver si hay más información] -> sotano_estatuas
+ [Me acerco, con mucho cuidado, al pozo] -> sotano_pozo
+ [Ya vi todo lo que necesitaba ver. Vuelvo arriba] -> hall_orfanato

=== sotano_estatuas ===
# music:horror_ambient
Una atenta mirada te permite notar que cada estatua está sobre un pedestal donde, en una época, estuvieron grabados nombres. Sea quien sea que vandalizó esto, también se encargó de destruir la piedra
{ conocimiento >= 25:
    Pero los nombre, si bien son importantes, no son todo. Muchas veces la forma de las estatuas no busca representar la realidad, sino repetir simbolismos que trasmiten información.
    Una lectura de los rasgos de las estatuas te da una pista. Se trata de los cuatro obispos del 7mo círculo del infierno. Si estamos ante esto, sin duda un demonio fue invocado a nuestra dimensión.
    La trama de complica
    ~ tiene_info_demoniaca = true
    # inv:add:info_invocacion_demoniaca
}
-> sotano_acido_hub

=== sotano_pozo ===
# music:horror_ambient
Te acercas con respeto al pozo. Más cerca estas más notas la leve inclinación del terreno que te lleva hacia el mismo. Uno de los bordes del pozo presenta una mancha oscura descolorida, tal vez sea humedad. Esperas que sea humedad, las otras opciones te gustan menos.

* [Acercarse más] -> pozo_acercarse
* [Ya no tengo nada mas que hacer acá. Retrocedo] -> sotano_acido_hub

=== pozo_acercarse ===
# music:horror_ambient
El pozo genera una atracción casi hipnótica. Si bien avanzas mirando atentamente donde pisas por temor a resbalarte, te aseguras de estar siempre con la imagen del pozo en la borde de tu campo de visión. Sus bordes desnivelados, como unos dientes chuecos, y la oscuridad de su interior lo hacen parecer un animal a punto de atacar.
Empezás a tener la inquietante idea de que, si dejas de mirarlo, el pozo va a saltar y te va a devorar.
Llegas lo más cerca del borde que te permite tu coraje. Plantas los pies bien firme y te asomas para ver. La oscuridad es impenetrable. Tiras una moneda y la caída parece eterna pero, después de unos segundos, se escucha el leve tintineo.

* [No hay nada mas que hacer aca arriba. Cuelgo una soga a una de las estatuas y bajo por el pozo] -> pozo_bajar
* [Retrocedo] -> sotano_acido_hub

=== pozo_bajar ===
# music:cueva_arañas
# play_sfx:cuerda_rota
Te preparas para bajar al pozo, en lo cual puede ser una de las peores decisiones de tu vida. Te cercioras tres veces que el nudo que ata la soga a la estatua este bien ajustado. Es muy curioso que toda una vida pueda depender de algo tan pequeño.
Con mucho esfuerzo le das la espalda al pozo. Se te erizan los pelos de la nuca y durante unos segundos esperas que el pozo se estire como la trompa de un animal gigante y te engulla. Pero no pasa nada. Retrocedes unos pasos hasta llegar al borde del pozo y comenzás a bajar
# next: Bajando
Durante unos metros el pozo no es tan profundo, tus piernas tocan sin problema una de las paredes del pozo y sentís como si estarías caminando por la pared. Intentas llevar la cuenta para notar cuanto bajas. En tu cabeza los números se escuchan de forma clara y pausada "uno, dos, tres"
En un momento el pozo se ensancha y tus pies patalean en el aire sin encontrar donde apoyar. Durante unos segundos tus brazos se sienten débiles, sin duda no están preparados para cargar con todo el peso de tu cuerpo. En tu mente explotan todo el tipo de puteadas posibles y perdés cualquier tipo de conteo que venias llevando.
Solo estas vos, la soga y la oscuridad. Arriba tuyo se ve una pequeña luz que indica la salida de regreso a la habitación anterior, que parece tan lejana como una estrella en el cielo.

* [Esto es demasiado arriesgado. Vuelvo a subir] -> pozo_subir
* [No es momento para cambiar de opinión. Sigo bajando] -> pozo_seguir

=== pozo_subir ===
# music:cueva_arañas
Morir de forma estúpida no va a rescatar a los chicos. Y si el Orfanato está arriba de una gran red de cuevas, sin duda hay una mejor entrada. Es increíble la velocidad con la que reptas por la cuerda pero, antes de darte cuenta, volvés a la cima.
-> sotano_acido_hub

=== pozo_seguir ===
# music:cueva_arañas
# play_sfx:tension
El ser humano tiene muchas ventajas. La transpiración, ser bípedos, los pulgares opuestos. Casi nadie nos gana como cazadores de resistencia. Pero moverse por una soga en mitad de la oscuridad, eso no es nuestro fuerte.
Nunca te sentiste tan expuesto y vulnerable, como si la oscuridad fuese una gran presencia que te rodea.
Entonces notas la luz abajo.
# next: Pero no está sola…
...No es una luz, son varias. Ocho en total. De repente todas se prenden y apagan al unisono. Como si parpadearan.
Entonces lo notas, no son luces. Son ojos. Cada ojo del tamaño de tu cabeza. Haces la cuenta tanto del proporcional y si bien, colgado de una cuerda en la oscuridad, tu matemática no es solida pero lo suficientemente buena como para darte cuenta que lo que hay ahi es gigante.
Es entonces cuando eso empieza a reptar por la pared para llegar a tu lado
# shake
# next: Subir desesperadamente
{ fuerza >= 25:
    -> pozo_escape_exitoso
- else:
    -> pozo_muerte
}

=== pozo_escape_exitoso ===
# music:cueva_arañas
La adrenalina responde y tus músculos están preparados. Empezas a trepar a toda velocidad. Es un esfuerzo de todo el cuerpo. Tus brazos te elevan, tus piernas te empujan, tu estomago mantiene el sentido.
Los ojos te siguen a un costado pero, de alguna forma, logras ser más rápido. Crees que vas a llegar.
# next
Es en ese momento donde escuchas un siseo y algo atrapa a la soga. Miras para abajo pero la oscuridad no te deja ver que se trata. La soga de repente se pone tensa y te tira para abajo. Es como nadar contra corriente.
Por suerte das un par de esfuerzos más y llegas a la boca del túnel, donde el camino se estrecha. Tus piernas logran hacer pie contra una pared y te extendés, hasta que tu espalda choca contra la otra.
Un tirón más fuerte hace temblar a la cuerda y amenaza con partirla al miedo. Por suerte este flexionado contra las paredes del pozo y tu ascenso ya no depende de ella.
# next
Adolorido llegas arriba de todo. Con la ultima energía que tenes soltás la cuerda de la estatua y la tiras al pozo. Calculas que sea lo que sea que esta ahí abajo, es tan grande que no podrá caber por el último tramo del pozo. Pero no queres tomar riesgo
El entrenamiento valió la pena
-> sotano_acido_hub

=== pozo_muerte ===
# stop_music
# shake # flash_red
Comenzás a trepar por la soga pero no hay forma que le ganes a eso. Te sentís como un gusano en el anzuelo de una caña de pescar. De repente algo sisea y agarra a la soga.
Basta un tirón a la soga para hacerte perder el agarre.
# next
Cerras los ojos de forma instintiva, aun así en la oscuridad no podrías ver nada. Recordás la moneda que tiraste de lo alto del pozo y todo el tiempo que tardó en caer. La caída es lo peor, la velocidad golpea tus sentidos y te da vértigo mientras en tu mente hay una tormenta de idea, desde planes desesperados para salvarte hasta otras decisiones posibles que te hubiesen evitado terminar acá. A lo último solo una idea persiste en tu cabeza "espero morir del golpe, y no quedarme paralitico y a merced de lo que este ahí abajo".
Por suerte el destino es piadoso y tu cuerpo explota al chocar el cuerpo. Lo que acecha en el fondo esta feliz, comida fresca
# flash_red
FIN DEL JUEGO.
-> END

=== sotano_acido_hub ===
# music:horror_ambient
+ [Estudio las estatuas] -> sotano_estatuas
+ [Me acerco al pozo] -> sotano_pozo
+ [Vuelvo arriba] -> hall_orfanato

=== banos_nada ===
# music:horror_ambient
No entendes mucho qué relación tienen los baños con el misterio que estas investigando. Sentís que es tu responsabilidad darle una mirada al lugar pero, una vez complicado, es mejor centrarse en alguna pista que puede llevar a algo útil.
-> hall_orfanato

// =========================================================
// OFICINA MADRE ALEGRÍA
// =========================================================

=== oficina_madre_opciones ===
# music:misterio_ambient
Te acercas sigilosamente a la puerta de la oficina de la Madrea Alegría. Apoyas tu oreja contra la puerta y solo escuchas el golpeteo de unos dedos contra el teclado. Quien sabe que podría estar haciendo ¿Enviando un mail a entidades malignas avisando de tu presencia? ¿Poniendo avisos en algún sitio web oscuro de venta de niños?.
Aunque, tal vez sos vos quien está delirando. No todas las personas odiosas son malas. Y, aun las personas malas, no están metido en cuestiones estrictamente sobrenaturales.
Apoyas levemente tu mano en la manija de la puerta. Obviamente está cerrada

* [Me doy media vuelta y continuo con mi investigación] -> oficina_ignorar
* [Saco mis ganzúas del bolso y empiezo a trabajar # REQUIRES: conocimiento >= 20] -> oficina_ganzua
* [Le doy una patada a la puerta y listo # REQUIRES: fuerza >= 20] -> oficina_patada
* [Golpeo la puerta hasta que me atiendan] -> oficina_golpear

=== oficina_ignorar ===
# music:misterio_ambient
No te cabe duda que la Madrea Alegría debe ser una persona horrible con los chicos. Pero te parece que la misma se maneja dentro de los parámetros normales de una infancia triste en un orfanato. Y vos estas acá porque hay un elemento sobrenatural en juego.
-> hall_orfanato

=== oficina_ganzua ===
# music:misterio_ambient
Eureka. La puerta se abre y esperas encontrar a la Madrea Alegria con las manos en la masa.
Desde la puerta se puede observar el monitor de su PC (pésimo feng shui). Lees por arriba de su hombro, ignorando su cara de indignación, solo para darte cuenta que estaba escribiendo un mail.
La Madre Alegria estaba escribiendo un largo mail a una serie de empresarios de la zona, mezclando imploración con amenazas de fuego eterno en el infierno esta solicitando donaciones para….medias. Y ropa en general.
# next
\- ¿Qué esperaba exactamente? ¿Qué tenga a los dos niños debajo de mi escritorio?
\- Disculpe Madre yo…
\- Usted no tiene idea de lo difícil que es alimentar, vestir y proveer a cincuenta chicos casi sin fondos. Ni cuanto me tengo que arrastrar para conseguir un billete.
\- Claro yo…
\- Sin contar que ahora voy a tener que comprar una puerta nueva – Dice ella mientras mira el cerrojo de la puerta.
\- Le pido perdón yo…
\- Usted va a salir de aca y ponerse a hacer su trabajo. Y dejarme hacer el mio.
-> hall_orfanato

=== oficina_patada ===
# music:misterio_ambient
Solo necesitas una patada bien puesta. La puerta se abre y esperas encontrar a la Madrea Alegria con las manos en la masa.
Desde la puerta se puede observar el monitor de su PC (pésimo feng shui). Lees por arriba de su hombro, ignorando su cara de indignación, solo para darte cuenta que estaba escribiendo un mail.
La Madre Alegria estaba escribiendo un largo mail a una serie de empresarios de la zona, mezclando imploración con amenazas de fuego eterno en el infierno esta solicitando donaciones para….medias. Y ropa en general.
# next
\- ¿Qué esperaba exactamente? ¿Qué tenga a los dos niños debajo de mi escritorio?
\- Disculpe Madre yo…
\- Usted no tiene idea de lo difícil que es alimentar, vestir y proveer a cincuenta chicos casi sin fondos. Ni cuanto me tengo que arrastrar para conseguir un billete.
\- Claro yo…
\- Sin contar que ahora voy a tener que comprar una puerta nueva – Dice ella mientras mira el cerrojo de la puerta.
\- Le pido perdón yo…
\- Usted va a salir de aca y ponerse a hacer su trabajo. Y dejarme hacer el mio.
-> hall_orfanato

=== oficina_golpear ===
# music:misterio_ambient
Golpeas. Primero un par de golpes de cortesía. Luego más fuerte. Por último terminas convirtiendo tu mano en una maza contra la puerta, al punto que te llega a doler la mano.
\- Obviamente, si tendría dos nenes escondidos en mi oficina, ya me hubiese dado cuenta {nombre_personaje} – La voz de la Madre Alegría trasmite el cansancio de quien está agotada de interactuar con gente de poca inteligencia. – Vaya a hacer algo útil y busque a los niños.
-> hall_orfanato

// =========================================================
// LA CUEVA
// =========================================================

=== cueva_entrada ===
# music:cueva_arañas
La cueva no fue pensada para seres humanos. El techo es demasiado bajo, por lo que tenes que avanzar en cuclillas a costa del bienestar de tus rodillas. Al llegar al primer doblez las paredes se estrechan obligándote a pasar por un minúsculo agujero del cual solo te llevas un arañazo en tu rodilla y un fuerte sabor a tierra humedad en la boca.
La presencia de tela de arañas es total, hilos duros y pegajosos que dificultan tu avance y se pegan a tu cuerpo. Sin duda cuando salgas de esta cueva vas a quemar toda tu ropa, sentís que nunca va a poder estar limpia.
Después del segundo dobles ya no llega más luz al interior de la cueva
# next
El techo continuo bajando, te enteras de esto cuando te chocas con una raíz directo en la frente. El golpe te deja de rodillas y simplemente no hay espacio para levantarse. Tenes que avanzar gateando, como un bebe, mientras una mano está ocupada con la linterna del celular que marca el camino.
Gateas entre un mar de raíces, telarañas y oscuridad, por suerte el camino es solo uno así que tu única preocupación es seguir adelante intentando no golpearte.
Eso es hasta que llegas a una habitación (dudas que se llame habitación, deberías estudiar más geología) en la cual el camino se bifurca.
El camino de la izquierda parece bajar de forma serpenteante mientras el camino de la derecha sigue más o menos recto y, en su inicio, observas la media de un niño.
¿Para dónde vas?

* [Es obvio que Juan uso la media para marcar su camino. Niño inteligente. Hay que ir por ahí] -> cueva_derecha
* [Es conveniente explorar toda la cueva. Bajas por el camino de la izquierda] -> cueva_izquierda
* [Me tomo un momento para escuchar y estudiar mi ambiente] -> cueva_escuchar

=== cueva_escuchar ===
# music:cueva_arañas
Dejas de pensar en el dolor de tu cuerpo (tus rodillas parecen dos sirenas que mandan constante señales a todo tu cuerpo). Contenes la respiración y tranquilizas tu respiración.
Algo se mueve. Mierda. Muchas cosas se mueven. Esta lleno en la cueva, arriba y abajo, todo a tu alrededor. Es un sonido suave y punzante, como si algo caminaría en punta de pie. La mayoría del ruido viene por el camino marcado por la media.
Pero también hay algo que viene atrás tuyo. Mejor estar atento
~ sabe_algo_sigue = true

* [Sigo por el camino de la derecha, marcado por la media] -> cueva_derecha
* [Bajo por el camino de la izquierda] -> cueva_izquierda

=== cueva_izquierda ===
# music:cueva_arañas
Bajas por el camino de la izquierda, aunque sería más correcto decir que caes de forma más o menos controlada. La red de telaraña hace parecer el lugar más espeso y peligroso. Notas un par de huecos por el que podrías seguir avanzando pero ninguno se encuentra al ras del suelo. Sin duda Juan no siguió para acá, aunque alguno ser que vuele o se pegue a las paredes podría usar esos huecos para moverse.

* [Me tomo unos momentos para dejar unas trampas en esos huecos. Es importante cuidarse la espalda] -> cueva_trampas
* [Vuelvo lo más rapido y sigo por el otro camino] -> cueva_volver_derecha

=== cueva_trampas ===
# music:cueva_arañas
~ puso_trampas = true
No estás trabajando en las mejores condiciones pero podes hacer una trampa. Algo lo suficientemente letal como para destruir a lo que se meta por ahí y lo suficientemente ruidoso para que lo escuches. Solo esperas no haberse excedido y poner en peligro la integridad de la cueva. O matar a un topo inocente
-> cueva_derecha

=== cueva_volver_derecha ===
# music:cueva_arañas
Subir es más difícil que bajar. Así de cruel es la gravedad. Terminas apagando la linterna del celular para tener libre tus dos manos para agarrarte de las raíces. Logras subir por pura fuerza de voluntad es un par de raspones en las rodillas y tierra bajo todas tus uñas.
-> cueva_derecha

=== cueva_derecha ===
# music:cueva_arañas
Pasas por encima de la media asegurándote de dejarla en su lugar, podría ser necesaria a futuro una marca que te indique por dónde ir. Das cinco pasos y el camino te obliga a realizar un giro angosto a tu derecha.
Es ahí donde tu pierna deja de responder, miras para abajo y notas que tu pie está atrapado en una red de tela de araña. Por mucha fuerza que haces estos no son los finos hilos que veías hasta ahora, son más gruesos y resistentes, y parecen tener unos pequeños filos que muerden tu zapatilla y amenazan con llegar hasta tu piel.
# next
{ sabe_algo_sigue:
    -> cueva_emboscada_sabe
- else:
    -> cueva_emboscada_no_sabe
}

=== cueva_emboscada_sabe ===
# music:cueva_arañas
Estas completamente indefenso, este sería el momento perfecto para que te ataquen. No hay que ser muy inteligente para sospechar que sea lo que sea que te esté siguiendo va a pensar lo mismo.
Giras todo tu cuerpo y, con un movimiento fluido y puramente instintivo, tenes tu daga en la mano. No llegas a clavársela, todo es demasiado para eso.
El enemigo estaba saltando, un par de colmillos del tamaño de tu antebrazo y ocho ojos brillantes saliendo de la oscuridad y enfilando directo hacia tu cuello, pero vos llegas a posicionar tu daga antes.
No se puede decir que lo apuñalaste, simplemente pusiste el filo en el lugar correcto y la fuerza de su salto hizo el resto.
# next
Los colmillos para a centímetros de tu brazo, moviéndose frenéticamente mientras rasgan la nada misma. Es una araña gigante, del tamaño de un perro casero. En tu cuerpo conviven el éxtasis de haber ganado el combate y el asco de tener cara a cara a esa cosa horrible, con sus pequeños pelos cortos y sus extremidades torcidas increíblemente largas.
Haces un pequeño movimiento con la muñeca, dejando la daga baile dentro de sus órganos, y terminas el asunto.
Su cuerpo afloja el agarre y en un latido está en el piso, con las piernas enroscadas sobre sí mismo. El filo de la daga esta bañado con una sustancia transparente y pegajosa, aunque ahora no tenes suficiente frialdad para pensar en que podría ser importante guardar esa sustancia.
-> boveda

=== cueva_emboscada_no_sabe ===
# music:cueva_arañas
# shake # flash_red
Obviamente, este es el momento perfecto para una emboscada. Algo se mueve rápidamente atrás tuyo. Intentas girar, lo cual es muy difícil con un pie inmovilizado, y ves ocho ojos negros como la noche y un par de colmillos del tamaño de tu mano dirigiéndose hacia tu cuerpo.
El celular se te escapa de la mano y todo se vuelve un juego de sombras y movimiento. Sea lo que sea es grande, como un perro casero, y tiene una capa de pelo fino que te da asco.
Sus extremidades se enganchan a tu cuerpo, tu cerebro se apaga por una mezcla de miedo y asco, la mera idea de que tu piel entre en contacto con eso convierte en líquido tus entrañas y debilita tus rodillas.
Es en ese momento donde el par de colmillos se clavan en tu brazo. El dolor se expande en oleadas desde la herida, pero lo menos sirve para empujar al miedo y entrar en modo sobrevivencia.
# next
Tu cerebro se despersonaliza e intenta ver la situación desde afuera (posiblemente, un efecto secundario de haber jugado tantos juegos en tercera persona). Te está atacando una araña gigante. Aceptado. Y te da mucho asco la mera idea de tocada. Aceptado. Pero debes hacer algo para defenderte.
Antes de darte cuenta, estas atravesando la cabeza de una araña con una daga larga. Su cuerpo afloja el agarre y en un latido está en el piso, con las piernas enroscadas sobre sí mismo. El filo de la daga esta bañado con una sustancia transparente y pegajosa, aunque ahora no tenes suficiente frialdad para pensar en que podría ser importante guardar esa sustancia.
# stat:hp:-5
# next
Limpias tu daga con tu pantalón y haces un tajo en la manga de tu camisa, donde la araña gigante te mordió. Ya se ven dos pequeños bultos rojos que se sienten calientes y duele al tacto. Crecer con documentales a tu disposición te volvieron paranoico respecto a la mordida de arañas, solo falta encontrarte con arenas venenosas para tener todos los temores de tu niñez juntos.

* [Lo importante es sacar el veneno. Usas la daga para cortar los bultos] -> herida_cortar
* [Te chupas la herida y escupis el veneno] -> herida_chupar
* [Limpiar la zona y vendar la herida. Esperemos que basta hasta ver un profesional] -> herida_vendar
* [Estoy en una cueva llena de enemigos. No es momento de ponerme a jugar a la enfermera] -> herida_ignorar

=== herida_cortar ===
# music:cueva_arañas
El corte duele. Duele más que la mordida. Ejerces presión en tu brazo y del corte sale una mezcla de sangre, pus y de una sustancia con olor a aceite que esperas que sea el veneno. Tu herida parece un surtidor, lo cual nunca es bueno. Pero después de apretar un rato (y gritar un poco), solo expulsa sangre. Esperas que eso sea suficiente.
Aun así, luego de vendar la herida, notas que la movilidad de tu brazo sufrió gravemente por tu intervención.
# stat:hp:-10
-> boveda

=== herida_chupar ===
# music:cueva_arañas
Girar así resulta complicado. Y cuando te pones los bultos en la boca tu primera reacción es alejar la boca en una mezcla de dolor y asco. Aun así, ser humano es entender la necesidad de ciertas dosis de dolor y sacrificio en aras de un bien mayor. Respirar profundo, te llevas los bultos a la boca y succionas. Decidís imaginar que es helado de frutillar y vainilla.
Cuando sentís un gusto amargo en la boca, lo que supones que es el veneno, escupís al piso y seguís hasta que solo llega a tu boca el gusto metálico de la sangre.
# stat:hp:-5
-> boveda

=== herida_vendar ===
# music:cueva_arañas
Sacas de tu bolso el kit básico de primeros auxilios y limpias la herida (acompañado por un par de gritos). Una cueva oscura, manos sucias de tierra, una mordida por una araña que es lo suficientemente grande como para pagar boleto en un colectivo. No son las mejores situaciones pero esperas que funcione durante un tiempo.
Por lo menos hasta que te pueda atender Mary Shelley. Solo esperas que no decida amputarte el brazo o dejarte en observación para ver si ganas el poder de trepar paredes y tirar telarañas.
-> boveda

=== herida_ignorar ===
# music:cueva_arañas
Puteas por lo bajo. Pateas el cadáver de la araña a tus pies, y decidís seguís adelante ignorando el dolor. Cuando termines tu misión, estas seguro que en El Faro te van a dar la atención médica correspondiente
# stat:hp:-5
-> boveda

// =========================================================
// LA BÓVEDA
// =========================================================

=== boveda ===
# SPIDER_START: difficulty=normal, fuerza={fuerza}, magia={magia}, sabiduria={conocimiento}
# next: Llegas a una gran bóveda
# music:boveda_ambient
Avanzas atento. Generalmente una característica de los monstros sobrenaturales que imitan insectos es que forman parte de una gran familia, no te extrañaría enterarte que tiene unos centenares de primos esperando en algún lugar de esta cueva.
También existe la posibilidad de que un mago haya agrandado de alguna forma arañas normales, crees que no hay ninguna regla mágica que lo prohíbe, aunque confías que hay reglas de buen gusto y sentido común que disuadirían a la gente de hacer algo así.
# next
Apuntas la luz del celular para abajo, para no delatar tu presencia. Entras a una bóveda que parece gigante. Por primera vez en mucho tiempo podes volver a pararte erguido (tu espalda y rodillas agradecen). El aire se siente caliente y pesado.
Pasas rápidamente la luz por el techo. En lugar de un cielo estrellado te encontras con cientos de raíces de los árboles de la superficie, que forman un firmamento retorcido. Entre ellos, una red completa de redes de araña entre la cual cuelga diversos capullos.
Algunos son pequeños, como un conejo o una rata, pero otros parecen del tamaño perfecto para contener un humano.
# next
Corres hacia el capullo del tamaño de un humano. De un niño humano. Corres más rápido que nunca en tu vida, pero a la vez sentís que te moves demasiado lento. Que se joda la sutileza, debes rescatar a ese niño.
No ibas a dejar que un chico inocente muera. No en tu guardia. Todo tu entrenamiento y conocimiento deja de tener sentido si no sirve para salvar una vida.
En tu pequeña corrida le rezas a todos los dioses habidos y por haber. Haces amenazas y promesas por igual. Solo importa llegar
# next
En tu camino se interpone una pared gruesa y semi trasparente de varias capas de telas de araña. Teniendo en cuenta el tamaño de los bichos que la crean, no tenes ninguna duda de que tranquilamente podrían atraparte.
Tenes que pasar.

* [El fuego le gana a todo. Prendes fuego las telarañas] -> boveda_pasar
* [Todavia tengo mi daga en la mano, las corto] -> boveda_pasar
* [Simplemente descargo mi poder contra ellas # REQUIRES: magia >= 20] -> boveda_pasar_magia

=== boveda_pasar ===
# music:boveda_ambient
Lo importante es que logras llegar.
-> boveda_capullo

=== boveda_pasar_magia ===
# music:boveda_ambient
Solo una palabra y un gesto. Sos una fuerza de la naturaleza, como un monzón o un terremoto, las telarañas se tuercen y quiebran dejando un camino para que avances.
-> boveda_capullo

=== boveda_capullo ===
# music:boveda_ambient
Llegas hasta el capullo y de un solo movimiento cortas el hilo que lo ata al techo. A tus pies está el capullo. Te basta una simple mirada para darte cuenta que la forma que esconde es la de un joven. Supones que es tarde para Dario, tal vez sea Juan.
Sos muy cuidadoso con tu daga, como una caricia, solo usas la punta y la moves despacio para abrir la tela de araña sin lastimar al niño.
# next
La cara de Juan se nota consumida, con sus mejillas hundidas y su seño en un perpetuo seño. Buscas sus signos vitales pero la capa de telaraña te impide tocarle el cuello. Te desesperas para despejar la tela de araña para poder colocar tus dedos sobre su yugular, pero solo logras que tus manos se llenen de telas de arañas.
Perdes minutos vitales usando el poco filo de la tela de araña de tus manos mientras no podes evitar de notar que su pecho no se mueve normalmente.
# next
Llegas a la yugular. Nada. El mundo deja de existir a tu alrededor. No te importa la oscuridad de la cueva, las telas de araña ni las decenas (al menos) de monstruos que deben estar a acercándose en la oscuridad. Solo existen vos y este niño.
Y no vas a dejar que se te muera
# next: Comenzás a darle RCP
Dar RCP no es tan fácil. Menos cuando todo el pecho del paciente está tapado por una gruesa capa de telas de araña. Es un esfuerzo físico considerable. Uno textualmente siente como se desgasta su vida para transferirla a la persona que recibe RCP.
Los minutos dejan de tener sentido y el tiempo se cuenta solamente en las comprensiones que debes realizar y las insuflaciones que llevas adelante para ponerle aire en sus pulmones
# next
¿Tal vez deberías rendirte?. El RCP no es magia, no vas a revivir a alguien si ya estaba muerto.
{ puso_trampas:
    Te llega el eco de las trampas que pusiste disparándose más alla. Ojala en algún lugar haya tripas y extremidades de arañas regadas por las paredes. Con suerte ganaste tiempo para un par de comprensiones más.
}
# next
{ not llego_a_tiempo:
    Pero no pasa nada. Llegaste tarde y Juan esta muerto. Por el borde de tus ojos ves brillos entre la oscuridad.
    # achievement:unlock:juan_muerto Las arañas viéndote fallar. Si bien su forma de pensar debe ser considerablemente alienígena (al fin y al cabo son demonios y eligieron forma de araña), de cierta forma sentís que se burlan de tu fracaso.
    Te cargas el cuerpo de Juan, te sorprende lo poco que pesa su cuerpo. Frágil y liviano, no entendes como hay gente que le puede hacer daño a los niños. Al menos te vas a asegurar que tenga un entierro decente.
- else:
    ~ juan_vive = true
    Juan toce. Pones su cuerpo de costado y le das ligeros golpes en la espalda. Hace un poco mas de fuerza y escupe una sustancia viscosa y blancuzca que estaba alojada en sus entrañas. Por el borde de tus ojos ves brillos entre la oscuridad. Las arañas te observan. Si bien su forma de pensar debe ser considerablemente alienígena (al fin y al cabo son demonios y eligieron forma de araña), esperas que sientan el fracaso.
    No hay tiempo para sutilezas, te cargas el cuerpo de Juan y corres hacia la salida.
}
# next
# music:chase_ambient
La luz del celular rebota por todos lados mientras corres, intentando hacer malabares entre el cuerpo de Juan, tu daga y el celular. Rocas de formas extrañas, raíces retorciadas, telarañas quebradas, la luz solo te da un calidoscopio de imágenes poco prometedoras.
Pero no la necesitas, tu cuerpo recuerda el camino de forma instintiva y logras seguir el camino correcto y agacharte cuando es adecuado (casi siempre).
# next
Atrás tuyo se escucha movimiento. Como si alguien estuviera clavando un centenar de agujas en la tierra. Rápido, mecánico y sin pausa. Es raro que los bichos no griten o aúllen.
# next
Saltas por encima de la media que marcaba el camino. Casi estas afueran.
Entonces las vez. Primero son meramente el reflejo de luz en la oscuridad. El brillo de sus ojos. Dieciséis ojos. Dos arañas. Dejas el cuerpo de Juan en el piso y te preparas para pelear

+ [Nadie me puede detener # REQUIRES: fuerza >= 25] -> cueva_pelea_fuerza
+ [Va a ser una pelea dura] -> cueva_pelea_normal

=== cueva_pelea_fuerza ===
# music:boss_arañas
Antes que te des cuenta una sustancia babosa y pegajosa rodea tu muñeca, la inhábil por suerte. Una de las arañas te atrapo con su tela y te tira hacia ella mientras la otra se prepara para flanquearte.
Sorprendentemente, Cabral te entrenó para situaciones así. En vez de ofrecer resistencia a la araña que te atrapó, cargas contra ella.
Atrás tuyo notas movimiento, la otra araña saltó hacia donde deberías haber estado. Pero vos ya estas con la daga en la mano.
La araña no mostró sorpresa o miedo, principalmente dado que su rostro carece de los elementos necesarios para eso, pero tu felicidad bastó para llenar el cupo de emociones. Le clavas la daga diez veces, viente veces, los números no tienen sentido. Solo el dolor en tu brazo.
# next
La otra araña duda en cargar hacia vos. Entendible. Estas bañado en sangre traslucida y al lado del cadáver de su compañera.
Pero esa duda es su error, con toda tu fuerza pateas el cadáver hacia ella. No es una patada digna de un gol, pero basta para confundirla y hacerla ir hacia un costado. Justo donde la esperabas.
De un corte preciso la abrís al medio. La tierra de la cueva se llena de entrañas mientras la araña cae al piso y sus extremidades se doblan sobre si misma.
-> regreso_orfanato

=== cueva_pelea_normal ===
# music:boss_arañas
No tenes la fuerza para cargar contra ellas, así que haces lo único que se te ocurre: esperar. Daga en mano, espalda contra la pared, dejas que vengan.
# next
La primera araña salta hacia vos. La esquivas por centímetros y le clavas la daga en el costado. No es un golpe limpio, pero basta. El bicho se retuerce y cae.
La segunda araña duda. Aprovechas para arrancar la daga y lanzar una patada al cadáver de la primera, empujándolo hacia ella. En la confusión, encontrás el hueco que necesitabas.
# next
Un corte. Otro. La daga se siente pesada pero tus brazos no paran. Cuando terminas, estas cubierto de un líquido translúcido y temblando. Pero vivo.
-> regreso_orfanato

// =========================================================
// REGRESO AL ORFANATO - BATALLA FINAL
// =========================================================

=== regreso_orfanato ===
# SPIDER_DIFFICULTY: fast
# music:chase_ambient
Corres por el bosque con el cuerpo de Juan en tus brazos. Será por qué es liviano, o el ruido afilado de los enemigos clavando sus extremidades en los árboles ayuda a empujar tu adrenalina, pero avanzas sin bajar el ritmo. No hay raíces que se interpongan en tu camino o ramas que te molesten
# next
No necesitas guiarte. Entre las copas de los árboles sobresale la cruz de la capilla vecina al orfanato. Santuario, o "la X marca el lugar", depende tus preferencias teológicas (al menos nadie duda de la existencia de los piratas)
# next
La puerta del orfanato te espera abierta, una suerte dado que dudas que la energía te acompañe mucho más. Colocas el cuerpo de Juan en el piso del edificio, sobre la virgen de la institución.
Los niños empiezan a observar por la escalera, esperando que uno se anime a bajar, mientras la Madre Alegría espera en el umbral de la puerta de su oficina
# next
Viene el momento de las preguntas. No te molesta mientras te dejen contestar desde el piso y alguien se digne a traerte un vaso con agua
# shake
Es entonces cuando el piso comienza a temblar. Cómo si una maza gigante le estuviera pegando al piso. Te toma un segundo preguntarte si la red de túneles también llega hasta debajo del orfanato.
Parece que las preguntas se pospusieron.
# next
# shake # play_sfx:explosion
El piso explota, pedazos de las venecianas que forman la imagen de la Virgen salen volando por todos lados. Los chicos gritan, pero se salvan de un impacto gracias al barandal de la escalera. Alrededor de la Madre Alegría vuelan decenas de pedazos de piso, la puerta de su oficina parece golpeada por metralla. Pero ella sigue inmue (parece que un poder superior la cuida al fin de cuentas)
{ fuerza >= 25:
    Llegas a tirarte al piso justo en el momento en el que un pedazo de mármol vuela por dónde estabas
- else:
    { magia >= 25:
        Llegas a recordar las palabras y gestos para hacer un escudo protector, contra el cual de pulveriza un pedazo de mármol que iba a tu cabeza
    - else:
        Vos no tenes tanta suerte y recibís un golpe de un pedazo de mármol justo en al cara
        # flash_red
        # stat:hp:-5
    }
}
# next
Donde antes estaba la Virgen ahora hay una araña gigante. Sus cuatro extremidades superiores están buscando asidero en lo que queda del piso para subir hasta el orfanato. La cabeza de la Virgen fue remplazada por un ocho ojos arácnido que refleja la luz del ambiente, mientras entre su rostro lleno de pelos asqueroso se mueven un par de colmillos del tamaño de un niño.
El bicho tiene el tamaño de un colectivo, mientras tanto pequeñas arañas (del tamaño de un perro, las comparaciones son siempre odiosas) comienzan a inundar la habitación
# next
Hay que reconocerlo a la Madre Alegría, es valiente. Reacciona antes que vos y avanza hacia la araña gigante con una regla en la mano. No estás seguro si lo hace para proteger a los niños o para castigar a la araña que debe haber roto mil reglas al destruir, con la misma acción, el piso de la habitación y una imagen santa.
Te das cuenta en cuestión de segundos que las arañas pequeñas (contextualmente pequeñas) la flanquean

* [La ayudas] -> ayudar_madre
* [Tenes otras cosas más importantes que hacer] -> no_ayudar_madre

=== ayudar_madre ===
# music:misterio_ambient
{ fuerza >= 25:
    Cargas y, en el mismo, la empujas con tu hombro para sacarla del peligro (tal vez un poco más fuerte de lo que querías), descargas un mandoble con la espada que parte en dos a una de las arañas y terminas girando sobre tus tales para enfrentar a las tres arañas que quedan.
    Corte, esquiva, parada, amague. Clavar. Y clavar de nuevo. En cuestión de segundos convertiste a una de las arañas en una fracción extraña y terminas clavado a la otra al piso con y espada
    La cuarta araña salta por tu yugular, pero tus reflejos son mejores y se encuentran con el cañón de una escopeta que la pulveriza de un tiro.
- else:
    Cargas y, en el mismo, la empujas con tu hombro para sacarla del peligro (tal vez un poco más fuerte de lo que querías), descargas un mandoble con la espada que parte en dos a una de las arañas y terminas girando sobre tus tales para enfrentar a las tres arañas que quedan.
    Corte, esquiva, parada, amague. Clavar. Y clavar de nuevo. En cuestión de segundos convertiste a una de las arañas en una fracción extraña y terminas clavado a la otra al piso con y espada.
    La cuarta araña es más rápida y, antes que te des cuenta, llega a clavar sus colmillos en tu rodilla. El dolor recorre todo tu cuerpo pero es golosa y no se retira.
    Colocas tu revolver sobre su cabeza y le destruido los sesos
    # stat:hp:-5
}
-> ninos_decision

=== no_ayudar_madre ===
# music:misterio_ambient
~ madre_alegria_vive = false
# achievement:unlock:alegria_muere
La Madre Alegría grita dia veces, la primera cuando una araña la muerde en la pantorrilla y la segunda cuando el golpe la hace caer de rodillas. Rápidamente es superada. Cuatro arañas les clavan sus colmillos, una en cada extremidad. Las arañas comienzan a moverse y subir por una de las paredes, dejando atrás un rastro de sangre. Aún así la Madre Alegría no grita más, se limita a repetir una plegaria en latín.
En cuestión de segundos las arañas están caminando por el techo, haciendo colgar su cuerpo en el vacío. De repente todas las arañas de ponen a tirar a la vez.
# flash_red
El ruido de carnes desgarrados y huesos rotos es peor que los gritos, pero la Madre Alegría atraviesa su martirio como un verdadero mártir de la iglesia.
Todo termina cuando las arañas logran llevarse cada una un pedazo de cuero. Si cuerpo cae al piso disparando chorros de sangre en todas direcciones
# next
El grito de los niños vuelva a enfocarte, la araña gigante ya casi subió y las pequeñas están empezando a trepar por todo lados. Hay que tomar una decisión
-> ninos_decision

=== ninos_decision ===
# music:misterio_ambient
+ [Que suban y se escondan en la pieza] -> ninos_habitacion
+ [En la capilla van a estar seguros] -> ninos_capilla
+ [La cocina parece un buen lugar para atrincherarse] -> ninos_cocina
+ [A la carga. Que se suman a pelear conmigo] -> ninos_pelear
+ [Que huyan por el bosque. Con un poco de suerte van a lograr escapar] -> ninos_huir

=== ninos_habitacion ===
# music:orfanato
Basta con un grito y un gesto y los chicos entienden de que se trata. Belén se pone upa a uno de los nenes más pequeños y sube las escaleras. Un grupo de arañas, corriendo por una de las paredes van a por ellos
Esperas que lleguen a hacer una barricada a tiempo
-> cap2a_spider_check

=== ninos_capilla ===
# music:orfanato
Siempre es mejor no necesitar ayuda. Pero estas en un orfanato religioso, peleando contra demonios e intentando salvar a unos niños. Si hay un momento donde el de arriba podría dar una mano, es este.
Das la orden y Belén toma el mando, asegurándose que ninguno se quede detrás.
Una araña intenta seguirlo, pero basta un disparo para dejarle en claro que si atención debe centrarse en vos
-> cap2a_spider_check

=== ninos_cocina ===
# music:orfanato
A la par que das la orden, la hermana Paciencia abre la puerta y le rompe la cabeza a una de las arañas con un palo de amasar, que termina bañado en una sustancia viscosa (ojalá que lo lave antes de cocinar). Los niños corren hacia la cocina. En segundo se convierten en un pequeño ejército armado con sartenes, cuchillos y cubiertos que usan como armas arrojadizas.
-> cap2a_spider_check

=== ninos_pelear ===
# music:horror_ambient
Das la orden y bajan, armados con cintos, lámparas y muebles. Los más grandes cargan de forma valiente, pero carecen de técnica. Los más chicos corren y gritan, esperando lograr algo, pero se quedan inmóviles en cuanto terminan frente a frente con una araña.
A tu derecha vez a un niño que, inútilmente, le pega a una araña con una almohada. A tu izquierda una niña cae al piso, sobrepasada por una araña que busca llegar a su yugular.
-> cap2a_spider_check

=== ninos_huir ===
# music:horror_ambient
Belén dirige la retirada hacia la puerta de salida. Va adelante al principio, para romper el miedo, y atrás al final, para ayudar a los rezagados.
Una araña avanza por el techo, intentando llegar a la puerta antes que ellos, pero de un disparo la bajas al piso obligándola dolorosamente a respetar la ley de gravedad.
Solo queda esperar que no se encuentren más arañas en el largo camino hacia la salida.
-> cap2a_spider_check

=== cap2a_spider_check ===
# SPIDER_CHECK: 12
# SPIDER_STOP

+ [→] -> combate_final

// =========================================================
// COMBATE FINAL
// =========================================================

=== combate_final ===
# music:boss_arañas
# next
La araña gigante logra clavar una de sus extremidades en la pared y eso le da el punto de apoyo necesario para terminar de salir de la cueva. Ya no tenes más vueltas que dar, te toca ver cómo vencer a eso.

* [Saco la espada y cargo directamente contra eso] -> combate_espada
* [Le lanzo una bola de fuego # REQUIRES: magia >= 30] -> combate_magia
* [Disparos precisos a sus extremidades. Tal vez pierde el apoyo y se volverá a caer a la cueva] -> combate_disparos
* [Es un demonio. Con las palabras correctas puede ser expulsado de este plano # REQUIRES: conocimiento >= 30, inv:info_invocacion_demoniaca] -> combate_exorcismo
* [Esto es una locura. Mejor huir a la capilla] -> combate_capilla
* [Acercarme, cortar, huir antes que me ataque y repetir. Un baile letal # REQUIRES: fuerza >= 30] -> combate_fuerza

=== combate_espada ===
# music:boss_arañas
# flash_red
La sorpresa dura solo unos segundos. La impresión fuerte cuando una de las extremidades atraviesa tu pecho de punta a punta. Cuando empezas a sentir frío y tu ropa mojada (por tu propia sangre) llega la calma. ¿Cómo se te ocurrió que podías cargar directamente contra eso?. Mientras la araña lentamente te acerca hacia sus colmillos, ya nada te importa. Solo esperas que los niños sobrevivan
MORISTE. FIN DEL JUEGO.
-> END

=== combate_magia ===
# music:boss_arañas
Concentras toda tu energía, mostras tus palmas a la araña gigante y recitas las palabras correctas. A pesar del miedo y la adrenalina, tu lengua baila pronunciando las palabras correctas sin trabarse y en tu nombre permanece grabada, como corresponde, una imagen de un sol sobre un fondo negro.
Es entonces cuando el fuego empieza a salir de tus manos # play_sfx:boladefuego
# next
# flash_yellow
Llamarla una bola de fuego es incorrecto, es más parecido a un lanzallamas. Sentís como el aire de calienta, tus brazos empiezan a transpirar pero, a la vez, tu cuerpo se siente cada vez más frío y liviano. Cómo si estaría vaciando tus entrañas para alimentar la llama.
El fuego es tal que no te dejo ver la llamarada, solo podes ver algunas cosas en los bordes de la llamas. El techo de la habitación que se está derritiendo, una araña pequeña que corre en llamas hacia ningún lado en un costado.
El resto es un mundo de rojo y amarillo.
# next
Te acordás a la primera vez que te pusiste en contacto con tu poder, cuando ibas al colegio, esa sensación de dejarte llevar por algo que está dentro tuyo. Un combustible que puede hacer funcionar máquinas de pesadillas. Generalmente esa sensación es la señal de que tenés que parar, de que estás cerca de perder el control, pero está vez no te importa.
# next
Seguís hasta que la energía abandona tu cuerpo. Caes de rodilla mientras de las palmas de tus manos sale humo. Donde estaba la araña gigante hay una pila de cenizas gris (para ser preciso, toda la habitación parece los restos de un asado gigante).
Un viento entra en la habitación y las cenizas se dispersan perdiendo cualquier forma. Ganaste
-> despues_combate

=== combate_disparos ===
# music:boss_arañas
Sacas el arma y apuntas a las patas. Si le volás el apoyo, la gravedad hace el resto.
# next
El primer disparo le arranca una pata delantera. La araña gigante se tambalea pero no cae. El segundo disparo le da en otra articulación y un crujido horrendo llena la bóveda.
La criatura intenta compensar redistribuyendo su peso, pero ya es tarde. Con el tercer disparo pierde el equilibrio y cae hacia el agujero del que salió, llevándose pedazos de roca y telaraña.
# next
El eco del impacto dura varios segundos. Después, silencio. Te asomas al borde y solo ves oscuridad. No sabés si está muerta, pero no va a volver a subir.
-> despues_combate

=== combate_exorcismo ===
# music:boss_arañas
Cuando se trata de invitar (o desinvitar) a un demonio no hay que improvisar. Muchas veces se pasan meses preparando la parafernalia, memorizando los movimientos y las palabras.
Todo eso está muy bien, pero la araña está a unos metros tuyos y dudas que está dispuesta a darte unos meses de pausa.
# next
Sacas tu libreta de un bolsillo y empezas a recitar un exorcismo genérico, mientras lo cruzas con oraciones de protección y asistencia a todas la deidades de arañas y naturaleza que se puedan sentir insultadas por la forma que eligió el demonio.
Es un cambalache pero, al fin y al cabo es una discusión. Cómo toda discusión, la confianza y la autoridad importa más que los argumentos.
Y vos sos un guardián de El Faro, plantado frente a ella solo con un cuaderno como arma. Es difícil que al proyecte más certeza (o soberbia) que eso.
# next
Algo te escucha. Y te da la razón. Un viento empieza a recorrer la habitación. Un tornado que a vos no te mueve un pelo pero que a las arañas pequeñas las hace volar como hojas en otoño.
La araña más grande se resiste, clava sus extremidades en la pared pero están no resisten. Una extremidad directamente es cercenada por el viento.
El techo se rasga. La misma realidad hace lugar a otra cosa, de la grieta enana una cacofonia de grItos y olores a descomposición.
# next
# shake
El viento, con tus últimas palabras, eleva a todas las arañas y las empuja atraves de esa grieta
Entonces todos para. El techo vuelve a ser solo un techo, el viento desaparece, y la única señal de lo que ocurrió (aparte del hueco gigante en el piso) son restos de patas de araña que ya están secándose. Lograste expulsar al demonio de vuelta al pozo infernal de dónde vino.
-> despues_combate

=== combate_capilla ===
# music:boss_arañas
Te das media vuelta y huis. Por suerte alguien dejo la puerta abierta. Los metros que te separan de la capilla parecen eternos y notas dos arañas a ti costado, saltando de árbol en árbol, que van a llegar primero.
Una se desliza por un hilo de seda y pone su cuerpo justo para taparte la entrada a la Capilla, pero vos vas a entrar igual. Usas tus últimas energías para imprimir más velocidad y saltas sobre ella.
# next
Entras a la capilla y la araña, que se agarro a tu talón, hace lo mismo. En cuanto caen al piso de la capilla, la araña empieza a derretirse como una vela. Intenta avanzar hacia vos (es bueno ver a alguien comprometido, malo que esté comprometido en matarte) pero, en menos de tres pasos termina convertida en una baba traslúcida.
Parece que el dueño de la casa juega a tu favor.
# next
Te paras en el marco de la puerta y vez hacia afuera. La araña gigante y sus (no tan) pequeñas amigas esperan en el bosque. Ninguna se atreve a entrar en la Capilla.
Esto va a ser muy injusto, para ellas. Tiras tu bolsa en el piso y sacas tu rifle de caza. Te pones en posición, asegurándote de no pasar el umbral de la puerta, y disparas
# next
En el piso hay casi 100 casquillos. Cuando te quedaste sin balas en el rifle pásate a la escopeta y se ahí a la pistola. El bosque es un cementerio de arañas explotadas.
La araña más grande (el blanco más fácil) perdió dos extremidades y desaparecieron la mitad de sus ojos de un buen disparo.
Preparar tu última bala y, con un certero disparo, acabas con su vida
-> despues_combate

=== combate_fuerza ===
# music:boss_arañas
El primer hachazo rompe una de las extremidades de la araña y amenaza con hacerla caer por el hueco del cual viene. Pero en ese momento el resto de la arañas carga hacia vos. Es difícil protegerse cuando tus enemigos simplemente pueden caminar por el techo y caer sobre tu cabeza.
Con mas fuerza que técnica logras abrirte un hueco y huir a la otra punta de la habitación, dejando un par de arañas muertas en el camino
# next
Es un trabajo que requiere tiempo y frialdad. Con cada segundo las filas enemigas se van achicando. En un momento, cuando un mandoble perfecto parte al medio a un araña que saltaba para noerdertenel cuello, sentís la euforia apoderarse de vos. La sed de sangre. Justo logras mover tu cabeza para esquivar una tela de araña que pasa a centímetros.
Debes controlar es sed de sangre. Frío y metódico. Si te dejas llevar vas a cometer un error.
# next
Al final todas las pequeñas arañas estás convertidad en fracciones en el piso de la habitación.
Cargas contra la araña grande. Para confundirla le lanzas con todas tus fuerzas el hacha contra su rostro. Mientras usa su tela de araña para detener ese ataque, vos estás trepando por una de sus piernas hacia su lomo.
Colocas la escopeta a quemarropa sobre su espalda y disparas.
# next
Carne juntos al vacío y la oscuridad de dónde viene. De vuelta a la curva donde encontraste a Juan. Por suerte el grueso del golpe lo amortiguó su cuerpo.
Bajas, solo te queda tu fiel daga pero notas en sus ojos (los que le quedan) que ya no tiene voluntad de luchar. Eso a vos no te importa.
Clavas la daga profundo en uno de sus ojos. Tan profundo que hasta tus muñecas entran en su cuerpo.
No sé levanta mas
-> despues_combate

// =========================================================
// DESPUÉS DEL COMBATE
// =========================================================

=== despues_combate ===
# stop_music
# next: Después del combate
# music:misterio_ambient
{ spider_survived:
    La adrenalina tarda en salir de tu cuerpo pero te das cuenta que estás entero. Tus manos están firmes. Las arañas no pudieron con vos.
- else:
    La adrenalina tarda en salir de tu cuerpo. Las mordeduras de araña te arden en los brazos y el cuello. Tenés marcas por todos lados y cada movimiento cuesta el doble de lo que debería.
    # stat:hp:-10
}
Lo correcto sería llamar a El Faro, informarle de la misión y pedir que envíen un equipo de limpieza (y alguien para que te lleve de vuelta a Costa Alegre, no estás es condición de manejar)
Pero tenés cosas que hacer
# next
Te acercas a Juan
{ not juan_vive:
    Su rostro parece estar en paz. Agradeces que tenga los ojos cerrados. No podrías tolerar que te mire.
    Sentís la culpa, se siente a suciedad, como si hubiera comido mierda con las manos. ¿Podrías hacerlo salvado?¿Deberías haber llegado antes?
    { madre_alegria_vive:
        La hermana Alegria se acerca y te da un abrazo para el cual ninguno estaba preparado. Es huesuda y se mantiene rígida. Aún así te susurra "Gracias" y te dice "yo me encargo de atender el cuerpo y darle los ritos que merece".
        No sabes que decirle, pero está bueno que alguien se encargue de las cosas, vos no querés pensar más
    }
- else:
    Su respiración es regular. Teniendo en consideración todo lo que pasó a su alrededor es un milagro.
    Te sentas en el piso a su lado y comenzas, con mucho cuidado, a sacarle la tela de araña que sigue pegada a tu cuerpo.
    La euforia te invade. Salvaste una vida. Hay una persona que va a crecer, amar y tener hijos gracias a vos.
    Esto es ser un Guardián y es hermoso.
    { madre_alegria_vive:
        La hermana Alegria se acerca y te da un abrazo para el cual ninguno estaba preparado. Es huesuda y se mantiene rígida. Aún así te susurra "Gracias" y te dice "yo me encargo. Conozco suficiente de primeros auxilios".
        No sabes qué decirle, pero está bueno que alguien se encargue de las cosas, vos no querés pensar más
    }
}
# next
-> despues_combate_ninos

=== despues_combate_ninos ===
# music:misterio_ambient
Pero Juan no era el único niño. Cuando las arañas atacaron el orfanato se tomaron decisiones de último minuto y tenés que averiguar cómo salió todo.
{ ninos_capilla:
    Abrís la puerta de la capilla y todos los niños están ahí, sin un rasguño, a los pies de una estatua de Santa Inés. La Capilla funcionó
    Belén se acerca y te abraza. Luego todos los niños la siguen
    # achievement:unlock:ninos_ninguno
- else:
    { ninos_habitacion:
        Cuando subis al primer piso tu corazón da un vuelco. La puerta de una de las habitaciones fue arrancada de su marco, tirada por telas de arañas.
        Entras y ves a los chicos amontonados en una esquina, llorando. En el centro de la habitación están los cadáveres de 3 arañas…y de más de diez chicos.
        Los dejaste a su suerte e hicieron lo mejor que pudieron.
        Belén, en la esquina de la habitación y te mira con odio en la mirada.
        # achievement:unlock:ninos_mitad
    }
    { ninos_cocina:
        Abris la puerta de la cocina, pasando por arriba del cadáver de una araña que ni recordas haber matado.
        Al abrír la puerta encontrás a la hermana Paciencia en un abrazo mortal con una araña. Ella le logró clavar un afilado cuchillo de cocina en un costado mientras el bicho llegó a clavar sus colmillos en su cuello.
        Tiras el cadáver del animal al costado, con la misma sutileza que le darías a una bolsa de basura.
        Los niños salen, ilesos, de sus escondites debajo de las mesas o dentro de los cajones.
        Belén se acerca y le dan un beso en la frente a la hermana que se sacrificó por ellos. El resto de los chicos la imitan
        # achievement:unlock:ninos_ninguno
    }
    { ninos_pelear:
        Recorres el campo de batalla y es un paisaje de pesadilla. Dantesco. Mas allá de cualquier adjetivo.
        Pedazos de cuerpos de niños juntos a pedazos de arañas, como un rompecabezas morboso. Niños sin cabeza, niños arrastrados por los techos dejando tras de si un rastro de sangre arterial. Ese fue tu ejército
        Encontrás a Belén casi al final, muerta al lago de y araña a la cual le rompió la cabeza con una lámpara. Al principio dudas, tal vez esta desmayada. No se notan heridas
        Eso hasta que giras su cuerpo y notas que, donde debería estar la espalda, hay solo sangre y horror.
        # achievement:unlock:belen_muere
        # achievement:unlock:ninos_todos_mueren
    }
    { ninos_huir:
        Recorres el bosque. El camino a la puerta de salida está marcado por niños muertos y redes de tela de araña. Fue una masacre. Sus piernitas no le podían ganar nunca a las arañas.
        Al final, todavía agarrada al portón, está Belén.
        Le gritas pero no te contesta. Los dedos de su mano están rojos del esfuerzo y, a pesar de que lo intentas, no suelta el portón. No te responde y sus ojos miran sin mirar, perdidos en los horrores que queman su memoria
        # achievement:unlock:ninos_casi_todos
    }
}
{ madre_alegria_vive:
    # achievement:unlock:alegria_vive
}

FIN DEL EPISODIO.
-> intermision_2

// =========================================================
// CAPÍTULO 2B: EL NUEVO AMANECER
// =========================================================

=== capitulo_2b ===
~ capitulo_actual = "Cap. 2 — El nuevo amanecer"
# CHAPTER_BREAK: title=El nuevo amanecer, subtitle=Capítulo 2, music=city_ambient
# inv:clear_mission
# achievement:unlock:nuevo_amanecer
# music:city_ambient
Te encontrás en uno de los barrios periféricos de Costa Alegre. A esta distancia el viento ya no trae el ruido de mar ni el olor a sal. Tranquilamente podrías estar en cualquier lugar de la Provincia. Es un barrio tranquilo, de veredas amplias, calles protegidas por las sombras de grandes árboles y poco tráfico.
# next
Ya es de noche, así que las calles están vacías. Solo llega el ruido de televisores y familias cenando desde adentro de las casas. Aunque no te cuesta imaginar que de día esto está lleno de pibes andando en bicicleta y hasta alguna calle cortada por un partido improvisado de fútbol.
Es por ese clima tan relajado que te permite darte cuenta enseguida cuál es la casa que El Faro te mandó a investigar.
# next
La información viene de un Guardián que forma parte de las Fuerzas de Seguridad. Ya es el quinto ataque a una casa que tiene un patrón común. Para no exponer a sus fuentes, El Faro decidió tercerizar el trabajo en vos.
Pero antes de concurrir esta noche a la casa te preparaste.
¿Cómo?

* [Leíste el expediente de punta a punta buscando alguna información particular] -> cap2b_prep_expediente
* [Pasaste a ver a Cabral para reforzar el entrenamiento] -> cap2b_prep_fuerza
* [Leíste el último tomo que Enriquez tenía para vos] -> cap2b_prep_conocimiento
* [Le pediste ayuda a la Dra. Mary Shelley para reforzar tu arsenal mágico] -> cap2b_prep_magia
* [Pediste el contacto del Guardián en las Fuerzas de Seguridad] -> cap2b_prep_tuco
* [Descansaste. Necesitabas recuperarte para la misión] -> cap2b_prep_descanso

=== cap2b_prep_expediente ===
# music:city_ambient
El expediente hacía un análisis detallado de los casos anteriores. Incluidas fotos de las víctimas que hubieses preferido no ver. Sus cuerpos parecían secos, como pasas de uva, y no daban cuenta de haber ejercido ningún tipo de resistencia. Es más, hasta se podía notar una ligera sonrisa de placer en sus rostros. Lo cual parece una clara señal de un ataque de un Vampiro Superior.
# next
A diferencia de los vampiros inferiores, que parecen murciélagos de tamaño gigante, los Vampiros Superiores mantienen un aspecto humano y tienden a ser superiores a nosotros en todo lo relacionado con las funciones intelectuales, las interacciones sociales y, en ciertos casos, la magia. Lo cual es bastante injusto dado que tienen una eternidad para practicar.
# next
Entre su repertorio de habilidades se encuentra la posibilidad de generar placer con su mordida, similar a la heroína. Eso explicaría la sonrisa en los cadáveres. Los estudiosos afirman que es una característica evolutiva para garantizar su alimento (o sea nosotros). El placer garantiza que los humanos no se quejen y, en caso de que el ataque sea interrumpido, la víctima lo racionalice como una noche de jolgorio.
# next
Solo hay un pequeño detalle. Los Vampiros Superiores deben ser invitados a entrar a la casa por alguno de sus dueños. En el momento en que alguien duerme en un lugar se genera un límite de protección que el Vampiro Superior no puede romper, ni usando sus poderes. Solo con una invitación libre y voluntaria.
La lógica dictaba que no entraban en una casa por un bocadillo. Pero aparentemente alguien los había invitado a entrar en todos los casos. ¿Había una relación previa entre la familia y los Vampiros?
~ tiene_teoria_vampiros = true
# inv:add:teoria_vampiros
-> cap2b_llegada_casa

=== cap2b_prep_fuerza ===
# music:city_ambient
Cabral se encuentra en el campo de tiro, una parte del sótano de El Faro que huele a pólvora. En cuanto llegás te pasa una pistola Bersa 9mm y comenzás a hacer entrenamientos para disparar.
Practicás pegar dos balas en el pecho y una en la cabeza; con balas inertes en el peine para fingir que el arma se traba, con blancos móviles, y con blancos modificados para tener que disparar en lugares muy particulares.
\- Recordá que muchos de nuestros enemigos no tienen una anatomía parecida a la nuestra. Disparar al pecho o a la cabeza puede ser básico para una persona, pero también tenés que aprender a disparar a ojos que van a estar a la altura de la rodilla o a la base de los tentáculos.
# next
Cuando terminás estás transpirado y con olor a pólvora. Pero más seguro mientras tu cuerpo se acostumbra al shock de disparar un arma.
Cabral te invita a una cerveza para festejar tus avances y, de yapa, algún sánguche así no salís a la misión con el estómago vacío.
# stat:fuerza:+5
-> cap2b_llegada_casa

=== cap2b_prep_conocimiento ===
# music:city_ambient
Esta vez en el escritorio de Enriquez te estaba esperando la guía con la letra F. Ella solo dejó de tipear con una mano para acercarte el libro. Así que buscaste la silla más cómoda y te pusiste a leer.
Es curioso que haya una varilla entera de cuestiones tan mundanas como "fregar". Rápidamente te das cuenta que "follar" ocupa casi la mitad del libro.
# next
El capítulo está lleno de ilustraciones de súcubos en poses imposibles. Hay que admitir que te sonrojás un poco.
\- Por favor, las manos donde pueda verlas – dice Enriquez con una mueca en la cara que podría ser una sonrisa.
La excitación se va cuando las ilustraciones son reemplazadas por fotografías médicas, que te golpean como un baldazo de agua fría. Al parecer hay un montón de seres sobrenaturales que les gusta girar lo que no debe ser girado, penetrar lo que obviamente no es un orificio de entrada y... ¡¿QUÉ PONEN SUS HUEVOS EN DÓNDE?!
Terminás el tomo con un nuevo aprecio por la abstinencia.
# stat:conocimiento:+5
-> cap2b_llegada_casa

=== cap2b_prep_magia ===
# music:city_ambient
Entraste a la oficina de la Dra. y te encontraste con un cuadro particular. En una mesa ratona se encontraba la Dra. Mary Shelley junto a una cabra negra, que por lo cómoda que estaba sentada parecía no tener problema en moverse en dos patas, y cuya cabeza estaba rapada y con marcas de suturas recientes.
En el centro de la mesa, un mazo de cartas. Parece que entraste en mitad de una partida de truco (la cabra estaba ganando).
# next
\- Me creés si te digo que es parte de un experimento esencial para trasladar la conciencia de los guardianes caídos a otros cuerpos – la Dra. miró al horizonte y cambió el tono de voz, como si le hablase a una audiencia – imaginá una organización donde ningún Guardián muera, donde su consciencia esté siempre segura y su cuerpo sea un mero objeto, como un auto, o un traje que se elige el que mejor se ajusta para cada misión.
\- Lo peor es que le creo Dra. No necesita explicarme nada.
Después de perder la partida de truco, la Dra. dedicó su tarde a repasar con vos principios claves de la magia así como cuestiones de anatomía que debés tener en cuenta si no querés lastimarte por canalizar grandes energías.
# stat:magia:+5
-> cap2b_llegada_casa

=== cap2b_prep_tuco ===
# music:city_ambient
Al Profesor no le gusta mucho tu pedido. Hace referencia a un montón de reglamentos (que fingís conocer) respecto a la importancia de centralizar la información y limitar el contacto entre los Guardianes para que, en caso de caer uno, no sea un total caos para la organización.
Literalmente, lo perseguís desde su despacho, atravesando el Hall Central donde trabaja Enriquez, hasta el estacionamiento de la Universidad donde guarda su coche.
# next
Lográs convencerlo cuando le hacés notar que, al ser un caso en el que obviamente va a estar involucrada la policía, tal vez sería necesario el contacto en caso de que te detengan u obstaculicen la investigación.
Te pasa un número. Cuando te contactás con la persona, un hombre de cincuenta años que se presenta como "Sargento Tuco", la conversación está llena de silencios. Parece que no le gusta que lo hayas contactado, pero dice que si necesitás podría hacerte un favor. Una sola vez. Remarca la unicidad del favor. Con todos los objetivos posibles.
~ tiene_favor_tuco = true
# inv:add:favor_tuco
-> cap2b_llegada_casa

=== cap2b_prep_descanso ===
# music:city_ambient
Tu cuerpo agradeció un día entero en la cama. Solo saliste para una comida reparadora, de esas que llenan el estómago pero también acarician el alma. Y pasaste toda la tarde jugando a juegos retro sin ninguna relación con tu trabajo, lo necesario para despejar la mente.
Pero eso te permitió volver a estar afilado para el trabajo.
# stat:hp:+5
-> cap2b_llegada_casa

// ---------------------------------------------------------
// SECCIÓN 2: LLEGAR A LA CASA + ENTRAR
// ---------------------------------------------------------

=== cap2b_llegada_casa ===
# music:city_ambient
A unos metros de la esquina se encuentra estacionada una patrulla policial. Justo frente a una casa blanca de un piso, con un pasillo en un costado que delata la existencia de un patio al fondo. En la puerta de la propiedad se encuentra un oficial de la policía, recostado contra la pared. Con solo verlo te das cuenta que su estado físico no es el mejor y, si no estuviera recostado, posiblemente sufriría un infarto si pasa media hora seguida de pie.
Esperás que sea el mejor tirador, porque en su defecto es un total desperdicio de dinero público.
# next
Te acercás a la casa bajo la luz azulada que desprende la patrulla de policía. A simple vista notás la puerta entreabierta (no forzada) y una tira de plástico medio caída que dice "policía - no pasar". Justo lo que pensás ignorar.
Dás un paso más y el agente de policía, que estaba quemando neuronas con el celular, lleva instintivamente su mano a la pistola que está en su cinto. De repente las dudas sobre su puntería se convierten en un problema muy presente.
Ambos se miran, como en un western de bajo presupuesto. Hay que tomar una decisión.
¿Qué hacés para entrar a investigar en la casa?
-> cap2b_entrar_opciones

=== cap2b_entrar_opciones ===
# music:city_ambient
+ [Te retirás y das la vuelta manzana buscando una entrada por los techos] -> cap2b_entrar_techos
+ {tiene_favor_tuco and not uso_favor_tuco} [Es momento de cobrar tu favor con Tuco] -> cap2b_entrar_tuco
* [Tenés un billete en el bolsillo. El viejo sobornín siempre funciona] -> cap2b_entrar_soborno
+ [Te hacés invisible para entrar en la casa # REQUIRES: magia >= 30] -> cap2b_entrar_invisible
+ [Fingís ser un policía para que te deje pasar] -> cap2b_entrar_policia

=== cap2b_entrar_techos ===
# music:city_ambient
Dás la vuelta a la manzana sin problema, buscando del otro lado cuál puede ser un punto de entrada. Frente a un frondoso árbol hay un comercio cerrado, que tiene pinta de haber sido un kiosco hace un par de crisis económicas. Sospechás que es tu mejor forma de entrar dado que debe ser la única propiedad vacía.
Trepás al árbol y con un poco de equilibrio, y un mucho de suerte, lográs avanzar por una rama que te acerca al frente del kiosco. De un salto lográs llegar al techo.
# next
Las luces del patrullero te sirven como guía. Aun así caminás con cuidado buscando evitar las tejas rotas o los techos de chapa que pueden despertar a algún vecino. Asomado al techo de un vecino encontrás el patio de la casa. Solo es cuestión de descender unos cinco metros.
{
    - fuerza < 20:
        Pero tus brazos no resisten y caés de sopetón al patio. La fuerza del impacto recorre tu cuerpo y hace un crack en tus rodillas. Por lo menos el policía que vigila la calle no escucha tus puteadas.
        # stat:hp:-5
    - else:
        Tus brazos resisten. Quedás colgando del borde en un intento de achicar la caída. Cuando caés lo hacés de forma ordenada, rodando por el piso mientras protegés tu cabeza y distribuís el impacto entre tus extremidades. Lo lograste.
}
-> cap2b_dentro_casa

=== cap2b_entrar_tuco ===
# music:city_ambient
Le mandás un mensaje a Tuco explicándole lo que necesitás, por respuesta solo recibís un emoticón. Te apoyás contra un árbol, fingiendo que sos solamente una persona que salió a disfrutar el aire fresco de la noche.
No sabés qué hizo Tuco pero fue rápido. La radio del policía empieza a sonar y una voz gritona le recita una serie de códigos y claves. Con una velocidad que creías imposible, el policía corre hacia su patrullero y sale quemando llanta para atender una urgencia que, sospechás, solo existe en la imaginación de Tuco.
# next
Con mucho cuidado, para no destruir la cinta policial y dejar rastros de tu entrada, empujás la puerta y entrás en la casa.
~ uso_favor_tuco = true
# inv:remove:favor_tuco
-> cap2b_dentro_casa

=== cap2b_entrar_soborno ===
# music:city_ambient
Te acercás al policía con el billete de más alta denominación en la palma de tu mano. Lo saludás, asegurándote que en el apretón de manos el billete pase a su sudorosa palma, mientras le sonreís.
\- Trabajo en el diario "Buenos días Costa Alegre". Vamos a publicar una noticia en la sección criminal y me gustaría sacar unas fotos para la primicia.
\- No está permitido – te contesta mientras ve el billete que le diste.
# next
\- Si no se puede sacar foto tal vez solo podría ver el lugar, como para estar más en tema para escribir la nota.
\- No está permitido – dice esta vez mientras guarda el billete en su bolsillo trasero.
\- No entiendo. Te di un billete.
\- Como un agradecimiento por mi servicio. De otra forma sería un soborno y eso...
\- Dejame adivinar, no está permitido.
\- Exactamente.
# next
No estás seguro si el policía no entiende el concepto de soborno, o lo entiende demasiado bien, pero te retirás con tu orgullo herido y un poco más pobre.
-> cap2b_entrar_opciones

=== cap2b_entrar_invisible ===
# music:city_ambient
Te alejás hasta doblar la esquina, y perder el campo de visión con el policía. Protegido por las sombras te ponés a recitar el hechizo. Es algo fácil, solo se requiere unas palabras, romper un espejo, quemar unas entrañas de ave y hacerte un corte superficial con un arma blanca nunca usada. Obviamente, son todos objetos que llevás en tu mochila.
# next
El hechizo no hace ningún ruido imponente, solamente vas desapareciendo lentamente. Al principio te cuesta un poco caminar. Es raro avanzar cuando no ves tus piernas o calcular por dónde vas sin ver tus brazos, pero te las arreglás.
Lo que sí, el hechizo no impide que generes sonido. Así que te acercás con cuidado al policía evitando pisar baldosas flojas y hojas secas.
Al llegar a la puerta contenés la respiración y pasás por debajo de la línea policial en una especie de juego de zamba letal. Pero lo lograste, estás dentro de la casa.
-> cap2b_dentro_casa

=== cap2b_entrar_policia ===
# music:city_ambient
Hay un refrán que dice que la clave para entrar en un lugar es fingir que pertenecés. Así que sacás pecho y ponés cara de asco, como si tu lengua hubiese sido reemplazada por un limón.
Te acercás a paso firme hasta la puerta de la casa.
\- Buenas agente, soy el teniente García – por una cuestión meramente estadística estás seguro que en toda comisaría hay alguien con el apellido García – vengo a investigar la escena del crimen.
# next
Para reforzar tu argumento pasás rápidamente por la cara del policía tu billetera esperando que confunda el carnet de la biblioteca con algún tipo de identificación oficial.
Por suerte no estás ante el miembro más brillante de las fuerzas de seguridad. Se limita a asentir, dar un paso al costado, y dejarte pasar. Contra todo pronóstico, lo conseguiste.
-> cap2b_dentro_casa

// ---------------------------------------------------------
// SECCIÓN 3: INVESTIGACIÓN DE LA CASA — HUB
// ---------------------------------------------------------

=== cap2b_dentro_casa ===
# music:horror_ambient
{ paso_tiempo_casa >= 3:
    -> cap2b_araca_la_cana
}
{cap2b_dentro_casa == 1:
    Una vez que entrás a la casa te tomás unos segundos para escuchar el ambiente. Parece que, por ahora, no hay ningún agente de la policía en la propiedad. No sabés si eso significa que llegaste tarde o temprano, pero tenés una ventana de tiempo para realizar tu propia investigación con una mirada que receptúe lo sobrenatural.
    # next
    La casa es la típica estructura chorizo. Una puerta al frente que da a la calle y una al fondo que da al patio trasero. Delante de todo hay un zaguán y al fondo una cocina, en el pasillo conector una serie de habitaciones.
    ¿Qué hay que ver primero?
- else:
    ¿Y ahora a dónde?
}

+ {not cap2b_casa_zaguan} [El zaguán] -> cap2b_casa_zaguan
+ {not cap2b_casa_cocina} [La cocina] -> cap2b_casa_cocina
+ {not cap2b_casa_bano} [El baño] -> cap2b_casa_bano
+ {not cap2b_casa_ninos} [La primera habitación] -> cap2b_casa_ninos
+ {not cap2b_casa_padres} [La segunda habitación] -> cap2b_casa_padres

=== cap2b_casa_zaguan ===
# music:horror_ambient
~ paso_tiempo_casa += 1
El cuarto es un caos. La puerta a la calle está entreabierta y, con un simple análisis, te das cuenta de que no fue forzada. Sea lo que sea que hizo esto fue invitado a entrar.
En el medio del cuarto hay un cuerpo chiquito, un niño de no más de 12 años. Sentís el ácido de un vómito subiendo desde tus entrañas y quemando todo a su paso, pero lográs contenerte. El cuerpo está seco, como una pasa de uva, y no muestra signos de una pelea.
{tiene_teoria_vampiros:
    # next
    Te fijás en el cuello y notás dos pequeñas marcas casi invisibles entre los pliegues de la piel reseca. Un ignorante se las confundiría con marcas de agujas pero vos sabés de qué se trata. Colmillos de vampiro. Tu teoría cobra forma.
}
# next
Sobre una mesa había fotos familiares y adornos de vacaciones. Es el único lugar que está destrozado, pero no por una pelea. ¿Los atacantes destruyeron el altar? ¿Con qué fin?
{conocimiento >= 20:
    # next
    Intentás ver las fotos desde la perspectiva del atacante. Tal vez envidiaba la vida de una familia normal o se avergonzaba de lo que vio. Entre las fotos notás la de un joven, con ropa actual, pero con el marco rodeado con un listón negro y una estampilla de la Virgen.
    ¿Puede ser un muerto reciente en la familia? Alguien que fue convertido para ser usado como caballo de Troya para que le abran la puerta.
    Sacás una foto y le pedís a Enriquez que busque entre sus fuentes en qué cementerio se encuentra enterrado el joven.
    ~ tiene_cementerio_correcto = true
    # inv:add:cementerio_correcto
}
Creés que no hay nada más que ver en esta habitación. Debés continuar con tu investigación.
-> cap2b_dentro_casa

=== cap2b_casa_cocina ===
# music:horror_ambient
~ paso_tiempo_casa += 1
La cocina es modesta, con una pequeña mesa en el medio para que pueda comer una familia, y cuenta con una salida al patio del fondo.
El cuerpo se encuentra en el piso, con un brazo estirado hacia la puerta de salida en un vano intento de escape, pero los perseguidores lo alcanzaron antes y lo dejaron clavado al suelo, donde permanece. Cuando lo ves no podés dejar de pensar en una pila de hojas secas en mitad del otoño.
{tiene_teoria_vampiros:
    # next
    Te fijás en el cuello y notás dos pequeñas marcas casi invisibles entre los pliegues de la piel reseca. Un ignorante se las confundiría con marcas de agujas pero vos sabés de qué se trata. Colmillos de vampiro. Tu teoría cobra forma.
}
# next
Hacés una recorrida pero no hay mucho más que ver acá. La familia dejó descongelando unas milanesas, sin duda para cenar esta noche. Es una niñería pero te dan una tristeza infinita.
-> cap2b_dentro_casa

=== cap2b_casa_bano ===
# music:horror_ambient
~ paso_tiempo_casa += 1
No hay mucho para ver en el baño. Un botiquín de primeros auxilios normal en el cajón bajo la mesada. Ninguna medicación particular. Un poco de humedad en el techo.
Lo normal que puede encontrarse en cualquier baño de Costa Alegre, hasta el tuyo. Perdiste tiempo buscando algo escondido en la mochila del inodoro y detrás del bidet que seguramente debió ser invertido de otra forma.
-> cap2b_dentro_casa

=== cap2b_casa_ninos ===
# music:horror_ambient
~ paso_tiempo_casa += 1
Un cuarto de niños. En cuanto abrís la puerta y ves que se asoma la cabeza de un juguete (un oso peluche del tamaño de un nene pequeño) sabés que te va a hacer mierda recorrer esta habitación.
Por suerte no hay cuerpos. No acá al menos. Pero notás algo raro, la habitación está dividida en dos. Una punta tiene una cama de un niño con el caos y los juguetes propios de un preadolescente.
# next
Pero del otro lado hay una cuna. Una cuna vacía con una manta apartada a un costado. No necesitás chequear el archivo, tu memoria no te dejaría olvidar un hecho tan mórbido: nadie usó ninguna referencia a cadáveres de bebés.
{conocimiento >= 25:
    # next
    Te dedicás un poco a pensar para qué podrían necesitar un bebé, mientras hacés toda tu fuerza para apartar la respuesta fácil: "un aperitivo para el camino".
    Existe un hechizo de Vampiros Superiores que implica sacrificar a siete bebés, uno por cada día de la semana. Como toda la magia vampírica implica sangre y dolor pero, en teoría, permitiría a un vampiro salir sin problema a la luz solar.
    Que sepas, no hay registro exitoso del hechizo, pero si vos lo conocés, no hay razones para que un Vampiro Superior también sepa de su existencia y esté intentando recrear esto.
    Te sentás en una silla (pequeña) y ves las fotos del expediente: en todas las casas se ven cunas o juguetes de bebés. Tu teoría cobra fuerza.
    ~ tiene_teoria_sacrificio = true
    # inv:add:teoria_sacrificio
}
-> cap2b_dentro_casa

=== cap2b_casa_padres ===
# music:horror_ambient
~ paso_tiempo_casa += 1
La cama matrimonial. El cadáver está en la cama, entre sábanas revueltas. En este contexto la cara de éxtasis del cuerpo se torna más macabra cuando la comparás con la piel reseca que sale entre las sábanas.
{tiene_teoria_vampiros:
    # next
    Te fijás en el cuello y notás dos pequeñas marcas casi invisibles entre los pliegues de la piel reseca. Un ignorante se las confundiría con marcas de agujas pero vos sabés de qué se trata. Colmillos de vampiro. Tu teoría cobra forma.
}
# next
Notás, al lado de la cama, un sacaleche y unas mamaderas. ¿También había un bebé en la casa?
-> cap2b_dentro_casa

// ---------------------------------------------------------
// SECCIÓN 3B: ARACA LA CANA + ESCAPAR
// ---------------------------------------------------------

=== cap2b_araca_la_cana ===
# music:horror_ambient
# achievement:unlock:caer_en_cana
Tus pensamientos son interrumpidos por una serie de ruidos que vienen de la calle. Coches parando en la puerta de la casa y voces de hombres toscas y violentas. Acostumbrados a dar órdenes y respaldar sus palabras con acero. Podrían ser criminales pero al escuchar que se saludan usando rangos, te das cuenta de que es la policía.
Seguramente están viniendo a profundizar su investigación de la escena de crimen. Tus pesquisas ya terminaron, esperás tener suficiente información para continuar con el caso.
Ahora lo importante es ver cómo hacer para salir de la casa sin que te vean.
-> cap2b_escapar_opciones

=== cap2b_escapar_opciones ===
# music:horror_ambient
+ [Corrés al patio trasero y trepás por los techos # REQUIRES: fuerza >= 25] -> cap2b_escapar_techos
+ [Te hacés invisible # REQUIRES: magia >= 30] -> cap2b_escapar_invisible
+ [Te escondés en la casa] -> cap2b_escapar_escondite
+ [Salís corriendo por la puerta principal antes que reaccionen] -> cap2b_escapar_correr

=== cap2b_escapar_techos ===
# music:horror_ambient
Vas hacia el fondo de la casa. El patio no tiene un punto de apoyo así que intentás correr con todas tus fuerzas contra la pared y hacer un poco de parkour para lograr empotrarte contra una pequeña abertura.
Lo lográs, la adrenalina invade tu cuerpo y lamentás que no haya nadie para ver lo que hiciste dado que fue bastante increíble.
# next
Ya con tu mano en la primera saliente (e ignorando que todo tu peso está castigando tu muñeca) podés ir buscando otras imperfecciones en la pared para seguir avanzando. En el pasillo se escuchan voces y luces.
Un poco más. Tus brazos se sienten en llamas pero las voces siguen avanzando hasta el patio.
A la par que se abre la puerta del patio, lográs subirte al techo. Contenés un suspiro y esperás que los policías se alejen.
-> cap2b_investigacion

=== cap2b_escapar_invisible ===
# music:horror_ambient
Elegís una esquina que parece poco importante, y donde esperás que nadie pase, y preparás el hechizo. Es rápido, improvisado y a falta de escenografía que te ayude tenés que apoyarte en fuerza bruta y eso se siente mientras recitás las palabras. Se siente en el dolor punzante en tu cabeza y en las gotas de sangre que empiezan a escaparte de tu nariz.
# next
Pero lo lográs, los policías entran y recorren la casa. Uno mira a tu esquina y pasa casualmente la luz de su linterna por donde está tu cuerpo, pero no encuentra nada. Debés contenerte para que los latidos de tu corazón no te delaten pero lo importante es que lo lograste. Una vez que ellos se reparten por la casa para hacer su investigación, aprovechás y avanzás hacia la puerta de la calle con el mayor sigilo posible.
En el camino te llama la atención que uno de los policías dejó la carpeta de su investigación sobre la mesa.

+ [La robás] -> cap2b_escapar_robar_carpeta
+ [Seguís de largo] -> cap2b_investigacion

=== cap2b_escapar_robar_carpeta ===
# music:horror_ambient
La verdad es que, cualquier información que tengan, le vas a sacar más provecho vos que ellos. Ya en la calle hojeás la carpeta: parece que un pariente de la familia murió hace poco. ¿Pudo haber sido convertido en Vampiro y usado como caballo de Troya para que la familia los invite a pasar? Vale la pena investigar el cementerio donde fue enterrado.
~ tiene_cementerio_correcto = true
# inv:add:cementerio_correcto
-> cap2b_investigacion

=== cap2b_escapar_escondite ===
# music:horror_ambient
Escuchás las voces ásperas del otro lado de la puerta. No hay mucho tiempo, sospechás que cuando entren van a dar vuelta la casa buscando cualquier pista posible. Tenés que elegir dónde esconderte.

+ [Debajo de la cama de alguna de las habitaciones] -> cap2b_escondite_cama
+ [En el baño, dentro de la bañera] -> cap2b_escondite_banera
+ [Hay unas plantas frondosas en el patio] -> cap2b_escondite_plantas

=== cap2b_escondite_cama ===
# music:horror_ambient
Corrés a la habitación de los padres y te metés bajo la cama. El lugar está oscuro y lleno de polvo pero lo que más aprensión te da es que a centímetros tuyo, del otro lado del colchón, está el cadáver de una de las víctimas. Intentás reconfortarte pensando en que al menos no debe tener sangre, no si el trabajo lo hizo un Vampiro Superior. Pero la línea de insectos avanzando por una de las patas de la cama para hacerse un festín con su carne te revuelve el estómago.
# next
Escuchás unos pasos y, en cuestión de segundos, estás enceguecido por la luz de una linterna que apunta directo a tu rostro. El policía te mira con un rostro que mezcla incredulidad y cansancio, y vos no podés evitar sentirte como un niño que fue atrapado en mitad de una travesura. Que te arresten no es tan divertido como lo hacen ver las películas, antes de darte cuenta estás camino a la comisaría más cercana.
-> cap2b_comisaria

=== cap2b_escondite_banera ===
# music:horror_ambient
Te escondés dentro de la bañera y cerrás la cortina detrás tuyo. Te sentís un poco ridículo y tenés serias sospechas de que la luz del baño trasluce tu sombra. Intentás agacharte para ser menos sospechoso y solo lográs mojarte el pantalón con una capa de agua que lleva días.
# next
Escuchás unos pasos y, en cuestión de segundos, estás enceguecido por la luz de una linterna que apunta directo a tu rostro. El policía te mira con un rostro que mezcla incredulidad y cansancio, y vos no podés evitar sentirte como un niño que fue atrapado en mitad de una travesura. Que te arresten no es tan divertido como lo hacen ver las películas, antes de darte cuenta estás camino a la comisaría más cercana.
-> cap2b_comisaria

=== cap2b_escondite_plantas ===
# music:horror_ambient
Corrés al patio y te escondés entre unas plantas altas. Sabés que los humanos tenemos un pasado cazador pero no estás logrando hacer contacto con los genes de tus ancestros. La pose te parece incómoda y, más te movés intentando buscar una posición correcta, más desarmás las plantas y quedás expuesto. Para colmo de males, la Luna brilla con toda intensidad.
# next
Escuchás unos pasos y, en cuestión de segundos, estás enceguecido por la luz de una linterna que apunta directo a tu rostro. El policía te mira con un rostro que mezcla incredulidad y cansancio, y vos no podés evitar sentirte como un niño que fue atrapado en mitad de una travesura. Que te arresten no es tan divertido como lo hacen ver las películas, antes de darte cuenta estás camino a la comisaría más cercana.
-> cap2b_comisaria

=== cap2b_escapar_correr ===
# music:horror_ambient
Corrés con todas tus fuerzas hacia la puerta principal, notás que está por ser abierta así que te lanzás como un ariete contra ella. El golpe trae dolor, pero por suerte la adrenalina entra a jugar. Antes de darte cuenta estás en la calle, notás por el rabillo del ojo que en tu salida un policía salió volando y golpeó contra un patrullero.
Corrés con todas tus fuerzas hacia la esquina, con el objetivo de romper el campo de visión de los policías y esconderte en la oscuridad. Atrás tuyo se escuchan puteadas y disparos (por suerte más de los primeros que de los segundos).
{
    - fuerza >= 20:
        # next
        Por suerte el entrenamiento de la policía es deficiente. Llegás a la esquina sin que una bala haya rozado tu cuerpo, aun así seguís corriendo, zigzagueás por otra esquina hasta llegar a una Avenida. Un colectivo justo está parando y te subís (no importa adónde, solo debe ser lejos de ahí). Es sorprendente que lograste pasar eso sin un rasguño.
    - else:
        # next
        Sentís un picor en tu brazo, como si un insecto te hubiese clavado un aguijón. Te pasás la mano. Sangre y carne. Problemas para preocuparse después, ahora es importante alejarse lo más posible antes de que la pérdida de sangre te haga bajar el ritmo.
        Por suerte llegás a una Avenida y encontrás un colectivo que está parado. No importa adónde va, alejarse es todo lo importante.
        # stat:hp:-10
}
-> cap2b_investigacion

// ---------------------------------------------------------
// SECCIÓN 5: COMISARÍA
// ---------------------------------------------------------

=== cap2b_comisaria ===
# music:city_ambient
~ llegaste_tarde_2b += 1
Es verdad que la burocracia es el pilar fundamental del Estado Moderno. Es increíble la cantidad de pasos que tienen que pasar antes de terminar tras las rejas. Primero toman tus huellas digitales, y aparte se toman el trabajo de levantar un acta con todos tus datos, y te dejan esperando esposado en un pasillo vaya a saber qué cosa.
Sabés que El Faro tiene gente encargada de asegurarse que toda esta información se borre, más que terminar arrestado lo que te da miedo es el reto que te va a dar Enriquez la próxima vez que la veas.
# next
Terminás en una celda húmeda respirando un aire viciado que seguramente proviene de los pulmones (esperás) de las personas que estuvieron antes detenidas en este lugar. Tus compañeros son un borracho que, por suerte, está durmiendo y un joven sentado en una esquina.
Tenés un pequeño cruce de miradas con el joven que está sentado en la esquina. Solo unos segundos, ojos con ojos. Él termina reconociendo que acá vos sos el mayor factor de peligro y se retuerce en su asiento intentando hacerse más chico.
# next
Sabés las minucias del proceso legal pero dudás que tu investigación pueda soportar estar detenida durante doce horas en aras del formalismo jurídico.
¿Qué pensás hacer?

+ [Solo resta esperar] -> cap2b_comisaria_esperar
+ {tiene_favor_tuco and not uso_favor_tuco} [Tenés derecho a una llamada. Es la hora de cobrarte el favor con Tuco] -> cap2b_comisaria_tuco
+ [Tenés derecho a una llamada. Tal vez Enriquez pueda ayudarte] -> cap2b_comisaria_enriquez

=== cap2b_comisaria_esperar ===
# music:city_ambient
~ llegaste_tarde_2b += 1
Perdés un par de horas que solo te sirven para poner en duda la eficiencia del sistema penal. En lugar de pensar respecto a la gravedad de tu crimen (que en este caso es ser un pésimo jugador de escondidas) te dedicás a disociar completamente y perderte en tu mundo interno.
# next
Seguramente El Faro cumple su tarea de soborno, amenazas y sabotaje informático. Sin mucho preámbulo un policía colorado se acerca, abre la celda, y con un gesto de la cabeza te indica que vayas para la calle.
-> cap2b_en_la_calle

=== cap2b_comisaria_tuco ===
# music:city_ambient
Pedís tu llamada. Esperás que se nieguen y estás preparando tus argumentos cuando un policía cansado viene a buscarte y, mientras bosteza, te lleva a un pasillo donde hay una verdadera reliquia: un teléfono de línea colgado en la pared. Juntás fuerza y marcás el número de emergencia que te dieron en El Faro. Del otro lado escuchás una tos grave y una sola palabra: "identifíquese".
# next
\- Sos un pelotudo – Ese es el único comentario que te dedica el Sargento Tuco cuando le terminás de contar la situación. La frase viene acompañada por un silencio largo que sospechás que lo dedica a decir para adentro todo el resto de los insultos que tiene pensado para vos.
\- Supongo que a todo Guardián le puede pasar algo así – decís con cierta duda.
\- Pibe, ¿te das cuenta la cantidad de problemas que me podés traer llamándome desde adentro de la comisaría?
\- Perdón, de verdad no había pensado en eso.
\- No, porque sos un pelotudo – Sospechás que "pelotudo" es la palabra favorita del Sargento Tuco.
\- Tenés razón, pero soy un pelotudo que quiere ser libre. ¿Me vas a sacar?
\- Dame cinco. No digas nada. Y olvidate este número – El Sargento Tuco cortó en cuanto dijo la "o" con tanta intensidad que sentís el golpe del tubo del teléfono como una cachetada.
# next
No pasan ni cinco minutos desde que cortás. En cuanto llegás a la celda ya vienen a buscarte. Sin mucho preámbulo un policía colorado se acerca, abre la celda, y con un gesto de la cabeza te indica que vayas para la calle.
~ uso_favor_tuco = true
# achievement:unlock:favor_tuco
# inv:remove:favor_tuco
-> cap2b_en_la_calle

=== cap2b_comisaria_enriquez ===
# music:misterio_ambient
Pedís tu llamada. Esperás que se nieguen y estás preparando tus argumentos cuando un policía cansado viene a buscarte y, mientras bosteza, te lleva a un pasillo donde hay una verdadera reliquia: un teléfono de línea colgado en la pared. Juntás fuerza y marcás el número de emergencia que te dieron en El Faro. Del otro lado escuchás la voz de Enriquez.
# next
\- Pero, ¿Me estás llamando de la Comisaría? – Es la tercera vez que Enriquez te hace la misma pregunta en sucesión, solamente cambió su tono. De la sorpresa a la ira y de ahí a la burla.
\- Sí, necesito que arreglen todo para sacarme lo más rápido así puedo continuar con la investigación.
\- Es sorprendente. Generalmente cuando los Guardianes llaman a este número real están rodeados o en un Hospital. O en la Morgue.
\- Dudo que alguien te llame de la Morgue – le contestás.
\- Podrían llamarme de la Morgue, en especial si están avanzando en su investigación sobre Vampiros.
# next
\- Te prometo que nunca te voy a llamar desde una Morgue – hablar con Enriquez se siente como hablar con tu madre cuando eras adolescente – Ahora, ¿podés arreglar todo para que me saquen rápido?
\- Obviamente, más que nada por el honor de El Faro. Es vergonzoso que con tantos monstruos ahí afuera vos hayas terminado atrapado por la policía.
# next
No pasan ni cinco minutos desde que cortás. En cuanto llegás a la celda ya vienen a buscarte. Sin mucho preámbulo un policía colorado se acerca, abre la celda, y con un gesto de la cabeza te indica que vayas para la calle.
-> cap2b_en_la_calle

=== cap2b_en_la_calle ===
# music:city_ambient
En la calle una ráfaga de viento te trae el olor a mar. Estuviste unas pocas horas encerrado pero aun así estás seguro de que preferís la libertad. Te alejás un par de metros de la puerta de la Comisaría para pensar cómo continuar tu investigación, cuando escuchás un par de pasos atrás tuyo. Girás sobre tus talones y te encontrás con un policía alto, con cara de pocos amigos, y una cabellera pelirroja que llama la atención.
\- ¿Sargento Tuco? – Arriesgás.
# next
\- Mirá si sos pelotudo. No hay nada más fácil que encargarse de Vampiros. Y de alguna forma vos lográs terminar encerrado en una comisaría. Pelotudo.
Te das cuenta, con escucharlo hablar, que Tuco solo respeta una cosa y si no le ponés un límite te va a tratar mal toda la vida.
Antes de darte cuenta, le estás contestando.

+ [Tan fácil no debe ser, sino lo hubiese solucionado vos solito. Por algo el Faro me mandó a mí a solucionar el problema. Pelotudo.] -> cap2b_tuco_respuesta_1
+ [Tenés razón. Estoy perdido. ¿Qué harías vos a continuación?] -> cap2b_tuco_respuesta_2
+ [Quería hacer la visita turística. Ya me voy.] -> cap2b_tuco_respuesta_3

=== cap2b_tuco_respuesta_1 ===
# music:misterio_ambient
Te sentís muy bien con tu respuesta. Tan bien que apenas te llegás a dar cuenta de que la cara del Sargento Tuco se pone tan roja como su pelo. Un puño vuela hacia vos.
{
    - fuerza < 25:
        El golpe te dejó con el culo en el piso y una buena cantidad de sangre en tu remera, sangre que debería estar en tu nariz.
        # stat:hp:-5
    - else:
        Ves el golpe venir y tenés tiempo de esquivarlo. Como buen hombre de uniforme, el Sargento Tuco está acostumbrado a pelear con gente que tiene un temor reverencial a pegarle. Vos no pertenecés a eso pero, para su suerte, tampoco sos tan estúpido para pegarle a un policía en la puerta de la Comisaría.
        A último momento tu golpe, que salió de puro reflejo, se abre y termina convertido en una bofetada que lastima más el ego que otra cosa. El Sargento Tuco se queda duro, como si lo hubiese reseteado.
}
# next
\- Andá a uno de los cementerios de la ciudad y buscá el nido de los Vampiros Superiores. Rápido y simple. Hasta vos lo vas a poder hacer – Después de tirar esa pieza de información, el Sargento Tuco se da media vuelta y vuelve a entrar en la Comisaría.
-> cap2b_investigacion

=== cap2b_tuco_respuesta_2 ===
# music:misterio_ambient
Te muestra una sonrisa llena de dientes castigados por la nicotina. Le encanta sentirse poderoso.
\- Andá a uno de los cementerios de la ciudad y buscá el nido de los Vampiros Superiores. Rápido y simple. Hasta vos lo vas a poder hacer – Después de tirar esa pieza de información, el Sargento Tuco se da media vuelta y vuelve a entrar en la Comisaría.
-> cap2b_investigacion

=== cap2b_tuco_respuesta_3 ===
# music:misterio_ambient
Te das media vuelta y lo dejás hablando solo. Durante los primeros segundos sentís una sensación de vértigo atrás tuyo, como si le hubieses dado la espalda a un perro furioso, pero el Sargento Tuco solo se remite a insultarte. Un bis infinito de la palabra "pelotudo".
\- Andá a uno de los cementerios de la ciudad y buscá el nido de los Vampiros Superiores. Rápido y simple. Hasta vos lo vas a poder hacer – Después de tirar esa pieza de información, el Sargento Tuco se da media vuelta y vuelve a entrar en la Comisaría.
-> cap2b_investigacion

// ---------------------------------------------------------
// SECCIÓN 6: ELEGIR CEMENTERIO
// ---------------------------------------------------------

=== cap2b_investigacion ===
# music:playa_ambient
Después de todas tus aventuras dejás que tus piernas te lleven en piloto automático mientras tu cabeza procesa toda la información que tenés. Es de noche y llegás hasta una playa. El mar se ve oscuro y agazapado, como una gran fiera dispuesta a saltar sobre su presa.
Teniendo en consideración tu último caso, es muy posible que realmente sea eso.
# next
Es claro que tenés un problema de Vampiros. Y los Vampiros hacen su nido en la gran mayoría en los cementerios. El único problema es que en Costa Alegre hay tres cementerios diferentes e ir al equivocado puede generar una pérdida de tiempo peligrosa. # play_sfx:sting_revelacion
-> cap2b_elegir_cementerio

=== cap2b_elegir_cementerio ===
# music:playa_ambient
+ {tiene_cementerio_correcto} [Esperás que te contacte Enriquez a ver si logró obtener información] -> cap2b_cementerio_pista
+ [Voy a "Lomas de Paz". El cementerio más coqueto de la ciudad] -> cap2b_lomas_de_paz
+ [El cementerio "Recuerdo Eterno" es el más grande y más cercano a la ciudad] -> cap2b_cementerio_recuerdo
+ [El "Cementerio Municipal". Sus torres llenas de nichos deben ser perfectas para emboscadas] -> cap2b_cementerio_municipal

=== cap2b_cementerio_pista ===
# music:playa_oscura
El teléfono vibra en tu bolsillo exigiendo atención. Un mensaje de Enriquez. Parece que tu pista tenía algo de valor. Hace menos de una semana un tío de la familia falleció en circunstancias extrañas y fue enterrado en "Lomas de Paz", aparentemente en el pasado la familia había tenido cierto dinero y mantenían una cripta paga.
# next
Te tomás un momento para unir los puntos en tu cabeza. Por alguna razón los Vampiros Superiores quieren entrar a una casa así que convierten a un familiar y lo usan como Caballo de Troya para que un pariente, dolido por la pérdida pero sorprendido por el regreso de su ser querido, los invite a pasar.
Si esa persona es aparte titular de una cómoda cripta, sería muy estúpido no usarla como guarida.
{tiene_teoria_sacrificio:
    # next
    Sin duda lo hacen porque quieren secuestrar a los bebés. Es muy difícil encontrar a un bebé de noche en alguno de los lugares que utilizan los vampiros como coto de caza. Sin duda el jefe de este grupo de vampiros está pensando hacer magia de sangre peligrosa. Tenés que ir a detenerlo.
}
Sin pensarlo, te dirigís al Cementerio "Lomas de Paz".
-> cap2b_lomas_de_paz

=== cap2b_cementerio_recuerdo ===
# music:playa_oscura
~ llegaste_tarde_2b += 1
El cementerio "Recuerdo Eterno" está rodeado por una pared no muy alta, apenas de dos metros, sus puertas están unidas por una cadena oxidada y pura fuerza de voluntad. Al lado hay un sereno que, para mayor vergüenza, duerme.
A simple vista, el único servicio que brinda este cementerio es ser un coto de caza perfecto para ladrones de tumbas, estudiantes de medicina que necesitan huesos y vagabundos.
Sin mucho esfuerzo, lográs entrar.
# next
Por dentro el cementerio es una cuadrícula perfecta llena de tumbas al ras del piso de las cuales surgen, como flores de jardín, un montón de cruces. Al igual que un jardín, el amor es clave. Un par de tumbas parecen todavía recibir visitas de parientes y se ven relativamente limpias y con flores, pero el resto está en un estado de franca decadencia. Ves cruces inclinadas, como intentando volver a la tierra, víctimas de los desechos de aves junto a tumbas rotas y desprolijas. Pero por muchas vueltas que das, no encontrás ningún vampiro.
Solo lográs deprimirte. Sin duda tu objetivo no se esconde acá.
-> cap2b_elegir_cementerio

=== cap2b_cementerio_municipal ===
# music:playa_oscura
~ llegaste_tarde_2b += 1
Visto desde afuera, el Cementerio Municipal parece una pesadilla industrial. Cuenta con una pequeña explanada para tumbas pero en el horizonte se ven tres edificios gigantes y oscuros. Dos edificios llenos de nichos y una chimenea gigante del crematorio.
Das unas vueltas y terminás entrando en los edificios de los nichos, cuentan hasta con ascensor. No podés sacarte la idea macabra de que es un complejo habitacional para cadáveres.
# next
Después de un poco de exploración te das cuenta de que la mayoría de los nichos están totalmente cerrados. Pero escuchás ruidos, voces susurrando un piso encima tuyo y una luz que se refleja temblorosa en el umbral de la escalera.
Te acercás sigilosamente, rozando tu arma con el borde de tus dedos...
Solo para encontrarte con un grupo de góticos sacándose unas fotos frente a uno de los nichos. Por mucho que les gustaría, estos chicos no son Vampiros Superiores.

+ [Te quedás cerca. Si hay Vampiros en la zona, son la víctima perfecta] -> cap2b_municipal_quedarse
+ [Les das un buen susto] -> cap2b_municipal_susto
+ [Te retirás] -> cap2b_municipal_retirar

=== cap2b_municipal_quedarse ===
# music:playa_oscura
Los seguís desde las sombras, viendo cómo hacen chistes, sacan fotos y toman alcohol barato. Perdés un montón de tiempo valioso para darte cuenta de que la única cosa vieja acosándolos sos vos. Tu investigación no va a avanzar por acá.
-> cap2b_elegir_cementerio

=== cap2b_municipal_susto ===
# stop_music
# music:terror_ambient
Salís de la oscuridad con tu mejor voz de Vincent Price y las manos en alto, imitando garras mientras gritás "¡Sangre nueva para mis huesos viejos!". Antes de darte cuenta los jóvenes están corriendo a los gritos por el cementerio. Vas a tener que llamar a El Faro para avisarle que no manden a ningún guardián a investigar esto.
-> cap2b_elegir_cementerio

=== cap2b_municipal_retirar ===
# music:playa_oscura
Vos también fuiste un adolescente idiota. Es más, estás seguro de que esas palabras son sinónimos. Mientras no molesten a nadie ni vandalicen el lugar no merece más atención. Lo importante ahora es pensar cómo continuar con tu investigación.
-> cap2b_elegir_cementerio

// ---------------------------------------------------------
// SECCIÓN 7: LOMAS DE PAZ — ENTRAR AL CEMENTERIO
// ---------------------------------------------------------

=== cap2b_lomas_de_paz ===
# music:terror_ambient
El cementerio se encuentra sobre una avenida. Un predio gigante rodeado de unos muros altos (más de dos metros) que terminan formando cruces. Ya desde afuera parece más elegante que tu casa. En menos de cinco minutos te das cuenta de que esto va a ser más difícil de lo que pensabas. La entrada está custodiada por una garita donde se observan ahora cuatro guardias que llevan, con la comodidad que solo da la costumbre, unas importantes escopetas.
# next
Es entendible que el lugar esté guardado, siendo el cementerio histórico de la oligarquía de Costa Alegre, no te extraña que varias criptas sean verdaderas tumbas egipcias y estén llenas de tesoros.
Los observás mejor, no tienen la impronta sobrenatural de los Vampiros Superiores (una elegancia fría, como un gato gigante) ni la desesperación y los temblores de los adictos a la sangre. Posiblemente sean humanos.
Pero, por otro lado, simples humanos con escopetas han dejado una buena cuota de cadáveres durante la historia de la humanidad.
# next
Esperás unos minutos. Luego de una larga escena de saludos, tomar un último mate, más saludos, y un mate para el viaje, el grupo se dispersa. La mayoría de los guardias se internan en el cementerio, suponés que para hacer un patrullaje, y solo queda uno en la garita.
Si vas a hacer algo, es este momento.
-> cap2b_entrar_lomas

=== cap2b_entrar_lomas ===
# music:terror_ambient
+ [Un simple hechizo para dormir va a ser suficiente # REQUIRES: magia >= 25] -> cap2b_lomas_hechizo
+ [Esas paredes no son tan altas, se puede trepar # REQUIRES: fuerza >= 25] -> cap2b_lomas_trepar
+ [La puerta es la entrada fácil, debe haber otra entrada # REQUIRES: conocimiento >= 25] -> cap2b_lomas_alcantarilla
+ {tiene_favor_tuco and not uso_favor_tuco} [Es la hora de cobrarte el favor con Tuco] -> cap2b_lomas_tuco
+ [Es solo un guardia de seguridad. Calculás que podés ganarle] -> cap2b_lomas_atacar
* [Podrías intentar fingir que sos su jefe] -> cap2b_lomas_jefe
+ [Tal vez si le decís que venís a ver la tumba de un pariente se apiade] -> cap2b_lomas_abuelita

=== cap2b_lomas_hechizo ===
# music:terror_ambient
Recitás las palabras y sentís cómo todo el agotamiento de tu cuerpo, el peso de tus extremidades y el dolor en tu cabeza, se empieza a concentrar en tu estómago. El hechizo termina con vos tosiendo, sacando a la fuerza un humo rosado y con olor dulce de tus entrañas.
El humo repta al ras del piso y, como un animal de caza, salta a la ventana abierta de la garita. En menos de un minuto: intensos ronquidos.
~ sin_guardias = true
-> cap2b_entre_criptas

=== cap2b_lomas_trepar ===
# music:terror_ambient
Te ponés a recorrer el perímetro y encontrás un lugar donde la pared tiene una pequeña mueca, suficiente para colocar la punta de tu pie. Con ese punto de apoyo (y las horas de entrenamiento que llevás encima) tenés más que suficiente para poder trepar la pared.
Un salto, unas gotas de transpiración invertidas, y ya estás adentro.
-> cap2b_entre_criptas

=== cap2b_lomas_alcantarilla ===
# music:terror_ambient
Con un celular, y tener acceso a las bases de datos correctas, se pueden conseguir muchas cosas. Tardás unos diez minutos en tener un mapa del cementerio, fácil de conseguir dado que es una atracción turística. El momento eureka viene cuando buscás el plano de las alcantarillas y notás que una de considerable tamaño pasa por debajo del cementerio.
# next
Soportás un pequeño momento de espeleología urbana y te metés dentro de una boca de tormenta cercana. Avanzás en la oscuridad, con un líquido hasta tus rodillas (elegís creer que es agua, así como te decís que lo que chilla y se mueve en la oscuridad son hojas) pero después de unos minutos encontrás una escalera que te lleva a una puerta de alcantarilla justo en el centro del Cementerio.
-> cap2b_entre_criptas

=== cap2b_lomas_tuco ===
# music:terror_ambient
Le explicás la situación a Tuco, una conversación marcada por silencio y el ruido constante de su respiración contra el auricular. Lo único que te dice es "Listo. En cinco minutos andá para la puerta. Y borrá este número".
Contás seis minutos, principalmente porque dudás de la eficiencia de las fuerzas de seguridad de Costa Alegre, y te acercás a la puerta.
El guardia abre la puerta y te saluda: "Me avisaron que llegaba Agente, por favor, pase".
~ uso_favor_tuco = true
# inv:remove:favor_tuco
-> cap2b_entre_criptas

=== cap2b_lomas_atacar ===
# music:terror_ambient
Te acercás con el mayor sigilo posible, pero llega un punto donde la luz de la farola ya no deja espacio para esconderte. Así que solo queda una respuesta posible: extrema violencia.
El guardia no espera un ataque y, antes que logre agarrar la escopeta, ya estás sobre él desmayándolo con una llave asfixiante.
~ sin_guardias = true
-> cap2b_entre_criptas

=== cap2b_lomas_jefe ===
# music:terror_ambient
Te acercás a la garita adoptando una actitud desagradable, propia de cargos jerárquicos y nepo baby.
\- Buenas – te presentás – me manda la gerencia para chequear que todo esté en orden.
Mientras hablás mirás lo menos posible al guardia, como si su mera presencia te daría asco.
\- Nadie me avisó nada.
\- Y eso va a ser problema de su superior – retrucás – ahora, lo que sí sería su problema es obligarme a volver en otro momento. Ese error pesaría en su cabeza.
# next
El guardia te mira unos segundos, meditativo, y luego se larga a reír.
\- Es más probable que me gane la lotería antes que uno de los jefes saque el culo de la silla y venga hasta acá en persona. Y más a esta hora. Rajá ratito.
-> cap2b_entrar_lomas

=== cap2b_lomas_abuelita ===
# music:abuelita
Te acercás a la garita con la cabeza baja y la cara más triste que podés construir. Te acercás mucho a la garita antes de hablarle. Querés convertir tu tristeza (falsa) en algo tangible y personal, que el guardia no pueda ignorar.
\- Disculpe que lo moleste, mi abuela está enterrada acá, ella fue casi una madre para mí. Me encantaría pasar a dejarle mis respetos pero, por el trabajo se me complica acercarme a otro horario. Sé que lo comprometo pero, ¿podría pasar cinco minutos? Saludo la tumba y me voy.
# next
El guardia te mira durante unos segundos mientras contiene una sonrisa triste que amenaza con aparecer en su rostro.
\- Pasá pibe, pero solo cinco minutos. Y no hagas nada raro.
Sabías que el argumento de la abuelita no iba a fallar. Todo el mundo ama a las abuelitas.
-> cap2b_entre_criptas

// ---------------------------------------------------------
// SECCIÓN 8: ENCUENTRO CON VAMPIRO
// ---------------------------------------------------------

=== cap2b_entre_criptas ===
# music:playa_oscura
Dentro del cementerio te encontrás en una pequeña ciudad. Calles rectas que forman manzanas llenas de criptas elegantes. Construcciones de mármol y cristal con decoraciones.
Si bien la mayoría está adornada con cruces y ángeles, la decoración más común debe ser estatuas de mujeres jóvenes. Mujeres jóvenes llorando contra la puerta de la cripta, mujeres jóvenes semidesnudas de la mano con esqueletos, mujeres jóvenes con rostros invadidos por la tristeza.
No entendés muy bien quién decidió que la parca debía ser tan sensual. Sospechás más que los artistas usaron modelo vivo y prefirieron explorar burdeles antes que morgues.
# next
Das un par de vueltas, más propio de un turista que de un investigador. Por suerte los guardias usan fuertes linternas en su recorrido así que, cuando ves que un halo de luz sale entre las criptas (la primera vez casi tenés un infarto), doblás en la primera esquina para asegurar que no te encuentren.
La solución te la da el destino. En esta caminata ves una silueta a lo lejos. Alta, delgada y algo etérea, tapada con una túnica negra.
# next
Un análisis más detallista te permite notar que no está caminando, sino que avanza flotando a unos centímetros del suelo (completamente innecesario, pero seguro si vos pudieras hacer lo mismo levitarías a todo lado).
Encontraste a un Vampiro Superior. Ahora hay que decidir el siguiente paso.
-> cap2b_encuentro_vampiro

=== cap2b_encuentro_vampiro ===
# music:terror_ambient
+ [El único vampiro bueno es el vampiro muerto. Cargás contra él] -> cap2b_vampiro_atacar
+ [Te acercás a hablarle. Tal vez lográs sacarle algo de información] -> cap2b_vampiro_hablar
+ [Lo seguís con el mayor cuidado posible. Debe estar yendo a su cubil] -> cap2b_vampiro_seguir
+ [Intentás ir por un camino paralelo y poner una trampa # REQUIRES: conocimiento >= 25] -> cap2b_vampiro_trampa

=== cap2b_vampiro_atacar ===
# stop_music
# music:boss_arañas
El peso de la espada en tu mano te da la confianza que necesitabas. Avanzás hacia la silueta y, cuando estás a unos pasos, cargás con un golpe perfecto directo para cortar la cabeza.
{
    - fuerza < 25:
        La criatura se da vuelta con una velocidad que tu cerebro no puede procesar. Una mano del color del mármol atrapó tu muñeca y empieza a apretar. Se siente como estar atrapado por una prensa industrial.
        Sus ojos son como un cielo estrellado, hermosos y ajenos. Su rostro no denota ninguna expresión, sin duda no hay sorpresa por tu ataque.
        Tu mano cede y la espada cae al piso, en el mismo momento que todo tu coraje se desvanece.
        # stat:hp:-10
        ~ vampiro_muerto = true
    - else:
        En tu cabeza escuchás los consejos de Cabral. Hay bichos que es vital no errar el primer golpe. Principalmente porque no vas a estar vivo para dar el segundo. Los Vampiros Superiores, de noche, son ese caso.
        Pero tus reflejos son más rápidos (al menos son más rápidos que un enemigo agarrado de sorpresa y por la espalda). La hoja atraviesa el cuello de par en par y sale cubierta en una fina capa de polvo.
        En cuanto la cabeza se despegó del cuerpo su carne se convierte en polvo y cenizas, dejando atrás de sí solo una túnica y ropa elegante.
        ~ vampiro_muerto = true
}
-> cap2b_frente_cubil

=== cap2b_vampiro_hablar ===
# music:misterio_ambient
# play_sfx:drone_tenso
Salís de entre las criptas y le dirigís la palabra con un tono de voz que sale menos firme de lo que esperabas.
\- Veo que no soy el único que aprecia la belleza del cementerio bajo la luz de la Luna. ¿Qué cripta pretende ver?
# next
El Vampiro gira y te mira con ojos vacíos. Su cabeza un poco caída para el costado, como si confiara en que al recostar la cabeza la gravedad ayudara a que las ideas caigan en el lugar correcto y le expliquen lo que está pasando. No se apura en hablar, te deja seguir.
\- Si querés yo te puedo mostrar mi cripta favorita – el tono de tu voz va enflaqueciendo a la par que el Vampiro te sigue viendo como una estatua con ojos de infinito – y vos me podrías mostrar la tuya.
# next
Sonríe, dejando asomar bajo los labios dos colmillos que son una promesa de dolor. Pero no ataca. En su lugar sentís algo mucho peor: una presión invisible detrás de tus ojos, como si alguien estuviera empujando tus pensamientos hacia un costado para hacer lugar a los suyos.
\- Qué valiente el ganado que se acerca solo – su voz resuena dentro de tu cráneo, no en tus oídos – Hace mucho que no me divierto así.
# WILLPOWER_START: normal
# UI_EFFECT: blur_vignette
# MOUSE_RESISTANCE: medium
{
    - magia >= fuerza and magia >= conocimiento:
        La realidad se dobla. El cementerio sigue siendo el mismo pero lo sentís como algo tuyo, familiar, casi hogareño. El Vampiro extiende un brazo y en su palma hay algo que parece un recuerdo que perdiste. La ilusión es buena: sólida, coherente, construida con materiales que reconocés. El olor es exacto. Los sonidos son exactos. Hasta la temperatura del aire tiene algo de correcto. Sería perfecta si no fuera porque los bordes de ese recuerdo brillan con un azul frío y residual que ninguna cosa real debería tener. —La costura del hilo. Un mago aprende a distinguir la energía de prestado de la energía propia, y esto claramente es lo primero. El hilo que cose la mentira, perfectamente visible para quien sabe mirar ese tipo de costuras. La ilusión sigue funcionando alrededor pero la grieta ya no puede ocultarse. # GENJUTSU_BREAK: magia:cap2b_hablar_resistido:—La costura del hilo.
    - fuerza >= magia and fuerza >= conocimiento:
        La realidad se dobla. El cementerio sigue siendo el mismo pero lo sentís como algo tuyo, familiar, casi hogareño. El Vampiro extiende un brazo y en su palma hay algo que parece un recuerdo que perdiste. La ilusión es buena, casi impecable. Te hace sentir en paz, a salvo, en el lugar exacto donde deberías estar. Y sin embargo hay algo que no cierra. Sería perfecta si no fuera porque tu cuerpo tiene un depredador a dos metros con colmillos y aun así no produce ni una gota de adrenalina. —Ninguna adrenalina. Ningún músculo en tensión, ningún latido extra, ninguna mandíbula apretada. Tu cuerpo debería estar gritando pero la ilusión le tiene tapada la boca. La paz que sentís no es tuya. # GENJUTSU_BREAK: fuerza:cap2b_hablar_resistido:—Ninguna adrenalina.
    - else:
        La realidad se dobla. El cementerio sigue siendo el mismo pero lo sentís como algo tuyo, familiar, casi hogareño. El Vampiro extiende un brazo y en su palma hay algo que parece un recuerdo que perdiste. La ilusión es buena, meticulosa, construida con suficiente verosimilitud para engañar a alguien que no haya prestado atención. Hay una historia, hay un contexto, hay datos que encajan. Casi todos. Sería perfecta si no fuera porque en algún momento afirma que los primeros enterramientos de este cementerio fueron en el ala norte. —El ala este. Lo sabés porque lo leíste: los registros más viejos siempre citan el ala este. Los datos incorrectos tienen una textura particular, se sienten como una piedra en el zapato. La mentira es casi perfecta pero ese detalle la delata por completo. # GENJUTSU_BREAK: conocimiento:cap2b_hablar_resistido:—El ala este.
}

* [Cedés ante la presencia del Vampiro]
    # WILLPOWER_STOP
    # MOUSE_RESISTANCE: none
    # UI_EFFECT: none
    -> cap2b_hablar_cedido
* [Intentás resistir la presión mental]
    -> cap2b_hablar_escalada

=== cap2b_hablar_resistido ===
# music:misterio_ambient
# WILLPOWER_STOP
# MOUSE_RESISTANCE: none
# UI_EFFECT: none
# flash_white
# shake
Algo se quiebra. No en vos, sino en la conexión que el Vampiro intentaba forjar. Es como arrancar una sanguijuela de tu cerebro: doloroso pero liberador.
El Vampiro retrocede un paso, genuinamente sorprendido. Sus ojos vacíos se abren un poco más de lo normal.
\- Interesante – dice, pero su voz ahora solo sale de su boca – Hace siglos que un mortal...
No le dejás terminar. La espada sale antes que la frase y le cruzás el cuello de un solo golpe limpio. Su cuerpo se dispersa en una nube de polvo y cenizas que se lleva el viento nocturno.
~ vampiro_muerto = true
-> cap2b_frente_cubil

=== cap2b_hablar_escalada ===
# music:misterio_ambient
La presión se intensifica. Sentís que tus pensamientos se vuelven lentos y pesados, como si caminaran por barro. La sonrisa del Vampiro se ensancha.
\- Ahí estás. Casi puedo saborearte – sus palabras se mezclan con las tuyas hasta que no sabés cuáles son de quién.
# WILLPOWER_START: fast
# UI_EFFECT: static_mind
# MOUSE_RESISTANCE: high
{
    - magia >= fuerza and magia >= conocimiento:
        La ilusión se vuelve más densa. El Vampiro ya no te muestra recuerdos: te mete adentro de uno. Estás en algún lugar que reconocés a medias, rodeado de caras borrosas que deberían importarte. El peso del suelo bajo tus pies, la temperatura del aire, los sonidos de fondo: todo está construido con una precisión que da miedo. Es más convincente que antes. Te hablan, te tocan el brazo, hacen referencias que deberían emocionarte. Casi funciona. Pero las caras tienen los movimientos del labio ligeramente desfasados respecto de las voces. —Labios desfasados. Como una película a la que le modificaron el audio. Un defecto de sincronía, un error en la fabricación del sueño que un mago con menos práctica no notaría. Pero vos lo notás. # GENJUTSU_BREAK: magia:cap2b_hablar_resistido_segundo:—Labios desfasados.
    - fuerza >= magia and fuerza >= conocimiento:
        La ilusión se vuelve más densa, el recuerdo inventado más cálido. Te envuelve como una manta: sonidos familiares, caras conocidas, la sensación de estar exactamente donde tenés que estar. Tu mente acepta casi todo sin pelear. Pero tu cuerpo empieza a filtrar la verdad que tu mente no puede: transpiración fría en la nuca, mandíbula apretada, puño cerrado sin que lo hayas decidido. —Frío en la nuca. No elegiste cerrar ese puño. Tu sistema nervioso le mandó a tus músculos la señal de combate que la ilusión está tratando de apagar. Peligro real, ahí afuera. No es paz lo que sentís. Cada segundo que pasa la ilusión se afina pero tu cuerpo sigue gritando que algo está mal. # GENJUTSU_BREAK: fuerza:cap2b_hablar_resistido_segundo:—Frío en la nuca.
    - else:
        La ilusión se vuelve más densa. Ahora el Vampiro habla con la voz de alguien que conocés, usando frases que suenan auténticas. La entonación está bien. Los patrones de habla están bien. Los temas de conversación son los correctos. Casi funciona. Pero en un momento usa una expresión que esa persona nunca usaría, con una cadencia que aprendió de memoria sin entender el contexto. —No es su voz. Una combinación de palabras que esa persona evitaría por razones que el Vampiro no puede saber porque nunca realmente la conoció. No es la persona. Es una copia que estudió a la persona de afuera, y ahora que lo notaste no podés dejar de notar las costuras en cada frase que dice. # GENJUTSU_BREAK: conocimiento:cap2b_hablar_resistido_segundo:—No es su voz.
}

* [Cedés ante la presencia del Vampiro]
    # WILLPOWER_STOP
    # MOUSE_RESISTANCE: none
    # UI_EFFECT: none
    -> cap2b_hablar_dominado
* [Intentás aguantar]
    # WILLPOWER_STOP
    # MOUSE_RESISTANCE: none
    # UI_EFFECT: none
    -> cap2b_hablar_dominado

=== cap2b_hablar_resistido_segundo ===
# music:misterio_ambient
# WILLPOWER_STOP
# MOUSE_RESISTANCE: none
# UI_EFFECT: none
# flash_white
# shake
Con un esfuerzo que sentís en cada fibra de tu ser, empujás la presencia fuera de tu mente. Es como vomitar algo que no debería estar adentro tuyo.
Caés de rodillas, jadeando, pero tu mano encuentra la empuñadura de la espada. El Vampiro te mira con algo que podría ser respeto o curiosidad, pero no le das tiempo a decidir cuál.
Te levantás y cortás. El polvo cae sobre vos como nieve sucia.
~ vampiro_muerto = true
-> cap2b_frente_cubil

=== cap2b_hablar_dominado ===
# music:horror_ambient
# WILLPOWER_STOP
# MOUSE_RESISTANCE: none
# UI_EFFECT: none
Tu voluntad cede como un dique que se rompe. Por un instante horrible ves el mundo a través de sus ojos: vos sos pequeño, frágil, tibio. Alimento.
El Vampiro se acerca flotando y sus colmillos perforan tu cuello. El dolor es intenso pero breve, reemplazado por un frío que te recorre entero.
# stat:hp:-25
# next
Pero algo sale mal para él. Tu sangre, contaminada por años de contacto con sustancias arcanas y hierbas de cazador, le produce un espasmo violento. Te suelta, escupiendo y retorciéndose.
\- ¡¿Qué sos?! – grita, con tu sangre corriendo por su mentón.
No tenés fuerzas para responder pero tampoco las necesitás. El Vampiro huye, elevándose hacia el cielo nocturno como una sombra que se disuelve entre las nubes.
~ sometimiento = sometimiento + 30
-> cap2b_frente_cubil

=== cap2b_hablar_cedido ===
# music:horror_ambient
~ sometimiento = sometimiento + 30
Dejás que la presencia del Vampiro inunde tu mente. Es como sumergirse en agua helada: al principio duele, después se adormece todo.
\- Buen ganado – susurra, y su aprobación se siente como una caricia en tu cerebro – Ahora mirá.
# next
El Vampiro levanta una mano y, sin querer, tus ojos siguen el movimiento. Te muestra el camino: entre las criptas, doblar a la izquierda en el ángel sin cabeza, la tercera cripta con columnas jónicas. Su cubil.
\- Andá – dice, y tus piernas obedecen antes que tu cerebro procese la orden – Deciles que te mandé yo. Tal vez te dejen vivir. Tal vez no.
# next
Caminás en la dirección indicada. A cada paso que te aleja del Vampiro recuperás un poco más de control sobre tu cuerpo. Pero la información queda: sabés exactamente dónde está el cubil.
Lo que no sabés es si fuiste a buscarlo o si él te mandó como ofrenda.
-> cap2b_frente_cubil

=== cap2b_vampiro_seguir ===
# music:misterio_ambient
El cementerio ofrece una infinidad de lugares para esconderte. No podés dar dos pasos sin encontrar una estatua, el marco de una entrada o un pequeño pasillo entre Criptas donde entra justo tu cuerpo. Aparte el trazado, similar a una ciudad, vuelve fácilmente predecible el camino que va a tomar una persona.
# next
Lo que sí, debés ser especialmente cuidadoso con tus pasos. La presencia del Vampiro parece haber acallado el ruido a su alrededor. Ni aves nocturnas o ratas chillando a lo lejos. Hasta los gusanos que se devoran a los cadáveres parecen tomarse un descanso.
Pero tu estrategia da resultado. Luego de un par de giros el Vampiro llega a la puerta de una cripta donde hay otros como él, con túnica negra y aspecto etéreo. Lo ves, recostado contra la estatua que representa un ángel llevando un bebé en sus brazos, decir unas palabras a sus compañeros que guardan la puerta y entrar al cubil.
-> cap2b_frente_cubil

=== cap2b_vampiro_trampa ===
# music:terror_ambient
# play_sfx:sal_romperse
Te escurrís entre dos criptas y avanzás a paso rápido entre lo que parece ser una calle paralela. Llegás primero a una esquina donde el Vampiro tiene que doblar así que aprovechás los segundos que tenés para trazar un semicírculo de sal y esconderte detrás de una estatua. La idea es que entre dentro de la figura y, cuando esté adentro, tirar una capa más de sal para convertirlo en un círculo y dejarlo encerrado.
(Sí, en tu mochila hay sal, ajo, mandrágora, amaranta y demás hierbas, suficiente para ser un buen cazador de monstruos o un chef de primer nivel.)
# next
El paso del Vampiro sobre el empedrado va al mismo ritmo que tu corazón. Lo escuchás acercarse.
Y pensás en todo lo que puede salir mal. Que no entre directo al círculo, que note la sal en el piso, que sienta tu presencia, que tus manos tiemblen y no cierren el círculo.
Muchos posibles caminos que se ramifican, y casi todos terminan con vos muerto. Una metáfora de tu vida.
# next
Pero ocurre el mejor final. El Vampiro da un paso corto dentro del semicírculo y, antes del siguiente paso, vos ya saliste de las sombras y cerraste la figura.
El siguiente ruido que escuchás es el "toc" fuerte de su cara golpeando contra una pared invisible.
Durante los siguientes segundos el Vampiro abandona su máscara de humanidad. Un borrón de violencia que golpea todos los límites del círculo buscando un escape que no existía.
# next
Cuando se volvió a quedar quieto regresó a la máscara de humanidad. Perfecto, ni un pelo fuera de lugar o una marca de transpiración. Giró sobre sus talones y te mira con los ojos vacíos y la cabeza ladeada a un costado.
\- Felicidades, ganado – su entonación es rara, como si la lengua fuese un ser vivo que apenas tiene bajo su control – me tenés encerrado con esta trampa tan... inventiva. Así que sin duda querés algo de mí. ¿Estás deseoso de ascender en la cadena alimenticia? ¿Querés ser eternamente joven? ¿Fuerte? ¿Carente de miedo?
# next
\- Solo quiero saber dónde está su cubil en este Cementerio – a pesar de la pared invisible que ofrece el círculo de sal, tu cuerpo instintivamente te pide que salgas corriendo.
\- Qué pobre y patética es la imaginación de los mortales. Teniendo un dios delante tuyo me pedís cómo ir a un cubil. ¿No preferís que te mate yo mismo? Sería mucho más rápido y te ahorraría dolor. Salvo que eso sea lo que te gusta – una lengua larga y gorda sale entre sus labios y recorre lascivamente un colmillo.
\- La locación del cubil. Ya.
\- No te das cuenta mortal que, para mí, tu apuro no tiene sentido. No manejo el tiempo con tus límites tan finitos.
\- Tu límite es el amanecer, que sospecho que será muy soleado en mitad de este Cementerio – A pesar de que sus ojos carecen de expresión, sabés que tu argumento ganó.
# next
Ya con las señas para llegar a la cripta donde se encuentra el cubil, lo que resta es decidir qué hacer con el Vampiro encerrado en el círculo de sal.

+ [Te retirás y dejás que el sol haga su trabajo] -> cap2b_trampa_dejar
+ [Lo liberás. Es demasiado sucio dejar a alguien encerrado esperando la muerte] -> cap2b_trampa_liberar
+ [Sus argumentos son muy buenos. Pedís que te convierta en Vampiro] -> cap2b_trampa_convertirse

=== cap2b_trampa_dejar ===
# music:misterio_ambient
Intentás pensar una frase graciosa pero la vida no es una película de acción. Simplemente lo mirás unos segundos y él se da cuenta. Sus ojos dejan de tener la expresión vacía que conservaban hasta ahora y su rostro se desencaja con una lluvia de emociones. ¿Miedo? ¿Rabia?
# next
No te interesa ver más, te das vuelta y comenzás a caminar hasta la dirección que te dio del cubil. Atrás tuyo escuchás sus gritos. Una mezcla de insultos con súplicas. Durante un momento llora como un niño pequeño para después pasar a tratarte de ganado y mugir como una vaca.
Cuando dudás vuelve a tu cabeza la imagen de la familia muerta, secos en su casa. Cómo su vida cotidiana fue destruida de forma horrible y azarosa por seres que no los consideran más que alimentos.
Ojalá que arda lentamente.
~ vampiro_muerto = true
-> cap2b_frente_cubil

=== cap2b_trampa_liberar ===
# music:misterio_ambient
Le pedís que jure por todo lo que considere sagrado que no te va a atacar una vez que rompas el círculo de sal. Él lo hace, jura por la sed y la sangre (lo cual te da más miedo que seguridad) que una vez roto el círculo va a irse para el lado contrario, dejar Costa Alegre y buscar otra ciudad para instalarse.
No promete que va a dejar de ser un asesino de personas, pero está bien, tampoco le hubieses creído si decía eso.
# next
Con una simple patada rompés el círculo. El viento se lleva los pedazos que formaban tu protección. Él sonríe y habla, con el tono entrecortado fruto del jugueteo de su lengua contra sus dientes.
\- Muy bien, pero esto de jurar por la sed y la sangre me puso un poco juguetón. Creo que debería probar un tentempié para el viaje.
# next
Lo esperabas. Por supuesto que lo esperabas. Cuando el círculo se rompió ya tenías la estaca en la mano, apoyada contra la palma con el filo hacia adelante. Dejaste que él se encargara de la distancia.
El sonido fue desagradable. La sensación en la muñeca, peor. Pero el resultado fue el esperado: el Vampiro se detuvo con los ojos abiertos, sin entender, y se fue convirtiendo lentamente en polvo como si siempre hubiera estado hecho de él.
~ vampiro_muerto = true
-> cap2b_frente_cubil

=== cap2b_trampa_convertirse ===
# stop_music
# music:horror_ambient
# play_sfx:sting_moral
\- Lo quiero – la frase sale entrecortada de tu boca, ahogada por la culpa y el miedo – Quiero ser inmortal. No morir nunca, no tener miedo jamás.
El Vampiro te mira, mientras ladea la cabeza para el lado contrario. Ninguna expresión de emoción, solamente se limita a extender su brazo y señalar a sus pies.
# next
Vos entendés de qué se trata. Te tirás de rodilla frente a él, tu cabeza a la altura de su cinto, la sal dispersa por la fuerza de tu caída.
Todo ocurre demasiado rápido, como una película a la cual le cortaron una escena. Él estaba parado delante tuyo y de repente lo tenés encima.
Los colmillos rompiendo tu carne duelen, pero la sensación también es placentera. Dios, es el mayor placer que nunca hayas sentido.
# next
Las sensaciones se van mezclando. Al principio prima el dolor, que retrocede por oleadas de placer. Después se impone el placer, condimentado por algún pinchazo de dolor.
Al final estás flotando. En un mar rojizo con un oleaje cada vez más tranquilo. No hay más problemas ni preocupaciones. En el cielo carmesí hay un pequeño sol palpitante que cada vez emite menos luz.
# WILLPOWER_START: fast
# UI_EFFECT: blood_pulse
# MOUSE_RESISTANCE: high
{
    - magia >= fuerza and magia >= conocimiento:
        Flotás en ese mar carmesí. Es hermoso. Cada fibra de tu cuerpo quiere creerlo. El oleaje es suave y caliente, las preocupaciones se disuelven antes de llegar a la orilla, hay una voz que te dice que estás bien, que esto está bien, que siempre estuvo bien. Es lo más hermoso que sentiste en tu vida. Pero un mago sabe distinguir entre una sensación real y una que le fabricaron: hay una corriente de energía entrando por tu cuello que no es sangre, es la manipulación directa de tu sistema límbico. —El hechizo. La costura. No es tuya esa paz. El placer es un hechizo y la emoción es una instrucción. Ahora que ves las costuras del encantamiento, el mar carmesí empieza a perder color en los bordes. # GENJUTSU_BREAK: magia:cap2b_convertirse_escape:—El hechizo. La costura.
    - fuerza >= magia and fuerza >= conocimiento:
        Flotás en ese mar carmesí. Es hermoso. Cada fibra de tu cuerpo quiere quedarse aquí para siempre. El oleaje te lleva y te trae, el sol carmesí pulsa despacio, la orilla siempre parece cerca. Es lo más hermoso que sentiste en tu vida. Pero tu cuerpo manda señales que el placer no puede tapar del todo: presión arterial bajando, extremidades frías, ritmo cardíaco cada vez más irregular. —Te estás vaciando. Tus dedos están azules. No te estás relajando. No estás flotando en ningún mar. Ese sol carmesí que pulsa es tu propio corazón quedándose sin combustible. # GENJUTSU_BREAK: fuerza:cap2b_convertirse_escape:—Te estás vaciando.
    - else:
        Flotás en ese mar carmesí. Es hermoso. Cada parte de vos quiere creerlo. La sensación es tan total que casi es un argumento en sí misma, casi prueba que debe ser real. Es lo más hermoso que sentiste en tu vida. Pero leíste sobre esta situación demasiadas veces: el mar carmesí y el sol palpitante son una mentira que tu cuerpo compra con entusiasmo. Lo que realmente ocurre es que estás perdiendo sangre en un cementerio mientras un depredador te vacía por el cuello. —No es placer. Esta escena tiene nombre y tiene diagnóstico. El éxtasis es el truco, el mecanismo de anestesia que la mordida usa para que no te resistas. Cada segundo que seguís flotando es un segundo menos de sangre en tus venas. # GENJUTSU_BREAK: conocimiento:cap2b_convertirse_escape:—No es placer.
}
* [Te dejás llevar]
    # WILLPOWER_STOP
    # MOUSE_RESISTANCE: none
    # UI_EFFECT: none
    -> cap2b_convertirse_muerte_lucida
* [Intentás resistir la sensación]
    # WILLPOWER_STOP
    # MOUSE_RESISTANCE: none
    # UI_EFFECT: none
    -> cap2b_convertirse_muerte_lucida

=== cap2b_convertirse_escape ===
# music:horror_ambient
# WILLPOWER_STOP
# MOUSE_RESISTANCE: none
# UI_EFFECT: none
# achievement:unlock:gano_willpower
# flash_white
# shake
Usás toda tu concentración para volver a sentir tu brazo derecho. Se siente torpe y entumecido, como si estuvieses medio dormido. Lentamente lo lográs mover, primero unos centímetros torpes, pero luego con mayor precisión. La suficiente para encontrar la daga que está en tu cinturón.
El golpe es torpe y no le cercena el cuello. No a la primera. El Vampiro grita y te suelta mientras intenta forzar a que tu mano suelte la empuñadura. Pero vos no la soltás. La empuñadura, como la idea de que eras una presa, es a lo que te aferrás para sobrevivir.
# next
Pero soltarte es su error. Realmente en ese momento ya te habían abandonado las fuerzas necesarias para ganarle un combate. Pero, al soltarte, la gravedad actuó a tu favor.
Caíste y, junto a vos, la daga que seguías agarrando bajó cercenando el resto del cuello.
Sobre vos llueve una fina capa de polvo y cenizas, el cadáver de algo que debería haber muerto hace mucho tiempo.
# stat:hp:-50
~ vampiro_muerto = true
-> cap2b_frente_cubil

=== cap2b_convertirse_muerte_lucida ===
# stop_music
# music:horror_ambient
# WILLPOWER_STOP
# MOUSE_RESISTANCE: none
# UI_EFFECT: none
Sabés exactamente qué te está pasando. Leíste las descripciones, estudiaste los casos, conocés cada etapa de la muerte por éxtasis vampírico. Y ese conocimiento es lo peor de todo.
Porque sentís cómo tu brazo derecho intenta moverse hacia la daga, pero los músculos ya no responden. La voluntad está ahí, la idea está ahí, pero el cuerpo ya pertenece al placer.
# next
Es como estar encerrado detrás de un vidrio, mirando cómo te matan. Sabés que la daga está a centímetros de tu mano. Sabés que un solo corte bastaría. Pero el mar rojizo te sostiene y las olas son cada vez más suaves y el sol palpitante se apaga lentamente.
Lo último que pensás, con una claridad cruel, es que morís sabiendo exactamente cómo salvarte.
# next
ESTÁS MUERTO.
# achievement:unlock:cambio_de_bando
-> END

// ---------------------------------------------------------
// SECCIÓN 9: FRENTE AL CUBIL
// ---------------------------------------------------------

=== cap2b_frente_cubil ===
# music:terror_ambient
Al fin encontrás la cripta correcta. De afuera parece un edificio bastante aburrido, una imitación a un templo grecorromano con una serie de columnas jónicas y un techo en punta.
Al mirar el lugar con más atención se puede observar unos pequeños detalles que dan cuenta de que está habitado. En el techo alguien colocó una antena (ser inmortal debe implicar mucho tiempo libre para llenar, por lo cual una conexión a internet debe ser un prerrequisito) y da la impresión de que alguien se tomó tiempo para limpiar la fachada.
# next
En el frente de la construcción se observan un par de Vampiros. Figuras etéreas con túnicas negras que están mirando fijamente a la nada. Si uno no presta atención, podría confundirlas con dos estatuas de excelente calidad. Pero sabés que en cuanto salgas de tu escondite esas dos estatuas van a cobrar vida y buscar beberse toda la sangre de tu cuerpo.
{vampiro_muerto:
    Dos Vampiros son dos más de los que te gustaría. Agradecés haberte sacado de encima el otro Vampiro que te encontraste en el Cementerio, sino la misión suicida que tenés enfrente sería... ¿más suicida?
}
# next
El cielo parece haberse puesto a tono con la situación, un par de truenos son la apertura de una tormenta bíblica que empieza a caer sobre todos. Rápidamente te encontrás mojado, irritado, y con la ropa pegada al cuerpo. # play_sfx:trueno_lejano En contraposición, los Vampiros parecen emitir un aura que mantiene el agua alejada de su piel (malditos sobrenaturales con ventajas innecesarias).
# next
Cada par de segundos el rugido de un trueno tapa todos los ruidos, hasta los latidos de tu corazón, hasta la voz en tu cabeza que te dice que si no lográs idear un plan pronto esto va a ser un desastre.
Es entonces cuando escuchás un grito proveniente del interior de la cripta. Lo reconocés de inmediato, es el llanto de un bebé. El ruido hace eco en tus huesos y te obliga a una respuesta.
Cuando un bebé está en peligro uno debe actuar. El imperativo biológico para garantizar la supervivencia de la especie está escrito en nuestro puto ADN.
Aparte, un bebé está en peligro. ¿Qué tipo de cobarde no haría algo?
Eso sí, si terminás muerto mucho no lo podrías ayudar. Tenés que pensar en algo.
-> cap2b_cubil_opciones

=== cap2b_cubil_opciones ===
# music:terror_ambient
+ [Los Vampiros están acostumbrados a cazar humanos. Pero un Guardián de El Faro no es una víctima. Atacás # REQUIRES: fuerza >= 30] -> cap2b_cubil_fuerza
+ [Esos Vampiros se ven muy inflamables. Que suerte que aprendiste a conjurar bolas de fuego # REQUIRES: magia >= 30] -> cap2b_cubil_magia
+ [Sin duda podés entrar a una de las criptas vecinas y armar una entrada # REQUIRES: conocimiento >= 30] -> cap2b_cubil_tunel
+ {not sin_guardias} [Tal vez sería momento de requerirle ayuda a los guardias del Cementerio] -> cap2b_cubil_guardias
+ {tiene_favor_tuco and not uso_favor_tuco} [Es necesario llamar a los refuerzos. Tuco podría caer con las tropas especiales] -> cap2b_cubil_tuco
+ [No se te ocurre ningún plan. Simplemente te acercás e improvisás] -> cap2b_cubil_improvisar

=== cap2b_cubil_fuerza ===
# music:boss_arañas
Dejás que pase un rayo, y la luz que trae, y salís a la carga. # play_sfx:trueno_cercano Está húmedo y estás mojado, así que tu avance épico es más un chapoteo infantil en los charcos. El primero de los Vampiros detecta tu presencia, hace un débil movimiento estirando la cabeza para adelante y un costado mientras sus ojos brillan como dos faroles en la oscuridad. Vos confirmás su punto disparando un tiro de escopeta directo a su pecho.
# next
El Vampiro recibe el disparo como si fuera una cachetada. La fuerza cinética del golpe apenas lo hace retroceder unos centímetros. Responde abriendo su boca, dejando salir un rugido animal y mostrándote unos colmillos que prometen dolor. Una movida atemorizante pero también un desperdicio de tiempo, y en un combate tan cercano cualquier minuto es clave.
Vos no perdés el tiempo, cortás la distancia con un salto y descargás un golpe con tu espada directo al cuello de tu rival. Antes de terminar el movimiento, su cuerpo se dispersa en una nube de polvo que se lleva la lluvia.
# next
El Vampiro superviviente se eleva hacia los cielos, cuando te girás para verlo ya se encuentra a diez metros del piso y subiendo, hasta convertirse en un punto negro entre las nubes de tormenta.
Va a caer en picada en cualquier momento, instintivamente corrés buscando una cripta que tenga un techo sobresaliente que pueda servir de defensa.
# next
El techo estalla sobre tu cabeza en una explosión de polvo, tejas y mármol. Parece que caer en picada no da mucho margen para maniobrar. El Vampiro se encuentra en el piso, todas sus extremidades están en ángulos anormales y su rostro es una masa deforme de la cual sobresale un ojo solitario ubicado en lo que debería ser una mejilla.
Aun así, sigue vivo, escuchás el horroroso sonido de la carne y el hueso reubicándose intentando volver a una posición más normal.
Malditos inmortales, con tiempo suficiente (y sangre) sobrevivría hasta a esto.
Por suerte vos estás ahí con tu espada listo para impedir eso. Para cuando terminás es solo otra pila de cenizas arrastrada por la lluvia.
-> cap2b_dentro_cubil

=== cap2b_cubil_magia ===
# music:boss_arañas
Realizar magia bajo la lluvia es complicado. El agua corriendo tiende a barrer y difuminar las energías. Aparte, elegiste hacer magia de fuego como si fuera poco.
Te escondés debajo de un techo y curvás tu cuerpo, en un intento de proteger a la primera llama que surge de la palma de tu mano.
# next
En un claro ejemplo de concentración (y suerte) la tercera vez que lográs crear una llama en tu palma logra sobrevivir a la tormenta hasta convertirse en una pelota de fuego.
Simplemente apuntás con tu palma hacia el Vampiro y soltás el fuego. La llama sale serpenteando, dejando una estela de humo a su paso a medida que va entrando en contacto con las gotas de agua, y golpea al Vampiro en el pecho.
Las llamas se extienden y, en cuestión de segundos, es una antorcha humana. El Vampiro se retuerce en el piso gritando de dolor en una lengua que te resulta desconocida.
# next
El Vampiro superviviente se eleva hacia los cielos, cuando te girás para verlo ya se encuentra a diez metros del piso y subiendo, hasta convertirse en un punto negro entre las nubes de tormenta.
Va a caer en picada en cualquier momento. Vos sabés lo que tenés que hacer.
Avanzás hacia el centro de la calle, justo a tus pies están las cenizas del Vampiro que acabás de incinerar.
Y esperás, como una presa perfecta. Esa espera, completamente vulnerable, se siente vertiginosa, un vértigo que repercute en tu estómago. Pero es necesario que se tire en picada hacia vos y esperar el último minuto.
# next
Notás que está casi encima tuyo por la sombra en el piso y por el agua de la lluvia que comienza a tener un patrón raro. Es en ese momento donde invocás una esfera de energía alrededor tuyo.
Una MUY SÓLIDA esfera de protección.
Parece que caer en picada no da mucho margen para maniobrar. El Vampiro rebota contra tu defensa y termina insertado en el techo de una Cripta.
Cuando vas a ver lo encontrás en el piso con todas sus extremidades en ángulos anormales y su rostro es una masa deforme.
Aun así, sigue vivo. Malditos inmortales.
Por suerte decís unas palabras y hacés un gesto con la mano. La carne se convierte en llamas y dolor, y luego en cenizas que se lleva la lluvia.
-> cap2b_dentro_cubil

=== cap2b_cubil_tunel ===
# music:terror_ambient
Das la vuelta a lo que podría considerarse una manzana y entrás en la cripta que se encuentra justo detrás. A diferencia del cubil de los Vampiros, este es un lugar olvidado, los familiares de los difuntos hace tiempo los olvidaron o también se encuentran en el reino de los muertos.
La puerta está quebrada, protegida por un candado oxidado y vencido. Te basta con hacer un poco de fuerza para mover los tablones y hacer un resquicio para poder entrar.
# next
Por dentro la cripta es igual de deprimente. Una serie de ataúdes carcomidos por la humedad y las telas de araña. Sin duda los saqueadores de tumbas hicieron su trabajo acá porque la tapa de uno de los ataúdes se encuentra corrida y el esqueleto que debería estar adentro parece un rompecabezas tirado al piso al cual le falta la mayoría de las piezas.
Pero no estás acá para hacer el paseo artístico. Te tomás cinco segundos y detectás cuál es la pared que debería conectar con la cripta que los Vampiros usan de cubil.
# next
Sacás de tu mochila un cincel y un martillo. Lamentás no tener explosivo plástico para hacer este trabajo pero, bueno, estás en el tercer mundo y el presupuesto siempre está limitado.
Colocás el cincel en una grieta entre dos ladrillos y esperás el próximo trueno. La furia de la tormenta sirve para esconder tus golpes.
# next
El trabajo resulta ser más fácil de lo que parecía, en cuanto sacás un par de ladrillos clave la pared sufre un pequeño derrumbe (sin duda las fuerzas de la tormenta están de tu lado porque en ese momento se escuchó un trueno tan fuerte que parecía una carga de artillería).
Usás una soga para atar tu mochila y la mayoría de tu equipo al tobillo, te tirás al piso, y avanzás cuerpo a tierra.
No será la entrada más heroica, pero sin duda es la más inteligente.
-> cap2b_dentro_cubil

=== cap2b_cubil_guardias ===
# music:terror_ambient
Te acercás a la garita que estaba a la entrada del Cementerio y encontrás al grupo de guardias juntos, compartiendo mate mientras una radio (que tira más interferencia que música) pasa un poco de chamamé.
No hay que ser muy astuto para darse cuenta de que no son el grupo de duros cazadores de vampiros que necesitarías en un momento como este. Pero bueno, construís con lo que tenés a mano.
# next
Mentís. Mucho. Decís que estabas viendo la tumba de tu abuelo y te encontraste con un grupo de saqueadores de tumbas. Usás todos los comentarios necesarios para intentar hacerles entender que son peligrosos, sin revelar su naturaleza Vampírica. Decís que parecen drogados, que sin duda están armados.
Los guardias te creen, el tono de miedo y urgencia que le lograste imprimir a tu voz eran muy convincentes (y no necesitaste fingirlo).
# next
El grupo avanza en línea hacia el cubil del Vampiro, vos aprovechás este momento para retroceder un poco y dejar que los guardias hagan el primer ataque.
No llegás a escuchar qué les dice a los Vampiros, un trueno tapa el sonido, pero debe haber sido algo intenso. Antes que puedas procesar lo que está pasando uno de los Vampiros clavó sus dientes en el cuello del guardia y se elevó con su presa en el aire, para sorpresa de todos.
La distracción te da espacio para hacer algo.

+ [Ingresar al cubil mientras los guardias pelean con los Vampiros] -> cap2b_guardias_entrar
+ [Ayudás a los guardias con el combate] -> cap2b_guardias_ayudar

=== cap2b_guardias_entrar ===
# music:terror_ambient
Sentís que los sacrificaste, como corderos al matadero, pero no vas a tener mejor posibilidad para entrar que esta. Te lanzás para la puerta de la Cripta mientras, atrás tuyo, escuchás puteadas, disparos y una risa macabra que seguro tendrá algún lugar en tus pesadillas.
~ todos_guardias_mueren = true
-> cap2b_dentro_cubil

=== cap2b_guardias_ayudar ===
# music:misterio_ambient
Antes de entrar en la cripta decidís darles una oportunidad de combate a los guardias. Te acercás por atrás a uno de los vampiros, que viene parando con el pecho toda la sucesión de disparos que recibe, y vaciás sobre su cabeza la cantimplora llena de agua bendita que llevabas.
Una mezcla de gritos de dolor, olor a carne quemada y sonidos de descreimiento llena el ambiente. El Vampiro intenta recobrar la compostura pero solo se encuentra con tu espada camino a su cuello.
Ingresás al cubil antes de que el polvo de tu enemigo llegue al piso, esperando que los Guardias puedan encargarse del Vampiro restante.
~ algunos_guardias_sobreviven = true
-> cap2b_dentro_cubil

=== cap2b_cubil_tuco ===
# music:misterio_ambient
Si hay un momento donde es necesario llamar a la caballería, es este. Sacás el celular de tu bolsillo y, antes que nada, te asegurás de silenciarlo y dejar el brillo al mínimo. Lo peor sería llamar la atención de forma estúpida como un protagonista de película de terror de bajo presupuesto.
Le enviás a Tuco tu ubicación y un resumen de lo que está pasando. La app de mensajes te da señales de que está escribiendo, escribiendo durante casi un minuto entero.
Esperás una respuesta larga, tal vez un diagrama de un plan de acción. Pero después del minuto solo te llega un emoticón de una mano con el pulgar para arriba.
# next
Completamente frustrado mirás la pantalla del celular intentando comprender qué te quiere decir el mensaje. ¿Está en camino? ¿No le importa lo que está pasando? ¿Va a remitir la información a alguien que piense hacer algo?
Estás tan enojado que apretás el celular al punto en que llegás a temer que lo destruyas en tus manos.
Entonces te llega el último mensaje de Tuco: "Preparate. En un minuto actuamos. Borrá este número después de esta noche".
# next
Desde que te llegó ese mensaje empezás a contar. Uno, dos, tres...
Te gustaría tener más idea de cuál es el plan de Tuco, como para saber qué hacer. Estirás tus músculos, te agazapás listo para correr y ponés tu mano izquierda en la empuñadura de tu espada y la derecha en tu pistola. Esperás que así tengas cubierto todas las opciones posibles.
Entonces escuchás el motor.
# next
Primero es un rugido lejano, tapado por la tormenta, pero empieza a subir cada vez más y más de tono hasta replicar dentro de tu caja torácica. Entonces mirás para tu izquierda y, girando la manzana, aparece una camioneta de policía. Una bestia de metal blindada, con rejas protegiendo sus ventanas, y dos faros gigantes en el techo.
El vehículo acelera y parece que vos no sos el único sorprendido, uno de los Vampiros logra volar pero el otro es llevado puesto por el camión. Su cuerpo es aplastado tres veces, primero por el paragolpe y luego por cada una de las ruedas.
# next
Mientras tanto, la camioneta gira en la esquina mientras se prepara para la segunda pasada a la vez que baja la ventana del acompañante. Del espacio sale un policía (con ropa antidisturbios, esa que solo ves cuando el país está cocinando una nueva crisis) y comienza a dispararle al Vampiro que está flotando en el aire.
Necesitabas una distracción y sin duda te la dieron. Sin pensarlo dos veces te abalanzás contra la puerta de la Cripta.
~ uso_favor_tuco = true
# inv:remove:favor_tuco
-> cap2b_dentro_cubil

=== cap2b_cubil_improvisar ===
# music:misterio_ambient
Salís de tu escondite y te dirigís hacia la pareja de Vampiros que cubren la entrada del Cubil. La tormenta esconde el ruido de los pasos pero no logra tapar la voz en tu cabeza. En lugar de darte una idea brillante se dedica a repetir "esto es una pésima idea, esto es una pésima idea" (que es algo que ya sabías, pero tenías fe de tener una inspiración de último minuto que te permita resolver la cuestión).
A fin de cuentas, hay bebés en peligro y tu trabajo es salvarlos. Mierda, aunque no sea tu trabajo igual irías a salvarlos.
# next
Uno de los Vampiros gira para mirarte. Estira su cabeza para adelante y un costado mientras sus ojos brillan como dos faroles en la oscuridad. De su boca sale un fuerte chasquido y su compañero también gira a verte, con la barbilla pegada al pecho y los ojos mirando hacia arriba.
Seguís avanzando, pero la idea brillante para solucionar el problema nunca llega. Uno de los Vampiros levanta la mano y hace gestos para que te acerques.
Empezás a dudar si seguís avanzando porque sos valiente o si es porque te encontrás bajo la influencia del Vampiro.
Lo importante es que no dejás de avanzar.
# WILLPOWER_START: extreme
# UI_EFFECT: static_mind
# MOUSE_RESISTANCE: extreme
{
    - magia >= fuerza and magia >= conocimiento:
        Tus piernas siguen avanzando. No las mandaste a avanzar pero siguen haciéndolo, una zancada detrás de la otra, como si hubieran recibido órdenes de una cadena de mando que no pasa por tu cabeza. Y entonces lo ves: hilos de energía, finos como telarañas, conectados a tus rodillas y tus tobillos. Los Vampiros los sostienen desde el otro extremo como si fueran las cuerdas de una marioneta. —Los hilos en tus rodillas. No es voluntad lo que te mueve. No es valentía, no es coraje, no es decisión. Es magia de compulsión, vieja y burda, de alguien que asumió que no sabrías reconocerla. Ahora que la identificaste, sus costuras son tan visibles como cualquier otro hechizo que hayas deshecho. Los hilos tiritan cuando los mirás directo. # GENJUTSU_BREAK: magia:cap2b_improvisar_resistido:—Los hilos en tus rodillas.
    - fuerza >= magia and fuerza >= conocimiento:
        Tus piernas siguen avanzando. No las estás moviendo vos. Intentás frenarlas y hay un segundo de confusión, como si el comando se perdiera en el camino, como si la señal de tu cerebro llegara con eco. Existe una diferencia entre caminar hacia el peligro porque sos un idiota valiente y no poder dejar de caminar aunque quieras. Tus piernas ahora son lo segundo. Un cuerpo entrenado sabe cuando algo va en contra de su propio movimiento. —El músculo que resiste. Lo reconocés antes que en tu cabeza: el tendón que tironea en sentido contrario, el instinto de supervivencia que grita parate aunque la ilusión diga avanzá. Tu cuerpo ya lo sabe aunque tu mente tarde en aceptarlo. Cada paso que das sin quererlo es una confirmación más de que algo externo te está moviendo. # GENJUTSU_BREAK: fuerza:cap2b_improvisar_resistido:—El músculo que resiste.
    - else:
        Tus piernas siguen avanzando. Sentís que querés ir hacia allá. O al menos eso es lo que te parece que sentís. Hay una diferencia entre los dos y tardan unos segundos en separarse en tu cabeza. Recordás haber leído sobre esto: la compulsión vampírica genera una sensación de "querer ir" artificialmente, pero tiene un tell conductual específico. El movimiento involuntario tiene una firma distinta al voluntario. La cabeza no hace los microajustes de equilibrio que haría un movimiento voluntario. —Demasiado uniformes. Tus piernas van demasiado rectas, demasiado mecánicas, sin la microoscilación constante que tiene un cuerpo que se mueve por su propia voluntad. Nada orgánico se mueve así. El patrón es tan claro que ahora no podés dejar de verlo en cada zancada. # GENJUTSU_BREAK: conocimiento:cap2b_improvisar_resistido:—Demasiado uniformes.
}

* [Cedés al control]
    # WILLPOWER_STOP
    # MOUSE_RESISTANCE: none
    # UI_EFFECT: none
    -> cap2b_improvisar_dominado
* [Intentás detenerte]
    # WILLPOWER_STOP
    # MOUSE_RESISTANCE: none
    # UI_EFFECT: none
    -> cap2b_improvisar_dominado

=== cap2b_improvisar_resistido ===
# music:misterio_ambient
# WILLPOWER_STOP
# MOUSE_RESISTANCE: none
# UI_EFFECT: none
# flash_white
Recuperás el control de tu cuerpo con un tirón violento, como si despertaras de una pesadilla. Tus piernas vuelven a ser tuyas.
El Vampiro más cercano inclina la cabeza, confundido por un instante. Ese instante es todo lo que necesitás.
Tu espada sale y corta limpio. El polvo del Vampiro se mezcla con la lluvia mientras su compañero retrocede, evaluándote con ojos nuevos. Decide que no vale la pena y se eleva hacia las nubes de tormenta.
La entrada del cubil está libre.
-> cap2b_dentro_cubil

=== cap2b_improvisar_dominado ===
# music:horror_ambient
# WILLPOWER_STOP
# MOUSE_RESISTANCE: none
# UI_EFFECT: none
Tus piernas siguen avanzando sin tu permiso. Sentís que sos un pasajero en tu propio cuerpo, mirando desde atrás de tus ojos cómo te acercás a dos depredadores que sonríen con la boca abierta.
Uno de ellos se lanza sobre vos. Los colmillos perforan tu hombro y el dolor rompe el hechizo de un golpe. Gritás, pero el grito es tuyo y tus brazos también vuelven a ser tuyos.
# stat:hp:-15
# next
Lográs sacar la espada y el Vampiro se despega. Hay sangre, mucha, pero es un corte limpio y superficial. El otro Vampiro no se molesta en atacar, te observa como se observa a un insecto que hizo algo inesperado.
Aprovechás la confusión para lanzarte hacia la puerta de la cripta. Entrás sangrando y temblando, pero entrás.
~ sometimiento = sometimiento + 30
-> cap2b_dentro_cubil

// ---------------------------------------------------------
// SECCIÓN 10: DENTRO DEL CUBIL
// ---------------------------------------------------------

=== cap2b_dentro_cubil ===
# music:terror_ambient
El cubil está iluminado por una lamparita (roja) que le brinda un aspecto orgánico y morboso a todo el cuarto. Sin ningún ataúd a la vista, toda la habitación está seccionada en diversas áreas para sus habitantes. Una esquina tiene una biblioteca con tomos que parecen tener varios siglos de antigüedad, mientras en otra esquina hay colgada una serie de pósters de músicos de los ochentas (no hay otra década donde sean aceptados esos peinados).
# next
Das un par de pasos y casi te chocás con una pequeña mesita que tiene una partida de ajedrez en trámite (aunque sospechás que si contás con la inmortalidad, llegar al grado de gran maestro simplemente es cuestión de estar aburrido).
Más ves la pequeña habitación que es la Cripta y más te parece... triste. No se te ocurre mejor palabra, un montón de vidas congeladas en el tiempo amontonadas en el mismo espacio que ocuparía un local chico en el centro.
Tal vez los Vampiros de las películas lo hacen ver glamoroso, pero si esta es la forma en la que vive la "clase media Vampírica", la muerte es una mejor alternativa.
# next
Tomás una escalera caracol que se adentra en las entrañas de la Cripta. Acá los Vampiros estuvieron trabajando, derribaron una pared y armaron una cueva subterránea. En las entrañas de la tierra la tormenta se vuelve un murmullo lejano.
Avanzás por un pasillo con ataúdes a intervalos regulares, sin duda el lugar donde viven los Vampiros (uno hasta tuvo el detalle de dejar unas pantuflas a un costado y una alfombrita a los pies del ataúd, sería tierno si no se tratara de un predador peligroso que trata a los humanos como ganado).
-> cap2b_pasillo_horror

=== cap2b_pasillo_horror ===
# music:horror_ambient
# play_sfx:susurro_multiple
La única luz viene del fondo del pasillo, del mismo lugar que provienen unas voces profundas que entonan un canto rítmico y gutural. Algo que nunca es buena señal.
Avanzás a tientas, con el temor de que una luz llame la atención.
Es entonces cuando un pequeño desnivel amenaza con hacerte caer. Te llevás una mano a la boca, para contener el grito reflejo que nació en tu garganta, y la otra se agarra de la pared para evitar que caigas al piso.
Húmedo. La mano que tocó la pared está en contacto con algo húmedo y pegajoso.

+ [Prendés la luz y te fijás qué es] -> cap2b_pasillo_luz
+ [Seguís a oscuras] -> cap2b_pasillo_oscuras

=== cap2b_pasillo_luz ===
# music:horror_ambient
Todo director de cine de terror sabe que insinuar es más efectivo que mostrar. Las cosas que crea tu mente con el estímulo adecuado tienden a ser más terroríficas (y adaptadas a tus miedos) que cualquier cosa que pueda hacer la oficina de efectos especiales.
Esta era la excepción a la regla. Todo respecto a los Vampiros giraba en torno a la sangre, y esto no era la excepción.
# next
En el piso yacía un intestino largo serpenteante que marcaba el camino hacia el lugar del ritual, flanqueado en intervalos regulares por charcos de sangre donde descansaban órganos. Se sentía mal, como romper un tabú o ver algo privado. A simple vista llegabas a reconocer un corazón y unos pulmones, el resto no sabías qué era pero había más que un par de las cosas que debían venir en pares. Ese piso tenía mucha muerte.
Lo que había en las paredes era escritura, o runas, o parte de un hechizo. Escrito de techo a piso en todos los tonos de rojo posibles.
{conocimiento >= 25:
    # next
    El color no era abstracto, era tan parte del lenguaje como los símbolos. Intentaste abstraerte y leerlo de forma fría (eso era sin pensar cuántas personas habían muerto para escribir eso y evitando pisar un pulmón). Era parte de los preparativos del ritual. La escritura era clara. El sacrificio de siete bebés humanos, uno por cada día de la semana, para garantizar que un Vampiro pueda caminar inmune bajo la luz del sol.
    No era claro si las otras reglas también se romperían, si podría entrar sin invitación a la casa de la gente o si sería inmune a los símbolos sagrados. Pero Vampiros de día ya eran suficiente problema. El Cazador estaba limitado por su hábitat de caza, y esto rompía esos límites. Era como si el Tiburón Blanco de repente tuviera piernas y pulgares opuestos.
}
No te queda más opción ahora, debés seguir avanzando y esperar que la terapia y los psicofármacos puedan hacerte olvidar esto.
-> cap2b_monticulos

=== cap2b_pasillo_oscuras ===
# music:horror_ambient
La mente funciona de formas raras. Que una idea entre en tu cabeza es fácil, pero que salga es casi imposible. Cualquiera que estuvo toda una tarde tarareando una canción pegajosa lo sabe.
Lo importante es que decidís que preferís no saber qué es la sustancia pegajosa que se encuentra en el pasillo. Te limpiás las manos en tu pantalón y seguís avanzando.
-> cap2b_monticulos

=== cap2b_monticulos ===
# music:terror_ambient
# play_sfx:canto_gutural
Las voces van tejiendo un canto que se hace cada vez más presente, casi tangible. El aire se vuelve espeso y te empieza a doler la cabeza. Te sentís embotado, como si te hubieses despertado en mitad de un sueño, con la mente confundida y las extremidades debilitadas.
Es entonces cuando escuchás el ruido metálico, a la entrada de la habitación donde se está realizando el ritual hay pilas y pilas de adornos y decoración religiosa robada de otras criptas.
# next
La mayoría está amontonada en pequeños túmulos que llegan hasta tu rodilla y embadurnados en una sustancia roja que preferís no averiguar qué es. Su consistencia y distribución no parece azarosa, sin duda es parte de lo que están intentando hacer. ¿Burlarse de los símbolos de la muerte? ¿Mancillar simbología judeocristiana?
Te ponés en cuclillas para observar mejor los montículos y ver qué encontrás.

+ [Una placa de una esposa despidiendo a su difunto marido. Podría servir] -> cap2b_monticulo_placa
+ [Una cruz de plata que casi no tiene manchas. Te la llevás] -> cap2b_monticulo_cruz
+ [Una estatua de Buda que parece casi indemne. Podría ser útil] -> cap2b_monticulo_buda
+ [Pateás todos los montículos. Que se jodan] -> cap2b_monticulo_patear

=== cap2b_monticulo_placa ===
# music:terror_ambient
"Mientras mi corazón siga latiendo, lo hará al ritmo de tu nombre". La frase no tiene autor así que debe ser algo que se decía la pareja en vida, un fragmento real de su cariño. Tal vez una muestra de amor puro pueda ser un arma eficiente (aunque, por las dudas, dejás tu espada a mano).
Dejás atrás el pasillo del horror y pasás a la siguiente habitación, debés agacharte para entrar, como un penitente o un suplicante.
# inv:add:placa_amor
-> cap2b_ritual_final

=== cap2b_monticulo_cruz ===
# music:terror_ambient
La cruz es de plata y tiene a Cristo crucificado en su frente. Te sorprende que, entre todas las tripas y la sangre que tapan los montículos, no tiene ni una mancha. Cuando la sacaste estaba atravesando un cráneo decrépito, tan viejo que estaba más cerca de la decoración que del horror, pero aun así había logrado mantenerse inmaculada.
Tal vez era una señal de la bendición sagrada. En el peor de los casos, se sentía pesada en tu mano, así que podía servir como una buena maza.
Dejás atrás el pasillo del horror y pasás a la siguiente habitación, debés agacharte para entrar, como un penitente o un suplicante.
# inv:add:cruz_plata
-> cap2b_ritual_final

=== cap2b_monticulo_buda ===
# music:terror_ambient
La estatua de Buda se encuentra en la cima de su pequeño túmulo, justo debajo de un ojo (que hacés todo lo posible para no entrar en contacto directo con su mirada muerta). Te sorprende encontrar un adorno de este tipo, hasta donde sabés la comunidad budista en Costa Alegre es casi insignificante. Al agarrarla te das cuenta de que la estatua es de oro macizo, sin duda una excentricidad de un oligarca que tenía suficiente tiempo libre como para aburrirse. Pero bueno, no es momento para rechazar ningún tipo de ayuda.
Dejás atrás el pasillo del horror y pasás a la siguiente habitación, debés agacharte para entrar, como un penitente o un suplicante.
# inv:add:buda_oro
-> cap2b_ritual_final

=== cap2b_monticulo_patear ===
# music:horror_ambient
Pateás el primer túmulo y explota repartiendo una lluvia de cruces, tripas, placas y carne. Una lluvia plateada y roja. Es bueno, es hacer algo. Esperás que destruirlo sirva de alguna manera para fastidiar el ritual. En el peor de los casos, al menos sirvió para convertir tu miedo en odio y acción. Si tenés que elegir, siempre es mejor estar enojado que asustado.
Dejás atrás el pasillo del horror y pasás a la siguiente habitación, debés agacharte para entrar, como un penitente o un suplicante.
-> cap2b_ritual_final

// ---------------------------------------------------------
// SECCIÓN 11: RITUAL FINAL — LA CONFRONTACIÓN
// ---------------------------------------------------------

=== cap2b_ritual_final ===
# music:horror_ambient
Sos lo menos interesante en la habitación. Esa es tu ventaja porque nadie te está mirando y te da espacio para actuar.
En el piso de la habitación hay un círculo delimitado con cera roja (o carne quemada) que contiene una figura geométrica compleja que te da dolor de cabeza con solo verla. Notás que el diagrama pulsa, salvo unos pequeños bultos que aparecen cada tanto como engranajes del diagrama.
# next
Encima, flotando a unos diez centímetros del piso, se encuentra el líder del Aquelarre usando una túnica borravino que circula siguiendo el patrón dibujado sobre el suelo.
Sobre su cabeza la energía del ritual se concentró. Es tanta energía y en tan poco lugar que se puede ver a simple vista. Una intensa red de hilos rojos que se van tensando y relajando a ritmos regulares.
Por último notás, del otro lado del círculo, a los seis miembros restantes del Aquelarre cantando de forma rítmica. Su ritmo dicta la forma en la que se tensan los hilos y pulsa el símbolo.
{conocimiento >= 25:
    Sea como sea, no van a poder detenerse en este momento. Una invocación así requiere una gran entrega y mueve emociones que anulan nuestra parte más racional. Esos seis Vampiros ahora son mera escenografía del ritual.
}
# next
Cuando superás el shock producido por la rareza de la situación, y la certera muerte que implicaría enfrentar a tantos Vampiros, observás mejor la situación. Esos bultos que yacen sobre el diagrama son los bebés desaparecidos.
{
    - llegaste_tarde_2b >= 2:
        # next
        El horror se presenta como un grito dentro de tu cabeza. Un grito constante en un idioma desconocido. Los cuerpos de bebé forman parte del diagrama en el piso.
        Cuerpos rotos que, en su desesperación, el Vampiro había desmembrado. Cabezas, gigantes para sus cuerpitos, caídas sobre sus pechos y apenas conectadas al resto del cuerpo por un tirón de músculo. Piernas que, en la homicida necesidad del Vampiro de consumir hasta la última gota de sangre, habían sido estrujadas y arrancadas.
        Solo un bebé sobrevivía, el último requisito para cerrar el ritual. Un pequeño tan inocente que miraba sin entender el juego de los hilos de energía roja que se tejían sobre su cabeza.
        Seguramente a la noche, y durante muchas noches (tal vez todas), ibas a pensar en todas las vueltas en falso que diste en tu investigación. Todos los atajos que pudiste haber tomado para llegar a tiempo.
        Pero ahora, era momento de actuar.
    - else:
        # next
        Los siete bebés que los Vampiros venían secuestrando en la Ciudad. Ahora están callados y quietos en la posición que les correspondía. La mayoría parecía muy joven hasta para gatear, aunque había uno que se notaba que tenía sus piernas en una posición antinatural, sin duda se las habían quebrado para que se quede donde querían.
        Era horrible, pero estaban vivos. Y estar vivo es el principio de todas las soluciones. Tu misión ahora era asegurarte de que sigan así.
}
# next
Con total indiferencia, y siguiendo un recorrido que parecía aleatorio pero espejaba el diagrama del piso, se agacha lentamente para tomar al bebé entre sus manos. Es una cosa hermosa, un par de cachetes que parecen una copa llena de flan con dulce de leche y una mirada que desborda inocencia.
En contraste, el Vampiro Superior parece una versión fallida del ser humano. Sus dedos eran largos al punto de generar inconformidad, como si se tratara de apéndices extraños. Como colmo se dejó las uñas largas, uñas que está usando para cortar la piel del bebé hasta hacerlo llorar.
# next
El llanto del bebé replicaba en todas las paredes hasta generar verdadero dolor físico, era la necesidad de actuar hecha sonido. El Vampiro lo tomó de una muñeca y lo elevó hasta la altura de su rostro, mirándolo con un brillo predador en sus ojos, mientras seguía levitando como si bailaran juntos un vals al son del llanto.
Pero vos estabas acá, un Guardián del Faro, y te ibas a asegurar de que esa persona sobreviva.
# next
Todas las piezas estaban claras ahora. El diagrama en el piso, el Vampiro levitando arriba a punto de devorar al bebé, los hilos de energía roja concentrándose en el techo y el resto del grupo en el fondo recitando para mantener la sonoridad que necesitaba el ritual.
La pregunta ahora es: ¿Cómo actuar?
-> cap2b_ritual_opciones

=== cap2b_ritual_opciones ===
# music:horror_ambient
+ [Te tirás contra el Vampiro Superior. Estás seguro de que podés ganarle # REQUIRES: fuerza >= 30] -> cap2b_ritual_fuerza
+ [El principal problema de los Vampiros es que son inflamables. Liberás el fuego # REQUIRES: magia >= 30] -> cap2b_ritual_magia
+ [Con un poco de ingenio se puede modificar el diagrama en el piso # REQUIRES: conocimiento >= 30] -> cap2b_ritual_diagrama
+ [Sin bebé no hay ritual. Lo más importante es impedir que exista un Vampiro diurno] -> cap2b_ritual_matar_bebe
+ {tiene_favor_tuco and not uso_favor_tuco} [Que suerte que guardaste el favor de Tuco para el último momento] -> cap2b_ritual_tuco
+ [Avanzás con la cruz en alto confiando en el poder divino # REQUIRES: inv:cruz_plata] -> cap2b_ritual_cruz
+ [Sacás la estatua de Buda y das un paso al frente confiando en que te proteja # REQUIRES: inv:buda_oro] -> cap2b_ritual_buda
+ [Sacás la placa de amor y das un paso adelante # REQUIRES: inv:placa_amor] -> cap2b_ritual_placa
+ [Sacás tu celular y ponés música a todo volumen para romper la melodía] -> cap2b_ritual_musica
+ [Tu sangre podría contaminar el ritual y convertirlo en un caos] -> cap2b_ritual_sangre

=== cap2b_ritual_fuerza ===
# music:boss_arañas
Avanzás hasta el borde del diagrama. Pisás con fuerza parte del trazado y movés frenéticamente el pie en un intento de borrar la imagen. Como insulto final, escupís sobre una de las figuras geométricas. El desafío está en el aire.
El Vampiro Superior vuelve a colocar el bebé en su posición (el plan está funcionando) y te mira, su rostro denota cansancio y aburrimiento principalmente.
# next
Cargás con la espada en tu mano menos hábil. Su reacción ocurre a la velocidad del pensamiento. En un momento estabas corriendo hacia él y ahora estás colgando a diez centímetros del piso, con una de sus garras en tu cuello y la otra atrapando el brazo donde está tu arma. Todo ocurre tan rápido que escuchás el ruido de tus huesos rompiéndose y el arma cayendo al piso antes de procesar la ola de dolor subiendo por tu brazo.
Sus labios se retraen dejando al descubierto un par de caninos largos y afilados, como agujas de coser.
# stat:hp:-10
# next
Los Vampiros Superiores pueden tener capacidades regenerativas tan rápidas que parecen inmunes al daño, y un umbral de dolor que los hace parecer intocables, pero no pueden escaparse de la física básica. Justo antes de que te muerda le das un cabezazo con toda tu fuerza. Masa y velocidad concentrada, puede ser que no le duela pero tira su cabeza para atrás. Eso te da un espacio para trabajar.
El movimiento lo entrenaste con Cabral mil veces. Es como pelear contra un perro, tenés que entregarle algo para que muerda así está distraído y podés trabajar.
# next
Por eso cargaste con el arma en tu brazo inhábil, él ocupó su mano en eso y te dejó la otra libre. Otra mano que ahora está aprovechando el espacio que ganó tu cabezazo para meter una daga directo a su cuello.
Su mirada se vuelve humana durante unos segundos a la par que la daga entra en su cuello. Supongo que volver a estar en contacto con su mortalidad logra eso.
Pero vos no dudás, seguís extendiendo el brazo (tu único brazo ahora) hasta que termina de estar completamente extendido.
# next
Caés al piso rodeado en la nube de polvo que fue tu enemigo. Las energías que el ritual concentraba se vuelven locas, latigazos de energía que cortan el techo e inundan la habitación de un fuerte olor a óxido y electricidad.
Antes de disiparse, un latigazo pasa por los vampiros que formaban el coro y los reduce a cenizas. Gracias destino. No tenías ni idea cómo encargarte de eso.
-> cap2b_epilogo

=== cap2b_ritual_magia ===
# music:boss_arañas
Juntás las yemas de los dedos de ambas manos formando un círculo, como si tuvieras una lente poderosa, y concentrás la energía. El primer fogonazo sale concentrado, más parecido a un chorro de agua a presión que a fuego, pero cumple su objetivo. El brazo del Vampiro Superior queda cercenado inmediatamente y el bebé queda libre (a una distancia considerable del piso, pero bueno, vas a echarle la culpa de eso a los vampiros).
# next
El Vampiro Superior carga contra vos. El coro del fondo carga contra vos. Parece que todo el mundo carga contra vos.
Hay dos consejos muy importantes. El primero es que el miedo no es buena emoción para hacer magia precisa (pero sí sirve si querés hacer explotar todo).
Segundo, no es conveniente nunca cargar contra la persona que es un lanzallamas humano. Lamentablemente, nadie le había explicado eso nunca a estos Vampiros.
# next
Apenas separás los dedos y el fuego fluye. Es una catarata y una explosión. Es el calor que funde todo a sus partículas principales para volver a construir algo nuevo.
Los Vampiros se convierten en polvo y el polvo en átomos. Las paredes de la cueva empiezan a gotear y se vuelven tan maleables como el barro. Las energías que el ritual había concentrado también son desmenuzadas hasta volverse inertes.
Entonces escuchás un llanto infantil.
# next
Recordás el orden. Vos manejás a la energía, no al revés. Cortar de repente el flujo de energía es doloroso, como interrumpir una función biológica, duele y te hace sentir frustrado y levemente descompuesto. Tu cuerpo empieza a temblar en un intento de procesar qué hacer con tanta energía extra de repente.
Te caés de rodilla y vomitás. Pero destruiste a los monstruos y, más importante, te aseguraste de no convertirte en uno.
-> cap2b_epilogo

=== cap2b_ritual_diagrama ===
# music:horror_ambient
Das un paso al frente y te detenés a ver el conjunto de símbolos y diagramas que forman la figura geométrica en el piso. Cuando uno está iniciando parecen símbolos extraños pero con onda (por eso tantos jóvenes entran al ocultismo, gran estética). A medida que uno aprende se da cuenta de que no son símbolos, son el lenguaje de la realidad.
En esencia, lo que tenés frente a tus ojos son una serie de órdenes para juntar energía y descargarla de una forma precisa, no muy diferente a lo que sería un trabajo de programación (no por nada los abuelos de la informática vienen del ocultismo).
# next
Esas órdenes pueden ser fácilmente modificadas si uno sabe lo que hace (lo sabés) y está lo suficientemente desesperado (lo estás).
Sacás tu daga y te hacés un corte en tu palma izquierda, la cual vas a usar de tintero. La adrenalina para gran parte del dolor aunque sabés que el corte lo vas a sentir por semanas, es una herida en una zona con mucho movimiento que tarda en sanar.
# stat:hp:-5
# next
Usás tu dedo derecho como pluma y empezás a hacer unas modificaciones. Más complicado es un hechizo más fácil resulta dañarlo, pero vos aspirás a más: vos querés controlar las energías que los Vampiros cosecharon en este lugar impío.
El Vampiro Superior está listo para morder al bebé cuando el hechizo (tu hechizo) cobra vida.
# next
Los hilos de energía del techo se tensan tan rápido que retumba en la habitación un sonido metálico, entonces uno de los hilos se libera dando un latigazo de energía que corta al medio al Vampiro Superior y lo reduce a una nube de polvo.
Habías mutado la energía del techo, en lugar de ser una máquina para fortalecer Vampiros era una máquina para matar Vampiros. Era sorprendente las pocas letras que tuviste que cambiar.
# next
Parecía un calamar con cientos de tentáculos. Desde el cielo empezó a lanzar latigazos contra los miembros del coro.
Ellos intentaron todo, volar, convertirse en humo o en un grupo de murciélagos. Nada sirvió, en menos de cinco segundos todos habían sido reducidos a polvo.
Destruido el último Vampiro, los hilos de energía se doblaron sobre sí mismos y formaron un ovillo. Lentamente dejaron de brillar y se camuflaron con el resto del techo, esperando al próximo grupo de vampiros que se adentre en esta cripta creyendo que habían encontrado un buen cubil. Acabás de crear una leyenda urbana, esperás al menos tener el derecho de ponerle nombre vos y que no se termine llamando algo estúpido como "spaghetti cazavampiros".
Pero lo importante es que lo lograste, contra todo pronóstico.
-> cap2b_epilogo

=== cap2b_ritual_matar_bebe ===
# music:horror_ambient
Más pensás la idea más te das cuenta de que es un plan horrible. ¿La vida de uno es menos importante que la vida de muchos? Verdad, pero es fácil decirlo cuando la vida que va a ser sacrificada es la de otra persona. ¿Su red de relaciones humanas es casi nula por lo cual su muerte afectará a menos gente? Una idiotez, cualquier persona sabe que un bebé es puro futuro y esperanza.
Uno puede racionalizarlo todo lo que quiera, pero los argumentos no pueden blindarse contra ese llanto que está pidiendo ayuda a gritos.
Se supone que vos tenías que venir a salvar al bebé, no hay nada que te diferencie del Vampiro que está por devorarlo. Sos un fracaso y vas a tener que vivir con eso.
Si no actuás ya no lo vas a poder hacer. Apuntás y...
# next
Disparás. Se te pudo haber encasquillado el arma, o pudiste haber pifiado el tiro. Pero no, fue tu mejor disparo. Su cabeza convertida en una explosión de sangre es una imagen que queda grabada en tu retina. A pesar de que cierres los ojos lo seguís viendo, encerrado por siempre en un momento de horror eterno.
Bajás el arma y esperás que el Vampiro Superior venga a matarte. No querés sobrevivir a esto. Mucho menos tener que hacer informes, recibir aplausos y miradas que fingen comprender el costo de lo que hiciste.
~ traumado = true
~ bebe_muerto = true
# next
Antes de darte cuenta el Vampiro Superior está encima tuyo (textualmente, está flotando a medio metro del piso) y se prepara para bajar como un ave de presa. Ojalá te mate, ojalá duela.
Es en ese momento que, al faltar uno de los elementos del ritual, la energía que estaba concentrándose en el techo se descontrola.
Un latigazo de energía cae justo sobre el Vampiro Superior y lo termina reduciendo a una pila de polvo que llueve sobre vos.
# next
Todo es un caos, la energía concentrada en el cielo es una tormenta de furia divina que libera latigazos de energía sobre todo el lugar. Vos no te movés del lugar, esperando el momento en que te caiga uno.
El coro de vampiros desaparece con un rayo, en una mezcla de fuego, humo y gritos. Casi toda la habitación es castigada, la sangre del piso se derrite y las paredes se cristalizan.
Pero vos sobrevivís.
-> cap2b_epilogo

=== cap2b_ritual_tuco ===
# music:misterio_ambient
Si existió un momento en la historia de la humanidad en que fue necesario llamar a la caballería, era este. No te importaba quién venga, la caballería polaca, el General Custer o la Brigada Antidisturbios de la Provincia de Buenos Aires. Alguien tenía que poder traer las armas pesadas.
Sacás una foto de lo que está pasando y se la enviás a Tuco junto con tu ubicación en tiempo real. Te agazapás entre unas sombras y esperás el mensaje de respuesta.
# next
Un corazón. Esa es toda la respuesta. Un puto emoticón que no tiene mucho sentido. ¿Significa que está viniendo? ¿Que le claves una estaca en el corazón? ¿Que en el fondo siempre apoyó a los Vampiros y los rituales humanos? ¡¿QUÉ MIERDA ES UN CORAZÓN?!
# next
Tenés suerte de que el ritual parece tener una cláusula de tiempo, el Vampiro Superior sigue dando vueltas con el bebé mientras el coro va cantando cada vez a mayor velocidad, sin duda la canción está llegando a un clímax. Un clímax que va a incluir la muerte del bebé.
No queda otra opción, con un revólver en una mano y la espada en otra, te preparás para actuar.
# next
Cuando avanzás hacia tu muerte escuchás el primer disparo, la ráfaga brillante pasó a centímetros tuyo y pega de lleno en la cabeza del Vampiro Superior, incendiando todo su pelo.
Un agente de la policía, con chaleco antibalas y un casco negro que deja ver unos mechones colorados, avanza y dispara dos tiros más al pecho del Vampiro hasta que la munición recargada de fósforo termina quemando el cañón del arma. Ese es el momento donde pasa a su pistola de bolsillo y vacía el cargador hasta que su blanco es polvo.
~ final_con_tuco = true
~ uso_favor_tuco = true
# inv:remove:favor_tuco
# next
Tal vez esta gente carecía de la pericia para descubrir qué estaba ocurriendo y encontrar el cubil de Vampiros, pero sin duda tienen el talento necesario para limpiar el problema. Simplemente te apartás a un costado (para no molestar) mientras un oficial con sobrepeso usa un arma de gas lacrimógeno modificada para lanzar una bomba de agua bendita al coro de Vampiros, a la par que otro agente carga usando un híbrido entre una espada y una cruz.
La caballería llegó al rescate y se encargó del asunto.
-> cap2b_epilogo

=== cap2b_ritual_cruz ===
# music:horror_ambient
Es momento de pasar a la acción. Das un paso hacia adelante, tus pies cruzan el diagrama, y estirás la cruz hacia adelante.
De repente sentís la energía atrás tuyo, como si una presencia gigante se encontrara a tu espalda. Igual no tenés tiempo para preocuparte por eso, estás demasiado concentrado en mantener tu agarre de la cruz que dejó de ser una estructura sólida de plata para convertirse en un pilar de luz vertiginoso.
# next
La voz que sale de tu boca no es la tuya, por suerte dado que estás seguro de que vos nunca hubieses logrado tener ese nivel de seguridad.
\- Alto, por la Sangre del Cordero, dejen a ese niño y abandonen este lugar.
La luz de la cruz deja ver al líder del Aquelarre de Vampiros como lo que es, un parásito despreciable. Piel quebradiza, los labios desaparecidos para dejar ver una dentadura compuesta solo por colmillos, la cabellera compuesta solo de un largo mechón gris, gusanos e insectos pululando en heridas infectadas en la piel. Un cadáver caminando.
# next
El Vampiro quiebra su columna, girando el cuerpo hacia la derecha hasta que su cabeza toca el piso y dejando tranquilamente el bebé sobre el piso.
Sentís la presión de la presencia a tu espalda y te ves obligado a avanzar un paso hacia adelante. En respuesta el Vampiro retrocede en cuatro patas hacia el resto de su grupo.
La energía que se concentraba en el techo simplemente se evapora, dejando atrás un humo rosado de olor metálico, mientras el grupo de Vampiros hace un montículo humano (bueno, no humano realmente) colocándose unos sobre otros e intentando ocultarse de la luz de la cruz.
# next
Simplemente ya no tenés una cruz en tu mano. Tus dedos se relajan porque no hay nada más que agarrar. Solamente hay luz adelante, un fogonazo de la primera luz del universo.
Cuando podés volver a ver, después de un buen tiempo, delante tuyo solo hay una pila de cenizas.
# achievement:unlock:cruz_contra_vampiros
-> cap2b_epilogo

=== cap2b_ritual_buda ===
# music:horror_ambient
Avanzás con el Buda en tu mano esperando que haga... ¿algo? En el momento en que tu pie toca la figura geométrica el Vampiro Superior se da cuenta de tu presencia. Te mira a vos, al Buda, y de nuevo a vos como intentando entender qué parte del ritual es todo esto.
Es cuando se da cuenta de que no es parte del ritual, y que la estatua de Buda lo único que está logrando es cansar tus brazos, cuando sonríe. Su sonrisa se va haciendo cada vez más grande hasta dejar al descubierto dos filosos colmillos.
# next
Su mordida destruye el cuello del bebé, dejando salir de su cuerpo un fuerte llanto y un chorro de sangre. Diez segundos es lo que tarda en morir el bebé, suena poco pero pudiste haber hecho un montón de cosas en ese tiempo, pero solo se te ocurrió contar y sostener una estatua de Buda.
Cuando el Vampiro Superior termina su festín deja el cadáver en una posición específica y te mira.
\- ¿Estás listo para reencarnar?
# next
El Vampiro se mueve a la velocidad de tu pensamiento. Solo dos de sus dedos, largos y flacos, se colocan alrededor de tu cuello. Todo lo que basta es un pequeño movimiento y estás muerto.
Tu cerebro tarda unos segundos en darse cuenta, lo suficiente para escuchar el crack de tus huesos al quebrarse y tener un último pensamiento coherente antes de irte. "¿Cómo pensaste que esto iba a funcionar?"
# next
ESTÁS MUERTO.
-> END

=== cap2b_ritual_placa ===
# music:horror_ambient
Avanzás con la placa en tu mano esperando que haga... ¿algo? En el momento en que tu pie toca la figura geométrica el Vampiro Superior se da cuenta de tu presencia. Te mira a vos, a la placa, y de nuevo a vos como intentando entender qué parte del ritual es todo esto.
Es cuando se da cuenta de que no es parte del ritual, y que la placa lo único que está logrando es cansar tus brazos, cuando sonríe. Su sonrisa se va haciendo cada vez más grande hasta dejar al descubierto dos filosos colmillos.
# next
Su mordida destruye el cuello del bebé, dejando salir de su cuerpo un fuerte llanto y un chorro de sangre. Diez segundos es lo que tarda en morir el bebé, suena poco pero pudiste haber hecho un montón de cosas en ese tiempo, pero solo se te ocurrió contar y sostener una placa funeraria.
Cuando el Vampiro Superior termina su festín deja el cadáver en una posición específica y te mira.
\- Veo que ya trajiste tu placa funeraria.
# next
El Vampiro se mueve a la velocidad de tu pensamiento. Solo dos de sus dedos, largos y flacos, se colocan alrededor de tu cuello. Todo lo que basta es un pequeño movimiento y estás muerto.
Tu cerebro tarda unos segundos en darse cuenta, lo suficiente para escuchar el crack de tus huesos al quebrarse y tener un último pensamiento coherente antes de irte. "¿Cómo pensaste que esto iba a funcionar?"
# next
ESTÁS MUERTO.
-> END

=== cap2b_ritual_musica ===
# music:horror_ambient
Sacás el celular y te asegurás de que esté en máximo volumen, abrís la aplicación de música y dejás que el algoritmo elija qué música pasar. Primero pasan un par de temas de trash metal, en el medio pasan un par de cumbias que te hacen mover la cintura aun en esta situación, para pasar por un par de música deprimente de la década del ochenta.
Los Vampiros que forman el coro se desesperan e intentan cambiar su entonación y ritmo para compensar el sonido que estás insertando vos en el hechizo.
Casi lo logran, hasta que los sorprendés con una sucesión de boleros.
# next
La energía que se estaba concentrando en el techo de la habitación empieza a perder forma. Los hilos se vuelven cada vez más anchos hasta parecer intestinos, uno explota bañando la habitación de sangre e impregnando el ambiente de un penetrante olor a óxido. Cada uno de los juegos de voces lo tironea para lados diferentes y lo moldea de formas contradictorias.
La situación no es sostenible.
# next
Todo explota cuando suena "La Marcha de San Lorenzo". A la par que la canción llamaba a la carga, las energías se descontrolaron completamente. Un tentáculo de energía roja salió disparado y pulverizó al Coro de Vampiros (junto con toda la esquina de la cueva, que se convirtió en vidrio).
El Vampiro Superior intentó huir, una sombra que pasó volando sobre tu cabeza. Justo en el momento en que otro rayo de energía venía directo hacia tu celular. El Vampiro funcionó de pararrayos y terminó convertido en un cometa de llamas que se pulveriza contra una pared.
# next
Ahí es el momento en que decidís apagar la música.
La energía concentrada termina cayendo en el ambiente como una ligera lluvia de sangre, que esperás que esté libre de cualquier tipo de enfermedad. Doscientos años de historia y los Granaderos siguen cobrándose victorias.
-> cap2b_epilogo

=== cap2b_ritual_sangre ===
# music:horror_ambient
Pasás la daga por tu palma. Primero sentís el frío de la hoja y luego el calor de la herida. Empieza a brotar sangre, la dualidad vida/muerte y el eje a través del cual gira toda la magia vampírica. Extendés tu mano y dejás que la herida gotee sobre la figura geométrica dibujada en el suelo.
# stat:hp:-5
# next
El plan original era que tu sangre arruine el ritual. Sangre de adulto. Sangre no contemplada.
Pero nada pasa, al fondo el coro sigue cantando, en el cielo la energía se sigue concentrando y los hilos rojos empiezan a interconectarse formando figuras cada vez más complejas.
Es entonces cuando el Vampiro Superior clava sus dientes en el cuello del bebé.
# next
Su mordida es ansiosa y brutal, desgarra el cuello y lo convierte en un manantial de sangre. Vos solo lo ves, de rodillas, mientras tu sangre comienza a generar una mancha en el piso.
El Vampiro Superior deja el cadáver del bebé, con más cuidado que el que usaba cuando estaba vivo, en su posición en el ritual.
Es entonces cuando te mira, con más curiosidad que otra cosa, y te dirige la palabra:
\- Veo que estás tan ansioso que ya te hiciste un corte. Lamentablemente esta noche tengo una dieta específica.
# next
El Vampiro se mueve a la velocidad de tu pensamiento. Solo dos de sus dedos, largos y flacos, se colocan alrededor de tu cuello. Todo lo que basta es un pequeño movimiento y estás muerto.
Tu cerebro tarda unos segundos en darse cuenta, lo suficiente para escuchar el crack de tus huesos al quebrarse y tener un último pensamiento coherente antes de irte. "¿Cómo pensaste que esto iba a funcionar?"
# next
ESTÁS MUERTO.
-> END

// ---------------------------------------------------------
// SECCIÓN 12: EPÍLOGO
// ---------------------------------------------------------

=== cap2b_epilogo ===
# stop_music
# music:misterio_ambient
# UI_EFFECT: none
# MOUSE_RESISTANCE: none
# WILLPOWER_STOP
Cuando salís de la cripta la lluvia ya es solo un recuerdo, presente en un par de charcos en el piso y un poco de barro. Las primeras luces del amanecer le dan otro aspecto al cementerio, más calmo, sin luces oscuras donde acechan monstruos.
{todos_guardias_mueren:
    # next
    Tenés que caminar con cuidado, en el piso no solo hay agua. Brazos, tripas y cosas que deberías tomar una clase de anatomía para saber qué son. Los restos de los guardias que mandaste al matadero para poder entrar en la cripta. Estas vidas van a pesar en tu consciencia.
    Pero eso puede esperar.
}
{algunos_guardias_sobreviven:
    # next
    Un par de guardias sobrevivieron al ataque final. Están sentados en la entrada de una cripta, bajo una estatua gigante de un ángel con alas extendidas, y te miran con cara desconcentrada. Alguien les va a tener que explicar qué fue lo que pasó. Diantres, hasta deberían ofrecerles un trabajo si sobrevivieron a esto.
    Pero eso puede esperar.
}
{final_con_tuco:
    # next
    Contra una pared te espera recostado un agente de policía colorado. Parece lastimado (no querés saber cómo es tu aspecto). Se limita a hacerte un gesto con la mano para darte a entender que todo está bien. Parco para hablar y con una cabellera que debe ser la base de un apodo, el Sargento Tuco. Sin duda cuando no prestes atención va a robarte el celular para asegurarse de que borres su contacto.
    Pero eso puede esperar.
}
# next
Cerrás los ojos y dejás que la luz del sol te bañe. Padre sol que quema a las cosas horribles e inexplicables mientras nutre y mantiene caliente a la humanidad.
{traumado:
    # next
    Una parte tuya siente que el sol debe quemarlo, que es otro monstruo asesino de niños. Simplemente ya no resistís más, el esfuerzo de racionalizarlo es demasiado pesado y la imagen de su cabeza convertida en una explosión de sangre nunca te abandona. No importa dónde mires esa muerte está ahí, como una impresión traslúcida que se superpone a todo.
    Te caés de rodilla y llorás. En algún momento el teléfono suena pero eso ocurre en otro lugar. Vos estás en tu mundo personal, un infierno donde no necesitás abrir los ojos para ver tus crímenes.
    Seguís llorando hasta que te duele el cuerpo y te desembrazás en espasmos mudos.
    En algún momento alguien te levanta. Recordás la aguja y la calma (física al menos) entrando en tu cuerpo. Ahora estás en tu pieza y no lo podés ver, por ahora.
}
{llegaste_tarde_2b >= 2 and not traumado:
    # next
    El único bebé sobreviviente está en tus brazos, durmiendo. Te da pánico tenerlo, tenés miedo de hacer un mal movimiento y lastimarlo o que se largue a llorar. Así que encontraste una posición cómoda (para el bebé, vos sentís como se te quiebra la espalda) y no te movés de ahí.
    Te preguntás quiénes serán sus padres. Por lo que viste esta noche no dudás de que están muertos pero al menos esperás que El Faro le encuentre una linda familia.
    Eso sería lindo. También es probable que El Faro lo entrene desde chiquito para ser un cazador de vampiros y cobrarse venganza. En ese caso no te extrañaría que en 20 años este bebé sea tu jefe.
    Te gustaría llamar a Enriquez y pedir que organice que alguien te pase a buscar. Pero eso implicaría moverse y arriesgarse a despertar al bebé.
    No importa, esperás. Esto es lindo.
}
{llegaste_tarde_2b < 2 and not traumado:
    # next
    Por suerte El Faro desembarcó con fuerza. Alguien había puesto una puerta médica en la entrada de una Cripta (mostrando que el encargado tenía un morboso sentido del humor). Teniendo en consideración la noche que tuviste, consideraste completamente válido sentarte en una esquina y dejar que el resto se encargue de vos.
    Pero claro, primero estaban los bebés. Siete vidas que salvaste vos, siete futuros llenos de posibilidades que seguían en camino gracias a tus acciones de esa noche.
    Y ¿qué era eso? ¿Enriquez cargando a uno mientras habla como un bebé? ¿Y acaso era una sonrisa eso que estaba apareciendo en su boca? Pase lo que pase no la ibas a dejar olvidar nunca este momento.
    Te deja tranquilo ver que el lugar está lleno de gente que sabe lo que tiene que hacer. Eso te permite desmayarte tranquilo.
}
{sometimiento >= 50:
    # next
    Mientras te alejás del cementerio sentís la voz del Vampiro todavía susurrando en tu cabeza. No son palabras, es más bien una presencia, como una mancha de humedad que se extiende en una pared. Algo que no estaba antes y que ahora no se va.
    ~ traumado = true
}

FIN DEL EPISODIO.
-> intermision_2

// ============================================================
// INTERMISIÓN 2
// ============================================================

=== intermision_2 ===
~ capitulo_actual = "Intermisión"
~ misiones_completadas = misiones_completadas + 1
// Determine room image from origin × trauma × max stat
{
- apodo_personaje == "Chispa" && traumado && magia >= 40: ~ habitacion_img = "hab_magia_max_trauma"
- apodo_personaje == "Chispa" && magia >= 40:             ~ habitacion_img = "hab_magia_max"
- apodo_personaje == "Chispa" && traumado:                ~ habitacion_img = "hab_magia_trauma"
- apodo_personaje == "Chispa":                            ~ habitacion_img = "hab_magia"
- apodo_personaje == "Madrugador" && traumado && fuerza >= 40: ~ habitacion_img = "hab_fuerza_max_trauma"
- apodo_personaje == "Madrugador" && fuerza >= 60:             ~ habitacion_img = "hab_fuerza_max"
- apodo_personaje == "Madrugador" && traumado:                ~ habitacion_img = "hab_fuerza_trauma"
- apodo_personaje == "Madrugador":                            ~ habitacion_img = "hab_fuerza"
- apodo_personaje == "Ratoncito" && traumado && conocimiento >= 40: ~ habitacion_img = "hab_conocimiento_max_trauma"
- apodo_personaje == "Ratoncito" && conocimiento >= 40:             ~ habitacion_img = "hab_conocimiento_max"
- apodo_personaje == "Ratoncito" && traumado:                ~ habitacion_img = "hab_conocimiento_trauma"
- apodo_personaje == "Ratoncito":                            ~ habitacion_img = "hab_conocimiento"
}
# CHAPTER_BREAK: title=Costa Alegre, subtitle=Intermisión, image={habitacion_img}.jpg, music=city_ambient
# music:city_ambient

Suena la alarma de tu celular antes de que el sol entre por la ventana. Fue una noche entera de insomnio y dar vueltas en la cama. En cada rincón oscuro de la habitación te pareció ver los horrores contra los cuales combatiste en la misión anterior.

En tu mesita de luz hay un blíster de medicación que te dejó Mary Shelley pero sospechás que es un camino de ida. No querés que tu vida pase a ser una sucesión de pastillas para bajar y pastillas para subir mientras tu hígado se convierte en un pedazo de desecho orgánico.
# next

Tu última misión mostró los horrores que se esconden en las sombras y se aprovechan de los más vulnerables. Pero, a pesar de todo, no dejan de ser monstruos desorganizados que pudieron ser contenidos por un solo Guardián.

Lo que te preocupa es la Secta que está llevando adelante los sacrificios humanos. Con solo recordar el cuerpo mutilado, imaginás que está al lado tuyo en la cama. La idea te obliga a salir con temor al bulto que forman las dos almohadas bajo las sábanas.

La Secta está organizada, tiene poder para actuar con impunidad en el mundo humano, y sin duda está haciendo alianzas con otra entidad. Esos son el verdadero problema contra el cual tiene que enfrentarse El Faro. Solo esperás que tenga la fuerza para ganar el conflicto.
# next

Abrís la ventana de tu departamento y entra un poco de aire acompañado por el olor a sal del agua. El viento trae unos gritos de diversión y alegría.

Te queda un poco de tiempo antes de tu siguiente misión. Tal vez podés hacer algo antes de ir.

+ [Bajar a la playa]
    -> inter2_playa
+ [Recorrer lo sobrenatural]
    -> inter2_tarot
+ [Ayudar a otro Guardián]
    -> inter2_abuelita
+ [Ir a enfermería]
    -> inter2_enfermeria
+ [Ir a la siguiente misión]
    -> inter2_siguiente

// ============================================================
// PLAYA
// ============================================================

=== inter2_playa ===
# music:playa_ambient

Costa Alegre está sufriendo la peor plaga que puede azotar a una ciudad: una invasión de turistas. Hay algún tipo de fin de semana largo o algo por el estilo — tu vida se volvió tan caótica que tardás un par de meses en recordar en qué mes estás — así que cada centímetro de arena es un campo de batalla entre turistas que intentan marcar posiciones a fuerza de sombrillas e infiltrarse entre las líneas enemigas extendiendo mantas y empujando ojotas.
# next

Encontrás un lugar alejado en un espigón que corta las olas del mar. A medida que te acercás a su límite, sentís cómo tu piel se moja fruto del viento. Al llegar al final te sentás e intentás meditar, pero el mar se embravece con tu presencia.
# next

Intentás ignorar la situación pero de repente notás que todo es sombras a tu alrededor. Una ola gigante se eleva tapando el sol y cae sobre tu cabeza. Son segundos enteros de agua y su fuerza azotando tu cuerpo.

Terminás mojado, salado, y entendiendo que el mar no te quiere presente.
# next

-> intermision_2

// ============================================================
// TAROT
// ============================================================

=== inter2_tarot ===
# music:misterio_ambient

Salís a caminar y te dejás llevar por el flujo de energías, por las pequeñas señales que hay en todas las ciudades. Cuando hay una bifurcación, basta lanzar una moneda al aire para saber por dónde seguir. Antes de darte cuenta, estás en la periferia de la ciudad.
# next

Es de noche pero la mayoría de las farolas no funcionan, solo una en la esquina está parpadeando. Vas hacia ella y mirás el camino. De nuevo, otra farola parpadeando a lo lejos. Seguís el circuito y terminás frente a una casa pintada de un verde loro, con la puerta abierta. Al lado hay una pizarra que dice "Tarot. Lectura de Cartas. Adivine su futuro".

De las entrañas de la casa se siente fluir, pesado y electrificante, un poco de poder real.
# next

El hogar de la tarotista está vacío. Solo hay un sobre en la mesa con tu nombre escrito en el lomo. Obviamente lo abrís.

"No voy a volver a aparecer durante la Demo. Lo único que veo en tu futuro ahora es que prontamente vas a tener la versión completa del juego, y ahí te voy a estar esperando".

No entendés mucho lo que quiere decir, pero no es raro — la mayoría de las profecías son crípticas y solo se entienden después de que ocurran los hechos.
# next

-> intermision_2

// ============================================================
// ENFERMERÍA
// ============================================================

=== inter2_enfermeria ===
# music:misterio_ambient

Entrás al laboratorio de Mary Shelley a esperarla. Como la científica oficial de El Faro, a ella le toca realizar las curaciones necesarias. Notás que su laboratorio está lleno de plantas que parecen haber sido castigadas por una plaga de insectos — las hojas tienen una sucesión de agujeros pero están siendo tratadas con una sustancia mucosa semitransparente que repara las heridas.

Solo con ver la sustancia se te revuelve el estómago y, al acercarte y olerla, la situación no mejora.
# next

— Veo que estás apreciando mi nueva invención, una sustancia orgánica autónoma restauradora — saltás del susto cuando Mary Shelley aparece detrás de vos.

— ¿Solo sirve en plantas?

— Estamos listos para pasar a pruebas con humanos.

— En serio, ¿y quién va a ser el conejillo de indias?
# next

Mary Shelley te mira durante cinco segundos y te das cuenta de la idiotez que acabás de preguntar. Vos sos el conejillo de indias.

— Al menos decime, ¿duele mucho?

— Las plantas nunca se quejaron — contesta Mary Shelley con una sonrisa.
# stat:hp:+5
# next

-> intermision_2

// ============================================================
// ABUELITA — HUB
// ============================================================

=== inter2_abuelita ===
# music:city_ambient_b

Un nuevo mensaje: otro Guardián está complicado con su misión. Parece ser un tema menor pero que, con la presencia de otro par de manos, se podría solucionar en una noche. Preferís estar ocupado — te sentís un inútil haciendo nada y el tiempo ocioso solo hace que tu mente camine hacia recuerdos oscuros.

Al menos vas a distraerte, o conseguir nuevos recuerdos oscuros para atormentarte.
# next

Te citan en la puerta de un garito frente al mar. En cuanto llegás al lugar te das cuenta de que no estás a la moda. No conocés la música que sale de las entrañas del local (es una mezcla de géneros que, para vos, hace el mismo ruido que el lavarropas que se te rompió), la gente tiene diez años menos que vos y no entendés cómo están tan ligeros de ropa cuando la brisa fría del mar castiga tu piel y llega hasta los huesos.

Es entonces cuando escuchás un carraspeo atrás tuyo y notás que el Guardián que requirió tu ayuda aún está menos apto que vos para entrar al lugar.
# next

Su aspecto es el de una abuelita. Piel arrugada, una cabellera larga canosa que forma un rodete en su cabeza, un traje sastre negro que parece haber sobrevivido la década del cincuenta (y tiene el olor a naftalina para acreditarlo) y un tono de voz dulce y poco amenazante.

— Bueno joven, creo que usted ha venido a darme una mano.

— Buenas noches. Dígame cuál es la situación y no se preocupe, yo me encargo — intentás no decirlo de forma condescendiente, pero simplemente no hay forma de decirlo sin sonar así.

— Créame jovencito, si uno llega a mi edad en este trabajo, no hay ningún tipo de situación de la cual no se pueda encargar.
# next

— Tiene razón.

— Le recuerdo que la mitad de los cementerios están llenos de jóvenes ansiosos como usted.

— Tiene razón — cuando saliste a la misión no esperabas terminar siendo retado por una abuelita mientras te azotaba la brisa marina.

— Por otro lado, la otra mitad de los cementerios está llena de viejas con artritis como yo. Salgamos de la intemperie y busquemos un lugar cálido donde le pueda contar lo que ocurre.
# next

A dos cuadras hay un café que cierra tarde. Mientras intentás entrar en calor con una taza de café doble, tu compañera está tomando un té de tilo con un par de galletitas.

— Hace unas semanas que estoy de cacería, jovencito, persiguiendo a un predador peligroso que se alimenta de adolescentes.

— Y yo estoy acá para ayudarla, señora.

— No se confunda, no necesito su ayuda para cazarlo. Es más, diría que su presencia hasta sería contraproducente. Lo que estoy intentando cazar es un súcubo.
# next

{conocimiento >= 25:
    Sabés que los súcubos son parásitos, primos lejanos de los vampiros, que se alimentan de la energía sexual de las personas al momento de tener relaciones íntimas. Si bien suena divertido, lo más probable es que un encuentro con un súcubo termine en un infarto, o al menos en un envejecimiento repentino.
}

— Y tiene miedo de que no me pueda resistir a sus encantos sexuales.

— Eres un hombre joven, estoy segura de que no te podrás resistir a los encantos sexuales de ninguna mujer. Y estoy hablando de los encantos normales que todas tenemos de joven — la abuelita se ríe por lo bajo — mucho menos si a eso le agregamos la capa de poderes sobrenaturales que tiene un súcubo.
# next

— Claro, por eso mandan a una mujer a cumplir este trabajo.

— Por eso mandan a una septuagenaria a cumplir este trabajo. ¿Conocés esa palabra o ya no se la enseñan en el colegio? — la abuela te apuñala verbalmente con una sonrisa y sigue sin parar — El concepto de heterosexualidad no existe ante un súcubo, aparte yo fui joven en los sesenta y... bueno, no nos desviemos del tema.

— Claro, yendo al punto, ¿para qué me necesita?

— Creo que ya debería ser claro: para que me ayudes a entrar al lugar. Hace tiempo que no entro a una confitería bailable y la seguridad cree que no doy el target.
# next

Ves la puerta del garito que el súcubo usa de coto de caza. El guardia de seguridad, un tipo gigante que parece aún más masivo porque está sentado sobre un banquito que parece robado de un jardín de infantes, decide de forma más o menos arbitraria quién entra y quién no.

Luego de verlo actuar un par de minutos te das cuenta de que entrar es muy fácil si sos joven o atractivo. La suma de ambas te permite entrar caminando. Lamentablemente, esta dupla de trabajo es exactamente lo contrario.

Así que hay que buscar opciones alternativas.

+ [Buscar una entrada trasera]
    -> inter2_abuela_cocina
+ [Hacer un escándalo en la puerta]
    -> inter2_abuela_escandalo
+ [Hacerse pasar por una banda]
    -> inter2_abuela_banda

// ============================================================
// ABUELITA — COCINA (entrada trasera)
// ============================================================

=== inter2_abuela_cocina ===
# music:orfanato_alegre

Das la vuelta al local y, el destino te ama, encontrás una puerta abierta. Al lado se encuentra fumando un empleado con un delantal de cocina y un aspecto de tener ganas de estar en cualquier lugar menos ahí.

Te acercás directo a la puerta, intentando poner cara de que pertenecés, pero a la vez caminando lento para no dejar atrás a la abuelita que tiene una leve cojera en su pierna derecha.

El empleado de cocina te mira.
# next

No sabés cuánto le pagan, pero sin duda es una miseria. Se limita a mirarte, saludarte con la cabeza y prenderse otro pucho. Te da la impresión de que ni una invasión extraterrestre le haría cortar su descanso.

Se encuentran en una cocina (que no pasaría un examen de bromatología) y siguen avanzando. Dice mucho del lugar que una abuela entrando por la cocina no le llame la atención al personal. Te hace preguntar qué cosas más raras han visto.
# next

De la cocina pasan a una barra y de ahí a la pista. Es un mar de cuerpos sudorosos chocando unos con otros, con vestimenta que los hace ver más sugerentes que la desnudez. La imagen de la pista se convierte en una serie de fotogramas a medida que el iluminador decide bombardear el lugar con flashes de luz blanca.

¿Ahora qué hacemos?
# next

Le susurrás la pregunta al oído a la abuelita (y luego, por obvios motivos, pasás del susurro al grito).

— Observar, esperar e intervenir cuando nuestra presa baje la guardia.

Tu compañera avanza con seguridad costeando los bordes de la pista, buscando pistas que vos no conocés. A pesar de todo — el rodete, las gafas gruesas y la ropa más vieja que cualquiera de los presentes — la seguridad le da un aire de pertenecer que es envidiable.
# next

A falta de mejor plan, te ponés a bailar. Y de paso tomás un trago dado que el calor hace que tu ropa se pegue al cuerpo. El trago fomenta que bailes mucho mejor (o se relajen tus estándares) pero produce más transpiración, lo cual te obliga a tomar otro trago.

Notás un patrón.
# next
# music:rave_electronic

Ella aparece bailando al lado tuyo. No importa cuánto la mires, no podés contener toda su belleza en una sola imagen mental. Solo procesás partes: el largo cabello ondulado detrás del cual esconde su rostro, una sonrisa pícara acompañada por una lengua juguetona que recorre el labio superior, ojos gatunos de un color que no tiene nombre, una cintura que se achica para quebrar su cuerpo en todas las formas interesantes.

Tu cerebro no puede procesar la suma de las partes.
# next
# music:horror_ambient

Estás prisionero entre un colchón y el cuerpo sudoroso de tu compañera de baile. Y no tenés ninguna intención de liberarte.

Ella te besa pero no es lo que esperás. Sus labios están fríos y se sienten como besar vidrio roto. Desde tus labios salen olas de dolor, como hilos con anzuelo que llegan a los extremos más recónditos de tu cuerpo y rascan los bordes.

Encontraste al súcubo. O, mejor dicho, el súcubo te encontró a vos.
# next

Pensás en buscar tu celular y llamar a tu compañera pero el siguiente beso es avasallante. Raspa contra el fondo de tu cuerpo y anula tu voluntad.

{fuerza >= 20:
    Juntás tus últimas fuerzas en tus extremidades y lográs empujarla contra la otra punta de la habitación. Ella se levanta con un movimiento fluido y se pone a horcajadas encima tuyo. Intentás forcejear pero es una pelea que no podés ganar, que no querés ganar.
- else:
    Intentás resistirte pero no hay energía. Cada beso te va vaciando más. Dentro de poco vas a ser un cascarón de carne.
    # stat:hp:-5
}
# next

En algún momento te desmayaste. Te levantás tranquilo; al lado tuyo está la abuelita con una taza de té.

— Tomalo, es revigorizante. Siempre salgo de casa con varios saquitos en la cartera.
# next

Es la misma habitación, pero el ambiente es completamente diferente. Respirás y te concentrás, primero en vos. Estás cansado pero (mayormente) sano, solo algo... ¿humillado?

Tu compañera se ve satisfecha. Detrás de ella ves la puerta del baño entreabierta; por lo poco que ves notás una sangre oscura, signos de pelea y algo que debería estar dentro de un cuerpo. Sentís desde adentro la clara fragancia de la muerte.
# next

— Ponerte a vos mismo en la posición de carnada no fue lo más inteligente del mundo, menos con tan poca preparación — la abuelita toma un sorbo de té, sospechás que para dejar de criticarte — pero bueno, esto solo deja claro que yo soy la persona indicada para estas misiones.

— ¿Lo logramos?

— Es una forma de decir. Tuviste tu colaboración. Lo importante es que hay un predador menos en Costa Alegre. Vamos a quedarnos con esa idea.
# stat:amistad_abuela:+2
# next

-> intermision_2

// ============================================================
// ABUELITA — ESCÁNDALO
// ============================================================

=== inter2_abuela_escandalo ===
# music:city_ambient_b

Van con la abuelita hasta la puerta con toda la intención de hacer un escándalo. Hay algo en sus rostros que los delata: los jóvenes que están esperando para entrar al garito se corren para los costados y los miran de forma desafiante, mientras el guardia de seguridad pone su inmensidad frente a la puerta con los brazos cruzados y los mira desde arriba. Recién ahora, cuando se para del banquito, te das cuenta de lo alto que es.

Tardás unos segundos en darte cuenta de que te encontrás rodeado.
# next

— Dejaron entrar a nuestra hija, es menor de edad y tiene un problema médico que le impide tomar alcohol. Necesitamos ya parar todo y entrar a buscarla — antes de terminar la frase te das cuenta de que no va a servir para nada.

— No dejamos entrar a menores al lugar — miente el guardia tan bien que casi parece verdad — y tampoco les servimos alcohol a menores. Así que tu hija, que no está adentro, tampoco está tomando alcohol.

La discusión se torna cíclica, solo que cada vez más alta y con más insultos decorando la idea principal. Un joven se acerca para entrar al lugar y piensa aprovechar la oportunidad para darle un empujón a la abuelita, pero basta una mirada de ella para que reconsidere, haga una torsión rara con su cuerpo, y avance sin tocarla.

En algún momento alguien del público dice "parece que no dejan entrar porque hay problemas con una chica".
# next

La masa va distorsionando la idea. Un chico alto con una mota de pelo azul dice "parece que hoy no dejan entrar chicas, es noche gay". Por otro lugar, un par de amigas discuten a los gritos sobre "la red de trata que opera en el sótano del lugar y secuestró una chica". Por último, alguien vestido con una chaqueta de cuero (y solo una chaqueta de cuero) señala a la abuelita y dice "era una niña hasta que tomó una droga adentro y quedó así".

La histeria se convierte en pánico y, a lo lejos, se escucha cómo a toda velocidad se acerca una sirena de policía.
# next

En cuanto la sirena deja de ser solo ruido y se convierte en una patrulla que se acerca por la calle, la gente sale corriendo en todas direcciones. El guardia da un paso atrás y se pone ocupando la totalidad del marco de la puerta del lugar, con una mano en la manija esperando una orden para cerrar.

De repente vos y la abuelita están muy solos, sin nadie a su alrededor, y afuera del lugar donde se suponía que iban a entrar.
# next

Un policía baja de la patrulla y se acerca hacia ustedes. Tu compañera dice por lo bajo que la dejes hablar y su tono cambia. Se pone más dulce y medio entrecortado, una anciana a toda regla. Ante esto el policía no sabe qué hacer y vuelve a la patrulla confundido.

— No solo no entramos al lugar — la abuelita volvió a su tono normal, tal vez un poco más filoso de lo que te gustaría — sino que hicimos suficiente escándalo como para advertirle a nuestra presa que la estábamos buscando. Voy a tener que empezar todo de cero.

— Lo lamento, no era mi intención.

— Sin duda, sino serías un traidor. Lamento que hayas venido hoy, pero no pudo salir.
# next

-> intermision_2

// ============================================================
// ABUELITA — BANDA
// ============================================================

=== inter2_abuela_banda ===

— ¿De la banda? ¿Ustedes? — el guardia tiene un tono de voz chillón que contrasta con las horas de gimnasio con las que castiga su físico.

— Claro, Vieja Loca. Con una sola S — y al terminar tu frase señalás a la abuelita, que procede a sacar la lengua mientras guiña un ojo — Es todo un show imperativo en el cual se mezcla música con otras artes — y esperás seriamente que el guardia no te pregunte cuáles porque todavía no llegaste a armar esa mentira.

— Sí, había escuchado que hoy era un día medio "freak" — el guardia logra pronunciar todas las letras convirtiendo la palabra en inglés en algo más parecido al chino — pasen, que las bandas ya están arrancando a tocar.
# next
# music:rave_electronic

Una vez dentro, el lugar es un mar de cuerpos transpirados y lo suficientemente vestidos como para acentuar e insinuar su desnudez. Estómagos expuestos, piernas largas que insinúan su fin y escotes prominentes. Entre la oscuridad, el humo, la música industrial y los flashes de luz brillante que cada tanto te enceguecen, es complicado mantener contacto con la abuelita, mucho menos encontrar al súcubo.

Aun así, tu compañera parece saber algo que vos no. Acomodándose las gafas, protegidas por un hilo alrededor de su cuello, observa con calma el lugar buscando señales que vos no detectás.
# next

— Es su turno — un joven rapado, salvo por un mechón azul, te grita al oído mientras te la llena de baba.

— ¿Qué?

— Para tocar. Tienen quince minutos, así que a romperla.

— ¿¿Qué??

— Te dejamos el bajo preparado. ¿Vos tocabas el bajo y la anciana cantaba, o era al revés?

— ¿¿¿Qué???

De todas las mentiras que dijiste en tu vida, resulta que es la más creíble.
# next

Una marea humana te empuja hacia el escenario. En el medio recibís una cerveza, palmadas, y alguien grita algo de romperte una pierna, que no entendés bien si es aliento o amenaza. Tu compañera avanza con más seguridad que vos mientras se toma un vodka que alguien le colocó en una mano.

Mientras están subiendo al escenario te susurra al oído:

— Excelente plan. Desde acá podemos vigilar todo el lugar y encontrar más fácilmente a nuestra presa.

— Fue mi plan desde el principio — mentís mientras alguien coloca un bajo en tus manos.
# next

Durante unos segundos todo el ruido del lugar se detiene y tenés quinientos pares de ojos observándote. Las personas dejan de parecer individuos y pasan a ser una masa expectante y amenazante.

Es pésimo momento para descubrir que tenés pánico escénico.

Es la abuelita quien toma el control de la situación. Toma el micrófono y empieza a recitar poesía. Hay algo en sus palabras entre sensual y nostálgico que te hace pensar en amores que no fueron e historias truncadas. El público responde, empieza a mover su cuerpo al compás de la métrica de la poesía.

Por mucho que tu compañera sea toda una Patti Smith, te toca hacer lo tuyo.
# next

{conocimiento >= 20:
    Por suerte tomaste clases de bajo cuando eras joven (tomaste al menos una clase de todo). Podés improvisar una base que va siguiendo el poema de tu compañera y que parece agradar al público. A medida que el movimiento de tus dedos se convierte en música, te relajás y perdés el miedo.

    Estás tan absorto en la situación que no te das cuenta cuando la abuelita se lanzó desde el escenario al público, como un ave de presa que baja en picada.
- else:
    No sabés qué hacer. Uno de tus dedos acaricia una cuerda y sale un sonido chillón completamente disonante con la poesía. Intentás parar las cuerdas pero solo lográs proyectar una maraña de ruido. Alguien se enoja y te lanza una lata de cerveza que da justo en tu cabeza. Es la antesala a un mar de silbidos y puteadas.

    Abandonás el escenario tan rápido que no te das cuenta de que la abuelita se lanzó al público, como un ave de presa que baja en picada.
    # stat:hp:-5
}
# next

Son las cuatro de la mañana y estás tomando una cerveza mientras mirás el océano y dejás que la brisa del mar te refresque, y posiblemente conjugue una gripe en tu organismo. El celular vibra en tu bolsillo, un mensaje de la abuelita:

"Buena cacería, el problema del súcubo fue solucionado. Si no nos subíamos al escenario nunca la iba a encontrar. Sus métodos son poco ortodoxos pero divertidos. Espero que trabajemos juntos de nuevo".

El mensaje está acompañado por una foto de ella saludando con la mano derecha, mientras en la izquierda tiene un machete bañado en una sangre negra viscosa. Sospechás que la abuelita no es alguien con quien joder.
# stat:amistad_abuela:+2
# next

-> intermision_2

// ============================================================
// MISIÓN SIGUIENTE — GATE AL MUSEO
// ============================================================

=== inter2_siguiente ===
# music:misterio_ambient

Desde El Faro te llaman de urgencia. Parece que hay un problema y, entre todas las disculpas que mandan respecto a cuánto lamentan volver a requerirte en una misión de campo, dan a entender que sos la persona más apta para solucionarlo.

De vuelta a la pista de baile.

# CHAPTER_BREAK: title=Visita al Museo, subtitle=Capítulo 3, music=misterio_ambient

-> capitulo_3

// ============================================================
// CAPÍTULO 3 — PLACEHOLDER
// ============================================================

=== capitulo_3 ===
~ capitulo_actual = "Cap. 3 — El Museo"
# music:centinelas_base

-> cap3_llegada_elfaro

=== cap3_llegada_elfaro ===
# next: Visita al Museo

Te citan a El Faro a las 6 de la mañana. Es tan temprano que el campus universitario donde se encuentra el edificio esta vacío, ni el estudiante más aplicado va a aparecer a esta hora. Vos lograste llegar puntual dado que tenes el esquema de sueño completamente roto y las pesadillas no te dejan dormir. No es difícil madrugar cuando nunca te fuiste a dormir.
# next

Entras a El Faro y te sorprende no encontrar a Enriquez sentada tras su escritorio en la recepción. Hasta donde sabias, ella estaba biológicamente conectada a la silla (lo cual es sarcasmo, aunque no dudas que en este lugar eso sea posible). Notas que la puerta que lleva al laboratorio de Mary Shelley está abierta y de su interior se escuchan dos voces solamente. Parece que es muy temprano hasta para los otros Guardianes de El Faro.
# next

¿Qué hacés?
* [Recorrer el lugar intentando encontrar a Enriquez]
    -> cap3_recorrer_elfaro
* [Meterte en la oficina del Profesor]
    -> cap3_espiar_oficina
* [Acercarte sigilosamente al laboratorio]
    -> cap3_espiar_lab

=== cap3_recorrer_elfaro ===
Recorres el edificio, o las partes que podes entrar al menos. El baño esta vacío, la cocina parece desierta y la heladera solo contiene ese tapper que está en el fondo desde que empezaste a trabajar acá y nadie logra descifrar que es su contenido marrón semilíquido. Por muchas vueltas que des, Enriquez parece estar en su día libre asi que no te queda más opción que dejar de perder el tiempo.
# next
-> cap3_briefing_lab

=== cap3_espiar_oficina ===
Te descalzas para hacer menos ruido y subís por la escalera que da a su oficina. Crees que estás haciendo un muy buen trabajo, los escalones no chirrearon ni una sola vez bajo tu peso.
# next
Justo cuando estas por poner tu mano en la manija, suena tu celular. ¿Cómo es posible? Siempre lo tenes en silenció justo por situaciones como esta.
# next
Lo sacas y lees un mensaje de El Profesor Buen intento, pero no hay forma que puedas entrar. Deja de jugar y veinte al laboratorio. Te estamos esperando.
# next
-> cap3_briefing_lab

=== cap3_espiar_lab ===
~ espiaste_lab = true
Avanzas lo más sigilo posible, haciendo tu cuerpo pequeño y prestando especial atención adonde pones los pies. Al principio lo conversación te llega como murmullos inentendibles.
# next
Estiras tu cuello un poco más y empezás a entender algunas palabras sueltas peligros, prohibido y locura. Es lamentable que, cuando espías, nunca escuchas cosas lindas como torta de chocolate o fiesta sorprensa.
# next
Es entonces cuando la voz de El Profesor te llega fuerte y claro.
# next
Deja de escuchar y entra de una vez NOMBRE DE PERSONAJE. Queremos hablar con vos y no tengo ganas de estar a los gritos.
# achievement:unlock:espia_elfaro
# next
-> cap3_briefing_lab

=== cap3_briefing_lab ===
# music:misterio_ambient

No tenes duda que murió con dolor, unas marcas al costado de su rostro, como si alguien hubiese clavado repetidas veces un picahielos y jugado con la herida, te lo confirman.

— Un nuevo cuerpo, la Secta sigue sacrificando gente y lanzándola al fondo del mar. Ya paso un mes desde la anterior misión, así que es claro el enfoque cíclico de su ritual
— Así que vamos a seguir recibiendo más cuerpos si no hacemos algo — interrumpís al Profesor mientras intentas que tu odio no se vuelque en tus palabras.
— Por eso llegó el momento de probar un enfoque más radical — Mary Shelley comienza a hablar pero se para en seco en cuanto El Profesor le da una mirada. Aprovechas el momento para meter una pregunta.

* [¿Sabemos quién es?]
    — Por suerte, al contar con el cuerpo, pude comparar el registro dental con las bases de datos del Gobierno. Martín Gimenez — Mary Shelley empieza a hablar rápido mientras hojea la información que tiene en su carpeta — 22 años, vivía en Costa Alegre hace 8 años, luego de escaparse de su hogar donde era víctima de violencia. Vino a trabajar en la industria pesquera, hace 3 años se quedó sin trabajo y se encontraba en situación de calle.
    Tenía solo 22 años, y pensar que para vos era un hombre de mediana edad. Supongo que, para él, los años golpearon más fuerte.
    -> cap3_briefing_lab_profundo

* [El Tiburón humanoide que me encontré en la Morgue ¿Volvió a aparecer?]
    -> cap3_briefing_lab_profundo

=== cap3_briefing_lab_profundo ===
— El Profundo — dice El Profesor poniendo voz de docente — por suerte no fue visto de nuevo. El cadáver fue encontrado por un barco pesquero que notó que algo se enganchó entre sus redes.
— Pobres, sin duda imaginaron que habían pescado algo grande — acotó Mary Shelley.
— Lo cual no quita que El Profundo esté dando vueltas por Costa Alegre intentando borrar las huellas de este ritual, te recomiendo estar atento.

* [¿Las runas son las mismas?]
    — Si, nuestro equipo sigue trabajando para intentar descifrarlas y darnos una mejor idea de qué están haciendo, pero es claro que se trata del mismo grupo — aclara El Profesor.
    Te acercas al cuerpo y mirás las runas, intentas abstraerte, alejarte lo suficiente para no ver heridas sobre la piel sino símbolos sobre un lienzo.
    { conocimiento < 30:
        Lo único que lográs es darle nafta a tu rabia. Debés encontrar la forma de detener esto.
    - else:
        — Intercambio y pesca abundante — decís señalando un par de heridas juntas (tanto que a simple vista parecen una sola herida) que decidís interpretar como una palabra — No hay que ser literal por pesca abundante, me parece que es algo tan básico como un intercambio de vidas humanas por riqueza, decile al equipo que trabaje en base a esa idea.
    }
    -> cap3_briefing_lab_plan

=== cap3_briefing_lab_plan ===
# next

— Por suerte, estábamos cocinando un plan que puede darnos una ventaja — la sonrisa de Mary Shelley contrasta fuertemente con el cadáver que tiene solo a tres pasos.
— No uses un plural. Es tu idea y yo no pienso hacerme cargo — El Profesor vuelve a mostrar un poco de tensión en su voz que denota que estuvieron discutiendo de esto durante las últimas horas.
— Bueno, díganme la idea de una vez — decís esperando que no vuelva a iniciar la pelea.
— Considero que, con un hechizo que todavía no fue probado, podríamos hacer que el cadáver nos muestre un rastro psíquico de donde estuvo antes de morir, lo cual podría ser una forma de llegar a la guarida de la secta — Mary Shelley habla rápido y mirando de reojo a El Profesor, con temor a que la interrumpa.
— Es imposible contar la cantidad de condicionales que tiene ese último párrafo, podría causarle un infarto a un profesor de Lengua y Literatura — la interrumpe El Profesor.
— Es mejor que no hacer nada
— Sin contar que nunca se usó el hechizo
— Pero su teoría es muy sólida
— Y rompe las barreras naturales entre la vida y la muerte
— También la penicilina
Y volvió a iniciar la pelea.
# next

Los argumentos van de punta a punta. Para El Profesor es un experimento peligroso que no tiene garantía de éxito, mientras que para Mary Shelley es la única forma de resolver el problema sin esperar que aparezcan más cuerpos.
Y nadie tiene pinta de que va a ceder su posición.

* [Te vas de la habitación, no tiene sentido perder tiempo viendo este espectáculo]
    Salís y aprovechás para ir a la cocina. Alguien trajo un par de medialunas así que te parece gran momento para hacerte un mate y desayunar algo. Pasan unos cinco minutos (y más medialunas de las que te animás a confesar) y te llega un mensaje de El Profesor pidiendo que vuelvas al laboratorio. Parece que ya tomaron una decisión.
    -> cap3_briefing_lab_museo

* [Interrumpís la pelea. Esto no va a ningún lado.]
    — Basta — gritas con tanta fuerza que hasta lográs que se muevan un par de cabellos de Mary Shelley — No tiene sentido discutir esto. Y no puedo decir el mal gusto que es hacerlo delante de un cadáver que al fin de cuenta es nuestra responsabilidad.
    Tus dos interlocutores empiezan a balbucear pero no les da tiempo de decir algo.
    — Si existe una forma de impedir otro muerto, debemos intentarla, estoy dispuesto. Cuéntenme qué están planeando.
    -> cap3_briefing_lab_museo

* [Esperás que terminen]
    Jurás que la conversación amaga con terminar tres veces. Y las tres veces vuelve a empezar con la misma intensidad. Es como estar perdido en un laberinto argumentativo.
    A la larga (y muy a la larga) es El Profesor quien termina cediendo. No sabés si hace eco a los argumentos esgrimidos por Mary Shelley, si simplemente tiene otras cosas que hacer o si ya pensó cómo controlar cualquier efecto secundario peligroso.
    -> cap3_briefing_lab_museo

=== cap3_briefing_lab_museo ===
# next

— Un hechizo así requiere una gran cantidad de poder — Mary Shelley está tan emocionada que habla cada vez más rápido y resulta complicado seguirla — hay pocas personas en el mundo que pueden brindar tanto poder.
— Y seguir vivas — acota El Profesor por lo bajo.
— Exacto — grita Mary Shelley — Y como el homicidio es malo la otra opción es encontrar un objeto que haya contenido una cantidad exorbitante de poder sobrenatural y usarlo como fuente de energía.
— Déjame adivinar — comentás con tristeza — El objeto está en algún tipo de fortaleza custodiado por, no sé, dragones zombis que tienen ametralladoras en la boca.
— Casi — contesta Mary Shelley — Está de visita en el Museo de Historia de Costa Alegre.
# next

— El plan entonces es que vaya al Museo de Historia de Costa Alegre y robe un objeto histórico de incontable valor.
— Sí, una momia incaica que está en una exposición ambulante de Jujuy. Aparenta ser un objeto de gran poder — la emoción desbordaba a Mary Shelley.
— No me gusta la palabra aparenta — acotaste a la misma vez que El Profesor.
— Sin duda lo es. Sacrificio humano, adoración religiosa. Mierda, hasta el hecho de que sea una pieza de museo es hasta un tipo de adoración. Si mis lecturas son correctas, es una batería lo suficientemente poderosa para darle poder al ritual que tengo en mente.
— No sé si me siento cómodo robando una pieza de arte histórico.
— El Museo Británico lo hace todo el tiempo y nadie le dice nada, lo tuyo hasta tendría más valor dado que lo hacés para salvar vidas — Mary Shelley hablaba tan rápido que las palabras se juntaban tanto hasta parecer una única gran palabra.
# next

En menos de quince minutos estaban apoyados sobre una mesa con fotos de la momia incaica, mapas del museo y folletos de las exposiciones.

¿Cómo respondés al plan de robar la Momia?
* [Aceptar sin objeciones — la misión es la misión]
    -> cap3_tiempo_libre
* [Aceptar pero expresar incomodidad ética]
    ~ conocimiento += 2
    — No sé si me siento cómodo robando una pieza de arte histórico.
    -> cap3_tiempo_libre

=== cap3_tiempo_libre ===

El plan era simple. Ibas a ir esta tarde a hacer un recorrido al Museo para conocer las instalaciones y obtener un poco información. A la noche ibas a volver con el objetivo de robarte la momia y venir directo a El Faro.
# next
En algún momento de la planificación entra Enriquez (tarde) con cara de pocos amigos y una jarra llena de café.
# next
* [Le haces un comentario]
    -> cap3_tl_comentario_enriquez
* [No le decís nada]
    -> cap3_tl_sin_comentario

=== cap3_tl_comentario_enriquez ===
En cuanto entra señalás el reloj de tu muñeca.
—Buenas tardes, ¿Querés que te preste mi reloj así te organizás?
La mirada de Enriquez es suficiente como para asesinar a alguien y te das cuenta que tiene en las manos una jarra llena de café hirviendo y no tendría dudas en usarlo.
Esto te va a pasar factura.
~ item_enojo_enriquez = true
# achievement:unlock:enojo_enriquez
# next
-> cap3_tl_menu

=== cap3_tl_sin_comentario ===
Sos lo suficiente inteligente para darte cuenta que no te conviene tener una mala relación con Enriquez. Aparte trae café, nadie que traiga café puede ser malo. Te llenás una taza y te dedicás a ver una foto de la momia incaica hasta que la imagen queda grabada en tu memoria.
# next
-> cap3_tl_menu

=== cap3_tl_menu ===

Llega un punto que no es posible hacer más planificación desde El Faro. Solo resta que vayas al Museo y hagas una exploración en el terreno. Aún así es temprano todavía, por lo que tenés tiempo para hacer alguna acción más antes de comenzar tu misión.
# next

¿Cómo aprovechás el tiempo?
* [Entrenar un poco con Cabral]
    -> cap3_tl_cabral
* [Ver si Enriquez tiene algo de conocimiento para compartir]
    -> cap3_tl_biblioteca
* [Hablar con Mary Shelley para afinar tus poderes sobrenaturales]
    -> cap3_tl_mary_shelley
* { belen_sobrevive } [Visitar a Belén en el nuevo orfanato]
    -> cap3_tl_belen
* { algunos_guardias_sobreviven } [Ver cómo están los guardias del cementerio]
    -> cap3_tl_guardias
* [No perder más tiempo — ir directo al Museo]
    -> cap3_museo_dia

=== cap3_tl_cabral ===
Cabral adaptó el sótano para convertirlo en una verdadera pista de obstáculos. Hay vallas para saltar, un muro para escalar y una intricada red de alambre de púa pensada para que te arrastres por debajo. Visto desde afuera, todo parece increíblemente divertido.
# next
Eso es, obviamente, hasta que empezás a hacerlo. A los cinco minutos de recorrido tus pulmones se sienten en llamas y tus rodillas parecen hechas de cristal.
No ayuda que cuando terminás Cabral se limita a mirar el reloj, negar con la cabeza y gritar de nuevo.
La primera vez que grita de nuevo te enojás, la segunda querés llorar. Para la tercera tu espíritu ya está roto y hacés el recorrido a pura inercia.
# next
Terminás en el piso, recostado sobre un charco de tu propio sudor. Por suerte Cabral siempre sabe cómo levantar tu ánimo y ya te está acercando una botella de agua mientras te hace una pregunta clave.
—¿Qué preferís? ¿Sanguches de milanesa o hamburguesas?
~ fuerza += 5
# play_sfx:stinger_fuerza
# next
-> cap3_museo_dia

=== cap3_tl_biblioteca ===
Te encontrás a Enriquez en su escritorio, con tan pocas ganas de sociabilizar como siempre.
# next
{ item_enojo_enriquez:
    —Estuve chequeando tus pedidos de libros para estudiar y vi que hay un error burocrático. Es una lástima pero tuve que cancelar el pedido del día de hoy —Enriquez disfruta cada una de las palabras.
    —¿Se puede hacer un nuevo pedido?
    —Sí, tiene que ser acorde al protocolo 22-J, ¿lo conocés?
    —Obviamente mentís.
    —Genial. Igual tiene un plazo de 48 horas, así que hoy no vas a poder leer nada.
    Te retirás aceptando tu derrota. Tal vez no debiste burlarte de ella.
    # next
- else:
    Sobre el escritorio te espera un libro gigante con la letra H escrita en la tapa con letras doradas. Te sorprende que una letra muda en español tenga tantas palabras en el manual correspondiente.
    # next
    Ojeando el libro te das cuenta que hemo es el prefijo que significa sangre y pasás las siguientes horas aprendiendo sobre todas las cosas horribles que quieren beber, usar o robar tu sangre, incluido un mosquito de más de dos metros que tiene la costumbre de decapitar a las personas para poner su pico directo en la aorta.
    # next
    Terminás la lectura y te das cuenta lo codiciado que sos. De repente sentís que bajo la fina capa de tu piel hay un tesoro que todos quieren robar.
    ~ conocimiento += 5
    # play_sfx:stinger_conocimiento
    # next
}
-> cap3_museo_dia

=== cap3_tl_mary_shelley ===
Mary Shelley está intentando solucionar una ecuación en su pizarrón. Parece que la manía que la desbordaba esta mañana ahora se concentró en un punto focal. Aun así, mientras mira el pizarrón no deja de golpetear el piso con su pie derecho mientras su mano izquierda juguetea con una lapicera.
# next
—¿Problema difícil? —preguntás.
—Técnicamente, existe la posibilidad de que cuando haga el ritual, tal vez despierte a todos los muertos del mundo y cree una invasión zombie.
—¿El Profesor sabe esto?
—Tranquilo, no va a ocurrir una invasión zombie.
—Mejor, eso sería extremadamente poco original —contestás.
# next
Ella está ocupada pero te da un ejercicio para fortalecer tu concentración. Te coloca sobre un pentagrama durante las próximas horas y tu única tarea es usar tu voluntad para que una pequeña moneda se mantenga flotando a la altura de tus ojos.
# next
En cuanto te parás sobre el pentagrama empieza a ocurrir de todo. Pasás por picos de calor a picos de frío, de repente una terrible sensación de ingravidez se instala en tu estómago. En un momento estás seguro que cientos de bichos babosos encontraron la forma de meterse entre tu ropa y reptan sobre tu piel dejando una húmeda baba a su paso. Por último, sentís un bocinazo constante detrás de ti a pesar de no poder avanzar.
# next
Hay momentos difíciles, pero a pesar de todo lográs sobreponerte y la moneda nunca cae al piso.
~ magia += 5
# play_sfx:stinger_magia
# next
-> cap3_museo_dia

=== cap3_tl_belen ===
El nuevo orfanato parece más feo. El edificio tiene claras marcas de descuido, vidrios rotos en la ventana, rejas oxidadas y paredes mal pintadas. El hecho de estar en una parte fea de la ciudad no ayuda mucho. Tampoco habla muy bien del lugar que, con muy poco sigilo burocrático, El Faro logró que autoricen que la visites de forma regular.
# next
Ella se sube a tu auto y te da un hola tímido. Siempre los primeros momentos son raros. Es verdad que una invasión de arañas demoniacas no es la mejor forma de conocer a alguien, pero en cierta forma te sentís responsable por su vida ahora. No tenés duda que algún burócrata en un sótano ya la anotó como posible futura Guardián.
# next
Aprovechás la mañana para comprarle un helado y dar una vuelta por la playa mientras los primeros rayos del sol expulsan el frío. La verdad es que verla bien sirve para darte cuenta lo importante de tu trabajo. Vos podés pasar por grandes cuotas de dolor físico o mental pero si al final una niña sobrevive, todo vale la pena.
# next
Después de un par de horas la volvés a llevar al orfanato y repetís la tradición del final de cada salida: le prometés que los monstruos no van a volver, le decís que cualquier problema puede llamarte y le pasás una bolsa de caramelos para que soborne a sus compañeros de orfanato.
~ hp += 5
# next
-> cap3_museo_dia

=== cap3_tl_guardias ===
Es raro volver al Cementerio. A simple vista no se ve ninguna señal de la batalla que ocurrió acá hace unas noches. La única novedad es un cartel de un blanco impoluto sobre el cual, en grandes letras negras, se aclara que está prohibido ingresar al predio luego del atardecer. No confiás mucho en que los Vampiros tengan un respeto obsesivo por la ley como para dejarse amedrentar por un simple letrero, pero entendés que es parte de una necesidad humana para normalizar la situación y sentir que se da una respuesta. Acá pasó algo una noche, así que pusimos un cartel y nunca se va a volver a repetir, los votantes ya pueden dormir tranquilos.
# next
Uno de los guardias te ve venir desde la garita y te saluda efusivamente, y luego en forma de chiste te hace un saludo militar. Desde los eventos en la entrada de la cripta (apodada la batalla de la cripta por los guardias) ellos bromean que sos su Capitán, General o Teniente. Generalmente ascendés de grado conforme hay más alcohol en la reunión.
# next
Si bien la mayoría no sabe de la existencia de El Faro, están conscientes de que en la oscuridad acechan cosas horribles y vos pertenecés a una organización indefinida que se encarga de mantenerlas a raya.
# next
Antes de darte cuenta estás con dos guardias tomando mate mientras un tercero está pidiendo un par de pizzas por delivery. Existe cierta comodidad que solo se da en la camaradería producto de haber atravesado juntos algo grande.
# next
Mucha gente atraviesa la vida sin tener una gran aventura, y es lógico, las grandes aventuras suenan bien en papel pero cuando uno las vive se da cuenta que están compuestas por temor, sufrimiento y pérdida. Los guardias tuvieron la tragedia de tener una gran aventura, pero la suerte de encontrar en ella la fuerza para sobrevivir y el coraje para sobrepasarlo. En cierta forma, están agradecidos por la oportunidad que les diste.
# next
Sabés que esta es la historia que se va a contar en fiestas familiares durante generaciones y no dudás que algún nieto lleve tu nombre. Pero ahora es momento de disfrutar del calor y el cariño que solo se tiene rodeado de compañeros de armas.
La tarde sirve para relajar tu mente y prepararte para los retos que tengas que enfrentar a futuro.
~ hp += 5
# next
-> cap3_museo_dia

=== cap3_museo_dia ===
# music:agite_museo
# next

DE DIA EN EL MUSEO
El museo estaba en el medio de un parque arbolado. El día era lindo y un montón de personas habían aprovechado para salir a disfrutar de la naturaleza. Una familia estaba disfrutando un picnic (mientras un comando de hormigas se acercaba para robarle las migas), una pareja de enamorados estaban enfrascados en un abrazo tan largo que sus cuerpos habían encontrado la forma perfecta de encajar entre si y con el árbol donde se apoyaban. Tu reflexión es interrumpida por una pelota que pasa a centímetros de tu cabeza, un grupo de jóvenes estaba aprovechando el parque para improvisar un partido de futbol.
# next

El Museo, visto desde afuera, es una mole brutalista que parece más apta para ser guarida de supervillano que centro de saber. Un circulo de cemento al cual se accede subiendo por una escalera (también de cemento) atravesando en el camino estatuas (obviamente, de cemento) que representan diversos períodos históricos de Costa Alegre.
# next

Entrás al hall central del Museo y se encuentra casi vacío, solo cuenta con un mostrador detrás del cual hay un par de pasantes y una gigantografia de la Momia Incaica que está en exposición.
Te tomás un momento para observar la momia. Generalmente cuando se escucha esa palabra uno piensa en Egipto, vendajes, sarcófagos de oro y maldiciones, pero este no era el caso con la Momia Incaica (aunque con tu suerte no estás dispuesto a descartar una maldición tan rápidamente).
La momia era una adolescente cruzada de piernas, con ropa propia del Imperio Incaico, que había sido momificada mediante el uso de la aridez y el frio de los Andes. Su rostro miraba para abajo y el efecto de sombras dificultaba ver su expresión pero parecía estar durmiendo. Requería un esfuerzo consciente darse cuenta que uno estaba viendo un cadáver y no una obra de arte, supones que el paso del tiempo y las particularidades de la modificación generan esa distancia.
# next

Te acercás al mostrador y el pasante joven te pasa un folleto y te explica como es el recorrido del Museo. Te informa que la estructura es un círculo que se recorre de derecha a izquierda, consta de cinco salas y al final tenés una tienda para comprar recuerdos así como la posibilidad de acceder al café que se encuentra en el jardín ubicado en el centro de la estructura.
Por último, te muestra una caja y te invita a dejar una colaboración para sostener la institución ante los cortes de financiación que lleva el Gobierno.

* [Colaborás con el Museo]
    Sacás unos billetes de tu billetera y ponés dinero en la caja de colaboración. Obviamente es de interés de toda Costa Alegre que sus instituciones educativas estén bien fundadas y te da un poco de vergüenza vivir en un país donde el Gobierno no financia la educación. Te preguntás donde va el dinero que ahorran, sin duda no están ayudando en combatir seres sobrenaturales.
    # achievement:unlock:colaborador_museo
    -> cap3_museo_primer_sala

* [No colaborás con el Museo]
    Sonreís y girás para la derecha, para entrar a la primera sala del Museo. Sentís que no es tu responsabilidad financiar la educación. Estás seguro que próximamente el Gobierno va a entrar en razón y librar el dinero que corresponde ¿No?, o sin duda otra persona va a venir y va a poner suficiente dinero como para compensar el día ¿No es así?
    # achievement:unlock:no_colaborador_museo
    -> cap3_museo_primer_sala

=== cap3_museo_primer_sala ===
La primera sala está dedicada a los Pueblos Originarios. Aparentemente eran hábiles pescadores y navegantes, en los costados ondulados de la sala se puede ver elementos de pesca, ropas tradicionales y vasijas de barro.
En el centro de la sala hay una recreación de las canoas que usaban para navegar el mar y pescar kilómetros de la costa. Te basta ver la canoa cinco minutos, y recordar lo violento que se puede poner el mar, para darte cuenta que esta gente era mas valiente que vos.
# next

Ahora tocaba Costa Alegre en la época colonial. No tenías consciencia de que la ciudad era tan vieja pero parece que ya había un pequeño poblado en el siglo XVIII que había sido un poco un puerto de pescadores (y mucho un centro de contrabandistas).
La mayoría de las vitrinas estaban compuestas por ropa de la época y objetos cotidianos de la Colonia donde abundaba el trabajo en plata y la iconografía cristiana.
En el centro de la sala había un carruaje gigante con unos detalles marinos (sirenas, tritones, kraken y demás seres fantásticos). Hay que admitir que el vehículo era más elegante que cualquier cosa que te podías cruzar hoy por la calle.
{ conocimiento >= 20:
    En una esquina de la sala se expone una tabla de la evolución poblacional de la ciudad en esos primeros años. La mezcla de números y letra manuscrita aleja a la mayoría de la gente, pero vos te quedás un momento comparando números. Parece que los primeros pobladores de Costa Alegre la tuvieron muy duro, hambruna por las embarcaciones hundidas, crecidas repentinas del mar, pestes. El poblado estuvo cerca de desaparecer varias veces durante su primer año de existencia. Eso es hasta 1780 donde esos sucesos dejan de aparecer y el pueblo empieza a prosperar.
    No te sorprende que la secta que estás buscando tal vez lleve actuando más de doscientos años haciendo esto y sus orígenes fueron para aplacar a las entidades que castigaban el poblado desde el fondo del mar.
}
# next

La tercera sala correspondía a Costa Alegre en el siglo XX, la cual había crecido desde 1900 para convertirse en un parador turístico como un centro industrial.
La mayoría de las vitrinas tenían fotos, planos o gigantografias de recortes periodísticos. Se veía fotos de la inauguración del Casino de Costa Alegre así como de los primeros hoteles sindicales que se había construido a metros del mar.
En el centro de la sala había una maqueta que contaba la historia de la toma de los Astilleros Herrera, símbolo de la lucha sindical de los sesenta y setenta en la Ciudad. En esa época cada vez que salía un barco del astillero se cobraba la vida de un par de trabajadores que morían por las pésimas condiciones de seguridad. El conflicto llevó a la fábrica por parte de los trabajadores exigiendo condiciones dignas de trabajo y terminó con una brutal represión por parte de la dictadura militar.
{ fuerza >= 20:
    Viendo el mapa te das cuenta que el predio de la fábrica no era tan difícil de custodiar, el gran problema era la posibilidad que la marina haga un desembarco naval entrando desde la rampa de lanzamiento del astillero. Si vos hubieses estado encargado de la defensa del predio, con veinte hombres fuertes y un par de armas largas, podrías seguir hasta el día de hoy atrincherado en la fábrica.
}
# next

Ya recorriste la mitad del circulo que compone el Museo y por fin llegás a la sala donde está la Momia Incaica. Aparte de la Momia (que está escondida de la vista detrás de unos biombos con información de la cultura Inca) en esta sala está la mayoría de los visitantes del museo que esperan su turno para entrar a ver la momia o dan vuelta entre las vitrinas donde se encuentran diversos objetos cotidianos propios del Imperio Inca.
{ magia >= 20:
    Mary Shelley tiene razón, la momia desborda de energía sobrenatural. Toda la sala se siente como un sauna, el aire está caliente y espeso y tenés que sentarte unos minutos para recuperar la compostura. La mera cercanía del objeto te hace sentir emocionado, excitado y energizado a la vez. No tenías esta mezcla tan particular desde que eras adolescente. Respirás y te concentrás en tu propio cuerpo y notás tus palmas mojadas, tu rostro colorado y tu corazón acelerado.
    Agradecés que la comunidad sobrenatural de Costa Alegre sea bastante bruta y no visite de forma regular los Museos, sino alguien ya se hubiese dado cuenta de las particulares características de la Momia Inca y hubiese intentado robarla.
    Aun así, te da un poco de miedo lo que puede pasar si quedás frente a frente a la Momia.
}

Se hace un hueco entre las masas de visitantes que quieren ver a la Momia Incaica. Si querés entrar a verla este es el mejor momento para hacerlo.

* [Entrás a ver a la Momia Incaica]
    -> cap3_museo_dia_momia

* [Lo importante es explorar el Museo para volver a la noche, mejor terminar el recorrido]
    -> cap3_museo_dia_recorrido_final

=== cap3_museo_dia_momia ===
Te metés entre los biombos que buscan recrear la cueva donde fue encontrada la Momia. Te sorprende lo pequeña que es, es obvio que en vida era solo una niña. Aparte su rostro, mirando hacia abajo y escondido detrás de un mechón de pelos, la hace parecer tímida e incómoda. No podés dejar de pensar que tal vez no es correcto que esté expuesta ante masas de desconocidos. Sentís que hay un doble sacrilegio, tanto al ritual religioso de su sacrificio como a la intimidad y respeto que le corresponde a los muertos.
# next

{ magia < 20:
    La energía se siente más espesa. Tu camisa de repente está empapada de sudor y una presión aprieta tu frente. Durante unos segundos no podés actuar, pero te saca de tu ensoñación unas gotas de sangre que caen sobre tu pecho. Te llevás las manos a tu nariz, estás sangrando. Mucho.
    Por lo menos la sangre es un vector que te pone en movimiento, te abrís paso a los empujones y vas a la siguiente sala en busca de un baño.
    -> cap3_museo_dia_recorrido_final
- else:
    { magia < 30:
        La energía de la momia es desbordante. Es como el sol o el mar. Aún más, esos conceptos tienen límites, son objetos finitos e ideas manejables. La energía de la momia es algo aun mayor, una luz rosada atraviesa todo. Los objetos, tu cuerpo, los espacios entre los átomos.
        Sentís la energía desbordándote, difuminándote. Una sensación de vértigo y caída te inunda e intentás enfrentarla.
        Los límites de tu ser se desdibujan e intentás torpemente mantenerlo, como un niño que dibuja unos palotes y dice que eso es una persona.
        Es entonces cuando tu cuerpo dice basta.
        ~ hp -= 10
        -> cap3_museo_dia_hospital
    - else:
        La energía de la momia es desbordante. Se siente como tener el mejor sexo de tu vida, dentro de un auto de alta gama, que avanza a toda velocidad, por el infinito.
        Naciste para manejar estas energías. Todo el tiempo anterior a esto, o sea toda tu vida, parece tan lenta y mundana. Gris y estática. Una pared de cemento.
        Te emborrachás en la energía. A tu alrededor se escuchan gritos. El tono de esos gritos va más allá del miedo ¿Pánico? ¿Locura?.
        Al olor después se le suma el olfato. Humo y el distintivo olor a carne quemada. Pero no te descompone, estás más allá de descomponerte.
        Por último se agrega el tacto. Ahí te das cuenta que la carne que se está quemando es la tuya.
        ~ hp -= 20
        -> cap3_museo_dia_hospital
    }
}

=== cap3_museo_dia_hospital ===
Una luz gigante flotaba sobre tu cabeza. Tu primera impresión fue que habías muerto y estabas en el cielo. Estabas relajado y, por lo menos, no tenías que levantarte para ir a trabajar.
Esa impresión duró hasta que la luz gigante titiló fruto de una falla de corriente y una polilla, confundida, huyó de la oscuridad y se chocó contra tu cara.
Problemas de corriente, olor a desinfectante, una sábana rasposa y el tic tac constante de aparatos electrónicos.
Estabas en el Hospital de Costa Alegre. Lejos del Cielo, con suerte estabas en su antesala.
# next

Parece que tu contacto cercano con la Momia había sobrecargado tu cuerpo. Después de hacer un análisis superficial (y carente de cualquier conocimiento técnico, simplemente te dedicaste a tocar todo lo que podías tocar para asegurar que seguía en su lugar) llegaste a la conclusión de que estabas bien.
En cuanto te sentás en la cama tu conclusión cambia de bien a relativamente bien. Tu cabeza duele como si alguien le hubiese pegado con un martillo y tu cuerpo se siente liviano y carente de energía, sin duda por la pérdida de sangre.
# next

Es sorprendente lo fácil que es escapar de un Hospital. Teniendo en cuenta lo colapsado que está el sistema de salud de la ciudad, creo que si algún profesional de salud se da cuenta que sos un fugado solamente se alegra al saber que va a tener una cama libre para un paciente más grave. Al fin de cuentas, si tenés suficiente energía para poder escaparte, no deberías estar en un hospital en primer lugar.
Al salir del Hospital notás una luna llena iluminando el paisaje nocturno. Tu pequeña experiencia te hizo perder todo el día y desperdiciar cualquier oportunidad de planificar el robo de la Momia.
No te quedan más opciones que ir directo al Museo e improvisar sobre la marcha.
# next
-> cap3_museo_noche_entrada

=== cap3_museo_dia_recorrido_final ===
La última sala es el cuarto de recuerdos. Postales, remeras, vasos e imanes. La característica común es el sobreprecio.
Si seguís avanzando volvés a la Sala principal y salís del Museo. A la derecha hay una arcada que da al centro del edificio, un jardín arbolado donde se instaló un café improvisado. Con ver el pizarrón con la oferta culinaria te das cuenta que el lugar también está marcado por el sobreprecio.
Ya recorriste el lugar, antes de irte podrías dejar preparada alguna acción que te permita hacer más fácil tu incursión nocturna para robar la momia.

* [Esconderte dentro del Museo es una opción. Y te ahorraría pensar cómo entrar a la noche.]
    Intentás esconderte en el baño del Museo. Trabás la puerta de un privado y te parás sobre el inodoro para que el guardia de seguridad no se dé cuenta que estás ahí cuando haga su ronda. Tenés que hacer fuerza para contener tu risa al recordar que usaste la misma técnica para quedarte en el colegio una noche con unos amigos.
    El plan funcionó esa vez. Lamentablemente, ya no estás en el colegio.
    No sabés cómo se dan cuenta que estás ahí, posiblemente tengan un sistema de cámaras y les llamó la atención que alguien entró al baño y nunca salió (esperás que nadie se descomponga en el museo).
    Un guardia con poco sentido del humor te escolta a la puerta.
    Afuera ves una luna llena iluminando el paisaje nocturno. Tu pequeña experiencia te hizo perder todo el día y desperdiciar cualquier oportunidad de planificar el robo de la Momia.
    No te quedan más opciones que ir directo al Museo e improvisar sobre la marcha.
    -> cap3_museo_noche_entrada

* { conocimiento >= 20 } [En las Salas hay guardias, podrías intentar robarle la llave a alguno para entrar tranquilo a la noche.]
    El Museo no está lleno de gente. Chocarse a alguien por accidente es difícil. Así que buscás otro enfoque. Registrás el lugar y encontrás lo que buscás, te das cuenta porque no tienen el aspecto del típico visitante de un Museo, caminan demasiado rápido y hablan demasiado alto. Es una pareja de adolescentes que sin duda estaban pasando la tarde en la plaza y decidieron entrar a molestar un poco.
    Uno de los guardias también los detecta y empieza a seguirlos, y vos lo seguís a él a unos metros (o, mejor dicho, al llavero que lleva colgado de su cinto). Al llegar a la Sala de la exposición Inca uno de los adolescentes hace una idiotez (obviamente) y golpea uno de los vidrios con sus nudillos un par de veces.
    El guardia se acerca para retarlos y vos aprovechás para pasar por su lado y hacer la maniobra McPherson y terminás con su juego de llaves en tu bolsillo.
    Esta noche vas a poder entrar por la puerta grande sin necesidad de tener problemas.
    -> cap3_museo_ya_adentro

* { magia >= 20 } [Un hechizo de invisibilidad y a esperar al baño.]
    Hacerte invisible no es tan fácil como parece. Si no estás bien concentrado más que invisible sos difuso, por usar una palabra. Aparte, curiosamente, nada llama más la atención que hacerte invisible en mitad de una multitud.
    Vas al baño y te escondés en un privado. Te concentrás mientras ejecutás una serie de precisos movimientos de manos a la par que repetís una onomatopeya de forma cada vez más baja.
    Una vez que sos invisible (como confirma el espejo del baño) te parás en una esquina esperando no chocarte con nadie y solo te resta esperar a la noche.
    -> cap3_museo_ya_adentro

* { fuerza >= 20 } [La puerta va a estar protegida, lo más simple es entrar trepando. Buscás claraboyas y ductos de respiración.]
    Das una nueva vuelta al museo, solamente que esta vez en lugar de observar los objetos en exposición te dedicás a estudiar el techo buscando una claraboya o los ductos de un aire acondicionado. La mayoría de las Salas carece de estos mecanismos, sospechás que para proteger las obras, pero el hall por el cual entrás tiene un ventanal gigante para facilitar la iluminación.
    A la salida estudiás el bosque que rodea el lugar y notás un árbol con una rama convenientemente gruesa que llega cerca del techo del Museo.
    Con un poco de suerte podrías saltar al techo del Museo, abrir el ventanal, y descolgarte con una soga. Arriesgado, pero divertido.
    -> cap3_museo_ya_adentro

* [A centímetros tuyos hay una alarma de incendio. No es necesario esperar. Simplemente generar caos y correr por la Momia.]
    Siempre tuviste ganas de hacer esto. Ves la alarma de incendio en la pared y te parece la mejor idea del mundo. En cuanto bajás la palanca una sirena grave empieza a escucharse por todo el Museo, luego viene una luz roja parpadeante y por último los gritos de pánico de toda la gente presente.
    La gente se convierte en una marea humana que va hacia la puerta. Vos avanzás contra corriente intentando llegar a la Sala donde se encuentra La Momia. Buscás los puntos de menor resistencia, aquella gente que parece que se va a correr a tu paso, en algún momento saltás por encima de un nene chiquito y girás todo tu cuerpo para no golpear de frente a una señora que no llegó a verte.
    Vas a llegar. Estás seguro que vas a llegar. Por lo menos eso creés hasta que alguien te agarra con una llave por el cuello y te dice "Es para el otro lado amigo". Te encontraste con un puto héroe ¿Cuáles eran las posibilidades?.
    Esos minutos que perdés son clave. Empezás a ver que el Museo se llena de uniformes azul (policía) y marrón (bomberos).
    Todo se volvió demasiado público, no te queda más opción que salir del Museo y volver a intentarlo a la noche.
    -> cap3_museo_noche_entrada

=== cap3_museo_ya_adentro ===
Tu plan fue un éxito y te encontrás dentro del Museo en cuanto cierra. Mientras avanzás bajo la semioscuridad escuchás unos ruidos en las otras Salas del Museo. Al principio no le das mucha importancia, este tipo de edificios viejos tienden a ser muy ruidosos cuando llega la noche y baja la temperatura. Sin duda es el metal de una cañería o algo por el estilo.
Pero después te das cuenta que el ruido es demasiado continuo y parece provenir de diversos grupos en varias habitaciones. ¿Guardias de seguridad? Podría ser pero los pasos serían demasiado inconstantes.
# next

Estás en el Hall Central listo para iniciar el recorrido que te va a llevar a la Momia Incaica cuando escuchás que una puerta detrás tuyo se abre.
Te escondés detrás del mostrador (el colmo de la falta de imaginación) mientras espiás por el filo del mueble. Un guardia de seguridad entra y recorre toda la habitación con el brillo de su linterna.
Avanza al centro de la habitación y no se da cuenta de nada. Sos vos el que lo nota primero, detrás de él aparecieron tres maniquíes que simplemente antes no estaban ahí. Notás que su rostro es totalmente liso, carente de cualquier rasgo facial, y eso es aún más perturbador que su súbito aparecer.
# next

El guarda para unos segundos y los maniquíes comienzan a moverse. Su caminar al principio es torpe y carece de dirección clara hasta que de repente los tres a la vez aumentan su velocidad y, con su avance zigzagueante, rodean al guardia de todas las direcciones.
La violencia generalmente ocurre muy rápido, por mucho que lo veas es increíble en qué tan poco tiempo las cosas pueden cambiar completamente para alguien. Uno de los maniquíes carga de frente, el guardia llega a darle un golpe fuerte en la cara con su pesada linterna (mala táctica, pero hay que reconocer que es valiente) pero el maniquí parece no sentir dolor.
En cuestión de segundos el maniquí atrapó uno de sus brazos mientras que los otros dos, que llegaron por los costados, agarraron respectivamente su otro brazo y una pierna.
Luego se dedican a tirar y doblar las extremidades.
# next

No hay malicia en la cara de los maniquíes (fácil al no haber rostro) ni emiten un sonido. Solo se escuchan los gritos desesperados del guardia que solo son superados por el ruido seco de huesos rompiéndose y carne siendo desgarrada.
Cuando terminan su trabajo sueltan al guardia que cae pesadamente al piso. Una caída así de espalda sin duda le saca todo el aire de los pulmones y le impide seguir gritando ayuda.
No pensás quedarte para ser la segunda víctima, aprovechás el momento y te colás en la Primera Sala del Museo mientras planeás cómo enfrentarte a esta nueva amenaza.
# achievement:unlock:llegaste_con_ventaja
# next
-> cap3_museo_primera_sala

=== cap3_museo_noche_entrada ===
# music:terror_ambient
Para tu desventaja, la noche está hermosa. Preferirías una de esas tormentas que traen el frio del mar y dejan la noche con olor a sal pero la noche es cálida con una brisa regular que llama a caminar.
Eso significa que el parque que rodea el Museo está lleno de parejas que caminan lento y sin rumbo, adolescentes que se aburren y no hacen nada (pero prefieren hacerlo afuera de su casa) y hasta un par de familias con niños que quedaron energizados después de la visita al Museo y no se quieren ir todavía.
Eso significa que te toca esperar un poco antes de ver cómo forzar tu entrada.
# next

Es entonces cuando te das cuenta que ya hay algo dentro del Museo. No es un ruido o una sensación sobrenatural, más una herencia genética de un pasado de cazador recolector que levanta pequeños detalles que no llegás a procesar y le da información a tu cerebro: hay algo entre esos arbustos ¿presa o peligro?.
Que se joda la sutileza, es momento de entrar en el Museo.

* { fuerza >= 20 } [Un poco de fuerza bastará para romper el mecanismo de la puerta.]
    Te apoyás contra la puerta y empezás a forzar el mecanismo mientras empujás con tu hombro. Requiere más que un poco de fuerza pero, luego de unos minutos, escuchás el click del mecanismo rompiéndose y podés entrar al hall central del Museo.
    -> cap3_museo_noche_convergencia

* { conocimiento >= 20 } [Hace tiempo que las ganzúas no se usan. Es su momento de brillar.]
    Las ganzúas bailan en la cerradura de la puerta haciendo un tintineo metálico. Apoyás tu oreja contra la puerta y vas escuchando el resultado de cada movimiento hasta encontrar la posición correcta. Eureka, la puerta se abre y entrás al hall central del Museo.
    -> cap3_museo_noche_convergencia

* { magia >= 20 } [Un poco de calor concentrado bastará para romper el mecanismo de la puerta.]
    Concentrar el calor fue lo más difícil, lo que te sale más natural era prender fuego toda la puerta (y la mitad del Museo de yapa) pero este trabajo requería algo más sutil. A medida que pasaron los segundos el calor se fue concentrando y aumentando, hasta convertir el pico de la puerta en una baba candente que cayó al piso. Así, por arte de magia (textualmente) lograste entrar al hall central del Museo.
    -> cap3_museo_noche_convergencia

* [Entrás de todas formas — improvisando]
    Rodeás el edificio buscando cualquier punto débil. Una ventana trasera con el seguro flojo cede con un poco de insistencia. No es elegante, pero funciona.
    -> cap3_museo_noche_convergencia

=== cap3_museo_noche_convergencia ===
Te encontrás de nuevo en el hall central, bajo la tenue luz de la luna que entra por los ventanales. Tardás unos segundos en comprender lo que estás viendo, una pieza así sería más propia de un museo de arte moderno.
En el piso hay una figura con el típico traje de guardia de seguridad, pero sus extremidades se encuentran dobladas en ángulos raros, ángulos que ningún cuerpo humano adoptaría voluntariamente.
A su alrededor están parados tres maniquíes de aspecto humanoide pero con rostros planos, carentes de cualquier rasgo. Por alguna razón esta particularidad los hace parecer más perturbadores.
Sospechás que, tal vez, dejaron en el hall central elementos que deben colocar en alguna vitrina mañana a primera hora para hacer una composición.
# next

Es entonces cuando escuchás un quejido en el piso. La figura con el traje de guardia de seguridad no era una maqueta ni un maniquí, era una persona que (por ese ruido) estaba en sus últimos minutos de vida.
No tenés mucho tiempo, debés decidir cómo actuar.

* [Te acercás a intentar salvar la vida al guardia de seguridad]
    Te arrodillás al lado del guardia mientras intentás recordar los pocos conocimientos que tenés sobre primeros auxilios. Sentís que, aun si recuperás todo lo que olvidaste sobre salud, el guardia está más cerca de necesitar un milagro que un médico.
    Solo llegás a notar cómo una sombra se mueve, antes de darte cuenta uno de los maniquíes te agarra firmemente del cuello. Movés los pies desesperadamente intentando encontrar algo sólido pero solo hay vacío. Lentamente te empezás a quedar sin aire.
    { fuerza >= 25:
        Sentís tus abdominales en llamas pero lográs elevar tus piernas y darle una patada al maniquí para forzar que te suelte. Corrés hacia la primera sala mientras ves delante de ti las sombras que produce el arbitrario movimiento del maniquí y escuchás detrás de ti el ruido inconexo de sus pisadas.
        ~ hp -= 10
    - else:
        Es entonces cuando otro maniquí descarga un golpe contra tu estómago, dejándote sin aire mientras abrís la boca en un grito mudo.
        Por suerte te lanza como un muñeco roto con tanta fuerza que atravesás la puerta hasta la siguiente habitación.
        ~ hp -= 20
    }
    -> cap3_museo_primera_sala

* [Alguien ya está en el Museo, vas a la siguiente sala para llegar rápido a la momia.]
    -> cap3_museo_primera_sala

=== cap3_museo_primera_sala ===
# stop_music
# play_sfx:heartbeat_boost
# UI_EFFECT: blur_vignette
# play_sfx:pasos_monstruo

Te encontrás de nuevo en el hall central, bajo la tenue luz de la luna que entra por los ventanales. Tardás unos segundos en comprender lo que estás viendo, una pieza así sería más propia de un museo de arte moderno.
# next

En el piso hay una figura con el típico traje de guardia de seguridad, pero sus extremidades se encuentran dobladas en ángulos raros, ángulos que ningún cuerpo humano adoptaría voluntariamente. A su alrededor están parados tres maniquíes de aspecto humanoide pero con rostros planos, carentes de cualquier rasgo. Por alguna razón esta particularidad los hace parecer más perturbadores.
# next

Es entonces cuando escuchás un quejido en el piso. La figura con el traje de guardia de seguridad no era una maqueta ni un maniquí, era una persona que —por ese ruido— estaba en sus últimos minutos de vida. No tenés mucho tiempo.
# next

El latido de tu propio corazón se amplifica en tus oídos como si alguien hubiera bajado todo el otro sonido del mundo. Los maniquíes se mueven. El clack-clack de sus articulaciones rebota contra las vitrinas de Pueblos Originarios. Tenés segundos para decidir.

¿Qué hacés?
* [Llegar a la primera sala y trabar la entrada — usar lo que encuentres] -> cap3_combate_baston
* [Desenfundar y dispararle al maniquí de adelante] -> cap3_combate_revolver
* [Dejar estallar la magia cruda] -> cap3_combate_magia

=== cap3_combate_revolver ===
# play_sfx:disparo
# flash_red
# shake

El disparo es perfecto, uno de esos para estar orgullosos. Conecta justo en la frente del maniquí —entre los ojos, aunque el bicho tiene un rostro liso lo cual te quita el punto de referencia. No hay sangre, tripas ni gritos de dolor, lo cual vuelve todo bastante anticlimático. Solo el fuerte olor a plástico quemado y la cabeza moviéndose para atrás por el efecto cinético de la bala.
# next

# play_sfx:clic_arma
{ fuerza >= 25:
    Los otros dos maniquíes se te lanzan encima. Sabés que su estrategia es agarrar y torcer, romper o quebrar. Te movés rápido entre ellos y usás el mango del revólver como una porra. En un momento una de sus manos logra agarrar el puño de tu chaqueta; te retorcés como un animal para sacarte la prenda antes que puedan agarrar algo de carne. A pesar de todo, el combate te favorece y de repente te encontrás del otro lado. Con un claro sentido táctico, te das media vuelta y corrés con toda tu fuerza hacia la Sala con la Momia.
    ~ hp -= 8
- else:
    Intentás girar para apuntarle a otro de los maniquíes pero te encontrás con un par de manos abiertas dirigidas directo a tu cuerpo. Por puro instinto te tirás al piso mientras el disparo es un eco que se pierde en el vacío. Te hacés una pelota intentando proteger tus órganos más importantes mientras los tres maniquíes te dan una tanda de patadas. Uno te agarra del cuello y te vuelve a poner sobre dos piernas —por suerte su agarre está en el cuello de tu chaqueta, no en la carne. Te retorcés como un animal y lográs sacarte la prenda. Salís corriendo hacia la Sala con la Momia mientras uno de los maniquíes atrás destroza tu chaqueta.
    ~ hp -= 10
}
# next
-> cap3_museo_momia

=== cap3_combate_baston ===
# play_sfx:golpe
# shake

Llegás a la primera Sala, la exposición de Costa Alegre en la época de los Pueblos Originarios. Ves un par de maquetas y lamentás que estas figuras con lanzas no cobren vida para ayudarte. Atrás tuyo escuchás como los pasos irregulares de los maniquíes se preparan para entrar. Cerrás la puerta de ingreso pero notás que es una madera de mala calidad —parece que el Museo estuvo desfinanciado desde su construcción. El cierre de la puerta es más una expresión de deseo que una defensa real.
# next

Tu mirada cae sobre una vitrina: báculo ceremonial de madera densa, ritualmente decorado, casi un metro de largo. Pesado. Rompés el vidrio y lo aferrás con ambas manos antes de que los golpes de los maniquíes hagan temblar la puerta.
# play_sfx:vidrio_roto
# next

# MINIGAME: keymash key=space duration=6000 threshold=18
# play_sfx:golpe

{ minigame_result == 1:
    Cada embiste de madera contra tu defensa hace retumbar toda la sala. Repelés la oleada con el báculo, usando las vitrinas como muralla. Los maniquíes retroceden dando espacio para avanzar. Las manos te sangran por los astillazos pero tus huesos siguen enteros.
    ~ hp -= 6
    ~ fuerza += 3
- else:
    Un maniquí se te cuela por el flanco y te clava astillas en el costillar antes que lo tirés. Sangrás pero seguís entero. Aprovechás el hueco para correr hacia la siguiente sala.
    ~ hp -= 18
}
# next
-> cap3_museo_momia

=== cap3_combate_magia ===
# play_sfx:magia_oscura
# flash_red
# UI_EFFECT: blood_pulse

{ magia >= 15:
    # play_sfx:magiexplosion
    Dejás estallar la magia cruda. La sala se ilumina con un fogonazo de luz azul y naranja cegadora; el crujido del fuego tapa hasta el latido en tus oídos. Los maniquíes se calcinan en segundos. Un grito de dolor escapa tuyo —quemaste también tus propias manos, pero el camino hacia la Sala con la Momia está despejado.
    ~ hp -= 12
    ~ magia -= 5
    # achievement:unlock:incineracion_museo
- else:
    La magia se te escapa mal canalizada. El fogonazo te quema a vos más que a ellos. Dos maniquíes siguen avanzando —su avance es impredecible, mezclando pasos lentos y largos con explosiones de velocidad. Solo te queda correr.
    ~ hp -= 20
    ~ magia -= 10
}
# next
-> cap3_museo_momia

=== cap3_museo_momia ===
// TODO: Task 8 — sala de la Momia + portal + ladrona + rama RATONCITO
-> END

// ============================================================
// MUERTE — game over por hp = 0
// ============================================================

=== muerte ===
# stop_music
# CHAPTER_BREAK: title=Misión fallida, subtitle=Fin, image=muerte.jpg
{~La enfermería quedaba a dos cuadras. Qué lástima.|Debiste haber ido a la enfermería antes de esto.|El parte de novedades va a decir simplemente: "baja en combate".|El sargento va a tener que dar muchas explicaciones.|Sobreviviste todo lo anterior para terminar así. Ironías de la vida.|En la academia te enseñaron primeros auxilios. Extraño que no lo recordaras ahora.}
-> END
