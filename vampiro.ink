// ============================================
// TECH DEMO: "El Peso de la Voluntad"
// Vampire Encounter - Parallel Willpower System
// ============================================
//
// Este archivo usa el sistema de voluntad PARALELO:
// - WILLPOWER_START: Activa la barra que decae mientras leés
// - WILLPOWER_CHECK: Evalúa tu voluntad actual al momento de elegir
// - WILLPOWER_STOP: Desactiva el sistema
// - El mouse se pone pesado mientras la barra está activa
//
// ¡Tenes que presionar V mientras leés y elegís opciones!

VAR willpower = 100
VAR sometimiento = 0
VAR willpower_passed = false

-> entrada_galpon

=== entrada_galpon ===
# bg:warehouse_dark
# music:dread_ambient
# UI_EFFECT: cold_blue

El aire en el galpón se vuelve pesado. 

Jesús, ahora en su forma de Yaguareté Aba, está lidiando con el vampiro en los techos, pero vos sentís una mirada clavada en tu nuca.

Una voz sedosa resuena directamente en tu cráneo:

"No tenés que pelear, querido. Puedo hacerte sentir... tan bien."

// ¡INICIO DEL DESAFÍO DE VOLUNTAD!
# WILLPOWER_START: normal
# UI_EFFECT: blur_vignette

Sentís cómo algo presiona contra tu mente. Tu voluntad empieza a flaquear...

[PRESIONÁ "V" PARA RESISTIR mientras elegís]

* [Resistir el llamado]
    # WILLPOWER_CHECK: 50
    { willpower_passed:
        -> resistencia_exitosa
    - else:
        -> resistencia_fallida
    }
    
* [Ceder al placer]
    # WILLPOWER_STOP
    -> ceder_primera

=== resistencia_exitosa ===
# UI_EFFECT: none
# shake
# flash_white

¡LO LOGRASTE!

Luchas contra tus propios músculos. Tu mano pesa como si fuera de plomo mientras intentás alcanzar tu arma, pero tu voluntad prevalece.

"Interesante..." ronronea la voz. "Tenés más fuego del que esperaba."

// Aumentar intensidad del desafío
# WILLPOWER_START: fast
# UI_EFFECT: static_mind

La presión sobre tu mente se intensifica. El vampiro ya no juega.

* [Mantener la resistencia]
    # WILLPOWER_CHECK: 60
    { willpower_passed:
        -> duelo_vampiro
    - else:
        -> ceder_parcial
    }

=== resistencia_fallida ===
~ willpower -= 30
~ sometimiento += 25

# UI_EFFECT: blood_pulse

Tu voluntad cede. Solo un poco. Pero es suficiente.

"Shhh... no peleés..."

-> ceder_parcial

=== ceder_primera ===
~ sometimiento += 50
~ willpower -= 40

# UI_EFFECT: blur_vignette

Una calidez antinatural recorre tu espina dorsal. 

"Eso es... déjate llevar..."

Los bordes de tu visión se oscurecen. ¿Para qué pelear?

Tus piernas se mueven solas, acercándote a la figura entre las sombras.

-> final_sometido

=== ceder_parcial ===
~ willpower -= 20

# WILLPOWER_START: fast
# UI_EFFECT: blur_vignette

Tus rodillas golpean el suelo del galpón. No querías arrodillarte. 

¿O sí?

La figura emerge de las sombras. Sus ojos son pozos de oscuridad imposible.

"Tan cerca... ¿podés sentirlo? La paz que ofrezco..."

La presión es casi insoportable ahora.

+ [Un último intento de resistir]
    # WILLPOWER_CHECK: 40
    { willpower_passed:
        -> ultimo_intento_exito
    - else:
        -> final_sometido
    }
    
+ [Inclinar el cuello]
    # WILLPOWER_STOP
    -> final_sometido

=== ultimo_intento_exito ===
# UI_EFFECT: none
# flash_white
# shake

¡NO!

La palabra sale como un rugido. Tu sangre ancestral despierta.

El vampiro retrocede un paso, genuinamente sorprendido.

"Vaya... hace décadas que no veo eso."

-> duelo_vampiro

=== duelo_vampiro ===
# WILLPOWER_START: extreme
# UI_EFFECT: static_mind

El vampiro te sonríe. Sus ojos parecen ocupar todo el espacio del galpón.

"Bueno entonces... hagámoslo de la manera difícil."

Se mueve. Más rápido de lo que deberías poder ver.

Tenés una fracción de segundo para reaccionar.

+ [¡ATACAR!]
    # WILLPOWER_CHECK: 50
    { willpower_passed:
        -> evaluar_ataque
    - else:
        -> derrota
    }

=== evaluar_ataque ===
# WILLPOWER_STOP
{ willpower > 30: 
    -> victoria 
- else: 
    -> victoria_pirrica
}

=== victoria ===
# UI_EFFECT: none
# music:stop
# flash_white
# shake

El filo del hacha conecta con su cuello.

Sangre negra salpica las paredes del galpón. El vampiro retrocede, más sorprendido que herido, pero herido al fin.

"Vos... esto no termina acá."

Se disuelve en sombras justo cuando Jesús aterriza a tu lado, transformándose de vuelta a su forma humana.

"¿Estás bien, Guardián?"

Asentís. Pero podés sentir la marca que dejó en tu mente. Un susurro que no se calla del todo.

Algo cambió esta noche.

[VICTORIA - Final Resistencia]

-> END

=== victoria_pirrica ===
# UI_EFFECT: blood_pulse
# music:stop
# shake

El hacha conecta, pero apenas.

Un corte superficial. Sangre negra gotea de su mejilla. 

Él te mira con algo parecido al respeto... y al hambre.

"Casi. Pero 'casi' no alcanza, ¿verdad?"

Desaparece en las sombras antes de que puedas reaccionar.

Jesús aterriza a tu lado. "¿Qué pasó? ¿Estás bien?"

No estás seguro. La voz todavía susurra en tu cabeza.

[VICTORIA PÍRRICA - Sobreviviste, pero...]

-> END

=== derrota ===
# WILLPOWER_STOP
# UI_EFFECT: blood_pulse
# music:stop

No fuiste lo suficientemente fuerte.

El vampiro aparece frente a vos en un parpadeo. Tu hacha cae de tus manos entumecidas.

"Shhh... ya pasó. Ahora vas a dormir."

Su mano fría acaricia tu mejilla casi con ternura.

Lo último que ves son sus colmillos.

[DERROTA - Dominado]

-> END

=== final_sometido ===
# WILLPOWER_STOP
# UI_EFFECT: blur_vignette
# music:dark_embrace

Ya no hay resistencia en vos.

Cuando los colmillos perforan tu cuello, sentís... alivio. Como volver a casa después de un largo viaje.

La voz susurra directamente en tu alma:

"Bienvenido a casa, querido. Ahora sos mío."

La oscuridad te abraza. Y vos la abrazás de vuelta.

[SOMETIMIENTO TOTAL]

-> END
