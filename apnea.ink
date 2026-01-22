// ---------------------------------------------------------
// PROYECTO: BardoEngine - APNEA
// Demo de mecánica inmersiva: Gestión de pánico y respiración
// FORMATO: Ink (Inkle Studios)
// ---------------------------------------------------------

VAR minigame_result = -1

-> intro

=== intro ===
# bg:armario_oscuro # music:tension_ambient
Estás escondido en un armario. Polvo, oscuridad, y el olor de ropa vieja.

Afuera, algo te busca. Lo escuchás moverse. Lento. Deliberado.

Tu única defensa es el silencio. Tu única arma es tu respiración.

* [Prepararte] -> preparacion

=== preparacion ===
# shake
Tu corazón late tan fuerte que tenés miedo de que lo escuche.

Apretás los puños. Cerrás los ojos. Te preparás para lo que viene.

Cuando la sombra pase cerca, vas a tener que aguantar la respiración.

NO HAGAS RUIDO.

* [Entendido] -> minigame_apnea

=== minigame_apnea ===
# minigame: type=apnea, waves=3, autostart=true

-> resultado

=== resultado ===
{ minigame_result:
    - 1: -> victoria
    - else: -> derrota
}

=== victoria ===
# flash_yellow # play_sfx:victory # music:stop
La sombra se fue.

Te dejaste caer contra la pared del armario, temblando.

Tu respiración vuelve lentamente a la normalidad. Estás vivo.

Sobreviviste.

-> END

=== derrota ===
# shake # flash_red # play_sfx:jumpscare # music:stop
La puerta del armario se abre de golpe.

Por un instante, ves su forma. Oscura. Imposible.

Después, nada.

-> END
