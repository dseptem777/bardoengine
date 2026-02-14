// ---------------------------------------------------------
// PROYECTO: Centinelas del Sur
// MOTOR: BardoEngine
// CONTENIDO: Capítulo 0 (Orígenes) + Capítulo 1 + Intermisión 1
// ---------------------------------------------------------

VAR nombre_personaje = ""
VAR magia = 0
VAR fuerza = 0
VAR conocimiento = 0
VAR entrada_temprana = false
VAR tiene_fotos = false
VAR tiene_mano = false
VAR tiene_descripcion = false
VAR new_game_plus = false

-> capitulo_0

=== capitulo_0 ===
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
# shake # play_sfx:golpe
Defensa arriba. Mentón abajo. Eso era todo el entrenamiento que tenía para el combate. Es una lástima que lo había sacado de ver películas de boxeo de los ochenta.

El primer golpe pasó directo entre mis brazos y chocó en mi rostro. Dolor, humillación, el mundo se sentía como una calesita borracha.

¿En qué momento terminé en el piso?

-> magia_confrontacion

=== magia_confrontacion ===
# shake # flash_red # play_sfx:golpe
Intenté ponerme en posición fetal. No sirvió. Cada golpe era una explosión de dolor que se expandía por todo mi ser. Mi cuerpo temblaba, todo su cableado estaba mal, la adrenalina me sobrecargaba pero no podía pelear ni tenía adónde correr. La única opción que me quedaba era seguir tirado en el piso esperando que todo termine rápido.

# shake # flash_red # play_sfx:golpe
¿De nuevo de pie? ¿Por qué? Solo escucho un pitido en un oído y de fondo los gritos roncos de mis compañeros de clase. Quieren sangre, son como animales carroñeros desesperados por alimentarse de mi dolor, de las sobras que les deje Jorge.

Entre el mar de rostros está Julieta, llorando. Debería hacer algo.
# next
# flash_red
Mi sangre en el piso. Esperaba más, y más roja, menos espesa. Creo que estoy disociando pero está bien. Debo escapar de mi cuerpo. Mi cuerpo es para que Jorge haga lo que quiera.

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

# stat:magia:+20 # stat:fuerza:+10 # stat:conocimiento:+10
-> intermision_0

// =========================================================
// ORIGEN 2: COMBATE IMPOSIBLE
// =========================================================

=== origen_combate ===
# music:horror_ambient
Mierda. Mierda. Mierda. La manija de la puerta se resbalaba en mi mano. Escucho a alguien llorar en el piso de arriba de la cabaña y yo no puedo abrir la puta puerta.

Me miro las manos. Están húmedas. Sangre. ¿De quién es esta sangre? ¿Miguel? ¿Claudia?

Intento limpiarme la sangre en el pantalón pero no sirve para nada, solo logré crear dos grandes manchas marrones en mis rodillas.

# play_sfx:pasos_monstruo
Pasos arriba. Pesados. Irregulares.
# next
Dios, es… es…
# next
* [Debo subir por las llaves. Estoy casi seguro que están en la habitación de María y Esteban.] -> combate_subir
* [Que se joda todo, yo solo quiero salir. Voy a saltar por una de las ventanas.] -> combate_ventana

=== combate_subir ===
La escalera es de madera y chilla en cuanto pongo mi pie en el primer escalón. Espero un segundo. En mi cabeza se repite el eco de los gritos de mi amigo agonizando, pero no pasa nada.

Por las dudas me saco las zapatillas, ato los cordones, y me las cuelgo al cuello. No sé si sirve o no, pero ser precavido no me va a matar.

(Lo que me va a matar es esa… cosa… que está en el piso de arriba alimentándose de mis amigos. Mierda.)

Cada escalón es una ruleta rusa. Un quejido de la madera, una posibilidad de morir.

Pero llego arriba de todo.

# flash_red
Lo veo por el rabillo del ojo. Su piel verdosa para camuflarse con el musgo y los tentáculos, húmedos y fuertes, abrazando el cadáver de lo que fue mi amigo.

PorfavorPorFavorPorFavor. No Quiero Morir.

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

# shake # flash_red
Pero no fue suficiente. Antes de darme cuenta estaba con la cabeza en el piso sufriendo una oleada de dolor que superó a la carga de adrenalina en mi cuerpo.

Recordaba los gritos de dolor de mi amigo muriendo en el piso de arriba de la cabaña. Le temía a la muerte, le temía más al dolor. Pero simplemente no podía más.

# play_sfx:disparo # flash_yellow
El ruido hizo eco por todo el bosque. La… cosa… chilló atrás mío. Sonó como estática de radio a todo volumen, como el ruido original del universo. Y sentí la tierra temblar abajo mío cuando su cuerpo cayó al piso.

Los agentes de "El Faro" habían llegado. Una hora antes, y todos mis amigos seguirían vivos. Unos minutos después, y yo sería un cadáver.

Me levanté con una misión. Yo sería quien llegaría siempre una hora antes.

# stat:magia:+10 # stat:fuerza:+20 # stat:conocimiento:+10
-> intermision_0

// =========================================================
// ORIGEN 3: CONOCIMIENTO PROHIBIDO
// =========================================================

=== origen_conocimiento ===
# music:misterio_ambient
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
Bueno, dejemos de dar vueltas y pasemos a la acción.

Entre las dos terrazas había una distancia de cinco metros. Llevábamos meses practicando para saltar esa distancia. Pero las prácticas habían sido sobre tierra, en cambio ahora teníamos una caída de 50 metros que hacía ver todo más real.

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

# play_sfx:caja_fuerte
Una vez abierta la caja fuerte no te encontrás con oro o pilas de dólares. Solamente hay un paquete con (considerable) cantidad de cocaína, una pistola (agradecés tener guantes para no dejar tus huellas digitales en lo que seguramente es un arma asesina) y un pequeño relicario con la foto de quien suponés que es la madre del dueño de la mansión.

# play_sfx:puerta
Entonces escuchás la puerta abriéndose detrás de ti.

-> conocimiento_confrontacion

=== conocimiento_biblioteca ===
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

La habitación es pequeña. Solo contiene un pequeño atril en el cual está colocada "La Última Colección" donde se recopilaban las profecías nunca publicadas de Solari Parravicini.

El cuarto pequeño y de madera te hace acordar a un ataúd. Instintivamente te colocás delante de Julieta mientras pensás en la necesidad de buscar por trampas o alarmas secretas.

# play_sfx:puerta
Entonces escuchás la puerta abriéndose detrás de ti.

-> conocimiento_confrontacion

=== conocimiento_confrontacion ===
El heredero de los Ayacucho Olavarría está en el marco de la puerta. A pesar de que son dos contra uno (y él está vestido solamente con una bata y unas pantuflas) en su rostro hay una sonrisa de diversión, como un padre que está jugando a un juego con su hijo que sabe que fácilmente puede ganar.

# play_sfx:magia_oscura
Antes que te des cuenta su mano recorre un patrón extraño en el aire mientras pronuncia unas palabras. Las palabras no tienen sentido, al menos no en el área de lo racional, pero algo en tu cerebro las entiende.

# shake
De repente estás completamente inmovilizado. Tu cuerpo se encuentra duro y se niega a responder cualquier orden. Hasta respirar, algo tan mecánico y natural, se vuelve complicado. Como si un gran peso estuviera oprimiendo tu pecho.

\- ¿Qué tenemos acá? ¿Ratoncitos que salieron de su cueva para mordisquear mis pertenencias?

* [Intentás moverte. No vas a ser vencido por una persona con bata y pantuflas.] -> conocimiento_resistir
* [No hacés nada. Veamos qué pasa.] -> conocimiento_esperar

=== conocimiento_resistir ===
# shake
Te esforzás por moverte, pero solo conseguís un punzante dolor de cabeza que se vuelve cada vez más filoso. El pánico empieza a carcomerte. ¿Qué pasa si nunca más recupero el control de mi cuerpo? ¿Moriré de inanición?

Intentás alguno de los ejercicios de respiración que te enseñó Julieta para contener el miedo pero ni siquiera tenés control de cómo respirás.

Estás encerrado en tu cuerpo, con tu miedo como único compañero de celda.

-> conocimiento_final

=== conocimiento_esperar ===
Ayacucho Olavarría sale de tu campo de visión, ni siquiera podés mover tu ojo para ver adónde va. Tu vista está clavada en el marco de la puerta, ahora vacía, y en la nuca de Julieta.

Lo escuchás caminar, canturrear algo, un poco de ruido de vidrio. La incertidumbre te vuelve loco, estás completamente consciente de que estás totalmente a su merced.

-> conocimiento_final

=== conocimiento_final ===
Ayacucho Olavarría vuelve a aparecer en tu campo de visión, con una copa de Brandy en la mano.

\- A ver qué tenemos acá, y qué provecho le podemos sacar a esta situación.

Da una vuelta alrededor de Julieta, apreciándola como quien analiza comprar un mueble caro o un departamento de lujo.

Luego se da vuelta y te mira con el mismo desprecio que se guarda para algo que se tira a la basura.

\- Para ella se me ocurren un par de usos, pero vos no me aportás nada realmente…

# play_sfx:magia_oscura
De nuevo, sus manos hacen un firulete en el aire mientras sus labios se mueven. Las palabras no son procesadas por tu cerebro consciente, pero generan su efecto.

# shake # flash_dark # play_sfx:crasheo
Luego todo, simplemente… se rompe.

No recordás mucho de lo que pasó después. Durante la mayor parte de un año estuviste ocupado volviendo a aprender cosas básicas. Como caminar y como hablar.

Hasta tuvieron que volver a enseñarte cómo usar tus esfínteres.

De Julieta no tuviste más noticias. En cuanto pudiste volver a usar tus dedos intentaste ponerte en contacto con amigos en común pero ella se desvaneció del mapa.

Parece que los agentes de "El Faro" recorren rutinariamente los neuropsiquiátricos. A veces hay poca diferencia entre una esquizofrenia y haber corrido la cortina para ver el mundo sobrenatural que se esconde detrás.

Ellos te ofrecieron un trabajo y una nueva oportunidad y no pensás desperdiciarla. Es más, tal vez hasta tengas espacio para la venganza.

# stat:magia:+10 # stat:fuerza:+10 # stat:conocimiento:+20
-> intermision_0

// =========================================================
// INTERMISIÓN 0: HUB DE COSTA ALEGRE
// =========================================================

=== intermision_0 ===
# music:ciudad_ambient
Costa Alegre es una importante ciudad con costas al Atlántico Sur. Durante el verano es un centro vacacional importante pero, durante el resto del año, la industria pesquera y la presencia de una Universidad garantiza que se mantenga poblada.
# next
En esta ciudad, haciéndose pasar por un olvidado edificio administrativo en el fondo del campus universitario (ahí donde el pasto bien cortado deja espacio a la maleza) se encuentra uno de los cuarteles de "El Faro".

"Marcando un camino seguro para la humanidad", ese es su lema. En igual parte estudiosos y milicia, "El Faro" se encarga de monitorear todas las amenazas sobrenaturales que se ciernan sobre la humanidad y, cuando se vuelven muy peligrosas, asegurar que lleguen a un final.

Sus agentes son de los más variopintos, desde intelectuales que son la personificación de "la curiosidad mató al gato" hasta víctimas de seres sobrenaturales que están cobrando su venganza. Algunos son verdaderos monstruos buscando la redención.
# next
# next
Y, claro, también estás vos.

Abrís la ventana de tu departamento y entra un poco de aire acompañado por el olor de sal del agua salada. El viento trae unos gritos de diversión y alegría.

Te queda un poco de tiempo para tu próxima reunión en el Ministerio. Tal vez podés hacer algo antes de ir a la sede de "El Faro".

¿Qué querés hacer?

* [Bajar a la playa. Me merezco descansar un poco y disfrutar de la vida normal que estoy protegiendo.] -> intermision_playa
* [Recorrer el filo entre lo normal y lo sobrenatural. Con un poco de suerte voy a conseguir información sobre mi próxima misión.] -> intermision_bloqueada
* [Podría ver qué están haciendo los otros agentes de "El Faro". Tal vez necesiten que los ayude un poco.] -> intermision_bloqueada
* [¿Estás jodiendo? Necesito ver a un buen médico. O al menos descansar, no voy a ayudar a nadie con estas heridas.] -> intermision_bloqueada
* [No hay razón para dar vueltas. Voy directo a la sede de "El Faro" a tomar mi siguiente misión.] -> intermision_faro

=== intermision_playa ===
# music:playa_ambient
Bajás a la playa y disfrutás un poco del sol golpeando tu cuerpo. Cuando el calor se vuelve insoportable podés ir al mar a refrescarte un poco.

Te sumás con un par de desconocidos a jugar un partido de volley en la arena y terminás la jornada tomando un trago en la barra de un bar costero viendo el horizonte.

La vida es buena. Pero no podés ignorar que a lo lejos se ven, amenazantes, un frente de nubes de tormentas.

-> intermision_faro

=== intermision_bloqueada ===
Esta opción no está disponible en este momento.

-> intermision_0

=== intermision_faro ===
# music:misterio_ambient
Es hora de ponerse a trabajar.

Te dirigís hacia la sede de "El Faro" para recibir tu siguiente misión.

-> capitulo_1

=== capitulo_1 ===
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
El hall central es un cuarto gigante, en el cual en el piso está representado el mismo logo que la puerta. A pesar de que el edificio no tiene ventanas el clima es agradable y no está viciado.
# shake
No es necesario ser un gran practicante de magia para darse cuenta de la gran cantidad de magia defensiva que hay en el lugar. Lo sentís como un dejo de gusto amargo en tu boca.
# next
El único ruido proviene del escritorio de la secretaria, la Sra. Enríquez, que está tipeando algo en su máquina de escribir.

+ [¿Por qué no pasamos a computadoras?]
    - — El tiempo no es una construcción social que todos intentamos acatar. En especial cuando se realiza tareas complejas. Y todas las tareas de El Faro son complejas.
    Enríquez te da una mirada que te hace sospechar que el título de "secretaria" es menospreciar la totalidad de su capacidad.
    Intentás justificarte pero levanta la mano para callarte. Un gesto simple pero efectivo.
    — Tal vez la hora de tu llegada era clave y al adelantarte arruinaste todo. Que no se repita, por favor.
    { entrada_temprana:
        Y respecto al tema de las computadoras. Yo ya trabajaba acá cuando cualquier mago de todo por dos pesos intentaba mezclar la protección astral con internet. Después del incidente del 2007 pasé a medios totalmente analógicos.
    }
    -> mision_profe

+ [Toser un poco hasta que ella se fije en vos]
    Enríquez te mira. Mira el reloj. Y te ignora hasta la hora exacta en la cual fuiste citado.
    - — Guardián, voy a asegurarme de descontar de su próximo sueldo las sumas necesarias para comprarle un reloj.
    -> mision_profe

=== mision_profe ===
- — El Profesor lo espera en el piso de arriba para darle su primera misión de campo. Por favor, no la arruine. Ya llené un formulario con sus datos y no quiero perder tiempo destruyendo el formulario… y llenando los formularios correspondientes para justificar la destrucción de documentación.
# next
El Profesor, Enríquez. Ninguno era un nombre real. Todos los guardianes de El Faro usan alias para proteger su vida civil. 
Vos también. ¿Cuál es?

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
— Tenemos tres guardianes en la sede que podrían ayudarte...
+ [Hablar con Enríquez (Sabiduría)] -> ayuda_enriquez
+ [Entrenar con Cabral (Fuerza)] -> ayuda_cabral
+ [Visitar a Mary Shelley (Magia)] -> ayuda_shelley

=== ayuda_enriquez ===
Enríquez termina sacando un libro grueso de un cajón. El golpe sobre el escritorio hace eco por todo el edificio. Una guía telefónica de una ciudad poblada.
Lees sobre la sabiduría de los anteriores Guardianes. Aprendés mucho de sus aciertos y más de las notas al pie sobre sus errores.
# stat:conocimiento:+5
# next
-> en_la_morgue

=== ayuda_cabral ===
Cabral te somete a una sesión de entrenamiento. El hombre es un manco, pero te tira al piso cinco veces antes de que puedas pestañear. Recibís una buena dosis de humildad y técnica.
# stat:fuerza:+5
# next
-> en_la_morgue

=== ayuda_shelley ===
Mary Shelley te clava una aguja llena de una sustancia de un verde antinatural. Dice que es para "relajar barreras psicológicas modernas que rechazan la magia". Luego del mareo inicial, tus sentidos se sienten más despejados.
# stat:magia:+5
# next
-> en_la_morgue

=== en_la_morgue ===
# music:terror_ambient
El palacio de justicia era una mole de diez pisos de mármol y cemento con gárgolas amenazantes. La morgue judicial estaba en el segundo subsuelo. Gracias a la identificación de El Faro, una buena camisa y caminar rápido, pasaste sin problemas frente a los policías.
# next
Llegaste a la puerta de la morgue al final de un pasillo largo. Un agente custodiaba el lugar con una escopeta apoyada contra la pared. Tu identificación bastó para pasar.
Adentro, la morgue era un depósito de cadáveres con una pared llena de pequeñas puertas frigoríficas. Eran demasiadas. ¿Cómo encontrar el cuerpo?

+ [Rastrear energía mágica residual] -> buscar_magia
+ [Hackear la computadora del forense] -> buscar_sabiduria
+ [Abrir todas las puertas a lo bruto] -> buscar_fuerza

=== buscar_magia ===
Cerrás los ojos y dejas que la habitación te hable. Sentís el dolor del lugar golpeando contra tu piel como alquitrán.
{ 
  - magia >= 25:
    Tu voluntad es fuerte. Haces un gesto y cortas las malas energías en seco identificando el punto exacto. -> frente_al_cadaver(true)
  - else:
    Te llega un grito de agonía. Es como avanzar contra una ventisca de agujas. Tardás demasiado, pero al final lo encontrás. -> frente_al_cadaver(false)
}

=== buscar_sabiduria ===
Te sentás frente a la vieja computadora. 
{ 
  - conocimiento >= 25:
    Encontrás un post-it viejo. Deducís la nueva contraseña en segundos. El expediente del NN te da la ubicación exacta. -> frente_al_cadaver(true)
  - else:
    Probás "amor", "123", nada. Terminas buscando en el tacho de basura y descifrando un código sucio. Tardás demasiado. -> frente_al_cadaver(false)
}

=== buscar_fuerza ===
Empezás a tirar de las puertas frigoríficas.
{ 
  - fuerza >= 25:
    Lo encarás como un entrenamiento funcional. Fresa y brutal. En una de las últimas puertas hallás lo que buscabas. -> frente_al_cadaver(true)
  - else:
    Es un trabajo engorroso. Tenés que alejarte un par de veces para no vomitar. Hay demasiada muerte acumulada aquí. -> frente_al_cadaver(false)
}

=== frente_al_cadaver(rapido) ===
# next
El cuerpo no es bonito. Su pecho tiene tres renglones de una escritura apretada. Un brazo fue desollado y quemado. Un corte en su estómago como una sonrisa cruel.
Sacas las fotos de rigor. 
# inv:add:fotos_profundo
~ tiene_fotos = true
{ not rapido:
    # play_sfx:tension
    En el pasillo escuchás al policía discutiendo con alguien. Una voz grave y amenazante.
}
Giras para irte y notás una sierra médica sobre una camilla. Una idea llega a tu cabeza: El Faro podría usar la mano para identificar al NN o convocar su espíritu.
# next
Agarrás fuerte la mano y empezás a serruchar. La carne es dura, más de lo que esperabas. Tu camisa está empapada en sudor. 
{ not rapido: 
    # play_sfx:disparos_escopeta # shake
    ¡TIROS! Dos disparos de escopeta en el pasillo. Un silencio mortal y luego un ruido sordo. Algo pesado acaba de caer. Los problemas se acercan.
}
# next
Usas tu peso para dar el último corte. El hueso cede. Ya tenés la mano en tu poder.
# inv:add:mano_nn
~ tiene_mano = true
# play_sfx:puerta_golpe
Algo está por entrar en la morgue.

+ [Esconderme en el ducto de ventilación] -> escape_ducto(rapido)
+ [Esconderme dentro de un frigorífico] -> escape_escondite
+ [Preparar una trampa] -> escape_trampa

=== escape_ducto(rapido) ===
{ 
  - rapido:
    Amontonás camillas y trepás rápido. { fuerza >= 25: Te metés en el ducto con agilidad absoluta. | Te cuesta, pero lográs meterte antes de que la pirámide colapse. }
    # next
    # play_sfx:puerta_destruida
    Abajo, la puerta sale volando y algo gigante entra destrozando todo. Te arrastrás por el tubo angosto y sucio hasta salir a la calle. -> final_morgue_exito
  - else:
    No hay tiempo para trepar con sigilo. Corrés hacia el ducto pero la puerta se abre de par en par. -> encuentro_monstruo
}

=== escape_escondite ===
Te metés en uno de los frigoríficos con un cadáver. Frío e incómodo. 
# play_sfx:puerta_destruida
Alguien patea la puerta y el monitor del escritorio vuela en mil pedazos.
# next
Por la rendija ves a una criatura de más de dos metros. Piel gris, garras negras, ojos oscuros.
# inv:add:descripcion_profundo
~ tiene_descripcion = true
{ magia >= 20: Sentís su hambre, una vibración acuática y antigua. }
Ves cómo se empieza a... COMER... el cadáver del NN. 
{ conocimiento >= 25: Comprendés que están borrando rastros genéticos. }
Esperás a que se retire y salís huyendo a toda velocidad. -> final_morgue_exito

=== escape_trampa ===
{ 
  - magia > fuerza and magia > conocimiento:
    # play_sfx:magia_oscura
    Dibujas un símbolo de dolor puro frente a la puerta con sangre residual.
  - fuerza > magia and fuerza > conocimiento:
    # play_sfx:clic_arma
    Preparás una trampa con tu escopeta directa a la cara de quien entre.
  - else:
    Electrificás la manija de la puerta con un puente eléctrico improvisado. 
}

# play_sfx:puerta_destruida
La entidad entra. Es masiva, ojos negros, mandíbula de tiburón. Tu trampa lo golpea de lleno, pero apenas lo detiene. No es humano.
# inv:add:descripcion_profundo
~ tiene_descripcion = true
+ [Huir aprovechando la distracción] -> final_morgue_escape
+ [Atacar con todo lo que tengo] -> pelea_monstruo

=== pelea_monstruo ===
Vacías el cargador y cargás con un hacha. La piel del ser es dura como el cemento. El hacha se quiebra al tercer golpe.
{ 
  - fuerza >= 25:
    # stat:hp:-25 # flash_red # shake
    Recibís un zarpazo que te destroza la guardia. Lográs rodar hacia atrás pero tu brazo sangra profusamente.
    -> final_morgue_escape
  - else:
    # stat:hp:-50 # flash_red # shake
    El golpe te manda al piso. Un corte profundo va del hombro a la cintura. El dolor es insoportable.
    -> final_morgue_escape
}

=== encuentro_monstruo ===
La entidad te encuentra antes de que puedas escapar. Sus ojos negros se clavan en vos.
+ [Luchar por tu vida] -> pelea_monstruo
+ [Intentar huir desesperadamente] -> final_morgue_escape

=== final_morgue_escape ===
Corrés por los pasillos. Te resbalás con los restos del policía (ahora carne picada). El miedo te da alas. 
{ 
  - fuerza >= 25:
    Llegás a tu auto. La garra del ser roza el vidrio trasero mientras arrancás a toda velocidad. -> final_morgue_exito
  - else:
    # stat:hp:-10
    Te perdés en el laberinto. Lográs esconderte en un vestuario hasta que el ser se retira con el cuerpo del NN. Salís temblando hacia el Faro. -> final_morgue_exito
}

=== final_morgue_exito ===
# music:misterio_ambient
De regreso en El Faro, dejas la mano del NN sobre el escritorio de Enríquez. Ella te mira, rocía desinfectante y te manda arriba.
# next
- Felicitaciones - El Profesor te da un abrazo que huele a tabaco eterno - volver es una victoria. 
{ tiene_fotos: Le mostras las fotos. }
- Sin duda era un Profundo. Seres de otros planos que viven en el fondo marino. Híbridos, embajadores de una secta. 
- Si te vuelves a encontrar con uno, intenta que abra la boca. Son débiles por dentro.
# next
Volvés a tu casa agotado. Sospechás que esto es el principio de algo más grande. Tarde o temprano te volverás a encontrar con esa entidad. Pero eso es problema del {nombre_personaje} del futuro. Ahora te toca dormir.
# next
-> intermision_1

// =========================================================
// INTERMISIÓN 1: PESADILLAS Y PISTAS
// =========================================================

=== intermision_1 ===
# music:ciudad_ambient
Te despertás a las tres de la mañana con un olor a salitre en la nariz. Hace días que te acosa una pesadilla de ahogo en un mar de sangre.
Ya que no podés dormir, decidís aprovechar el tiempo.
¿Qué querés hacer antes de tu próxima misión?

+ [Bajar a la playa a despejarte] -> inter_playa
+ [Visitar a la Tarotista de las afueras] -> inter_tarot
+ [Ayudar a Jesús "El Jaguar" en los muelles] -> inter_jesus
+ [Ir a la enfermería con Mary Shelley] -> inter_enfermeria
+ [Ir directo al Faro por una nueva misión] -> inter_misiones

=== inter_playa ===
Crees ver un cadáver en la orilla, pero es solo un tronco con algas. Tu salud mental está en juego.
# stat:hp:+5
-> inter_misiones

=== inter_tarot ===
Una anciana elegante te tira las cartas. - Te voy a dar un consejo: usa los símbolos antiguos si la situación se pone pesada.
-> inter_misiones

=== inter_jesus ===
Te encontrás con Jesús, un hombre jaguar ("Aba"). Te pide ayuda con un vampiro que tiene secuestrada a una mujer.
+ [Ataque frontal con Jesús]
    La mujer muere en la pelea. Jesús está decepcionado.
    -> inter_misiones
+ [Generar una distracción estratégica]
    Lográs salvar a la mujer. Jesús te lo agradece.
    # stat:conocimiento:+5
    -> inter_misiones
+ [Sigilo absoluto]
    Inmovilizás a la mujer mientras Jesús termina con el vampiro. Queda viva aunque con abstinencia.
    # stat:fuerza:+5
    -> inter_misiones

=== inter_enfermeria ===
Mary Shelley te cura las heridas. - Lindo cuerpo. Si morís, intentá mantener las extremidades pegadas al torso para que sea más fácil revivirte.
# stat:hp:+20
-> inter_misiones

=== inter_misiones ===
# music:misterio_ambient
El Faro te ha asignado dos casos urgentes. Debes elegir uno:

+ [Casos: PEQUEÑOS INOCENTES (Orfanato)] -> prox_mision_1
+ [Casos: EL NUEVO AMANECER (Asesinato familiar)] -> prox_mision_2

=== prox_mision_1 ===
Te dirigís al orfanato. El destino de esos niños depende de vos.
-> END

=== prox_mision_2 ===
Vas a la escena del crimen. Algo huele a ritual desde aquí.
-> END
