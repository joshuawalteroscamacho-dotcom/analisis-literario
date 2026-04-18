import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   ANÁLISIS — Plataforma de análisis crítico literario
   
   ESTRUCTURA DEL CÓDIGO (para que puedas modificarlo):
   
   1) DATOS — los libros, las preguntas, las preguntas de debate
   2) ESTILOS GLOBALES (CSS)
   3) COMPONENTES PEQUEÑOS reutilizables (botón, chip, etc.)
   4) COMPONENTE PRINCIPAL App — maneja qué pantalla se muestra
   5) PANTALLAS — Home, Desafíos, Sesión de desafío, Debates, Perfil
   
   PALETA EDITORIAL LITERARIA:
   - papel   #f5efe4  (fondo crema)
   - tinta   #1a1613  (texto, casi negro cálido)
   - vino    #7a1f2b  (acento principal)
   - sepia   #a0896b  (detalles, bordes)
   - marfil  #faf6ec  (tarjetas)
   ═══════════════════════════════════════════════════════════════════ */

/* ───────────────── 1) DATOS DE LOS LIBROS ───────────────── */
// Cada libro tiene: identificador, título, autor, año, género, una frase
// descriptiva (tagline) y dos listas:
//   - questions:      las preguntas de la trivia de análisis crítico
//   - debatePrompts:  las preguntas abiertas estilo Kialo para debatir

const BOOKS = [
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "Distopía política",
    tagline: "El Gran Hermano te observa.",
    questions: [
      {
        mode: "critical",
        concept: "Poder simbólico",
        text: "¿Por qué el Gran Hermano nunca aparece físicamente en la novela?",
        options: [
          "Es una figura mítica: como idea no puede morir, como persona sí",
          "Está administrando el Imperio de Oceanía",
          "Orwell quería reducir el número de personajes",
          "Fue eliminado antes de que comience la historia",
        ],
        correct: 0,
        feedback:
          "El Gran Hermano no necesita existir físicamente: su poder reside en ser un símbolo absoluto. Una persona real puede morir. Una idea no.",
      },
      {
        mode: "highlight",
        text: "Subraya la frase que captura la alienación total del individuo:",
        fragment:
          "No existía nada propio, a excepción de unos cuantos centímetros cúbicos dentro del cráneo. Winston sabía que el pensamiento era lo único que el Partido no podía controlar aún, aunque lo intentaba cada segundo del día.",
        target: "No existía nada propio",
        feedback:
          "La abolición de la propiedad se extiende hasta el yo mismo. Los centímetros cúbicos del cráneo son el último territorio de resistencia.",
      },
      {
        mode: "complete",
        concept: "Doblepiensa",
        text: "Completa el lema del Partido:",
        before: "LA GUERRA ES LA PAZ\nLA LIBERTAD ES LA",
        after: "\nLA IGNORANCIA ES LA FUERZA",
        options: ["ESCLAVITUD", "FELICIDAD", "MENTIRA", "MUERTE"],
        correct: 0,
        feedback:
          "'La Libertad es la Esclavitud' invierte el significado hasta que la sumisión parezca liberación. Es la doblepiensa aplicada al lenguaje público.",
      },
      {
        mode: "context",
        text: "¿Qué revela Winston sobre el control del pasado?",
        fragment:
          "El pasado no solo se ha cambiado, sino que ha sido destruido. ¿Cómo puedes establecer el mayor de los hechos cuando no queda ni siquiera un registro fuera de tu propia memoria?",
        options: [
          "Winston tiene problemas personales de memoria",
          "El control del pasado equivale al control total de la realidad",
          "Los archivos del Partido son simplemente ineficientes",
          "La gente en Oceanía era naturalmente olvidadiza",
        ],
        correct: 1,
        feedback:
          "Quien controla el pasado controla el presente. Sin memoria colectiva, no hay base material para la resistencia.",
      },
      {
        mode: "critical",
        concept: "Naturaleza del poder",
        text: "¿Qué distingue filosóficamente al Partido de otros totalitarismos según O'Brien?",
        options: [
          "Usa tecnología más avanzada para vigilar",
          "Busca el poder puro y exige amor genuino, no solo obediencia",
          "Permite más libertad económica que otros sistemas",
          "Tiene un enemigo externo real que justifica sus medidas",
        ],
        correct: 1,
        feedback:
          "Los totalitarismos anteriores perseguían objetivos externos. El Partido persigue solo el poder. Y no le basta la obediencia exterior: necesita el amor genuino del súbdito.",
      },
    ],
    debatePrompts: [
      {
        id: "1984-d1",
        question: "¿Winston Smith es un héroe o una víctima del sistema?",
        context:
          "Al final Winston ama al Gran Hermano. ¿Eso anula todo lo que hizo antes o lo vuelve más trágico?",
      },
      {
        id: "1984-d2",
        question:
          "¿Qué es más efectivo para controlar una sociedad: el miedo o el amor forzado?",
        context:
          "O'Brien dice que no basta la obediencia: necesitan amor genuino. Discute si eso lo hace más o menos temible que un régimen basado solo en miedo.",
      },
    ],
  },

  {
    id: "agua",
    title: "Como agua para chocolate",
    author: "Laura Esquivel",
    year: 1989,
    genre: "Realismo mágico",
    tagline: "Las emociones se sirven a la mesa.",
    questions: [
      {
        mode: "critical",
        concept: "Estructura narrativa",
        text: "¿Qué función cumple la receta al inicio de cada capítulo?",
        options: [
          "Es decorativa, para hacer el libro más extenso",
          "Anticipa temáticamente el estado emocional del capítulo",
          "Sirve para enseñar cocina mexicana al lector",
          "Es referencia autobiográfica de la autora",
        ],
        correct: 1,
        feedback:
          "Cada receta es una obertura narrativa. Los ingredientes y transformaciones espejean el estado emocional de Tita.",
      },
      {
        mode: "highlight",
        text: "Subraya la frase que ilustra la transmisión física de emociones:",
        fragment:
          "Tita sabía que según las leyes antiguas de la alquimia de la cocina, quien preparara los alimentos con amor transmitía ese amor a los comensales, y que ese día, al hervir sus lágrimas con la masa del pastel de bodas, había inoculado en todos los invitados una nostalgia sin remedio.",
        target: "había inoculado en todos los invitados una nostalgia sin remedio",
        feedback:
          "'Inoculado' es clave: el dolor de Tita es literalmente infeccioso. Esquivel trata lo mágico con seriedad científica.",
      },
      {
        mode: "context",
        text: "¿Qué critica Esquivel a través de la tradición que condena a Tita?",
        fragment:
          "La única hija que se quedaría soltera para cuidar a su madre sería la menor. Así había sido siempre y así sería.",
        options: [
          "Una crítica personal a Mamá Elena como individuo",
          "Cómo las estructuras patriarcales son perpetuadas por las propias mujeres",
          "Una celebración de las tradiciones familiares mexicanas",
          "Una crítica al sistema legal mexicano de la época",
        ],
        correct: 1,
        feedback:
          "La tradición la perpetúa una mujer sobre otra. Los mecanismos de opresión son internalizados por las víctimas.",
      },
      {
        mode: "critical",
        concept: "Cocina y poder",
        text: "¿Por qué la cocina es espacio de PODER para Tita?",
        options: [
          "Porque en la cocina nadie la vigila",
          "Porque sus emociones transmitidas a través de los alimentos afectan realmente a todos",
          "Porque aprende técnicas que la hacen económicamente independiente",
          "Porque Mamá Elena no entra nunca a la cocina",
        ],
        correct: 1,
        feedback:
          "En todos los demás aspectos Tita carece de agencia. En la cocina, sus emociones se convierten en fuerzas reales que afectan físicamente a todos.",
      },
    ],
    debatePrompts: [
      {
        id: "agua-d1",
        question: "¿Pedro es víctima del sistema o cómplice del sufrimiento de Rosaura?",
        context:
          "Se casa con Rosaura sabiendo que no la ama, solo para estar cerca de Tita. ¿Puede ser víctima y agente de sufrimiento al mismo tiempo?",
      },
      {
        id: "agua-d2",
        question: "¿La cocina es la prisión de Tita o su único espacio de libertad?",
        context:
          "Argumenta a favor o en contra: el mismo espacio puede ser opresivo y liberador simultáneamente.",
      },
    ],
  },

  {
    id: "granja",
    title: "Rebelión en la granja",
    author: "George Orwell",
    year: 1945,
    genre: "Fábula política",
    tagline: "Todos son iguales. Algunos más que otros.",
    questions: [
      {
        mode: "highlight",
        text: "Subraya la frase que representa la corrupción total de los ideales:",
        fragment:
          "Todos los animales son iguales, pero algunos animales son más iguales que otros.",
        target: "algunos animales son más iguales que otros",
        feedback:
          "La paradoja 'más iguales' destruye el concepto de igualdad desde adentro. La revolución no cambió el sistema: simplemente reemplazó a los opresores.",
      },
      {
        mode: "critical",
        concept: "Corrupción del poder",
        text: "¿Por qué los cerdos caminan en dos patas al final?",
        options: [
          "Para mostrar superación evolutiva",
          "Para simbolizar que adoptaron las características que combatían",
          "Para crear una escena cómica",
          "Para mostrar que son la especie más inteligente",
        ],
        correct: 1,
        feedback:
          "Los animales ya no pueden distinguir cerdos de humanos. El problema no era quién gobernaba sino la estructura del poder mismo.",
      },
      {
        mode: "complete",
        concept: "Reescritura gradual",
        text: "Completa el mandamiento modificado para justificar el alcohol:",
        before: "Ningún animal beberá alcohol",
        after: ".",
        options: ["en exceso", "jamás", "sin permiso", "públicamente"],
        correct: 0,
        feedback:
          "La adición de 'en exceso' convierte una prohibición absoluta en una regulación que los cerdos pueden manejar.",
      },
      {
        mode: "context",
        text: "¿Qué revela el fragmento sobre Squealer?",
        fragment:
          "Squealer podía convertir el negro en blanco. Siempre había una explicación, siempre había estadísticas, siempre había una razón por la que lo que parecía una traición era en realidad necesario para la seguridad de la granja.",
        options: [
          "Squealer es un científico que estudia el comportamiento",
          "Squealer representa la propaganda que legitima cada abuso del poder",
          "Squealer actúa de buena fe genuinamente",
          "Squealer es simplemente el más inteligente",
        ],
        correct: 1,
        feedback:
          "Squealer es la propaganda institucionalizada. Todo régimen totalitario necesita su Squealer.",
      },
    ],
    debatePrompts: [
      {
        id: "granja-d1",
        question: "¿Boxer era virtuoso o solo ingenuo?",
        context:
          "Trabaja hasta morir repitiendo 'Napoleón siempre tiene razón'. ¿Su lealtad absoluta es admirable o es parte del problema?",
      },
      {
        id: "granja-d2",
        question:
          "Si Snowball hubiera ganado en vez de Napoleón, ¿la granja hubiera terminado diferente?",
        context:
          "Piensa si el problema era Napoleón específicamente o la estructura de poder que cualquier cerdo heredaba.",
      },
    ],
  },

  {
    id: "ceguera",
    title: "Ensayo sobre la ceguera",
    author: "José Saramago",
    year: 1995,
    genre: "Ficción filosófica",
    tagline: "¿Qué queda del ser humano cuando desaparece la vista?",
    questions: [
      {
        mode: "critical",
        concept: "Universalización",
        text: "¿Por qué Saramago no da nombres a sus personajes?",
        options: [
          "Para simplificar la escritura",
          "Para universalizar: cualquier sociedad puede caer en esa barbarie",
          "Porque está basada en hechos reales y debía proteger identidades",
          "Por una decisión editorial",
        ],
        correct: 1,
        feedback:
          "Al usar roles genéricos, Saramago elimina la distancia cómoda. No es la tragedia de individuos específicos: es lo que puede pasarle a cualquier sociedad.",
      },
      {
        mode: "highlight",
        text: "Subraya la frase que expresa la tesis filosófica central:",
        fragment:
          "Si antes de cegar los hombres eran capaces de hacer cuanto hicieron, lo que vemos ahora no es un resultado de la ceguera, lo que ya estaba aquí era la verdadera ceguera. Quizás la ceguera blanca es simplemente el revelador de una oscuridad interior que siempre existió.",
        target: "lo que ya estaba aquí era la verdadera ceguera",
        feedback:
          "La epidemia no introdujo la maldad: la reveló. Un espejo no crea lo que muestra.",
      },
      {
        mode: "context",
        text: "¿Qué representa la condición de la mujer del médico?",
        fragment:
          "La mujer del médico vio cómo el mundo se desmoronaba pero nunca reveló su secreto. Cargó con la lucidez como se carga con una enfermedad incurable.",
        options: [
          "Un privilegio que le permite escapar del sufrimiento",
          "La carga insoportable de mantener la conciencia moral cuando todos la han perdido",
          "Que ella causó la epidemia y tiene inmunidad",
          "Un error narrativo sin resolución",
        ],
        correct: 1,
        feedback:
          "Su vista no es privilegio sino condena. Debe ver todo el horror. La conciencia moral plena en un mundo sin conciencia no es liberadora: es una responsabilidad aplastante.",
      },
    ],
    debatePrompts: [
      {
        id: "ceguera-d1",
        question: "¿La sociedad colapsó por la ceguera o la ceguera solo reveló lo que ya era?",
        context:
          "Saramago sugiere que la barbarie ya estaba ahí, oculta. ¿Estás de acuerdo o crees que las instituciones sí transforman a las personas?",
      },
    ],
  },

  {
    id: "maus",
    title: "Maus",
    author: "Art Spiegelman",
    year: 1991,
    genre: "Novela gráfica",
    tagline: "Una historia que no debería existir pero debe contarse.",
    questions: [
      {
        mode: "critical",
        concept: "Metáfora visual",
        text: "¿Por qué Spiegelman representa a judíos como ratones y a nazis como gatos?",
        options: [
          "Para hacer el libro accesible para niños",
          "Invierte la propaganda nazi que los comparaba con plagas",
          "Porque la editorial exigió que no usara representaciones humanas",
          "Fue una decisión arbitraria sin intención simbólica",
        ],
        correct: 1,
        feedback:
          "Spiegelman toma la comparación de la propaganda nazi literal y la convierte en el punto de vista de la narración. Confronta al lector con la absurdidad de esa lógica.",
      },
      {
        mode: "highlight",
        text: "Subraya la frase que muestra la honestidad metanarrativa de Spiegelman:",
        fragment:
          "Y entonces yo pensé: ¿pero es que realmente mi padre recuerda así? ¿O está contando lo que cree que recuerda? ¿O lo que quiere que yo recuerde? ¿Y qué estoy yo cambiando al dibujarlo?",
        target: "¿Y qué estoy yo cambiando al dibujarlo?",
        feedback:
          "Esta pregunta apunta a la responsabilidad del creador: no solo cuestiona la memoria del padre sino lo que Spiegelman mismo hace al transformarla en dibujo.",
      },
      {
        mode: "critical",
        concept: "Humanización del trauma",
        text: "¿Por qué Spiegelman muestra a Vladek con defectos como tacañería y racismo?",
        options: [
          "Para criticar a las víctimas del Holocausto como grupo",
          "Para humanizarlos: son personas complejas marcadas por el trauma, no santos",
          "Porque tenía una mala relación personal con su padre",
          "Para hacer la historia más dramática",
        ],
        correct: 1,
        feedback:
          "Convertir a los supervivientes en santos porque sufrieron es en sí mismo deshumanizarlos. Vladek es difícil Y alguien que sobrevivió a Auschwitz: ambas cosas coexisten.",
      },
    ],
    debatePrompts: [
      {
        id: "maus-d1",
        question:
          "¿Tiene derecho un artista a ganar premios y dinero contando el sufrimiento ajeno?",
        context:
          "Spiegelman se dibuja a sí mismo sobre una pila de cadáveres tras ganar el Pulitzer. No responde la pregunta: solo la formula.",
      },
    ],
  },

  {
    id: "casa",
    title: "La casa de los espíritus",
    author: "Isabel Allende",
    year: 1982,
    genre: "Realismo mágico político",
    tagline: "Cuatro generaciones de mujeres que desafían el tiempo.",
    questions: [
      {
        mode: "critical",
        concept: "Estructura narrativa",
        text: "¿Por qué la novela tiene dos narradores que alternan?",
        options: [
          "Para crear confusión narrativa que refleja el caos político",
          "Para confrontar la perspectiva del patriarca con la de su víctima/descendiente",
          "Para que el lector tenga más opciones de identificación",
          "Porque Allende no pudo decidir un solo punto de vista",
        ],
        correct: 1,
        feedback:
          "La doble narración confronta dos versiones: Esteban desde el poder, Alba desde la consecuencia. Juntas revelan lo que ninguna podría mostrar sola.",
      },
      {
        mode: "highlight",
        text: "Subraya la frase que muestra la función política de los diarios de Clara:",
        fragment:
          "Los cuadernos de anotar la vida que Clara llevó desde niña eran la prueba de que aquello había ocurrido. No estaban escritos para ser publicados, sino para que nadie pudiera borrar lo que había pasado.",
        target: "para que nadie pudiera borrar lo que había pasado",
        feedback:
          "La escritura privada de Clara tiene función política: preservar una versión de la historia que los poderes oficiales no puedan eliminar.",
      },
      {
        mode: "context",
        text: "¿Qué conecta la violación de la campesina con la tortura de Alba?",
        fragment:
          "Esteban García era nieto de Pancha García, la campesina que el patrón había tomado a la fuerza. El odio que sentía por los Trueba venía de ahí, de esa sangre mezclada que nadie reconoció.",
        options: [
          "Es una coincidencia de nombres sin intención narrativa",
          "Allende muestra que la violencia privada e impune produce la violencia pública institucional",
          "Demuestra que el mal es hereditario y biológico",
          "Sugiere que la dictadura fue responsabilidad de las clases bajas",
        ],
        correct: 1,
        feedback:
          "Esteban García cierra el círculo: producto de la violencia privada de Trueba, ejerce la violencia institucional del Estado sobre la nieta del mismo Trueba.",
      },
    ],
    debatePrompts: [
      {
        id: "casa-d1",
        question: "¿Esteban Trueba es un monstruo o un hombre de su tiempo?",
        context:
          "Viola, domina, apoya el golpe. Pero también ama a Clara, cuida a Alba, se arrepiente al final. ¿Puede existir compasión por un personaje así?",
      },
    ],
  },
];

/* ───────────────── 2) ESTILOS GLOBALES ─────────────────
   Toda la apariencia visual vive aquí. Si quieres cambiar colores
   o fuentes, modifica las variables CSS al inicio.
*/
const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap');

:root {
  --papel:   #f5efe4;
  --marfil:  #faf6ec;
  --tinta:   #1a1613;
  --tinta2:  #4a3f37;
  --vino:    #7a1f2b;
  --vinoB:   #5c141d;
  --sepia:   #a0896b;
  --sepiaL:  #d9c9a8;
  --linea:   #e6dcc7;
  --verde:   #4a6a3d;
  --rojo:    #a32d2d;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--papel);
  color: var(--tinta);
  -webkit-font-smoothing: antialiased;
}

/* Efecto papel: textura muy sutil para que no se vea plano digital */
.paper-bg {
  background:
    radial-gradient(ellipse at top, rgba(160, 137, 107, 0.08), transparent 60%),
    var(--papel);
}

.serif { font-family: 'Fraunces', 'Georgia', serif; }
.serif-italic { font-family: 'Fraunces', serif; font-style: italic; }

::selection { background: var(--vino); color: var(--marfil); }

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--sepiaL); border-radius: 3px; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes inkDrop { 0% { opacity: 0; transform: scale(0.94); } 60% { transform: scale(1.02); } 100% { opacity: 1; transform: scale(1); } }

.btn-primary {
  background: var(--vino);
  color: var(--marfil);
  border: none;
  padding: 12px 18px;
  border-radius: 2px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover { background: var(--vinoB); }
.btn-primary:disabled { background: var(--sepia); cursor: not-allowed; }

.btn-ghost {
  background: transparent;
  color: var(--tinta);
  border: 1px solid var(--sepia);
  padding: 11px 18px;
  border-radius: 2px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-ghost:hover { background: var(--linea); }

.chip {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid var(--sepia);
  border-radius: 2px;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--tinta2);
  background: transparent;
}

.rule {
  border-top: 1px solid var(--linea);
  margin: 20px 0;
}

.rule-vino {
  display: block;
  width: 40px;
  height: 2px;
  background: var(--vino);
  margin: 12px 0;
}

/* Selección de texto para el modo subrayar */
.highlight-fragment {
  user-select: text;
  cursor: text;
  line-height: 2;
}
.highlight-fragment::selection { background: #f5d76e; color: var(--tinta); }
`;

/* ───────────────── 3) COMPONENTES PEQUEÑOS ───────────────── */

// Encabezado que aparece en la parte superior de cada pantalla
// salvo la Home. Muestra un botón "volver" y el título en serif.
function TopBar({ onBack, title, subtitle, rightSlot }) {
  return (
    <div
      style={{
        padding: "18px 20px",
        background: "var(--marfil)",
        borderBottom: "1px solid var(--linea)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          fontSize: 13,
          color: "var(--tinta2)",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          padding: 0,
        }}
      >
        ← Volver
      </button>
      <div style={{ flex: 1, textAlign: "center" }}>
        <div
          className="serif"
          style={{ fontSize: 16, fontWeight: 500, color: "var(--tinta)" }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "var(--sepia)",
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div style={{ width: rightSlot ? "auto" : 60 }}>{rightSlot}</div>
    </div>
  );
}

// Barra de navegación inferior (móvil) / superior (PC).
// Tres secciones: Libros, Debates, Perfil.
function NavBar({ current, onChange, streak }) {
  const items = [
    { id: "home", label: "Biblioteca", icon: "❦" },
    { id: "debates", label: "Debates", icon: "❝" },
    { id: "profile", label: "Perfil", icon: "✦" },
  ];
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        background: "var(--marfil)",
        borderTop: "1px solid var(--linea)",
        display: "flex",
        zIndex: 50,
      }}
    >
      {items.map((it) => {
        const active = current === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            style={{
              flex: 1,
              padding: "12px 8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: active ? "var(--vino)" : "var(--tinta2)",
              borderTop: active ? "2px solid var(--vino)" : "2px solid transparent",
              marginTop: -1,
            }}
          >
            <span
              className="serif"
              style={{ fontSize: 18, lineHeight: 1 }}
            >
              {it.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontWeight: active ? 600 : 400,
              }}
            >
              {it.label}
            </span>
            {it.id === "profile" && streak > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  marginLeft: 28,
                  background: "var(--vino)",
                  color: "var(--marfil)",
                  borderRadius: 8,
                  fontSize: 9,
                  padding: "1px 5px",
                  letterSpacing: 0,
                }}
              >
                {streak}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────── 4) COMPONENTE PRINCIPAL ───────────────── */

export default function App() {
  // Estado de navegación: qué pantalla se ve ahora
  // Posibles valores: "home", "book", "challenge", "debates", "debate", "profile"
  const [screen, setScreen] = useState("home");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedDebate, setSelectedDebate] = useState(null);

  // Racha: número de días consecutivos que el usuario practica.
  // Como no persistimos datos, empieza en 0 y sube si el usuario completa
  // un desafío. Esto es una simulación — en una versión futura se guardaría
  // la fecha del último desafío y se compararía con la fecha actual.
  const [streak, setStreak] = useState(0);

  // Total de puntos ganados en la sesión (sumamos 10 por cada respuesta correcta)
  const [points, setPoints] = useState(0);

  // Libros que el usuario ya completó al menos una vez (para mostrar en el perfil)
  const [completedBooks, setCompletedBooks] = useState([]);

  // Historial de debates en los que el usuario dejó su argumento
  const [debateContributions, setDebateContributions] = useState([]);

  // Función auxiliar: cuando el usuario completa un desafío, actualizamos estado global
  function onChallengeComplete(bookId, earnedPoints) {
    setPoints((p) => p + earnedPoints);
    setStreak((s) => s + 1);
    if (!completedBooks.includes(bookId)) {
      setCompletedBooks((cb) => [...cb, bookId]);
    }
  }

  function onDebateContribution(debateId, argument) {
    setDebateContributions((prev) => [
      ...prev,
      { id: debateId, argument, date: Date.now() },
    ]);
    setPoints((p) => p + 5);
  }

  // Router simple: renderiza una pantalla u otra según "screen"
  return (
    <div
      className="paper-bg"
      style={{
        maxWidth: 480,
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <style>{GLOBAL_STYLES}</style>

      <div style={{ flex: 1, overflow: "auto" }}>
        {screen === "home" && (
          <HomeScreen
            onPickBook={(b) => {
              setSelectedBook(b);
              setScreen("book");
            }}
          />
        )}

        {screen === "book" && selectedBook && (
          <BookScreen
            book={selectedBook}
            onBack={() => setScreen("home")}
            onStartChallenge={() => setScreen("challenge")}
            onOpenDebate={(d) => {
              setSelectedDebate(d);
              setScreen("debate");
            }}
          />
        )}

        {screen === "challenge" && selectedBook && (
          <ChallengeScreen
            book={selectedBook}
            onBack={() => setScreen("book")}
            onComplete={(pts) => {
              onChallengeComplete(selectedBook.id, pts);
            }}
          />
        )}

        {screen === "debates" && (
          <DebatesScreen
            onOpenDebate={(debate, book) => {
              setSelectedBook(book);
              setSelectedDebate(debate);
              setScreen("debate");
            }}
            contributions={debateContributions}
          />
        )}

        {screen === "debate" && selectedDebate && selectedBook && (
          <DebateScreen
            book={selectedBook}
            debate={selectedDebate}
            onBack={() => setScreen("debates")}
            onContribute={onDebateContribution}
            existingArgument={debateContributions.find(
              (c) => c.id === selectedDebate.id
            )}
          />
        )}

        {screen === "profile" && (
          <ProfileScreen
            streak={streak}
            points={points}
            completedBooks={completedBooks}
            debateContributions={debateContributions}
          />
        )}
      </div>

      {/* Navegación inferior: solo se muestra en las pantallas principales */}
      {["home", "debates", "profile"].includes(screen) && (
        <NavBar
          current={screen}
          onChange={setScreen}
          streak={streak}
        />
      )}
    </div>
  );
}

/* ───────────────── 5) PANTALLAS ───────────────── */

/* ═══════ HOME: biblioteca ═══════ */
function HomeScreen({ onPickBook }) {
  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      {/* Encabezado editorial */}
      <div style={{ padding: "40px 24px 28px" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: "var(--sepia)",
            textTransform: "uppercase",
          }}
        >
          Año I · Número 01
        </div>
        <span className="rule-vino" />
        <h1
          className="serif"
          style={{
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1,
            color: "var(--tinta)",
            letterSpacing: "-0.02em",
          }}
        >
          Análisis
        </h1>
        <div
          className="serif-italic"
          style={{
            fontSize: 16,
            marginTop: 4,
            color: "var(--tinta2)",
            fontStyle: "italic",
          }}
        >
          la lectura como pensamiento
        </div>
        <p
          style={{
            fontSize: 13,
            marginTop: 20,
            color: "var(--tinta2)",
            lineHeight: 1.7,
            maxWidth: 380,
          }}
        >
          La primera plataforma dedicada exclusivamente al análisis crítico
          literario en español. No es un examen. No hay presión. Solo leer,
          pensar, y practicar cómo mirar un texto.
        </p>
      </div>

      {/* Separador tipográfico */}
      <div
        style={{
          padding: "0 24px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "var(--sepia)",
          }}
        >
          <span
            style={{
              flex: 1,
              height: 1,
              background: "var(--linea)",
            }}
          />
          <span
            className="serif-italic"
            style={{ fontSize: 13, fontStyle: "italic", color: "var(--tinta2)" }}
          >
            Biblioteca
          </span>
          <span
            style={{
              flex: 1,
              height: 1,
              background: "var(--linea)",
            }}
          />
        </div>
      </div>

      {/* Tarjetas de libros */}
      <div style={{ padding: "0 20px 24px" }}>
        {BOOKS.map((book, i) => (
          <BookCard
            key={book.id}
            book={book}
            index={i}
            onClick={() => onPickBook(book)}
          />
        ))}
      </div>

      {/* Pie editorial */}
      <div
        style={{
          padding: "20px 24px 32px",
          textAlign: "center",
          color: "var(--sepia)",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Proyecto ExpoITC · Especialización en Sistemas
      </div>
    </div>
  );
}

// Tarjeta de un libro en la biblioteca
function BookCard({ book, index, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: 16,
        padding: "20px 22px",
        background: "var(--marfil)",
        border: "1px solid var(--linea)",
        borderRadius: 2,
        cursor: "pointer",
        animation: `fadeUp 0.5s ${index * 0.05}s both`,
        position: "relative",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--vino)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--linea)")}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: "var(--sepia)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {book.genre} · {book.year}
      </div>
      <h3
        className="serif"
        style={{
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.15,
          color: "var(--tinta)",
          letterSpacing: "-0.01em",
          marginBottom: 4,
        }}
      >
        {book.title}
      </h3>
      <div
        className="serif-italic"
        style={{
          fontSize: 13,
          color: "var(--tinta2)",
          fontStyle: "italic",
          marginBottom: 12,
        }}
      >
        {book.author}
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--tinta2)",
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        {book.tagline}
      </p>
      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 10,
          letterSpacing: 1,
          color: "var(--sepia)",
          textTransform: "uppercase",
        }}
      >
        <span>{book.questions.length} preguntas</span>
        <span>·</span>
        <span>{book.debatePrompts.length} debates</span>
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE UN LIBRO ═══════ */
// Muestra el detalle del libro y permite entrar a los desafíos o debates.
function BookScreen({ book, onBack, onStartChallenge, onOpenDebate }) {
  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <TopBar onBack={onBack} title={book.title} subtitle={book.author} />

      <div style={{ padding: "28px 24px" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2.5,
            color: "var(--sepia)",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {book.genre} · {book.year}
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 36,
            fontWeight: 900,
            lineHeight: 1,
            color: "var(--tinta)",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          {book.title}
        </h1>
        <div
          className="serif-italic"
          style={{ fontSize: 16, color: "var(--tinta2)", fontStyle: "italic" }}
        >
          {book.author}
        </div>
        <span className="rule-vino" />
        <p
          className="serif"
          style={{
            fontSize: 17,
            color: "var(--tinta)",
            lineHeight: 1.5,
            fontStyle: "italic",
            marginTop: 14,
          }}
        >
          "{book.tagline}"
        </p>

        {/* Bloque de acción: empezar desafíos */}
        <div
          style={{
            marginTop: 36,
            padding: "22px 20px",
            background: "var(--marfil)",
            border: "1px solid var(--linea)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "var(--sepia)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Desafíos
          </div>
          <h3
            className="serif"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--tinta)",
              marginBottom: 8,
            }}
          >
            Practica análisis crítico
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--tinta2)",
              lineHeight: 1.7,
              marginBottom: 16,
            }}
          >
            {book.questions.length} preguntas de interpretación, subrayado y
            contexto. Sin tiempo. Sin nota. Solo pensar.
          </p>
          <button className="btn-primary" onClick={onStartChallenge}>
            Empezar →
          </button>
        </div>

        {/* Bloque de debates del libro */}
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "var(--sepia)",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Preguntas abiertas
          </div>
          {book.debatePrompts.map((dp) => (
            <div
              key={dp.id}
              onClick={() => onOpenDebate(dp)}
              style={{
                padding: "16px 18px",
                background: "var(--marfil)",
                border: "1px solid var(--linea)",
                marginBottom: 10,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--vino)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--linea)")}
            >
              <div
                className="serif"
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--tinta)",
                  lineHeight: 1.4,
                }}
              >
                ❝ {dp.question}
              </div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: "var(--vino)",
                  textTransform: "uppercase",
                  marginTop: 8,
                }}
              >
                Argumentar →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE DESAFÍO (antes "trivia") ═══════
   Esta es la sesión de preguntas. Importante: en lugar de decir
   "examen" o "trivia" usamos "desafío" y el tono es didáctico —
   el feedback aparece siempre, sin sensación de nota.
*/
function ChallengeScreen({ book, onBack, onComplete }) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState(null); // para selección múltiple
  const [highlightText, setHighlightText] = useState(""); // para modo subrayar
  const [completePick, setCompletePick] = useState(null); // para completar
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = book.questions[index];
  const total = book.questions.length;

  // Determinar si la respuesta actual es correcta
  function isCorrect() {
    if (q.mode === "highlight") {
      if (!highlightText) return false;
      const h = highlightText.toLowerCase();
      const t = q.target.toLowerCase();
      return h.includes(t) || t.includes(h);
    }
    if (q.mode === "complete") return completePick === q.correct;
    return chosen === q.correct; // critical y context
  }

  // El usuario confirma una respuesta
  function submitAnswer() {
    if (answered) return;
    setAnswered(true);
    if (isCorrect()) setCorrectCount((c) => c + 1);
  }

  // Pasar a la siguiente pregunta, o terminar
  function next() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setAnswered(false);
      setChosen(null);
      setHighlightText("");
      setCompletePick(null);
    } else {
      // Terminamos. Avisar al padre con los puntos ganados.
      onComplete(correctCount * 10);
      setFinished(true);
    }
  }

  // Captura de selección de texto para modo subrayar
  function captureSelection() {
    const s = window.getSelection()?.toString().trim();
    if (s && s.length > 2) setHighlightText(s);
  }

  // PANTALLA FINAL
  if (finished) {
    const percent = Math.round((correctCount / total) * 100);
    return (
      <div style={{ animation: "fadeIn 0.4s" }}>
        <TopBar onBack={onBack} title="Desafío completado" />
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 3,
              color: "var(--sepia)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Tu lectura
          </div>
          <div
            className="serif"
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "var(--vino)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {correctCount}/{total}
          </div>
          <div
            className="serif-italic"
            style={{
              fontSize: 16,
              fontStyle: "italic",
              color: "var(--tinta2)",
              marginTop: 8,
            }}
          >
            {percent >= 80
              ? "Lees con atención crítica."
              : percent >= 50
              ? "Vas por buen camino."
              : "Cada pregunta enseña algo. Vuelve a intentarlo."}
          </div>

          <div
            style={{
              marginTop: 36,
              padding: "20px",
              background: "var(--marfil)",
              border: "1px solid var(--linea)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "var(--sepia)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Ganaste
            </div>
            <div
              className="serif"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--tinta)",
              }}
            >
              +{correctCount * 10} puntos
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--tinta2)",
                marginTop: 4,
              }}
            >
              y sumaste un día a tu racha de lectura.
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ marginTop: 24, width: "100%" }}
            onClick={onBack}
          >
            Volver al libro
          </button>
        </div>
      </div>
    );
  }

  // MODO NORMAL
  return (
    <div>
      <TopBar
        onBack={onBack}
        title={book.title}
        subtitle={`Pregunta ${index + 1} de ${total}`}
      />

      {/* Barra de progreso muy delicada */}
      <div
        style={{
          height: 2,
          background: "var(--linea)",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "var(--vino)",
            width: `${((index + (answered ? 1 : 0)) / total) * 100}%`,
            transition: "width 0.4s",
          }}
        />
      </div>

      <div
        style={{ padding: "24px 22px 40px", animation: "fadeUp 0.3s" }}
        key={index}
      >
        {/* Etiqueta del tipo de pregunta */}
        <div style={{ marginBottom: 14 }}>
          <span className="chip">
            {q.mode === "critical" && "Análisis"}
            {q.mode === "highlight" && "Subrayar"}
            {q.mode === "complete" && "Completar"}
            {q.mode === "context" && "Contexto"}
          </span>
        </div>

        {/* Enunciado principal en serif — hace que se sienta como un texto de libro */}
        {q.concept && (
          <div
            className="serif-italic"
            style={{
              fontSize: 12,
              color: "var(--vino)",
              fontStyle: "italic",
              marginBottom: 6,
            }}
          >
            sobre {q.concept}
          </div>
        )}
        <h2
          className="serif"
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "var(--tinta)",
            lineHeight: 1.35,
            marginBottom: 22,
          }}
        >
          {q.text}
        </h2>

        {/* Fragmento del libro (si hay) */}
        {q.fragment && (
          <div
            className={q.mode === "highlight" ? "highlight-fragment" : ""}
            onMouseUp={q.mode === "highlight" ? captureSelection : undefined}
            onTouchEnd={q.mode === "highlight" ? captureSelection : undefined}
            style={{
              padding: "18px 20px",
              background: "var(--marfil)",
              borderLeft: "3px solid var(--vino)",
              marginBottom: 20,
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: 15,
              fontStyle: "italic",
              color: "var(--tinta2)",
              lineHeight: q.mode === "highlight" ? 2 : 1.65,
            }}
          >
            {q.fragment}
          </div>
        )}

        {/* Modo subrayar: mostrar lo que el usuario seleccionó */}
        {q.mode === "highlight" && highlightText && (
          <div
            style={{
              padding: "12px 14px",
              background: "#fdf4d1",
              borderLeft: "3px solid #c9a94d",
              marginBottom: 16,
              fontSize: 13,
              color: "var(--tinta2)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#8a6d1f",
                marginBottom: 4,
              }}
            >
              Tu subrayado
            </div>
            <span
              className="serif-italic"
              style={{ fontStyle: "italic" }}
            >
              "{highlightText}"
            </span>
          </div>
        )}

        {q.mode === "highlight" && !highlightText && !answered && (
          <div
            style={{
              textAlign: "center",
              color: "var(--sepia)",
              fontSize: 12,
              fontStyle: "italic",
              fontFamily: "Fraunces, serif",
              marginBottom: 16,
            }}
          >
            Mantén pulsado y selecciona con el dedo o el cursor
          </div>
        )}

        {/* Modo completar: muestra el texto con un hueco */}
        {q.mode === "complete" && (
          <div
            className="serif"
            style={{
              padding: "20px",
              background: "var(--marfil)",
              borderLeft: "3px solid var(--vino)",
              marginBottom: 18,
              fontSize: 17,
              lineHeight: 2,
              whiteSpace: "pre-line",
              color: "var(--tinta)",
              textAlign: "center",
            }}
          >
            {q.before}
            <span
              style={{
                display: "inline-block",
                minWidth: 110,
                padding: "0 12px",
                borderBottom: "2px solid var(--vino)",
                margin: "0 4px",
                color:
                  completePick !== null
                    ? completePick === q.correct && answered
                      ? "var(--verde)"
                      : answered
                      ? "var(--rojo)"
                      : "var(--vino)"
                    : "var(--sepia)",
                fontWeight: 700,
              }}
            >
              {completePick !== null ? q.options[completePick] : "_____"}
            </span>
            {q.after}
          </div>
        )}

        {/* Opciones para los modos críticos y contexto */}
        {(q.mode === "critical" || q.mode === "context") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              const isCorr = i === q.correct;
              const isPicked = chosen === i;
              let bg = "var(--marfil)";
              let border = "var(--linea)";
              let color = "var(--tinta)";
              if (answered) {
                if (isCorr) {
                  bg = "#e8f0e3";
                  border = "var(--verde)";
                  color = "var(--verde)";
                } else if (isPicked) {
                  bg = "#f6e6e3";
                  border = "var(--rojo)";
                  color = "var(--rojo)";
                } else {
                  color = "var(--sepia)";
                }
              } else if (isPicked) {
                border = "var(--vino)";
                bg = "#f9f2e9";
              }
              return (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => setChosen(i)}
                  style={{
                    padding: "14px 18px",
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 2,
                    color,
                    textAlign: "left",
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                    cursor: answered ? "default" : "pointer",
                    lineHeight: 1.5,
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <span
                    className="serif"
                    style={{
                      fontSize: 14,
                      color: "var(--sepia)",
                      fontWeight: 500,
                      minWidth: 16,
                    }}
                  >
                    {String.fromCharCode(97 + i)}.
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {answered && isCorr && (
                    <span style={{ color: "var(--verde)" }}>✓</span>
                  )}
                  {answered && isPicked && !isCorr && (
                    <span style={{ color: "var(--rojo)" }}>✗</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Opciones para modo completar */}
        {q.mode === "complete" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {q.options.map((opt, i) => {
              const isCorr = i === q.correct;
              const isPicked = completePick === i;
              let bg = "var(--marfil)";
              let border = "var(--linea)";
              let color = "var(--tinta)";
              if (answered) {
                if (isCorr) {
                  bg = "#e8f0e3";
                  border = "var(--verde)";
                  color = "var(--verde)";
                } else if (isPicked) {
                  bg = "#f6e6e3";
                  border = "var(--rojo)";
                  color = "var(--rojo)";
                }
              } else if (isPicked) {
                border = "var(--vino)";
                bg = "#f9f2e9";
              }
              return (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => setCompletePick(i)}
                  style={{
                    padding: "12px",
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 2,
                    color,
                    fontSize: 13,
                    fontFamily: "Fraunces, serif",
                    fontWeight: 500,
                    cursor: answered ? "default" : "pointer",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Botón confirmar (antes de contestar) */}
        {!answered && (
          <button
            className="btn-primary"
            disabled={
              (q.mode === "highlight" && !highlightText) ||
              (q.mode === "complete" && completePick === null) ||
              ((q.mode === "critical" || q.mode === "context") && chosen === null)
            }
            style={{ width: "100%", marginTop: 20 }}
            onClick={submitAnswer}
          >
            Confirmar respuesta
          </button>
        )}

        {/* Feedback después de contestar */}
        {answered && (
          <div
            style={{
              marginTop: 22,
              padding: "20px",
              background: "var(--marfil)",
              borderLeft: `3px solid ${
                isCorrect() ? "var(--verde)" : "var(--vino)"
              }`,
              animation: "inkDrop 0.4s",
            }}
          >
            <div
              className="serif-italic"
              style={{
                fontSize: 12,
                color: isCorrect() ? "var(--verde)" : "var(--vino)",
                fontStyle: "italic",
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              {isCorrect() ? "Bien leído." : "Hay otra lectura."}
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--tinta)",
                lineHeight: 1.7,
              }}
            >
              {q.feedback}
            </p>
            <button
              className="btn-primary"
              style={{ marginTop: 16, width: "100%" }}
              onClick={next}
            >
              {index + 1 < total ? "Siguiente pregunta →" : "Ver mi lectura →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE DEBATES (lista) ═══════
   Muestra todas las preguntas de debate de todos los libros.
   Inspirada en Kialo.edu: preguntas abiertas para argumentar.
*/
function DebatesScreen({ onOpenDebate, contributions }) {
  // Armamos una lista plana con todos los debates de todos los libros
  const allDebates = BOOKS.flatMap((book) =>
    book.debatePrompts.map((dp) => ({ ...dp, book }))
  );

  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      <div style={{ padding: "36px 24px 20px" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: "var(--sepia)",
            textTransform: "uppercase",
          }}
        >
          Sección 02
        </div>
        <span className="rule-vino" />
        <h1
          className="serif"
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "var(--tinta)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Debates
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--tinta2)",
            lineHeight: 1.7,
            marginTop: 14,
          }}
        >
          No hay respuesta correcta. Solo argumentos. Escribe tu lectura
          sobre cada pregunta, y luego compara con las que ya dejaron otros
          lectores.
        </p>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        {allDebates.map((d, i) => {
          const already = contributions.find((c) => c.id === d.id);
          return (
            <div
              key={d.id}
              onClick={() => onOpenDebate(d, d.book)}
              style={{
                padding: "20px 22px",
                background: "var(--marfil)",
                border: "1px solid var(--linea)",
                marginBottom: 12,
                cursor: "pointer",
                animation: `fadeUp 0.4s ${i * 0.04}s both`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--vino)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--linea)")}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 2,
                  color: "var(--sepia)",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {d.book.title} · {d.book.author}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--tinta)",
                  lineHeight: 1.3,
                  marginBottom: 10,
                }}
              >
                ❝ {d.question}
              </div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: already ? "var(--verde)" : "var(--vino)",
                  textTransform: "uppercase",
                }}
              >
                {already ? "Ya argumentaste · ver" : "Argumentar →"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE UN DEBATE ESPECÍFICO ═══════
   Aquí el usuario escribe su argumento. También ve argumentos de
   "otros lectores" — como no tenemos backend, son argumentos precargados
   que simulan una comunidad. Esto igual sirve para que el usuario vea
   perspectivas diferentes, que es el punto pedagógico real.
*/

// Argumentos precargados por cada debate, dividen entre "a favor" y "en contra"
// o entre posiciones. Están escritos a conciencia para mostrar argumentos
// reales, no rellenos.
const SEEDED_ARGUMENTS = {
  "1984-d1": [
    {
      side: "Víctima",
      author: "Mariana, 16",
      text: "Winston está condenado desde el inicio. El libro no es sobre si puede escapar sino sobre cómo el sistema garantiza que no lo haga. Todo lo que hace fue anticipado por O'Brien. Eso es ser víctima, no héroe.",
      likes: 24,
    },
    {
      side: "Héroe trágico",
      author: "David, 17",
      text: "Winston es héroe precisamente porque sabe que perderá y aun así intenta. Escribir el diario, amar a Julia, buscar la resistencia: son actos libres. Que al final lo rompan no los borra.",
      likes: 31,
    },
    {
      side: "Ninguno",
      author: "Lucía, 15",
      text: "Pensar en esos términos es una trampa del lector. Orwell no quiere que Winston sea ni héroe ni víctima sino un ejemplo: así es como se destruye a cualquier persona bajo ese sistema.",
      likes: 18,
    },
  ],
  "1984-d2": [
    {
      side: "Amor forzado",
      author: "Andrés, 16",
      text: "El miedo termina cuando termina la amenaza. El amor forzado convierte al oprimido en defensor del sistema. Por eso O'Brien necesita que Winston realmente ame al Gran Hermano: así el control dura para siempre.",
      likes: 29,
    },
    {
      side: "Miedo",
      author: "Camila, 17",
      text: "El amor forzado no existe en la realidad, solo en ficción. En el mundo real ningún régimen ha logrado lo que O'Brien describe. El miedo sí funciona en todos lados.",
      likes: 12,
    },
  ],
  "agua-d1": [
    {
      side: "Víctima",
      author: "Sofía, 16",
      text: "Pedro acepta el matrimonio que Mamá Elena le impone. La estructura no le deja espacio para decir no sin abandonar a Tita completamente. Su 'elección' está tan limitada como la de ellas.",
      likes: 15,
    },
    {
      side: "Cómplice",
      author: "Tomás, 17",
      text: "Pedro usa a Rosaura durante décadas como instrumento. Podría haber elegido irse, no volver nunca, no generar el sufrimiento. Eligió quedarse cerca de Tita sabiendo el costo para Rosaura. Eso es ser cómplice.",
      likes: 27,
    },
  ],
  "agua-d2": [
    {
      side: "Prisión",
      author: "Laura, 16",
      text: "La cocina es donde la mandan, no donde elige estar. Mamá Elena la confina ahí. Que encuentre algo de poder dentro no cambia que es una cárcel de la que nunca sale.",
      likes: 16,
    },
    {
      side: "Territorio",
      author: "Esteban, 17",
      text: "Tita transforma el espacio de opresión en espacio de poder real. Sus emociones cambian el cuerpo de los otros. Es lo contrario de una prisión: es el único lugar donde ella actúa sobre el mundo.",
      likes: 22,
    },
    {
      side: "Ambos",
      author: "Valeria, 16",
      text: "Esquivel escribe precisamente la paradoja: puede ser las dos cosas al mismo tiempo. No tenemos que elegir. Lo interesante es cómo un mismo espacio contiene confinamiento y creación.",
      likes: 30,
    },
  ],
  "granja-d1": [
    {
      side: "Virtuoso",
      author: "Nicolás, 15",
      text: "Boxer representa la nobleza del trabajador que cree en los ideales. Su error no es la virtud sino confiar en quienes no la merecen. Criticarlo es culpar a la víctima.",
      likes: 19,
    },
    {
      side: "Ingenuo",
      author: "Paula, 17",
      text: "'Napoleón siempre tiene razón' no es virtud, es renuncia a pensar. Orwell lo muestra como tragedia precisamente porque Boxer podría haber cuestionado y no lo hizo. La ingenuidad, en política, mata.",
      likes: 33,
    },
  ],
  "granja-d2": [
    {
      side: "Igual",
      author: "Mateo, 16",
      text: "Cualquier cerdo que tomara el poder usaría los mismos mecanismos: el control del alimento, la reescritura, la propaganda. Snowball mismo quería el molino. La estructura corrompe, no el individuo.",
      likes: 26,
    },
    {
      side: "Diferente",
      author: "Julia, 17",
      text: "Snowball creía en la educación del resto de los animales. Napoleón la bloqueó. Esa diferencia no es menor: sin educación distribuida, cualquier poder concentrado se corrompe. Con ella, es al menos posible resistir.",
      likes: 21,
    },
  ],
  "ceguera-d1": [
    {
      side: "Ya era",
      author: "Diego, 16",
      text: "Si el colapso se da en tres semanas, no hay forma de que se haya construido en tres semanas. Lo que emerge son patrones que ya estaban latentes. Las instituciones los disfrazaban, no los creaban.",
      likes: 28,
    },
    {
      side: "Las instituciones importan",
      author: "Ana, 17",
      text: "Esa lectura es muy pesimista. Las instituciones sí transforman: una persona criada con derechos piensa diferente a una criada sin ellos. Sin esa influencia durante siglos, la barbarie emergería distinto o no emergería.",
      likes: 22,
    },
  ],
  "maus-d1": [
    {
      side: "Sí, pero con honestidad",
      author: "Felipe, 17",
      text: "Es inevitable. Alguien va a contar estas historias, y esos 'alguien' merecen vivir de su trabajo. Lo que Spiegelman hace distinto es no esconder la pregunta: la dibuja a sí mismo encima de los cadáveres. Esa honestidad es la ética.",
      likes: 35,
    },
    {
      side: "No",
      author: "Daniela, 16",
      text: "Los sobrevivientes y sus familias deberían tener el derecho exclusivo a contar sus historias. Un artista externo, por bien intencionado que sea, está convirtiendo dolor ajeno en producto cultural.",
      likes: 17,
    },
    {
      side: "Es una pregunta imposible",
      author: "Santiago, 16",
      text: "No hay respuesta porque el bien (preservar la memoria) y el costo (lucrar con el dolor) son reales al mismo tiempo. Spiegelman hace bien en no responder: formular la pregunta es más honesto que resolverla.",
      likes: 29,
    },
  ],
  "casa-d1": [
    {
      side: "Monstruo",
      author: "Marco, 17",
      text: "Viola campesinas. Domina a Clara. Apoya el golpe que lleva a la tortura de su nieta. El hecho de que también sepa amar no lo redime: muchos monstruos históricos eran cariñosos con su familia cercana.",
      likes: 23,
    },
    {
      side: "Hombre de su tiempo",
      author: "Isabella, 16",
      text: "Las estructuras que lo formaron son reales. Allende no lo absuelve, lo complica. Juzgarlo desde hoy sin entender el sistema que lo produjo nos hace creer que somos inmunes a ese tipo de condicionamiento.",
      likes: 20,
    },
    {
      side: "Las dos cosas",
      author: "Rafael, 17",
      text: "Eso es lo que hace la novela interesante: Esteban es ambas cosas. La pregunta mal planteada nos obliga a elegir cuando Allende escribió precisamente para que no pudiéramos. Esa incomodidad es el punto.",
      likes: 27,
    },
  ],
};

function DebateScreen({ book, debate, onBack, onContribute, existingArgument }) {
  const [argument, setArgument] = useState(existingArgument?.argument || "");
  const [submitted, setSubmitted] = useState(!!existingArgument);

  const seeds = SEEDED_ARGUMENTS[debate.id] || [];

  function submit() {
    if (argument.trim().length < 20) return;
    onContribute(debate.id, argument.trim());
    setSubmitted(true);
  }

  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      <TopBar onBack={onBack} title="Debate" subtitle={book.title} />

      <div style={{ padding: "28px 24px" }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: 2,
            color: "var(--sepia)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {book.title} · {book.author}
        </div>

        <h1
          className="serif"
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--tinta)",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            marginBottom: 14,
          }}
        >
          ❝ {debate.question}
        </h1>

        <p
          className="serif-italic"
          style={{
            fontSize: 14,
            fontStyle: "italic",
            color: "var(--tinta2)",
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          {debate.context}
        </p>

        {/* Zona de escritura */}
        {!submitted ? (
          <>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "var(--sepia)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Tu argumento
            </div>
            <textarea
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Escribe tu lectura. Defiéndela con razones del libro..."
              style={{
                width: "100%",
                minHeight: 160,
                padding: "16px",
                background: "var(--marfil)",
                border: "1px solid var(--linea)",
                borderRadius: 2,
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--tinta)",
                resize: "vertical",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--vino)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--linea)")}
            />
            <div
              style={{
                fontSize: 11,
                color: "var(--sepia)",
                marginTop: 6,
                marginBottom: 20,
                textAlign: "right",
              }}
            >
              {argument.length} caracteres · mínimo 20
            </div>
            <button
              className="btn-primary"
              disabled={argument.trim().length < 20}
              style={{ width: "100%" }}
              onClick={submit}
            >
              Publicar argumento
            </button>
          </>
        ) : (
          <div
            style={{
              padding: "20px",
              background: "var(--marfil)",
              borderLeft: "3px solid var(--verde)",
              marginBottom: 24,
              animation: "inkDrop 0.4s",
            }}
          >
            <div
              className="serif-italic"
              style={{
                fontSize: 11,
                fontStyle: "italic",
                color: "var(--verde)",
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              Tu argumento · publicado
            </div>
            <p
              className="serif"
              style={{
                fontSize: 15,
                color: "var(--tinta)",
                lineHeight: 1.6,
              }}
            >
              {argument}
            </p>
          </div>
        )}

        {/* Sección "otros lectores" — visible cuando el usuario ya contribuyó
            o si hay debates donde queremos mostrarles ejemplos directamente.
            Decidimos: mostrar siempre, pero más llamativo después de publicar. */}
        {seeds.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--linea)",
                }}
              />
              <span
                className="serif-italic"
                style={{
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "var(--tinta2)",
                }}
              >
                Otros lectores
              </span>
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--linea)",
                }}
              />
            </div>

            {seeds.map((s, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 14,
                  padding: "16px 18px",
                  background: "var(--marfil)",
                  border: "1px solid var(--linea)",
                  borderRadius: 2,
                  animation: `fadeUp 0.4s ${i * 0.1}s both`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <span className="chip">{s.side}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--sepia)",
                    }}
                  >
                    ♥ {s.likes}
                  </span>
                </div>
                <p
                  className="serif"
                  style={{
                    fontSize: 14,
                    color: "var(--tinta)",
                    lineHeight: 1.6,
                    marginBottom: 10,
                  }}
                >
                  {s.text}
                </p>
                <div
                  className="serif-italic"
                  style={{
                    fontSize: 12,
                    fontStyle: "italic",
                    color: "var(--sepia)",
                  }}
                >
                  — {s.author}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE PERFIL ═══════
   Muestra la racha, los puntos, los libros practicados y debates.
*/
function ProfileScreen({ streak, points, completedBooks, debateContributions }) {
  const completedBookObjects = BOOKS.filter((b) =>
    completedBooks.includes(b.id)
  );

  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      <div style={{ padding: "36px 24px 24px" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: "var(--sepia)",
            textTransform: "uppercase",
          }}
        >
          Sección 03
        </div>
        <span className="rule-vino" />
        <h1
          className="serif"
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "var(--tinta)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Tu lectura
        </h1>
        <p
          className="serif-italic"
          style={{
            fontSize: 14,
            fontStyle: "italic",
            color: "var(--tinta2)",
            marginTop: 6,
          }}
        >
          en el año I de este diario
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <StatCard label="Racha de días" value={streak} suffix="días" />
          <StatCard label="Puntos ganados" value={points} />
        </div>

        {/* Libros practicados */}
        <div
          style={{
            marginTop: 28,
            padding: "20px 22px",
            background: "var(--marfil)",
            border: "1px solid var(--linea)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "var(--sepia)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Libros practicados · {completedBookObjects.length} de {BOOKS.length}
          </div>
          {completedBookObjects.length === 0 ? (
            <p
              className="serif-italic"
              style={{
                fontSize: 14,
                fontStyle: "italic",
                color: "var(--tinta2)",
                lineHeight: 1.6,
              }}
            >
              Aún no has completado ningún libro. Empieza por el que más te
              intrigue.
            </p>
          ) : (
            <ul style={{ listStyle: "none" }}>
              {completedBookObjects.map((b) => (
                <li
                  key={b.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--linea)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      className="serif"
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: "var(--tinta)",
                      }}
                    >
                      {b.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--sepia)",
                        letterSpacing: 0.5,
                      }}
                    >
                      {b.author}
                    </div>
                  </div>
                  <span style={{ color: "var(--verde)", fontSize: 14 }}>✓</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Debates en los que contribuyó */}
        <div
          style={{
            marginTop: 16,
            padding: "20px 22px",
            background: "var(--marfil)",
            border: "1px solid var(--linea)",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "var(--sepia)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Argumentos publicados · {debateContributions.length}
          </div>
          {debateContributions.length === 0 ? (
            <p
              className="serif-italic"
              style={{
                fontSize: 14,
                fontStyle: "italic",
                color: "var(--tinta2)",
                lineHeight: 1.6,
              }}
            >
              Aún no has escrito tu lectura en ningún debate.
            </p>
          ) : (
            debateContributions.map((c, i) => {
              // Buscar de qué debate y libro es
              let debate = null;
              let book = null;
              for (const b of BOOKS) {
                const d = b.debatePrompts.find((dp) => dp.id === c.id);
                if (d) {
                  debate = d;
                  book = b;
                  break;
                }
              }
              return (
                <div
                  key={i}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      i < debateContributions.length - 1
                        ? "1px solid var(--linea)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: 1.5,
                      color: "var(--sepia)",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {book?.title}
                  </div>
                  <div
                    className="serif"
                    style={{
                      fontSize: 13,
                      color: "var(--tinta)",
                      fontWeight: 500,
                      marginBottom: 6,
                    }}
                  >
                    {debate?.question}
                  </div>
                  <div
                    className="serif-italic"
                    style={{
                      fontSize: 13,
                      fontStyle: "italic",
                      color: "var(--tinta2)",
                      lineHeight: 1.6,
                    }}
                  >
                    "{c.argument.slice(0, 140)}
                    {c.argument.length > 140 ? "…" : ""}"
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Tarjeta pequeña de estadística
function StatCard({ label, value, suffix }) {
  return (
    <div
      style={{
        padding: "18px 16px",
        background: "var(--marfil)",
        border: "1px solid var(--linea)",
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: "var(--sepia)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        className="serif"
        style={{
          fontSize: 40,
          fontWeight: 900,
          color: "var(--vino)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {suffix && (
        <div
          style={{
            fontSize: 11,
            color: "var(--sepia)",
            marginTop: 4,
          }}
        >
          {suffix}
        </div>
      )}
    </div>
  );
}
