// Toybox: BardoEngine Minigame Dashboard
// Demonstrates stats/inventory integration with minigames

VAR minigame_result = -1
VAR agilidad = 5
VAR hp = 100
VAR tiene_ganzua = true
VAR new_game_plus = false

-> main

=== main ===
# bg:toybox
# music:toybox_theme
--- BARDO TOYBOX ---
Selecciona un minijuego para testear la integración.

{new_game_plus:
    [🌟 NEW GAME+ ACTIVO - Contenido exclusivo desbloqueado]
}

[TUS STATS: Agilidad={agilidad}, HP={hp}]

+ [QTE - Reflejos] -> test_qte
+ [Lockpick - Dificultad según Agilidad] -> test_lockpick
+ [Arkanoid - Arcade] -> test_arkanoid
+ [Subir Agilidad (+2)] -> subir_agilidad
+ {new_game_plus} [⭐ Contenido NG+ Exclusivo] -> ng_plus_content
+ [Back to Main Menu] -> END

=== subir_agilidad ===
~ agilidad = agilidad + 2
Tu agilidad sube a {agilidad}. Los minijuegos de precisión serán más fáciles.
+ [Volver] -> main

=== test_qte ===
~ minigame_result = -1
Prepárate para reaccionar...
# minigame: type=qte, key=SPACE, timeout=1.5, autostart=true
-> qte_result

=== qte_result ===
[DEBUG: minigame_result = {minigame_result}]
{ minigame_result == 1:
    ¡ÉXITO! Reflejos de acero.
    # achievement:unlock:first_win
    [LOGRO DESBLOQUEADO: Primera Victoria]
- else:
    FALLASTE. El golpe te alcanza.
    # stat:hp:-15
    [-15 HP]
}
[HP actual: {hp}]
+ [Volver al menú] -> main
+ [🌟 Desbloquear logro secreto] -> unlock_secret

=== unlock_secret ===
# achievement:unlock:secret_test
¡Encontraste el logro secreto del Toybox!
+ [Volver al menú] -> main

=== test_lockpick ===
~ minigame_result = -1
{ tiene_ganzua:
    Tienes una ganzúa. Tu agilidad ({agilidad}) afecta la velocidad del indicador.
    # minigame: type=lockpick, zoneSize=0.18, speed=1.2, autostart=true
    -> lockpick_result
- else:
    No tienes ganzúa. Necesitas una para forzar cerraduras.
    + [Volver] -> main
}

=== lockpick_result ===
[DEBUG: minigame_result = {minigame_result}]
{ minigame_result == 1:
    ¡CLICK! La cerradura se abre sin problemas.
    # achievement:unlock:first_win
    # achievement:unlock:lockpick_pro
- else:
    CRACK. La ganzúa se rompe en tus manos.
    ~ tiene_ganzua = false
    [Perdiste la ganzúa]
}
+ [Volver al menú] -> main

=== test_arkanoid ===
~ minigame_result = -1
¡Destruye todos los bloques!
# minigame: type=arkanoid, autostart=true
-> arkanoid_result

=== arkanoid_result ===
[DEBUG: minigame_result = {minigame_result}]
{ minigame_result == 1:
    ¡FANTÁSTICO! Victoria total.
    ~ agilidad = agilidad + 1
    [+1 Agilidad por tu destreza]
- else:
    GAME OVER. Mejor suerte la próxima.
}
+ [Volver al menú] -> main

=== ng_plus_content ===
¡Bienvenido al contenido exclusivo de New Game+!

Has completado el juego al menos una vez. Como recompensa, tienes acceso a contenido extra:

~ agilidad = agilidad + 10
[+10 Agilidad bonus de NG+!]

Este contenido solo aparece en tu segundo playthrough o posteriores.
+ [Volver al menú con tu bonus] -> main
