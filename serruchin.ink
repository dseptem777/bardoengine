// ---------------------------------------------------------
// PROYECTO: BardoEngine - SERRUCHÍN
// Demo de mecánica inmersiva: Autoamputación de emergencia
// FORMATO: Ink (Inkle Studios)
// ---------------------------------------------------------

-> intro

=== intro ===
# bg:quirofano_abandonado
Tu brazo izquierdo está negro. La gangrena subió hasta el codo en las últimas horas. El olor a carne podrida te da arcadas.

En el piso hay un serrucho oxidado. No hay anestesia. No hay doctor. No hay otra salida.

Si no te lo sacás ahora, el veneno te va a llegar al corazón en menos de una hora.

* [Agarrar el serrucho] -> preparacion

=== preparacion ===
# inv:add:serruchin
# shake
Tus manos tiemblan cuando agarrás el serrucho. El metal está frío y oxidado. Algunas manchas marrones podrían ser óxido... o sangre vieja.

Te mordés el cinturón con los dientes. Apoyás el filo dentado contra tu piel, justo debajo del codo.

Esto va a doler como la puta madre.

* [Empezar a serruchar] -> serrucho_1

=== serrucho_1 ===
# shake # flash_red # play_sfx:serrucho # play_sfx:grito # stat:hp:-15
AAAAAAARGH.

El primer corte es el peor. La hoja se traba en la piel y tenés que hacer fuerza. Sangre caliente te chorrea por el brazo.

La adrenalina te golpea como un camión. Todo se vuelve más nítido. Más real. Más horrible.

Recién empezaste. Tenés que seguir.

* [Seguir serruchando] -> serrucho_2

=== serrucho_2 ===
# shake # flash_red # play_sfx:serrucho # play_sfx:grito # stat:hp:-15
El serrucho muerde el músculo. Podés SENTIR cada diente rasgando las fibras de tu carne.

Lágrimas te corren por la cara. El cinturón casi se te cae de la boca.

Vas por la mitad del músculo. La sangre forma un charco debajo tuyo.

No pares ahora o fue todo en vano.

* [Continuar] -> serrucho_3

=== serrucho_3 ===
# shake # flash_red # play_sfx:serrucho # play_sfx:grito # stat:hp:-15
CRAC.

El serrucho llegó al hueso. El sonido es... indescriptible. Como morder hielo pero MIL VECES PEOR.

Tu visión se vuelve roja en los bordes. El dolor es tan intenso que casi te desmayás.

SEGUÍ. YA CASI.

* [Serruchar el hueso] -> serrucho_4

=== serrucho_4 ===
# shake # flash_red # play_sfx:serrucho_hueso # play_sfx:grito # stat:hp:-20
Cada movimiento del serrucho en el hueso te electrifica el cerebro entero.

El sonido es lo peor. Ese chirrido húmedo que no vas a poder olvidar NUNCA.

Ves astillas blancas mezcladas con la sangre. Estás atravesando el hueso.

UN POCO MÁS.

* [Terminar de cortar el hueso] -> serrucho_5

=== serrucho_5 ===
# shake # flash_red # play_sfx:serrucho # play_sfx:grito # stat:hp:-15
El hueso se parte con un CRACK definitivo.

Solo queda el músculo y la piel del otro lado. Estás tan cerca...

Tu brazo gangrenado cuelga en un ángulo imposible. Ya casi no es parte de vos.

DALE EL GOLPE FINAL.

* [Terminar el trabajo] -> final

=== final ===
# shake # flash_red # play_sfx:carne # play_sfx:grito # stat:hp:-10
CON UN ÚLTIMO TIRÓN, TU BRAZO CAE AL PISO.
# inv:add:brazo_podrido # inv:remove:serruchin

...

Silencio.

Solo escuchás tu respiración entrecortada y el goteo de la sangre.

Lo hiciste.

Agarrás un trapo sucio y te hacés un torniquete de emergencia. El dolor sigue ahí, pero el veneno... el veneno ya no puede avanzar.

Sobreviviste.

# flash_yellow # play_sfx:victory

Con un brazo menos, pero vivo.

-> END
