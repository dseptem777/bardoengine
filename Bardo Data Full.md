{  
"metadata": {  
"appId": "bardo-engine-partuza",  
"titulo": "Tu nombre en clave es Partuza",  
"autor": "Tyler Durden / Revista NAH\!",  
"engine": "BardoEngine v1.0",  
"variables\_iniciales": {  
"clave\_a": 0,  
"clave\_b": 0,  
"clave\_c": 0,  
"items": \[\]  
}  
},  
"historia": {  
"pagina\_1": {  
"texto": "Despiertas en un sillón del living, abrazado a una botella de whisky vacía. Tienes una mancha blancuzca en tu remera... En la planta de tu pie dice con marcador indeleble: 'puto el que lee'. Te miras al espejo: Eres Marley.",  
"tags": \["\#shake", "\#play\_sfx:resaca", "\#bg:living\_sucio"\],  
"opciones": \[  
{ "texto": "Si piensas que eres Bob Marley", "destino": "pagina\_102" },  
{ "texto": "Si piensas que eres Marley de Teleshow", "destino": "pagina\_32" }  
\]  
},  
"pagina\_102": {  
"texto": "¡Bob Marley está muerto, gil\! Te quedas mirando el techo hasta que el hambre te consume. FIN.",  
"tags": \["\#flash\_red", "\#bg:cielo"\],  
"opciones": \[\]  
},  
"pagina\_32": {  
"texto": "Te acomodas tus rubias mechas lacias... Un paparazzi de la revista Escándalo te saca una foto en el baño. Lo obligas a punta de Magnum 44 a limpiar todo. Al salir, encuentras un catálogo de Coto y un sobre misterioso.",  
"tags": \["\#play\_sfx:paparazzi", "\#bg:banio"\],  
"opciones": \[  
{ "texto": "Tomar el catálogo de Coto", "destino": "pagina\_4" },  
{ "texto": "Agarrar el sobre misterioso y llamativo", "destino": "pagina\_115" }  
\]  
},  
"pagina\_4": {  
"texto": "¡Qué divertido, un catálogo de supermercado\! Lees las ofertas de acelga y pepitas. Te pones de buen humor para ir al súper.",  
"tags": \["\#bg:catalogo"\],  
"opciones": \[  
{ "texto": "Ir al Supermercado", "destino": "pagina\_6" },  
{ "texto": "Hacer el pedido por internet", "destino": "pagina\_16" }  
\]  
},  
"pagina\_6": {  
"texto": "Llegas al súper. En la góndola de lácteos te encuentras con Jacinto 'Probeta' Rattin, un viejo conocido que insiste en que lo ayudes a conseguir helio para un experimento 'revolucionario'.",  
"tags": \["\#bg:supermercado", "\#play\_sfx:super\_ambience"\],  
"opciones": \[  
{ "texto": "Ayudar a Jacinto a buscar helio", "destino": "pagina\_45" },  
{ "texto": "Ignorarlo y comprar una Quilmes", "destino": "pagina\_8" }  
\]  
},  
"pagina\_8": {  
"texto": "La Quilmes está caliente. Tu decepción es tan grande que decides que el mundo debe terminar. Te vas a dormir. FIN.",  
"tags": \["\#flash\_blue"\],  
"opciones": \[\]  
},  
"pagina\_45": {  
"texto": "Jacinto te lleva a un depósito secreto detrás de las fiambreras. 'El helio está en esas garrafas', dice señalando unas latas de conserva sospechosas. Sumas CLAVE A \= 10.",  
"metadata": { "set\_variable": { "clave\_a": 10 } },  
"tags": \["\#bg:deposito"\],  
"opciones": \[  
{ "texto": "Abrir las latas con los dientes", "destino": "pagina\_50" },  
{ "texto": "Usar un abrelatas profesional", "destino": "pagina\_51" }  
\]  
},  
"pagina\_51": {  
"texto": "El gas sale con un silbido. Tu voz se vuelve finita, como si hubieras tragado una flauta dulce. Jacinto se ríe tanto que le da un paro cardiorrespiratorio.",  
"tags": \["\#pitch\_high"\],  
"opciones": \[  
{ "texto": "Tratar de reanimarlo", "destino": "pagina\_60" },  
{ "texto": "Robarle la billetera y huir", "destino": "pagina\_61" }  
\]  
},  
"pagina\_60": {  
"texto": "Le haces RCP al ritmo de 'Stayin' Alive'. Jacinto revive y te regala un frasco con 'polvo de estrellas'. Sumas CLAVE C \= 20.",  
"metadata": { "set\_variable": { "clave\_c": 20 } },  
"tags": \["\#play\_sfx:disco"\],  
"opciones": \[  
{ "texto": "Ir a la fiesta de los Chemical Brothers", "destino": "pagina\_120" }  
\]  
},  
"pagina\_115": {  
"texto": "El sobre es una invitación VIP para una fiesta en el Planetario con los Chemical Brothers. Dice que debes llevar 'sustancias' y un colador.",  
"tags": \["\#bg:sobre", "\#play\_sfx:invitacion"\],  
"opciones": \[  
{ "texto": "Ir a la fiesta de una", "destino": "pagina\_120" },  
{ "texto": "Llamar a tu tía para ver si tiene un colador", "destino": "pagina\_119" }  
\]  
},  
"pagina\_120": {  
"texto": "En el Planetario el ambiente está pesadísimo. Los Chemical Brothers están mezclando música con una licuadora llena de tuercas.",  
"tags": \["\#flash\_multi", "\#shake", "\#bg:planetario"\],  
"opciones": \[  
{ "texto": "Tomar el trago sin preguntar", "destino": "pagina\_125" },  
{ "texto": "Preguntar si tienen una Sprite", "destino": "pagina\_130" }  
\]  
},  
"pagina\_125": {  
"texto": "El trago sabe a detergente y gloria. Te conviertes en el alma de la fiesta. FIN.",  
"tags": \["\#play\_sfx:victory"\],  
"opciones": \[\]  
}  
}  
}