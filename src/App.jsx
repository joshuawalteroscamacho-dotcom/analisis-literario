// 1. PRIMERO TODOS LOS IMPORTS (Fuera de cualquier función)
import { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, collection, addDoc, getDocs, query, orderBy,
  serverTimestamp, doc, setDoc, getDoc, increment, updateDoc
} from "firebase/firestore";

// 2. LUEGO TU COMPONENTE PRINCIPAL
export default function App() {
  
  // 3. AQUÍ YA VAN TUS CONFIGURACIONES Y LÓGICA
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  const fbApp = initializeApp(firebaseConfig);
  const auth = getAuth(fbApp);
  const db = getFirestore(fbApp);

  /* ================================================================
    SISTEMA DE PREGUNTAS...
  ================================================================ */
  
  // ... resto de tu código

/* ================================================================
  SISTEMA DE PREGUNTAS
  Cada libro tiene un "pool" grande de preguntas (10+).
  Cada test selecciona 8 preguntas al azar sin repetir las de la
  sesión anterior (guardadas en sessionStorage por bookId+difficulty).
  Las flashcards se crean desde la pantalla de flashcards y se usan
  en la trivia. También hay flashcards base predefinidas.
================================================================ */

// Utilidad: seleccionar N preguntas aleatorias evitando lastUsed
function selectQuestions(pool, n, lastUsedIndices = []) {
  const available = pool.map((_, i) => i).filter(i => !lastUsedIndices.includes(i));
  const source = available.length >= n ? available : pool.map((_, i) => i);
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map(i => ({ ...pool[i], _poolIndex: i }));
}

const BOOKS = [
  // ── 1. 1984 ──────────────────────────────────────────────────
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "Distopía política",
    tagline: "El Gran Hermano te observa.",
    color: "#8B1A1A",
    spine: "#6B1212",
    questions: [
      { difficulty:"easy", mode:"critical", concept:"Personajes",
        text:"¿Quién es Winston Smith?",
        options:["El líder del Partido","Un empleado del Ministerio de la Verdad que guarda pensamientos rebeldes","El jefe de la Policía del Pensamiento","Un ciudadano de Eurasia"],
        correct:1, feedback:"Correcto. Winston trabaja reescribiendo la historia para el Partido, aunque en secreto la cuestiona.", feedbackAlt:"Winston Smith es el protagonista: un empleado del Ministerio de la Verdad que internamente se rebela." },
      { difficulty:"easy", mode:"fragment", concept:"Lema del Partido",
        text:"Lee el fragmento. ¿Qué efecto busca el lema del Partido?",
        fragment:"En la fachada del edificio destacaban las tres consignas del Partido: LA GUERRA ES LA PAZ. LA LIBERTAD ES LA ESCLAVITUD. LA IGNORANCIA ES LA FUERZA.",
        options:["Inspirar con ideales positivos","Paralizar el pensamiento crítico mediante contradicciones aceptadas como verdad","Resumir honestamente la filosofía del gobierno","Advertir a los enemigos del Partido"],
        correct:1, feedback:"Exacto. El lema usa contradicciones para que el ciudadano no pueda razonar en contra.", feedbackAlt:"El lema es un ejemplo de 'doblepensar': aceptar dos ideas opuestas como verdades simultáneas." },
      { difficulty:"medium", mode:"critical", concept:"Poder simbólico",
        text:"¿Por qué el Gran Hermano nunca aparece físicamente en la novela?",
        options:["Es una figura mítica: como idea no puede morir, como persona sí","Está administrando el Imperio desde otro país","Orwell quería reducir el número de personajes","Fue eliminado antes de que comience la historia"],
        correct:0, feedback:"El Gran Hermano no necesita existir físicamente: su poder reside en ser un símbolo absoluto.", feedbackAlt:"Orwell lo construye como símbolo. El poder no está en un individuo sino en la idea misma." },
      { difficulty:"medium", mode:"fragment", concept:"Neolengua",
        text:"Lee el fragmento. ¿Cuál es el propósito real de la Neolengua según Syme?",
        fragment:"—No comprendes la belleza de la destrucción de las palabras. ¿Sabes que la Neolengua es el único idioma del mundo cuyo vocabulario disminuye cada año? [...] La finalidad de la Neolengua es limitar el alcance del pensamiento. Ortodoxia es inconsciencia.",
        options:["Hacer el idioma más eficiente","Destruir la posibilidad misma de pensar críticamente","Simplificar la comunicación","Crear un idioma universal"],
        correct:1, feedback:"La Neolengua no es simplificación: es aniquilación del pensamiento crítico.", feedbackAlt:"Destruir palabras es destruir ideas. Orwell muestra que el lenguaje hace posible el pensamiento." },
      { difficulty:"hard", mode:"critical", concept:"Naturaleza del poder",
        text:"¿Qué distingue filosóficamente al Partido de otros totalitarismos según O'Brien?",
        options:["Usa tecnología más avanzada","Busca el poder puro y exige amor genuino, no solo obediencia","Permite más libertad económica","Tiene un enemigo externo real"],
        correct:1, feedback:"El Partido persigue solo el poder. Y no le basta la obediencia: necesita el amor genuino del súbdito.", feedbackAlt:"O'Brien explica que el Partido tortura para que Winston ame genuinamente al Gran Hermano antes de morir." },
      { difficulty:"hard", mode:"highlight", concept:"Momento de quiebre",
        text:"Subraya la frase que captura el momento en que Winston pierde definitivamente su humanidad:",
        fragment:"Miró el retrato. Era impensable que pudiera ser vencido. Contempló los enormes ojos. Dos lágrimas le resbalaron por las mejillas. Pero ahora todo iba bien, la lucha había terminado. Había obtenido la victoria sobre sí mismo. Amaba al Gran Hermano.",
        correctHighlight:"Amaba al Gran Hermano",
        feedback:"Esa frase es el colapso total: no solo obedece, genuinamente ama a su opresor.", feedbackAlt:"'Victoria sobre sí mismo' es irónico: esa victoria es su destrucción como ser pensante." },
      { difficulty:"easy", mode:"critical", concept:"Diario",
        text:"¿Por qué es tan peligroso que Winston escriba un diario?",
        options:["Está prohibido por ser anticuado","Constituye un crimen del pensamiento que puede llevar a la vaporizacion","El papel es un lujo reservado al Partido","Podría revelar su identidad a Julia"],
        correct:1, feedback:"Escribir pensamientos propios es un crimen del pensamiento: la evidencia más peligrosa de deslealtad.", feedbackAlt:"El diario materializa los pensamientos rebeldes de Winston, haciéndolos irrefutables para la Policía del Pensamiento." },
      { difficulty:"easy", mode:"critical", concept:"Vigilancia",
        text:"¿Qué es una telepantalla y cuál es su función principal?",
        options:["Una televisión de entretenimiento","Un dispositivo bidireccional que transmite y vigila simultáneamente","Un sistema de comunicación solo entre miembros del Partido","Una herramienta para recibir órdenes del Gran Hermano"],
        correct:1, feedback:"La telepantalla es el instrumento central del control: no solo emite, también registra todo lo que ocurre ante ella.", feedbackAlt:"Su función principal es hacer que la vigilancia sea omnipresente y que nadie sepa con certeza si está siendo observado." },
      { difficulty:"medium", mode:"critical", concept:"Julia",
        text:"¿Qué tipo de rebelión representa Julia en contraste con la de Winston?",
        options:["Julia tiene una rebelión política e intelectual más profunda que Winston","Julia se rebela de forma práctica y sensual, sin ambición política de cambiar el sistema","Julia trabaja activamente para derrocar al Partido junto a la Hermandad","Julia y Winston tienen exactamente el mismo tipo de rebelión"],
        correct:1, feedback:"Julia se rebela para vivir, no para cambiar el mundo. Winston quiere comprender y destruir el sistema.", feedbackAlt:"Esta diferencia crea la tensión entre ellos: Winston busca significado político, Julia busca placer y libertad personal." },
      { difficulty:"hard", mode:"critical", concept:"O'Brien y la traición",
        text:"¿Qué revela la traición de O'Brien sobre la naturaleza del poder en la novela?",
        options:["Que incluso los inteligentes pueden ser corruptos","Que el Partido infiltra hasta las esperanzas más íntimas de sus oponentes, haciendo imposible la resistencia","Que Winston era demasiado ingenuo para sobrevivir","Que la Hermandad nunca existió realmente"],
        correct:1, feedback:"O'Brien encarna la trampa perfecta: el Partido seduce con la promesa de resistencia antes de destruirla.", feedbackAlt:"La traición de O'Brien demuestra que el Partido no solo vigila acciones, sino que controla activamente las esperanzas." },
    ],
    flashcards: [
      { id:"fc1", front:"¿Qué significa 'doblepensar'?", back:"Sostener dos creencias contradictorias simultáneamente y aceptar ambas como verdaderas." },
      { id:"fc2", front:"¿Cuál es el lema del Partido?", back:"Guerra es Paz. Libertad es Esclavitud. Ignorancia es Fuerza." },
      { id:"fc3", front:"¿Qué representa Julia en contraste con Winston?", back:"Rebelión práctica y sensual vs. rebelión intelectual y política." },
      { id:"fc4", front:"¿Qué es la Neolengua?", back:"El idioma oficial diseñado para hacer imposible el pensamiento crítico, reduciendo cada año su vocabulario." },
    ],
    debatePrompts:[{ id:"1984-d1", question:"¿Winston Smith es un héroe o una víctima del sistema?", context:"Al final Winston ama al Gran Hermano. ¿Eso anula todo lo que hizo antes o lo vuelve más trágico?" }],
    forumId:"1984-forum"
  },

  // ── 2. Rebelión en la granja ──────────────────────────────────
  {
    id:"granja",
    title:"Rebelión en la granja",
    author:"George Orwell",
    year:1945,
    genre:"Fábula política",
    tagline:"Todos son iguales. Algunos más que otros.",
    color:"#2D5A1B",
    spine:"#1E3D12",
    questions:[
      { difficulty:"easy", mode:"critical", concept:"Personajes",
        text:"¿Quién toma el control de la granja después de expulsar a Snowball?",
        options:["Boxer","Napoleón","Squealer","El Viejo Mayor"],
        correct:1, feedback:"Napoleón usa perros amaestrados para expulsar a Snowball y se convierte en el dictador.", feedbackAlt:"Napoleón representa a Stalin: expulsa a su rival (Snowball/Trotsky) y concentra todo el poder." },
      { difficulty:"easy", mode:"fragment", concept:"Igualdad corrompida",
        text:"Lee el fragmento. ¿Qué revela este mandamiento modificado?",
        fragment:"Había un solo Mandamiento. Decía: TODOS LOS ANIMALES SON IGUALES PERO ALGUNOS ANIMALES SON MÁS IGUALES QUE OTROS",
        options:["Que el sistema evolucionó hacia algo más justo","Que los cerdos corrompieron el principio original de igualdad","Que los animales votaron por cambiar las reglas","Que el mandamiento nunca fue tomado en serio"],
        correct:1, feedback:"La corrupción del mandamiento revela que los cerdos traicionaron la revolución desde adentro.", feedbackAlt:"El lenguaje se pervierte para justificar la desigualdad como si fuera igualdad." },
      { difficulty:"medium", mode:"critical", concept:"Corrupción del poder",
        text:"¿Por qué los cerdos caminan en dos patas al final?",
        options:["Para mostrar superación evolutiva","Para simbolizar que adoptaron las características que combatían","Para crear una escena cómica","Para mostrar que son los más inteligentes"],
        correct:1, feedback:"Los animales ya no pueden distinguir cerdos de humanos. El problema no era quién gobernaba sino el poder mismo.", feedbackAlt:"La revolución no transformó el sistema, solo cambió quién lo operaba." },
      { difficulty:"medium", mode:"fragment", concept:"Propaganda",
        text:"¿Qué técnica de manipulación usa Squealer en el fragmento?",
        fragment:"—Camaradas, nosotros los cerdos hacemos esto en un espíritu de sacrificio. Muchos no nos gusta la leche y las manzanas. La leche y las manzanas (esto ha sido probado por la Ciencia) contienen sustancias necesarias para el bienestar de un cerdo. Nosotros somos trabajadores cerebrales.",
        options:["Apelar a la ciencia falsa y presentar el privilegio como sacrificio","Usar amenazas directas","Ofrecer recompensas","Demostrar superioridad física"],
        correct:0, feedback:"Squealer invierte la realidad: los cerdos no roban, 'se sacrifican'.", feedbackAlt:"La apelación a 'la Ciencia' añade autoridad falsa a un argumento completamente deshonesto." },
      { difficulty:"hard", mode:"critical", concept:"Imagen final",
        text:"¿Qué demuestra que los animales no puedan distinguir cerdos de humanos?",
        options:["El éxito evolutivo de los cerdos","Que la corrupción fue tan completa que el régimen resultante es idéntico al derrocado","Que los humanos aceptaron a los cerdos como iguales","Que la memoria de los animales se deterioró"],
        correct:1, feedback:"La revolución no transformó el sistema. Los nuevos gobernantes reproducen exactamente los métodos de los viejos.", feedbackAlt:"El poder corrompe independientemente de quién lo ejerza." },
      { difficulty:"hard", mode:"highlight", concept:"Lealtad ciega",
        text:"Subraya la frase que mejor muestra cómo la lealtad sin pensamiento crítico se vuelve parte del problema:",
        fragment:"Boxer no podía pensar mucho más allá de este punto, pero sentía que Napoleón siempre tenía razón. Y Boxer adoptó como lema personal, además de 'Trabajaré más duro', este otro: 'El camarada Napoleón siempre tiene razón'.",
        correctHighlight:"El camarada Napoleón siempre tiene razón",
        feedback:"Boxer se convierte en cómplice involuntario: su virtud sin pensamiento crítico alimenta la dictadura.", feedbackAlt:"La virtud sin crítica puede ser peligrosa. Boxer representa la clase trabajadora explotada por su propia lealtad." },
      { difficulty:"easy", mode:"critical", concept:"El Viejo Mayor",
        text:"¿Qué papel cumple El Viejo Mayor en la novela?",
        options:["Es el primer dictador de la granja","Inspira la rebelión con su discurso sobre la igualdad animal antes de morir","Es el cerdo que inventa los Siete Mandamientos","Es el líder de los perros guardianes"],
        correct:1, feedback:"El Viejo Mayor es Karl Marx y Lenin: la figura revolucionaria fundadora cuya visión es traicionada por sus sucesores.", feedbackAlt:"Su muerte antes de la revolución es simbólica: los ideales no sobreviven a quienes los proclamaron." },
      { difficulty:"medium", mode:"critical", concept:"Boxer",
        text:"¿Qué representa el destino de Boxer en la novela?",
        options:["Que el esfuerzo siempre es recompensado","Que la clase trabajadora es traicionada y explotada por quienes dice servir","Que la lealtad al Estado es la virtud más alta","Que los animales no son suficientemente inteligentes para gobernarse"],
        correct:1, feedback:"Boxer trabaja hasta colapsar y es vendido al matadero. Su destino es la crítica más brutal de Orwell al stalinismo.", feedbackAlt:"El cerdo más fuerte y más leal termina siendo mercancía. La revolución consume a sus hijos más fieles." },
      { difficulty:"easy", mode:"critical", concept:"Los Siete Mandamientos",
        text:"¿Por qué los cerdos modifican los Siete Mandamientos gradualmente?",
        options:["Porque las reglas originales tenían errores lógicos","Para ajustar las reglas a sus acciones y mantener la apariencia de legitimidad","Porque los demás animales los votaron democráticamente","Porque Snowball los había escrito mal desde el principio"],
        correct:1, feedback:"Los cerdos no cambian sus acciones para ajustarse a las reglas. Cambian las reglas para ajustarse a sus acciones.", feedbackAlt:"Esta inversión es la esencia de la propaganda: el poder reescribe la realidad para que parezca que siempre tuvo razón." },
      { difficulty:"hard", mode:"critical", concept:"La alegoría",
        text:"¿A qué evento histórico real alude directamente la expulsión de Snowball por Napoleón?",
        options:["A la Primera Guerra Mundial","A la expulsión de Trotsky por Stalin de la Unión Soviética","A la Revolución Francesa","Al ascenso del nazismo en Alemania"],
        correct:1, feedback:"Snowball es León Trotsky y Napoleón es Stalin. Orwell narra el proceso histórico real con absoluta precisión a través de la alegoría.", feedbackAlt:"La novela es una crítica directa al estalinismo. Orwell, siendo de izquierdas, critica la traición de los ideales socialistas." },
    ],
    flashcards:[
      { id:"fc1", front:"¿Qué representan los cerdos?", back:"La clase dirigente comunista soviética (Stalin y los bolcheviques)." },
      { id:"fc2", front:"¿Qué le pasa a Boxer?", back:"Trabaja hasta colapsar y es vendido al matadero. Napoleón miente diciendo que murió en el hospital." },
      { id:"fc3", front:"¿Qué son los Siete Mandamientos?", back:"Las reglas de la revolución que los cerdos van modificando hasta dejar solo una contradictoria." },
      { id:"fc4", front:"¿Qué representa Snowball?", back:"León Trotsky: el revolucionario idealista expulsado por el líder que se vuelve dictador." },
    ],
    debatePrompts:[{ id:"granja-d1", question:"¿Boxer era virtuoso o solo ingenuo?", context:"Trabaja hasta morir repitiendo 'Napoleón siempre tiene razón'. ¿Su lealtad es admirable o parte del problema?" }],
    forumId:"granja-forum"
  },

  // ── 3. Como agua para chocolate ──────────────────────────────
  {
    id:"chocolate",
    title:"Como agua para chocolate",
    author:"Laura Esquivel",
    year:1989,
    genre:"Realismo mágico",
    tagline:"Las emociones se sirven a la mesa.",
    color:"#C87941",
    spine:"#9B5E30",
    questions:[
      { difficulty:"easy", mode:"critical", concept:"Conflicto central",
        text:"¿Por qué Tita no puede casarse con Pedro al inicio?",
        options:["Pedro no la ama","La tradición obliga a la hija menor a cuidar a la madre hasta su muerte","Tita está comprometida con otra persona","Pedro es demasiado pobre"],
        correct:1, feedback:"La tradición condena a Tita a una vida de servidumbre y le niega el amor.", feedbackAlt:"La novela critica cómo las tradiciones familiares pueden convertirse en prisiones." },
      { difficulty:"easy", mode:"fragment", concept:"Realismo mágico",
        text:"¿Qué recurso literario usa Esquivel en este fragmento?",
        fragment:"Dicen que Tita era tan sensible que desde que estaba en el vientre de su madre lloraba cuando ésta picaba cebolla. Un día los sollozos fueron tan fuertes que provocaron un parto prematuro.",
        options:["Hipérbole realista","Realismo mágico: los sentimientos tienen efectos físicos reales en el mundo","Descripción médica precisa","Metáfora sobre la sensibilidad femenina"],
        correct:1, feedback:"El realismo mágico hace que las emociones tengan efectos físicos literales.", feedbackAlt:"Desde su nacimiento, Tita tiene una conexión mágica con sus emociones." },
      { difficulty:"medium", mode:"critical", concept:"Simbolismo de la cocina",
        text:"¿Qué representa la cocina para Tita?",
        options:["Una cárcel sin escapatoria","Su único espacio de libertad y expresión dentro de la opresión","Un lugar de trabajo sin significado especial","El símbolo del fracaso de sus sueños"],
        correct:1, feedback:"La cocina es la paradoja central: el espacio de su esclavitud se convierte en su único poder real.", feedbackAlt:"Esquivel transforma la cocina de jaula en territorio de resistencia." },
      { difficulty:"medium", mode:"critical", concept:"Mamá Elena",
        text:"¿Qué función narrativa cumple Mamá Elena como antagonista?",
        options:["Representa la maldad pura sin motivación","Encarna el patriarcado y las tradiciones que oprimen a las mujeres","Es un personaje secundario sin importancia","Representa solo el amor maternal mal expresado"],
        correct:1, feedback:"Mamá Elena representa todo el sistema de valores tradicionales que usa las costumbres para controlar.", feedbackAlt:"Su crueldad tiene raíces en el mismo sistema que también la oprimió a ella." },
      { difficulty:"hard", mode:"critical", concept:"Pedro como personaje",
        text:"¿Por qué Pedro acepta casarse con Rosaura si ama a Tita?",
        options:["No amaba realmente a Tita","Muestra que Pedro es víctima y cómplice del sistema: elige estar cerca de Tita aunque dañe a todos","Es un error narrativo de la autora","Prueba que Pedro es un héroe completamente altruista"],
        correct:1, feedback:"Pedro no es un héroe romántico limpio: su decisión daña a Tita y a su propia esposa. Es víctima y cómplice.", feedbackAlt:"Esquivel no idealiza a Pedro. El amor no justifica todas las decisiones." },
      { difficulty:"hard", mode:"highlight", concept:"El poder de la comida",
        text:"Subraya la frase que mejor expresa el mecanismo mágico central de la novela:",
        fragment:"Tita lo sabía desde siempre: que al incorporar sus emociones a la comida, éstas pasaban directamente a quienes la comían. La noche del pastel de bodas de Rosaura y Pedro, sus lágrimas cayeron sobre la masa y todos los invitados sintieron una tristeza tan profunda que tuvieron que abandonar la fiesta.",
        correctHighlight:"al incorporar sus emociones a la comida, éstas pasaban directamente a quienes la comían",
        feedback:"Las emociones de Tita se transmiten literalmente a través de su cocina.", feedbackAlt:"Esta idea convierte a Tita en poderosa a pesar de su situación de opresión." },
      { difficulty:"easy", mode:"critical", concept:"Nacha",
        text:"¿Qué papel cumple Nacha en la vida de Tita?",
        options:["Es la antagonista que refuerza las reglas de Mamá Elena","Es la figura materna real de Tita, quien la cría en la cocina con amor","Es la hermana mayor que hereda el amor de Pedro","Es un personaje decorativo sin importancia"],
        correct:1, feedback:"Nacha es la madre verdadera de Tita: la cría, le enseña a cocinar y le transmite el amor que Mamá Elena nunca le dio.", feedbackAlt:"La relación Tita-Nacha es la más afectiva de la novela. Nacha representa el amor materno genuino." },
      { difficulty:"medium", mode:"critical", concept:"Rosaura",
        text:"¿Cómo funciona el personaje de Rosaura en relación al sistema que oprime a Tita?",
        options:["Rosaura es otra víctima inocente del sistema igual que Tita","Rosaura perpetúa el sistema al querer imponer a su hija Esperanza la misma tradición que condenó a Tita","Rosaura intenta activamente liberar a Tita de las tradiciones","Rosaura no tiene ninguna función simbólica en la novela"],
        correct:1, feedback:"Rosaura reproduce la opresión: quiere que Esperanza también cuide a su madre de por vida.", feedbackAlt:"Este ciclo muestra que la opresión se perpetúa cuando las propias víctimas la internalizan y la transmiten." },
      { difficulty:"easy", mode:"critical", concept:"Estructura",
        text:"¿Qué estructura narrativa organiza los capítulos de la novela?",
        options:["Los capítulos se organizan por años de la vida de Tita","Cada capítulo lleva el nombre de un mes y contiene una receta que desencadena los eventos","Los capítulos siguen las estaciones del año en la hacienda","La novela no tiene estructura definida, es completamente lineal"],
        correct:1, feedback:"Cada capítulo = un mes + una receta. La comida organiza el tiempo y desencadena los eventos emocionales.", feedbackAlt:"Esta estructura convierte la cocina en el eje temporal y emocional de toda la novela." },
      { difficulty:"hard", mode:"critical", concept:"Esperanza",
        text:"¿Qué representa el final de la novela con Esperanza libre para casarse?",
        options:["Que las tradiciones finalmente triunfaron","Que el ciclo de opresión se rompe en la siguiente generación gracias a la resistencia de Tita","Que la novela tiene un final paradójico sin resolución","Que Mamá Elena tenía razón sobre el matrimonio"],
        correct:1, feedback:"Esperanza puede casarse libremente. Tita sacrificó su vida pero rompió el ciclo para la siguiente generación.", feedbackAlt:"El final es agridulce: la libertad de Esperanza es el legado de la prisión de Tita." },
    ],
    flashcards:[
      { id:"fc1", front:"¿Qué es el realismo mágico?", back:"Corriente donde elementos mágicos ocurren en contexto cotidiano y son aceptados como normales." },
      { id:"fc2", front:"¿Por qué Tita no puede casarse?", back:"La tradición obliga a la hija menor a cuidar a la madre hasta su muerte." },
      { id:"fc3", front:"¿Qué representa la cocina para Tita?", back:"El único espacio de libertad y poder: puede expresar sus emociones y afectar el mundo a través de la comida." },
      { id:"fc4", front:"¿Qué simboliza la receta en cada capítulo?", back:"La comida como vehículo de emociones: cada receta desencadena los eventos emocionales del capítulo." },
    ],
    debatePrompts:[{ id:"chocolate-d1", question:"¿Es Tita una mujer que resiste o que acepta su destino?", context:"Nunca abandona la hacienda, pero su cocina transforma todo. ¿Eso es resistencia o resignación?" }],
    forumId:"chocolate-forum"
  },

  // ── 4. La casa de los espíritus ──────────────────────────────
  {
    id:"espiritus",
    title:"La casa de los espíritus",
    author:"Isabel Allende",
    year:1982,
    genre:"Realismo mágico",
    tagline:"La memoria es el arma de los sobrevivientes.",
    color:"#4A2070",
    spine:"#32154D",
    questions:[
      { difficulty:"easy", mode:"critical", concept:"Clara del Valle",
        text:"¿Por qué Clara del Valle es el personaje central?",
        options:["Es la narradora sin poderes especiales","Tiene poderes de clarividencia y sus cuadernos son la fuente de toda la historia","Es la antagonista principal","Es la hija mayor de Esteban"],
        correct:1, feedback:"Clara es el corazón espiritual: sus poderes y cuadernos son la memoria que permite contar la historia.", feedbackAlt:"Sin sus cuadernos, la historia de tres generaciones no podría reconstruirse." },
      { difficulty:"easy", mode:"critical", concept:"Generaciones",
        text:"¿Cuáles son las tres generaciones femeninas principales?",
        options:["Clara, Esteban y Pedro García","Clara, Blanca y Alba — cada una representa una época de Chile","Férula, Blanca y Clara","Solo Clara y Alba"],
        correct:1, feedback:"Clara, Blanca y Alba son el eje. Tres generaciones de mujeres que enfrentan el mundo de maneras distintas.", feedbackAlt:"Allende construye la historia del país a través de estas tres mujeres." },
      { difficulty:"medium", mode:"critical", concept:"Esteban Trueba",
        text:"¿Por qué Esteban Trueba es un personaje complejo y no simplemente un villano?",
        options:["Porque se arrepiente completamente al final","Porque a pesar de su violencia, ama genuinamente a su familia","Porque es bueno y sus actos tienen justificación moral","Porque es un personaje secundario"],
        correct:1, feedback:"Trueba comete actos terribles pero también ama profundamente. Encarna las contradicciones de su clase.", feedbackAlt:"Su amor es real pero su violencia también. No es malo ni bueno: es humano en el peor sentido." },
      { difficulty:"medium", mode:"critical", concept:"Historia y ficción",
        text:"¿Qué relación tiene la novela con la historia real de Chile?",
        options:["Ninguna, es completamente ficticia","Refleja el golpe de estado de 1973 y la dictadura con nombres ficticios","Es una autobiografía directa","Está ambientada en un país inventado"],
        correct:1, feedback:"La novela es una alegoría de Chile: el golpe militar, la dictadura y la represión están presentes.", feedbackAlt:"Isabel Allende era sobrina del presidente Allende. La novela procesa el trauma del golpe de 1973." },
      { difficulty:"hard", mode:"critical", concept:"Memoria y escritura",
        text:"¿Por qué los cuadernos de Clara son políticamente importantes?",
        options:["Son solo un recurso estético","Son la memoria que permite resistir el olvido impuesto por la dictadura","Prueban los poderes mágicos de Clara","Son el único elemento de realismo mágico"],
        correct:1, feedback:"Los cuadernos son un acto político: la escritura es resistencia contra los regímenes que borran la historia.", feedbackAlt:"Escribir es resistir. La memoria escrita es el único antídoto contra la barbarie que quiere el olvido." },
      { difficulty:"hard", mode:"highlight", concept:"Transmisión generacional",
        text:"Subraya la frase que mejor expresa el tema central de la memoria como resistencia:",
        fragment:"Alba comprendió entonces que el pasado no termina nunca. La historia de su abuela, de su madre, la suya propia, no era una cadena de desgracias sino la prueba de que algo sobrevive: el amor y la memoria que une a los que se fueron con los que siguen.",
        correctHighlight:"el amor y la memoria que une a los que se fueron con los que siguen",
        feedback:"La memoria no es nostalgia, es el lazo que da sentido a la historia familiar y colectiva.", feedbackAlt:"Lo que une generaciones no es la sangre sino la memoria compartida del amor y el sufrimiento." },
      { difficulty:"easy", mode:"critical", concept:"Poderes de Clara",
        text:"¿Cuál de estos NO es un poder sobrenatural de Clara?",
        options:["Predecir el futuro","Mover objetos con la mente","Curar enfermedades","Comunicarse con los espíritus"],
        correct:2, feedback:"Clara puede predecir, tiene telekinesis y se comunica con espíritus, pero curar enfermedades no es su don.", feedbackAlt:"Sus poderes la conectan con el mundo espiritual, no con el físico-médico." },
      { difficulty:"medium", mode:"critical", concept:"Blanca y Pedro",
        text:"¿Qué representa la relación entre Blanca y Pedro Tercero García?",
        options:["Un romance sin dimensión política","El amor que trasciende las clases sociales y el orden establecido","Una relación basada solo en la rebeldía juvenil","Una historia de amor sin consecuencias en la trama"],
        correct:1, feedback:"Su amor cruza la barrera de clases: la hija del patrón y el hijo del campesino. Es un acto político además de amoroso.", feedbackAlt:"Esteban Trueba no puede tolerar esta relación porque amenaza el orden social que él representa." },
      { difficulty:"easy", mode:"critical", concept:"El nombre de la novela",
        text:"¿Por qué la novela se llama 'La casa de los espíritus'?",
        options:["Porque hay fantasmas que asustan a los personajes","Porque la casa familiar es el espacio donde coexisten generaciones y sus recuerdos como espíritus","Porque Esteban Trueba es espiritista","Porque Clara narra desde el más allá"],
        correct:1, feedback:"La casa es el eje donde varias generaciones coexisten con sus historias, todas presentes como espíritus.", feedbackAlt:"La casa no es solo un edificio sino un espacio cargado de memoria y presencias que no desaparecen." },
      { difficulty:"hard", mode:"critical", concept:"Alba y el ciclo",
        text:"¿Qué significa que Alba decida no perpetuar el odio al final de la novela?",
        options:["Que ha olvidado lo que sufrió","Que comprende que el ciclo de violencia solo se rompe eligiendo no reproducirlo","Que perdona a sus torturadores por razones religiosas","Que es demasiado débil para buscar justicia"],
        correct:1, feedback:"Alba elige la memoria y la escritura sobre la venganza. Es el gesto más poderoso y el más difícil.", feedbackAlt:"Allende plantea que la verdadera resistencia no es replicar la violencia sino documentarla y negarle su último triunfo: el olvido." },
    ],
    flashcards:[
      { id:"fc1", front:"¿Quiénes son las tres generaciones?", back:"Clara (abuela), Blanca (madre) y Alba (nieta). Cada una representa una época y forma de resistir." },
      { id:"fc2", front:"¿Qué representa Esteban Trueba?", back:"La oligarquía chilena: poderosa y violenta, pero capaz de amor. Sus contradicciones reflejan las de su clase." },
      { id:"fc3", front:"¿Por qué son importantes los cuadernos de Clara?", back:"Son la memoria que permite reconstruir la historia familiar y resistir el olvido impuesto por la dictadura." },
      { id:"fc4", front:"¿A qué evento histórico alude la novela?", back:"Al golpe de estado de 1973 en Chile y a la dictadura de Pinochet, narrados con nombres ficticios." },
    ],
    debatePrompts:[{ id:"espiritus-d1", question:"¿Puede Esteban Trueba ser perdonado al final?", context:"Ayuda a salvar a Alba a pesar de todo lo que causó. ¿El arrepentimiento tardío tiene valor moral real?" }],
    forumId:"espiritus-forum"
  },

  // ── 5. Maus ──────────────────────────────────────────────────
  {
    id:"maus",
    title:"Maus",
    author:"Art Spiegelman",
    year:1991,
    genre:"Novela gráfica / Holocausto",
    tagline:"Una historia de supervivencia. Dos.",
    color:"#1C1C1C",
    spine:"#0A0A0A",
    questions:[
      { difficulty:"easy", mode:"critical", concept:"Estructura narrativa",
        text:"¿Cuántas historias se narran simultáneamente en Maus?",
        options:["Solo la historia del Holocausto","Dos: la supervivencia de Vladek en el pasado y la relación Vladek-Artie en el presente","Tres: Vladek, Artie y Mala","Una sola historia lineal"],
        correct:1, feedback:"Maus entrelaza dos tiempos: el Holocausto narrado por Vladek y el presente donde Artie lo entrevista.", feedbackAlt:"Esta doble narrativa es central: el trauma del pasado afecta las relaciones del presente." },
      { difficulty:"easy", mode:"critical", concept:"Representación visual",
        text:"¿Por qué los judíos son representados como ratones y los nazis como gatos?",
        options:["Para hacer el cómic más entretenido para niños","Para usar la alegoría visual: los nazis cazaban a los judíos como gatos cazan ratones","Porque Spiegelman prefirió animales por razones estéticas","Porque no sabía cómo dibujar personas"],
        correct:1, feedback:"La alegoría visual es brutal: los nazis perseguían a los judíos exactamente como depredadores a presas.", feedbackAlt:"Spiegelman usa la metáfora animal para mostrar la lógica deshumanizadora del nazismo." },
      { difficulty:"medium", mode:"critical", concept:"Vladek y los diarios",
        text:"¿Qué significa el momento en que Vladek destruye los diarios de Anja y cómo reacciona Artie?",
        options:["Vladek los destruyó para proteger la privacidad familiar y Artie lo comprende","Vladek los destruyó por dolor tras su muerte y Artie lo llama 'asesino' porque perdió la voz de su madre","Vladek los vendió y Artie no reacciona significativamente","Los diarios fueron destruidos accidentalmente"],
        correct:1, feedback:"Artie llama 'asesino' a su padre: destruir los diarios fue borrar la voz de Anja, su segunda muerte.", feedbackAlt:"Este momento muestra que el trauma no está solo en el pasado sino en cómo los sobrevivientes lo gestionan." },
      { difficulty:"medium", mode:"critical", concept:"Vladek en el presente",
        text:"¿Qué conflicto genera la obsesión de Vladek por ahorrar dinero y comida en Nueva York?",
        options:["Es un conflicto económico entre padre e hijo","Revela cómo el trauma del Holocausto persiste en comportamientos cotidianos décadas después","Es una característica normal en personas de su generación","Muestra que Vladek nunca amó realmente a su familia"],
        correct:1, feedback:"La avaricia de Vladek no es un defecto de carácter: es una cicatriz del Holocausto que nunca sanó.", feedbackAlt:"Spiegelman muestra cómo el trauma sobrevive en comportamientos aparentemente cotidianos." },
      { difficulty:"hard", mode:"critical", concept:"Meta-narrativa",
        text:"¿Qué metáfora visual usa Spiegelman cuando dibuja a personas humanas en el taller discutiendo el éxito del libro?",
        options:["Muestra que el cómic es popular","Cuestiona la representación del sufrimiento: ¿tiene derecho alguien a convertir el Holocausto en éxito comercial?","Celebra el logro artístico sin cuestionamiento","Es solo un capítulo autobiográfico sin significado especial"],
        correct:1, feedback:"Spiegelman se pregunta si tiene derecho a narrar el Holocausto y beneficiarse de ese relato. Es una crisis ética y artística.", feedbackAlt:"Al dibujar personas en lugar de animales, rompe la representación para cuestionar la representación misma." },
      { difficulty:"hard", mode:"critical", concept:"Richieu",
        text:"¿Por qué el libro termina con Vladek llamando a Artie por el nombre de su hermano fallecido, Richieu?",
        options:["Porque Vladek tiene demencia","Porque para Vladek, Artie nunca podrá sustituir al hijo perfecto que murió en el Holocausto — el peso del fantasma es permanente","Porque es un error narrativo de Spiegelman","Porque Artie y Richieu son físicamente idénticos"],
        correct:1, feedback:"Ese momento final condensa todo el libro: Artie vive bajo la sombra de un hermano que nunca conoció pero que siempre compite con él.", feedbackAlt:"Vladek lleva a Richieu como una foto en su bolsillo. Artie no puede competir con la perfección del muerto." },
      { difficulty:"easy", mode:"critical", concept:"Mala",
        text:"¿Cómo retrata la obra a Mala, la segunda esposa de Vladek?",
        options:["Como una villana que explota a Vladek","Como una sobreviviente que también carga con el trauma pero que es incomprendida por la obsesión de Vladek con Anja","Como un personaje secundario sin profundidad","Como la figura materna que Artie necesitaba"],
        correct:1, feedback:"Mala también sobrevivió al Holocausto pero vive bajo la sombra de Anja idealizada. La novela la trata con complejidad.", feedbackAlt:"Spiegelman muestra que no todos los sobrevivientes son tratados igual: Vladek glorifica a Anja y menosprecia a Mala." },
      { difficulty:"medium", mode:"critical", concept:"El cómic dentro del cómic",
        text:"¿Por qué Artie incluye el cómic antiguo 'Prisionero en el planeta de los demonios'?",
        options:["Para mostrar que siempre fue un artista talentoso","Para revelar que ya desde joven procesaba el trauma familiar a través del arte, aunque sin entenderlo","Para demostrar que Maus no es su primera obra","Para criticar los cómics de superhéroes"],
        correct:1, feedback:"El cómic antiguo muestra que Artie llevaba el peso de la historia de su padre desde siempre, aunque no pudiera nombrarlo.", feedbackAlt:"La inclusión revela la continuidad del trauma: antes de saber la historia completa, Artie ya la sentía." },
      { difficulty:"easy", mode:"critical", concept:"Forma artística",
        text:"¿Cuál es la innovación principal de Maus en la literatura del Holocausto?",
        options:["Ser la primera obra sobre el Holocausto","Narrar la historia del Holocausto a través de un cómic con animales, legitimando el formato como arte serio","Ser escrita por un sobreviviente directo","Ser la obra más vendida sobre el tema"],
        correct:1, feedback:"Maus demostró que el cómic puede abordar los temas más graves con la misma profundidad que la novela o el ensayo.", feedbackAlt:"Ganó el Pulitzer en 1992: el primer y único cómic en recibirlo. Cambió la percepción del formato." },
      { difficulty:"hard", mode:"critical", concept:"Racismo de Vladek",
        text:"¿Qué revela el episodio donde Vladek no quiere que Artie deje subir a un autoestopista afroamericano?",
        options:["Que Vladek es un personaje plenamente moral","Que los sobrevivientes del Holocausto también pueden internalizar prejuicios, complejizando la figura del 'víctima pura'","Que Artie también comparte ese prejuicio","Que el episodio es solo un detalle realista sin significado"],
        correct:1, feedback:"Spiegelman no idealiza a su padre. Vladek, víctima del racismo nazi, también tiene prejuicios. La humanidad es contradictoria.", feedbackAlt:"Este momento incomoda deliberadamente: demuestra que ser víctima no convierte a nadie en moralmente irreprochable." },
    ],
    flashcards:[
      { id:"fc1", front:"¿Por qué los judíos son ratones y los nazis gatos?", back:"Alegoría visual: los nazis cazaban a los judíos como depredadores a presas. Deshumanización representada." },
      { id:"fc2", front:"¿Qué son las dos historias de Maus?", back:"El Holocausto narrado por Vladek (pasado) y la relación Vladek-Artie mientras lo entrevista (presente)." },
      { id:"fc3", front:"¿Por qué Artie llama 'asesino' a su padre?", back:"Vladek destruyó los diarios de Anja, borrando su voz: para Artie fue una segunda muerte de su madre." },
      { id:"fc4", front:"¿Qué logro editorial tiene Maus?", back:"Ganó el Premio Pulitzer en 1992, siendo el primer y único cómic en recibirlo." },
    ],
    debatePrompts:[{ id:"maus-d1", question:"¿Tiene Artie derecho a contar la historia de su padre?", context:"Es el trauma de otro. Pero también es su historia como hijo. ¿Dónde está el límite entre testimonio y apropiación?" }],
    forumId:"maus-forum"
  },

  // ── 6. El principito ─────────────────────────────────────────
  {
    id:"principito",
    title:"El principito",
    author:"Antoine de Saint-Exupéry",
    year:1943,
    genre:"Fábula filosófica",
    tagline:"Lo esencial es invisible a los ojos.",
    color:"#1A5E8A",
    spine:"#0E3D5C",
    questions:[
      { difficulty:"easy", mode:"critical", concept:"El dibujo de la boa",
        text:"¿Por qué los adultos confundían el primer dibujo del narrador con un sombrero?",
        options:["Porque era un dibujo muy malo","Porque los adultos solo ven lo superficial, no la realidad interior que representa","Porque realmente era un sombrero","Porque el narrador no sabía dibujar boas"],
        correct:1, feedback:"El dibujo es la metáfora central del libro: los adultos ven solo la superficie, nunca el elefante interior.", feedbackAlt:"Esta incapacidad de ver 'desde adentro' es la crítica de Saint-Exupéry al mundo adulto." },
      { difficulty:"easy", mode:"critical", concept:"Los baobabs",
        text:"¿Qué peligro representan los baobabs para el asteroide B-612?",
        options:["Son venenosos para el Principito","Sus raíces pueden destruir el asteroide si no se arrancan a tiempo siendo pequeños","Bloquean la luz del sol","Son el hogar de animales peligrosos"],
        correct:1, feedback:"Los baobabs son la metáfora de los malos pensamientos: deben combatirse cuando son pequeños antes de que destruyan todo.", feedbackAlt:"Saint-Exupéry usa los baobabs para hablar de los vicios y malos hábitos que se vuelven imposibles de erradicar." },
      { difficulty:"medium", mode:"critical", concept:"La Rosa",
        text:"¿Cuál es el conflicto emocional entre el Principito y su Rosa?",
        options:["La Rosa es malvada y manipuladora","La Rosa es orgullosa y exigente, y el Principito no sabe aún si el amor requiere tolerar sus defectos o huir","El Principito no ama a la Rosa","El conflicto es solo sobre cuidados físicos de la planta"],
        correct:1, feedback:"El Principito abandona su planeta sin comprender que el amor implica aceptar la complejidad del ser amado.", feedbackAlt:"El Zorro le explicará después que la Rosa es única precisamente porque él la ha cuidado y ella lo ha cuidado a él." },
      { difficulty:"medium", mode:"critical", concept:"El Zorro",
        text:"¿Cuál es el secreto que el Zorro le revela al Principito antes de despedirse?",
        options:["Que la vida es corta y hay que disfrutarla","Lo esencial es invisible a los ojos: solo se ve bien con el corazón","Que los adultos son irremediablemente malos","Que debe regresar a su planeta lo antes posible"],
        correct:1, feedback:"'Lo esencial es invisible a los ojos' es la tesis del libro: el valor real de las cosas no se puede ver con los ojos.", feedbackAlt:"Esta frase también explica el vínculo con la Rosa: su valor no está en su apariencia sino en la relación construida." },
      { difficulty:"hard", mode:"critical", concept:"Los planetas",
        text:"¿Qué lección sobre la autoridad y el deber le da el Rey del primer planeta al Principito?",
        options:["Que la autoridad se ejerce por la fuerza","Que un buen rey solo ordena lo que ya va a ocurrir: no impone su voluntad, sino que formaliza lo que es natural","Que la autoridad depende del número de súbditos","Que mandar es más difícil que obedecer"],
        correct:1, feedback:"El Rey solo ordena lo que ya va a pasar. Eso es la crítica a la autoridad vacía: el poder que solo existe de nombre.", feedbackAlt:"Esta escena satiriza a los líderes que se atribuyen el mérito de lo que ocurriría de todas formas." },
      { difficulty:"hard", mode:"critical", concept:"El regreso",
        text:"¿Qué método usa el Principito para regresar a su planeta y qué trato hace con la serpiente?",
        options:["Construye una nave espacial","Deja que la serpiente lo pique — su veneno lo libera del cuerpo para que pueda regresar a su asteroide","El narrador lo lleva de regreso","Regresa volando por sus propios medios"],
        correct:1, feedback:"La picadura de la serpiente es una muerte simbólica: el cuerpo queda, el Principito vuela de regreso.", feedbackAlt:"Saint-Exupéry usa esta escena para hablar de la muerte no como fin sino como retorno." },
      { difficulty:"easy", mode:"critical", concept:"El geógrafo",
        text:"¿Por qué el geógrafo no tiene registrados los ríos o montañas de su propio mundo?",
        options:["Porque los mapas tardan mucho tiempo en actualizarse","Porque solo registra lo que le cuentan los exploradores: nunca sale de su escritorio a ver directamente","Porque los ríos y montañas cambian constantemente","Porque su trabajo es solo teórico"],
        correct:1, feedback:"El geógrafo es la crítica a los intelectuales que estudian el mundo sin vivirlo. Sabe todo de memoria, nada de experiencia.", feedbackAlt:"Esta escena satiriza el conocimiento abstracto desconectado de la realidad directa." },
      { difficulty:"medium", mode:"critical", concept:"El bebedor",
        text:"¿Qué absurda lógica sigue el bebedor para justificar su vicio?",
        options:["Bebe para celebrar los buenos momentos","Bebe para olvidar la vergüenza de beber: un círculo vicioso que se autoalimenta sin salida","Bebe porque tiene frío en su planeta","Bebe porque los demás se lo piden"],
        correct:1, feedback:"El bebedor es la metáfora de la adicción: la vergüenza genera el vicio y el vicio genera la vergüenza.", feedbackAlt:"Saint-Exupéry muestra la absurdidad de muchas lógicas adultas que nos atrapan en círculos." },
      { difficulty:"easy", mode:"critical", concept:"La rosa y el jardín",
        text:"¿Por qué el Principito llora al ver el jardín lleno de rosas iguales a la suya?",
        options:["Porque le recuerdan cuánto extraña su planeta","Porque creyó que su Rosa era única pero hay miles iguales, cuestionando su valor especial","Porque las rosas del jardín son más bellas","Porque tiene alergia a las flores"],
        correct:1, feedback:"Ese momento es la crisis del libro: si hay miles iguales, ¿qué hace especial a su Rosa?", feedbackAlt:"La respuesta la dará el Zorro: su Rosa es única no por ser diferente sino porque él la ha cultivado." },
      { difficulty:"hard", mode:"critical", concept:"El narrador adulto",
        text:"¿Qué revela que el narrador adulto siga siendo capaz de ver el cordero dentro de la caja?",
        options:["Que nunca creció realmente","Que conserva la capacidad infantil de ver con el corazón, de imaginar lo esencial invisible","Que la caja tenía un hueco y realmente había un cordero","Que el Principito nunca existió, era una ilusión del narrador"],
        correct:1, feedback:"El narrador adulto que aún puede ver el cordero demuestra que no todo lo infantil se pierde al crecer.", feedbackAlt:"Saint-Exupéry escribió el libro desde el exilio durante la Segunda Guerra Mundial: era un adulto que pedía no olvidar al niño interior." },
    ],
    flashcards:[
      { id:"fc1", front:"¿Cuál es la frase central del libro?", back:"'Lo esencial es invisible a los ojos. Solo se ve bien con el corazón.'" },
      { id:"fc2", front:"¿Qué representan los baobabs?", back:"Los malos pensamientos o vicios que deben combatirse cuando son pequeños antes de volverse irremediables." },
      { id:"fc3", front:"¿Por qué la Rosa del Principito es única?", back:"No por ser la más bella, sino porque él la ha cuidado y ella lo ha cuidado a él. El vínculo es lo que crea unicidad." },
      { id:"fc4", front:"¿Qué critica Saint-Exupéry con los habitantes de los planetas?", back:"Los vicios adultos: la autoridad vacía, la vanidad, la adicción, la acumulación, el conocimiento sin experiencia." },
    ],
    debatePrompts:[{ id:"principito-d1", question:"¿El Principito es un libro para niños o para adultos?", context:"Está escrito para niños pero critica a los adultos. ¿Quién realmente necesita leerlo?" }],
    forumId:"principito-forum"
  },

  // ── 7. El retrato de Dorian Gray ─────────────────────────────
  {
    id:"dorian",
    title:"El retrato de Dorian Gray",
    author:"Oscar Wilde",
    year:1890,
    genre:"Novela gótica",
    tagline:"La belleza es la única forma de genialidad.",
    color:"#2C4A2E",
    spine:"#1A2E1C",
    questions:[
      { difficulty:"easy", mode:"critical", concept:"El deseo de Dorian",
        text:"¿Qué petición formula Dorian Gray al ver el cuadro terminado?",
        options:["Quiere que le regalen el cuadro","Desea en voz alta que el cuadro envejezca en su lugar mientras él permanece joven","Pide destruir el cuadro porque lo avergüenza","Solicita que lo exhiban en una galería de arte"],
        correct:1, feedback:"Dorian desea que el cuadro cargue con su envejecimiento y sus pecados. El deseo se cumple mágicamente.", feedbackAlt:"Este momento inicial establece el pacto fáustico central de la novela." },
      { difficulty:"easy", mode:"critical", concept:"Lord Henry",
        text:"¿Cómo influye Lord Henry en Dorian?",
        options:["Lo protege de los excesos de la vida","Lo corrompe con una filosofía del placer sin consecuencias, haciéndolo creer que la juventud y la belleza son lo único que importa","Lo educa en valores morales sólidos","Lord Henry no tiene influencia significativa"],
        correct:1, feedback:"Lord Henry es el corruptor intelectual: seduce con palabras brillantes que destruyen la moral.", feedbackAlt:"Lord Henry planta las ideas que Lord Wotton luego ve crecer en Dorian. Nunca actúa: solo habla." },
      { difficulty:"medium", mode:"critical", concept:"Sibyl Vane",
        text:"¿Quién es Sibyl Vane y qué causa la ruptura con Dorian?",
        options:["Una pintora que rivalizaba con Basil","Una actriz a quien Dorian amaba por su arte, pero la abandona cuando su amor real la hace actuar mal","La hermana de Lord Henry","La mujer que descubrió el secreto del cuadro"],
        correct:1, feedback:"Dorian amaba a Sibyl como personaje escénico, no como persona real. Cuando el amor la humanizó, perdió lo que él amaba.", feedbackAlt:"Su suicidio es el primer crimen moral de Dorian, el primero que el cuadro registra." },
      { difficulty:"medium", mode:"critical", concept:"El primer cambio",
        text:"¿Cuál es el primer cambio visible que Dorian nota en el retrato tras rechazar a Sibyl?",
        options:["El cuadro empieza a desvanecerse","Aparece una línea de crueldad en la boca del retratado","El cuadro comienza a envejecer físicamente","El color del cuadro cambia a tonos oscuros"],
        correct:1, feedback:"Una línea de crueldad en la boca: el primer pecado moral deja su marca en el cuadro, no en el rostro.", feedbackAlt:"Wilde muestra que la crueldad antecede al envejecimiento físico. El alma se corrompe antes que el cuerpo." },
      { difficulty:"hard", mode:"critical", concept:"El libro amarillo",
        text:"¿Cómo influye el libro amarillo que Lord Henry le regala a Dorian?",
        options:["Lo reforma moralmente","Se convierte en su biblia del hedonismo: guía su vida hacia el placer sin límites durante décadas","Lo inspira a crear arte","No tiene impacto significativo en su conducta"],
        correct:1, feedback:"El libro es la filosofía de Lord Henry cristalizada: Dorian lo lee cientos de veces y moldea su vida según él.", feedbackAlt:"Wilde nunca nombra el libro. Se cree que es 'A rebours' de Huysmans, símbolo del decadentismo francés." },
      { difficulty:"hard", mode:"critical", concept:"La muerte de Basil",
        text:"¿Cómo reacciona Dorian cuando Basil le suplica ver el cuadro para comprobar los rumores?",
        options:["Le muestra el cuadro y Basil lo perdona","Le muestra el cuadro y, horrorizado por la reacción de Basil ante su monstruosidad, lo asesina","Niega que el cuadro haya cambiado","Destruye el cuadro antes de que Basil llegue"],
        correct:1, feedback:"Dorian mata a Basil para proteger su secreto. Es el crimen físico que sigue al moral.", feedbackAlt:"La muerte de Basil es el punto de no retorno: Dorian ya no puede pretender que sus actos no tienen consecuencias." },
      { difficulty:"easy", mode:"critical", concept:"El escondite",
        text:"¿Dónde esconde Dorian el retrato?",
        options:["En el sótano","En el ático de la casa, en el cuarto donde jugaba de niño, cerrado con llave","En la bóveda de un banco","En la galería de Basil Hallward"],
        correct:1, feedback:"El ático-sala de la infancia: el lugar donde guardamos lo que no queremos ver pero no podemos destruir.", feedbackAlt:"La elección del espacio es simbólica: los secretos se guardan arriba, fuera de la vista cotidiana." },
      { difficulty:"hard", mode:"critical", concept:"El final",
        text:"¿Qué ocurre cuando Dorian apuñala el lienzo al final?",
        options:["El cuadro se destruye y Dorian queda libre","Dorian muere horriblemente envejecido y el cuadro recupera su belleza original","El cuadro permanece intacto y Dorian escapa","El cuadro se desvanece sin consecuencias"],
        correct:1, feedback:"Intentar destruir su conciencia lo destruye a él. El cuadro siempre fue su alma, no solo su imagen.", feedbackAlt:"El final es la justicia poética de Wilde: no puedes destruir tu propia alma sin destruirte a ti mismo." },
      { difficulty:"medium", mode:"critical", concept:"James Vane",
        text:"¿Quién intenta vengar la muerte de Sibyl Vane y cómo se frustra ese intento?",
        options:["Lord Henry, que decide denunciar a Dorian","James Vane, el hermano de Sibyl, que persigue a Dorian pero se detiene porque Dorian sigue pareciendo joven","Basil Hallward, que confronta a Dorian con el cuadro","Nadie intenta vengarse de Dorian"],
        correct:1, feedback:"James no puede creer que el hombre que arruinó a su hermana hace 18 años siga siendo tan joven. El retrato lo salva.", feedbackAlt:"La juventud de Dorian, su privilegio, lo protege literalmente de la justicia. Wilde critica esto también." },
      { difficulty:"easy", mode:"critical", concept:"El mensaje de Wilde",
        text:"¿Cuál es el mensaje central de la novela sobre la relación entre belleza y moral?",
        options:["La belleza física garantiza la virtud moral","La belleza exterior puede coexistir con la corrupción interior: apariencia y realidad pueden ser completamente opuestas","La fealdad es siempre signo de maldad","La moral no importa si eres suficientemente bello"],
        correct:1, feedback:"Wilde muestra la falsedad de juzgar por la apariencia. Dorian es bello y monstruoso simultáneamente.", feedbackAlt:"El cuadro materializa la verdad que la belleza exterior oculta. Wilde era el hombre más brillante de su era y el más castigado por su 'apariencia'." },
    ],
    flashcards:[
      { id:"fc1", front:"¿Cuál es el pacto fáustico de Dorian Gray?", back:"Desea que el retrato envejezca y cargue sus pecados mientras él permanece joven y bello." },
      { id:"fc2", front:"¿Qué representa el retrato?", back:"El alma de Dorian: registra cada pecado moral mientras su cara permanece inmaculada." },
      { id:"fc3", front:"¿Qué papel cumple Lord Henry?", back:"El corruptor intelectual: seduce con filosofía del placer sin actuar directamente." },
      { id:"fc4", front:"¿Qué ocurre cuando Dorian apuñala el cuadro?", back:"Muere horriblemente envejecido. El cuadro recupera su belleza. No puedes destruir tu alma sin destruirte a ti mismo." },
    ],
    debatePrompts:[{ id:"dorian-d1", question:"¿Es Dorian Gray víctima de Lord Henry o responsable de sus propias elecciones?", context:"Lord Henry lo sedujo con ideas. Pero Dorian eligió vivir según ellas. ¿Dónde está la responsabilidad?" }],
    forumId:"dorian-forum"
  },
];

/* ================================================================
  DISEÑO — Paleta tipo biblioteca antigua
================================================================ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500;600&display=swap');

  :root {
    --ink:     #1A0F0A;
    --ink2:    #4A3728;
    --paper:   #F8F4E9;
    --cream:   #EDE8D6;
    --gold:    #C9973A;
    --goldL:   #E8C06A;
    --wood:    #6B4226;
    --woodD:   #3D2410;
    --border:  #D4C5A0;
    --green:   #2A5C2A;
    --red:     #8B1A1A;
    --shadow:  rgba(26,15,10,0.18);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: var(--paper);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Tipografía ── */
  .display  { font-family: 'Playfair Display', Georgia, serif; }
  .serif    { font-family: 'Lora', Georgia, serif; }
  .sans     { font-family: 'DM Sans', system-ui, sans-serif; }

  /* ── Botones ── */
  .btn-gold {
    background: linear-gradient(135deg, #C9973A 0%, #E8C06A 50%, #C9973A 100%);
    color: #1A0F0A;
    border: none;
    padding: 12px 22px;
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.3px;
    box-shadow: 0 2px 8px rgba(201,151,58,0.4);
    transition: all 0.2s;
  }
  .btn-gold:hover  { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(201,151,58,0.5); }
  .btn-gold:active { transform: translateY(0); }
  .btn-gold:disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }

  .btn-outline {
    background: transparent;
    color: var(--ink);
    border: 1.5px solid var(--border);
    padding: 11px 20px;
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-outline:hover { border-color: var(--gold); color: var(--wood); background: rgba(201,151,58,0.06); }

  .btn-back {
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--gold);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    font-weight: 500;
  }
  .btn-back:hover { color: var(--wood); }

  /* ── Chips ── */
  .chip {
    display: inline-block;
    padding: 3px 10px;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 11px;
    color: var(--ink2);
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.2px;
  }
  .chip-easy   { background: #e8f5e9; border-color: #4a8c4a; color: #1a5c1a; }
  .chip-medium { background: #fff3e0; border-color: #c07020; color: #7a4800; }
  .chip-hard   { background: #fde8e8; border-color: #c04040; color: #7a1010; }

  /* ── Highlight ── */
  .highlight-word { background: #FFE066; padding: 1px 3px; border-radius: 2px; cursor: pointer; transition: background 0.15s; }
  .highlight-word:hover { background: #FFD030; }

  /* ── Estante de libros ── */
  .bookshelf {
    background: linear-gradient(180deg, #5C3317 0%, #3D2010 40%, #2A1508 100%);
    border-radius: 0 0 8px 8px;
    padding: 16px 16px 24px;
    box-shadow: inset 0 4px 12px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3);
    position: relative;
  }
  .bookshelf::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 8px;
    background: linear-gradient(180deg, #8B5E3C 0%, #6B4226 100%);
    border-radius: 0 0 4px 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  }
  .bookshelf::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 12px;
    background: linear-gradient(180deg, #2A1508 0%, #1A0A03 100%);
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }

  .shelf-row {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    padding: 8px 8px 20px;
    position: relative;
    flex-wrap: wrap;
    justify-content: center;
  }
  .shelf-row::after {
    content: '';
    position: absolute;
    bottom: 10px; left: 0; right: 0;
    height: 6px;
    background: linear-gradient(180deg, #8B5E3C 0%, #6B4226 100%);
    border-radius: 2px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  }

  /* ── Libro (lomo) ── */
  .book-spine {
    position: relative;
    width: 52px;
    min-height: 140px;
    border-radius: 3px 6px 6px 3px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s;
    transform-origin: bottom center;
    box-shadow: -3px 0 8px rgba(0,0,0,0.4), 2px 0 4px rgba(255,255,255,0.06), inset -4px 0 8px rgba(0,0,0,0.3);
  }
  .book-spine::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0; left: 0;
    width: 6px;
    background: rgba(0,0,0,0.25);
    border-radius: 3px 0 0 3px;
  }
  .book-spine::after {
    content: '';
    position: absolute;
    top: 4px; bottom: 4px; right: 4px;
    width: 1px;
    background: rgba(255,255,255,0.12);
  }
  .book-spine:hover {
    transform: translateY(-12px) rotate(-2deg);
    box-shadow: -4px 12px 20px rgba(0,0,0,0.5), 2px 0 4px rgba(255,255,255,0.1);
    z-index: 10;
  }
  .book-spine:active { transform: translateY(-6px) rotate(-1deg); }

  .book-title-spine {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.92);
    text-align: center;
    padding: 8px 0;
    line-height: 1.2;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    max-height: 100px;
    overflow: hidden;
  }
  .book-author-spine {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    font-family: 'DM Sans', sans-serif;
    font-size: 8px;
    color: rgba(255,255,255,0.55);
    margin-top: 4px;
    letter-spacing: 0.3px;
  }

  /* ── Header hero ── */
  .hero-header {
    background: linear-gradient(160deg, var(--woodD) 0%, #2C1808 60%, #1A0F05 100%);
    padding: 32px 20px 0;
    position: relative;
    overflow: hidden;
  }
  .hero-header::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,151,58,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-header::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 20px;
    background: linear-gradient(180deg, transparent 0%, var(--paper) 100%);
    pointer-events: none;
  }

  /* ── Tarjeta de info ── */
  .info-card {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 18px 20px;
    margin-bottom: 14px;
  }
  .info-card-gold {
    background: linear-gradient(135deg, rgba(201,151,58,0.1) 0%, rgba(232,192,106,0.06) 100%);
    border: 1px solid rgba(201,151,58,0.35);
  }

  /* ── Botón de dificultad ── */
  .diff-btn {
    width: 100%;
    padding: 14px 18px;
    margin-bottom: 10px;
    background: var(--cream);
    border: 1.5px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .diff-btn:hover { border-color: var(--gold); background: rgba(201,151,58,0.06); transform: translateX(3px); }

  /* ── Debate/forum card ── */
  .debate-card {
    padding: 16px 18px;
    background: var(--cream);
    border: 1.5px solid var(--border);
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .debate-card:hover { border-color: var(--gold); transform: translateX(3px); }

  /* ── Respuesta opción ── */
  .answer-btn {
    width: 100%;
    padding: 14px 16px;
    background: var(--cream);
    border: 1.5px solid var(--border);
    border-radius: 8px;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    transition: all 0.15s;
    margin-bottom: 8px;
  }
  .answer-btn:hover:not(:disabled) { border-color: var(--gold); background: rgba(201,151,58,0.06); }
  .answer-correct { background: #e8f5e9 !important; border-color: #2a7a2a !important; color: #1a5c1a !important; }
  .answer-wrong   { background: #fde8e8 !important; border-color: #8b1a1a !important; color: #6b1212 !important; }
  .answer-faded   { opacity: 0.45; }
  .answer-selected:not(.answer-correct):not(.answer-wrong) { border-color: var(--gold) !important; background: rgba(201,151,58,0.1) !important; }

  /* ── Fragmento ── */
  .fragment-box {
    background: var(--cream);
    border-left: 4px solid var(--gold);
    border-radius: 0 8px 8px 0;
    padding: 18px 20px;
    margin-bottom: 18px;
    font-family: 'Lora', Georgia, serif;
    font-size: 14px;
    line-height: 1.8;
    color: var(--ink2);
  }

  /* ── NavBar ── */
  .navbar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    max-width: 480px;
    margin: 0 auto;
    background: var(--woodD);
    border-top: 2px solid rgba(201,151,58,0.3);
    display: flex;
    z-index: 100;
  }
  .nav-btn {
    flex: 1;
    padding: 12px 8px 14px;
    background: transparent;
    border: none;
    border-top: 3px solid transparent;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    color: rgba(255,255,255,0.5);
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    transition: all 0.2s;
  }
  .nav-btn.active { color: var(--goldL); border-top-color: var(--gold); }
  .nav-btn:hover:not(.active) { color: rgba(255,255,255,0.75); }

  /* ── TopBar ── */
  .topbar {
    padding: 14px 18px;
    background: var(--woodD);
    border-bottom: 1px solid rgba(201,151,58,0.2);
    display: flex;
    align-items: center;
    gap: 14px;
  }

  /* ── Progreso ── */
  .progress-bar { height: 4px; background: var(--cream); }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--goldL)); transition: width 0.4s; }

  /* ── Feedback card ── */
  .feedback-correct { background: #e8f5e9; border-left: 4px solid #2a7a2a; border-radius: 0 8px 8px 0; padding: 16px 18px; margin-top: 16px; }
  .feedback-wrong   { background: rgba(201,151,58,0.08); border-left: 4px solid var(--gold); border-radius: 0 8px 8px 0; padding: 16px 18px; margin-top: 16px; }

  /* ── Input / Textarea ── */
  .text-input {
    width: 100%;
    padding: 13px 16px;
    background: var(--cream);
    border: 1.5px solid var(--border);
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--ink);
    outline: none;
    transition: border-color 0.2s;
  }
  .text-input:focus { border-color: var(--gold); }
  textarea.text-input { resize: vertical; line-height: 1.6; font-family: 'Lora', Georgia, serif; }

  /* ── Flashcard ── */
  .flashcard {
    border: 2px solid var(--gold);
    border-radius: 12px;
    padding: 36px 24px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.25s;
    text-align: center;
  }
  .flashcard:hover { box-shadow: 0 4px 20px rgba(201,151,58,0.25); }
  .flashcard.flipped { background: rgba(201,151,58,0.08); }

  /* ── Thread card ── */
  .thread-card {
    margin-bottom: 10px;
    padding: 14px 16px;
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .thread-card:hover { border-color: var(--gold); transform: translateX(3px); }

  /* ── Like button ── */
  .like-btn {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 3px 12px;
    font-size: 13px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    color: var(--ink2);
  }
  .like-btn:hover  { border-color: var(--gold); color: var(--wood); }
  .like-btn.liked  { background: rgba(201,151,58,0.1); border-color: var(--gold); color: var(--wood); }

  /* ── Stat card ── */
  .stat-card {
    padding: 18px 16px;
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  /* ── Divider con texto ── */
  .divider-text {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 16px 0;
    color: var(--ink2);
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
  }
  .divider-text::before, .divider-text::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Scroll personalizado ── */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  @media (prefers-reduced-motion: reduce) {
    .book-spine { transition: none; }
    .btn-gold, .btn-outline, .diff-btn, .debate-card, .thread-card { transition: none; }
  }
`;

const DIFF = {
  easy:   { label:"Fácil",   cls:"chip-easy",   color:"#1a5c1a", icon:"○" },
  medium: { label:"Media",   cls:"chip-medium",  color:"#7a4800", icon:"◑" },
  hard:   { label:"Difícil", cls:"chip-hard",    color:"#7a1010", icon:"●" },
};

/* ================================================================
  APP PRINCIPAL
================================================================ */
export default function App() {
  const [screen, setScreen]             = useState("home");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [selectedDiff, setSelectedDiff] = useState(null);
  const [user, setUser]                 = useState(null);
  const [streak, setStreak]             = useState(0);
  const [points, setPoints]             = useState(0);
  const [completedBooks, setCompletedBooks] = useState([]);
  const [globalStats, setGlobalStats]   = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const d = snap.data();
          setStreak(d.streak || 0);
          setPoints(d.points || 0);
          setCompletedBooks(d.completedBooks || []);
        }
      }
    });
    return unsub;
  }, []);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    try {
      const snap = await getDoc(doc(db, "stats", "global"));
      if (snap.exists()) setGlobalStats(snap.data());
    } catch (e) {}
  }

  async function onChallengeComplete(bookId, earned) {
    const np = points + earned, ns = streak + 1;
    const nc = completedBooks.includes(bookId) ? completedBooks : [...completedBooks, bookId];
    setPoints(np); setStreak(ns); setCompletedBooks(nc);
    if (user) {
      await setDoc(doc(db, "users", user.uid),
        { streak: ns, points: np, completedBooks: nc, lastActivity: serverTimestamp() },
        { merge: true });
    }
    try {
      await updateDoc(doc(db, "stats", "global"), {
        [`books.${bookId}.completions`]: increment(1), totalChallenges: increment(1)
      });
      fetchStats();
    } catch (e) {}
  }

  function goBook(b)  { setSelectedBook(b);  setScreen("book"); }
  function goChallenge(d) { setSelectedDiff(d); setScreen("challenge"); }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--paper)", display: "flex", flexDirection: "column" }}>
      <style>{STYLES}</style>
      <div style={{ flex: 1, paddingBottom: 76 }}>
        {screen === "home"       && <HomeScreen globalStats={globalStats} onPickBook={goBook} />}
        {screen === "book"       && selectedBook && <BookScreen book={selectedBook} onBack={() => setScreen("home")} onStartChallenge={goChallenge} onOpenDebate={(d) => { setSelectedDebate(d); setScreen("debate"); }} onOpenFlashcards={() => setScreen("flashcards")} onOpenForum={() => setScreen("forum")} />}
        {screen === "challenge"  && selectedBook && <ChallengeScreen book={selectedBook} difficulty={selectedDiff} onBack={() => setScreen("book")} onComplete={(pts) => onChallengeComplete(selectedBook.id, pts)} />}
        {screen === "debate"     && selectedDebate && selectedBook && <DebateScreen book={selectedBook} debate={selectedDebate} onBack={() => setScreen("book")} user={user} />}
        {screen === "flashcards" && selectedBook && <FlashcardsScreen book={selectedBook} onBack={() => setScreen("book")} />}
        {screen === "forum"      && selectedBook && <ForumScreen book={selectedBook} onBack={() => setScreen("book")} user={user} />}
        {screen === "profile"    && <ProfileScreen streak={streak} points={points} completedBooks={completedBooks} user={user} onLogout={() => setScreen("home")} />}
      </div>
      {(screen === "home" || screen === "profile") && (
        <NavBar current={screen} onChange={setScreen} streak={streak} />
      )}
    </div>
  );
}

/* ================================================================
  TOP BAR
================================================================ */
function TopBar({ onBack, title, subtitle, light = true }) {
  return (
    <div className="topbar">
      <button className="btn-back" onClick={onBack} style={{ color: light ? "var(--goldL)" : "var(--gold)" }}>
        ← Volver
      </button>
      <div style={{ flex: 1, textAlign: "center" }}>
        <div className="display" style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>{title}</div>
        {subtitle && <div className="sans" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2, letterSpacing: 0.5 }}>{subtitle}</div>}
      </div>
      <div style={{ width: 60 }} />
    </div>
  );
}

/* ================================================================
  NAV BAR
================================================================ */
function NavBar({ current, onChange, streak }) {
  const tabs = [
    { id:"home",    label:"Biblioteca", icon:"📚" },
    { id:"profile", label:"Mi Perfil",  icon:"✦"  },
  ];
  return (
    <div className="navbar">
      {tabs.map(t => (
        <button key={t.id} className={`nav-btn ${current === t.id ? "active" : ""}`} onClick={() => onChange(t.id)}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span>{t.label}</span>
          {t.id === "profile" && streak > 0 && (
            <span style={{ position:"absolute", top:8, marginLeft:22, background:"var(--gold)", color:"var(--ink)", borderRadius:10, fontSize:9, padding:"1px 5px", fontWeight:700 }}>{streak}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ================================================================
  HOME — El estante de libros
================================================================ */
function HomeScreen({ globalStats, onPickBook }) {
  // Agrupamos libros en filas de máximo 4
  const rows = [];
  for (let i = 0; i < BOOKS.length; i += 4) rows.push(BOOKS.slice(i, i + 4));

  return (
    <div>
      {/* ── Hero Header ── */}
      <div className="hero-header">
        <div style={{ position:"relative", zIndex:1, paddingBottom: 28 }}>
          <div className="sans" style={{ fontSize:11, color:"rgba(201,151,58,0.7)", letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>
            Año I · Número 01
          </div>
          <h1 className="display" style={{ fontSize:52, fontWeight:900, color:"#F8F4E9", lineHeight:0.95, letterSpacing:"-0.02em" }}>
            Análisis
          </h1>
          <div className="serif" style={{ fontSize:17, color:"rgba(201,151,58,0.85)", marginTop:8, fontStyle:"italic" }}>
            la lectura como pensamiento
          </div>
          <p className="sans" style={{ fontSize:13, color:"rgba(248,244,233,0.6)", marginTop:14, lineHeight:1.7, maxWidth:360 }}>
            La primera plataforma de análisis crítico literario en español. Debates reales, flashcards y desafíos por nivel.
          </p>

          {/* Stats */}
          {globalStats && (globalStats.totalChallenges || 0) > 0 && (
            <div className="sans" style={{ marginTop:16, display:"inline-flex", alignItems:"center", gap:8, background:"rgba(201,151,58,0.15)", border:"1px solid rgba(201,151,58,0.3)", borderRadius:20, padding:"6px 14px", fontSize:12, color:"rgba(201,151,58,0.9)" }}>
              <span>✦</span>
              <span>{globalStats.totalChallenges} desafíos completados esta semana</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Estante ── */}
      <div className="bookshelf" style={{ margin: "0 0 24px" }}>
        <div className="sans" style={{ fontSize:10, color:"rgba(248,244,233,0.35)", letterSpacing:3, textTransform:"uppercase", textAlign:"center", marginBottom:8, paddingTop:16 }}>
          Biblioteca · {BOOKS.length} obras
        </div>
        {rows.map((row, ri) => (
          <div key={ri} className="shelf-row">
            {row.map((book) => (
              <BookSpine key={book.id} book={book} onClick={() => onPickBook(book)} />
            ))}
          </div>
        ))}
      </div>

      {/* ── Lista compacta ── */}
      <div style={{ padding:"0 16px 16px" }}>
        <div className="divider-text">Todas las obras</div>
        {BOOKS.map((book) => (
          <BookListItem key={book.id} book={book} onClick={() => onPickBook(book)} globalStats={globalStats} />
        ))}
      </div>
    </div>
  );
}

function BookSpine({ book, onClick }) {
  const heights = { 1984:160, granja:148, chocolate:154, espiritus:166, maus:145, principito:140, dorian:158 };
  const h = heights[book.id] || 150;

  return (
    <div className="book-spine" style={{ backgroundColor: book.color, height: h }} onClick={onClick} title={book.title}>
      {/* Degradado lateral que simula grosor */}
      <div style={{ position:"absolute", top:0, bottom:0, right:0, width:8, background:`linear-gradient(90deg, transparent, rgba(255,255,255,0.08))`, borderRadius:"0 6px 6px 0" }} />
      {/* Decoración dorada en el lomo */}
      <div style={{ position:"absolute", top:12, left:0, right:0, height:1, background:"rgba(201,151,58,0.4)" }} />
      <div style={{ position:"absolute", bottom:12, left:0, right:0, height:1, background:"rgba(201,151,58,0.4)" }} />
      <span className="book-title-spine">{book.title}</span>
      <span className="book-author-spine">{book.author.split(" ").pop()}</span>
    </div>
  );
}

function BookListItem({ book, onClick, globalStats }) {
  const stats = globalStats?.books?.[book.id];
  return (
    <div onClick={onClick}
      style={{ marginBottom:10, padding:"14px 16px", background:"var(--cream)", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", display:"flex", gap:14, alignItems:"center", transition:"all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.transform = "translateX(4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}>
      {/* Mini lomo */}
      <div style={{ width:10, height:52, borderRadius:2, backgroundColor: book.color, flexShrink:0, boxShadow:"-2px 0 4px rgba(0,0,0,0.2)" }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div className="sans" style={{ fontSize:11, color:"var(--ink2)", marginBottom:2 }}>{book.genre} · {book.year}</div>
        <div className="display" style={{ fontSize:17, fontWeight:700, lineHeight:1.2, marginBottom:2 }}>{book.title}</div>
        <div className="sans" style={{ fontSize:12, color:"var(--ink2)", marginBottom:6 }}>{book.author}</div>
        <div className="sans" style={{ fontSize:12, color:"var(--ink2)" }}>
          {book.questions.length} preguntas · {book.flashcards.length} flashcards
          {stats?.completions > 0 && <span style={{ color:"var(--gold)", marginLeft:6 }}>· {stats.completions} completados</span>}
        </div>
      </div>
      <span style={{ fontSize:18, color:"var(--gold)", flexShrink:0 }}>›</span>
    </div>
  );
}

/* ================================================================
  BOOK SCREEN
================================================================ */
function BookScreen({ book, onBack, onStartChallenge, onOpenDebate, onOpenFlashcards, onOpenForum }) {
  const diffs = ["easy","medium","hard"];

  return (
    <div>
      <TopBar onBack={onBack} title={book.title} subtitle={book.author} />

      {/* Cabecera del libro */}
      <div style={{ background:`linear-gradient(160deg, ${book.spine} 0%, ${book.color} 60%, var(--ink) 100%)`, padding:"28px 20px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:160, height:160, borderRadius:"50%", background:"rgba(201,151,58,0.1)", pointerEvents:"none" }} />
        <div className="sans" style={{ fontSize:10, color:"rgba(201,151,58,0.7)", letterSpacing:3, textTransform:"uppercase", marginBottom:6 }}>{book.genre} · {book.year}</div>
        <h1 className="display" style={{ fontSize:34, fontWeight:900, color:"#F8F4E9", lineHeight:1, letterSpacing:"-0.01em", marginBottom:6 }}>{book.title}</h1>
        <div className="serif" style={{ fontSize:15, color:"rgba(232,192,106,0.8)", fontStyle:"italic" }}>{book.author}</div>
        <div style={{ width:40, height:2, background:"rgba(201,151,58,0.5)", margin:"14px 0" }} />
        <p className="serif" style={{ fontSize:16, color:"rgba(248,244,233,0.75)", lineHeight:1.55, fontStyle:"italic" }}>
          "{book.tagline}"
        </p>
      </div>

      <div style={{ padding:"20px 16px 100px" }}>
        {/* Desafíos por nivel */}
        <div className="info-card info-card-gold" style={{ marginBottom:16 }}>
          <div className="display" style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>Análisis crítico</div>
          <div className="sans" style={{ fontSize:13, color:"var(--ink2)", marginBottom:16 }}>Elige un nivel. 8 preguntas seleccionadas al azar del banco de {book.questions.length}.</div>
          {diffs.map(d => {
            const count = book.questions.filter(q => q.difficulty === d).length;
            if (!count) return null;
            return (
              <button key={d} className="diff-btn" onClick={() => onStartChallenge(d)}>
                <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span className={`chip ${DIFF[d].cls}`}>{DIFF[d].label}</span>
                  <span className="sans" style={{ fontSize:13, color:"var(--ink)" }}>{count} preguntas disponibles</span>
                </span>
                <span style={{ color:"var(--gold)", fontSize:18 }}>→</span>
              </button>
            );
          })}
        </div>

        {/* Flashcards */}
        <div className="info-card" style={{ marginBottom:16 }}>
          <div className="display" style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>Flashcards</div>
          <div className="sans" style={{ fontSize:13, color:"var(--ink2)", marginBottom:14 }}>{book.flashcards.length} cartas base · más las que tú crees. 3 fases: repaso, escritura y trivia.</div>
          <button className="btn-gold" onClick={onOpenFlashcards}>Empezar flashcards →</button>
        </div>

        {/* Debates */}
        <div className="sans" style={{ fontSize:11, color:"var(--ink2)", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Debates abiertos</div>
        {book.debatePrompts.map(dp => (
          <div key={dp.id} className="debate-card" onClick={() => onOpenDebate(dp)}>
            <div className="display" style={{ fontSize:15, fontWeight:600, marginBottom:8, lineHeight:1.35 }}>❝ {dp.question}</div>
            <div className="sans" style={{ fontSize:12, color:"var(--gold)" }}>Argumentar →</div>
          </div>
        ))}

        {/* Foro */}
        <div className="info-card" style={{ marginTop:6 }}>
          <div className="display" style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>Foro · Preguntas y dudas</div>
          <div className="sans" style={{ fontSize:13, color:"var(--ink2)", marginBottom:14 }}>Pregunta lo que no entendiste. Otros lectores responden.</div>
          <button className="btn-outline" onClick={onOpenForum}>Entrar al foro →</button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
  CHALLENGE SCREEN — Con selección aleatoria no repetitiva
================================================================ */
function ChallengeScreen({ book, difficulty, onBack, onComplete }) {
  const pool = book.questions.filter(q => q.difficulty === difficulty);
  const N_QUESTIONS = Math.min(8, pool.length);

  // Selección aleatoria evitando preguntas de la última sesión
  const selectedQuestions = useMemo(() => {
    const storageKey = `lastQ_${book.id}_${difficulty}`;
    let lastUsed = [];
    try { lastUsed = JSON.parse(sessionStorage.getItem(storageKey) || "[]"); } catch (e) {}
    const qs = selectQuestions(pool, N_QUESTIONS, lastUsed);
    const newIndices = qs.map(q => q._poolIndex);
    try { sessionStorage.setItem(storageKey, JSON.stringify(newIndices)); } catch (e) {}
    return qs;
  }, [book.id, difficulty]);

  const [index, setIndex]           = useState(0);
  const [answered, setAnswered]     = useState(false);
  const [chosen, setChosen]         = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished]     = useState(false);
  const [expanded, setExpanded]     = useState(true);
  const [highlighted, setHighlighted] = useState([]);

  if (selectedQuestions.length === 0) {
    return (
      <div>
        <TopBar onBack={onBack} title="Sin preguntas" />
        <div style={{ padding:24, textAlign:"center", color:"var(--ink2)" }}>No hay preguntas de nivel {DIFF[difficulty].label}.</div>
      </div>
    );
  }

  const q = selectedQuestions[index];
  const total = selectedQuestions.length;

  function isCorrect() {
    return q.mode === "highlight" ? highlighted.includes(q.correctHighlight) : chosen === q.correct;
  }

  function submit() {
    if (answered) return;
    setAnswered(true);
    if (isCorrect()) setCorrectCount(c => c + 1);
  }

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1); setAnswered(false); setChosen(null); setHighlighted([]); setExpanded(true);
    } else {
      onComplete(correctCount * 10); setFinished(true);
    }
  }

  function toggleWord(w) {
    if (answered) return;
    setHighlighted(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  }

  if (finished) {
    const pct = Math.round((correctCount / total) * 100);
    return (
      <div>
        <TopBar onBack={onBack} title="Sesión completada" subtitle={book.title} />
        <div style={{ padding:"40px 20px", textAlign:"center" }}>
          <div className="display" style={{ fontSize:72, fontWeight:900, color:"var(--gold)", lineHeight:1 }}>{correctCount}</div>
          <div className="serif" style={{ fontSize:18, color:"var(--ink2)", marginTop:8, fontStyle:"italic" }}>
            {correctCount === total ? "¡Perfecto!" : `de ${total} correctas · ${pct}%`}
          </div>
          <div className="info-card" style={{ marginTop:28, textAlign:"left" }}>
            <div className="display" style={{ fontSize:22, fontWeight:700, color:"var(--gold)" }}>+{correctCount * 10} puntos</div>
            <div className="sans" style={{ fontSize:13, color:"var(--ink2)", marginTop:4 }}>Sumaste un día a tu racha de lectura.</div>
          </div>
          <button className="btn-gold" style={{ marginTop:24, width:"100%" }} onClick={onBack}>Volver al libro</button>
        </div>
      </div>
    );
  }

  const ok = isCorrect();

  return (
    <div>
      <TopBar onBack={onBack} title={`${DIFF[difficulty].label} · ${book.title}`} subtitle={`${index + 1} / ${total}`} />
      <div className="progress-bar">
        <div className="progress-fill" style={{ width:`${((index + (answered ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <div style={{ padding:"20px 16px 100px" }} key={index}>
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          <span className={`chip ${DIFF[q.difficulty].cls}`}>{DIFF[q.difficulty].label}</span>
          <span className="chip">
            {q.mode === "critical" ? "Análisis" : q.mode === "fragment" ? "Fragmento" : "Subrayar"}
          </span>
        </div>

        {q.concept && <div className="sans" style={{ fontSize:12, color:"var(--gold)", marginBottom:8, fontWeight:500 }}>Sobre: {q.concept}</div>}
        <h2 className="display" style={{ fontSize:19, fontWeight:600, lineHeight:1.4, marginBottom:20, color:"var(--ink)" }}>{q.text}</h2>

        {/* Fragmento expandible */}
        {(q.mode === "fragment" || q.mode === "highlight") && q.fragment && (
          <div style={{ marginBottom:18 }}>
            <button className="btn-outline" onClick={() => setExpanded(!expanded)}
              style={{ width:"100%", marginBottom:8, display:"flex", justifyContent:"space-between", fontSize:13 }}>
              <span>{expanded ? "Ocultar" : "Mostrar"} fragmento</span>
              <span>{expanded ? "▲" : "▼"}</span>
            </button>
            {expanded && (
              <div className="fragment-box">
                {q.mode === "highlight" ? (
                  <div>
                    {q.fragment.split(" ").map((word, i) => (
                      <span key={i} onClick={() => toggleWord(word)}
                        className={highlighted.includes(word) ? "highlight-word" : ""}
                        style={{ cursor:"pointer", marginRight:4 }}>{word}</span>
                    ))}
                  </div>
                ) : q.fragment}
              </div>
            )}
          </div>
        )}

        {/* Opciones */}
        {q.mode !== "highlight" && (
          <div style={{ marginBottom:4 }}>
            {q.options.map((opt, i) => {
              const isCorr = i === q.correct;
              const isPick = chosen === i;
              let cls = "answer-btn";
              if (answered) {
                if (isCorr)           cls += " answer-correct";
                else if (isPick)      cls += " answer-wrong";
                else                  cls += " answer-faded";
              } else if (isPick)      cls += " answer-selected";
              return (
                <button key={i} className={cls} disabled={answered} onClick={() => setChosen(i)}>
                  <span className="sans" style={{ color:"var(--gold)", minWidth:18, fontWeight:600 }}>{String.fromCharCode(97+i)}.</span>
                  <span style={{ flex:1 }}>{opt}</span>
                  {answered && isCorr && <span>✓</span>}
                  {answered && isPick && !isCorr && <span>✗</span>}
                </button>
              );
            })}
          </div>
        )}

        {!answered && (
          <button className="btn-gold" style={{ width:"100%", marginTop:8 }}
            disabled={q.mode === "highlight" ? highlighted.length === 0 : chosen === null}
            onClick={submit}>
            Confirmar respuesta
          </button>
        )}

        {answered && (
          <div className={ok ? "feedback-correct" : "feedback-wrong"}>
            <div className="sans" style={{ fontSize:13, fontWeight:700, color: ok ? "var(--green)" : "var(--gold)", marginBottom:8 }}>
              {ok ? "✓ Bien leído." : "✧ Otra lectura posible:"}
            </div>
            <p className="serif" style={{ fontSize:14, lineHeight:1.75, color:"var(--ink)" }}>
              {ok ? q.feedback : q.feedbackAlt}
            </p>
            <button className="btn-gold" style={{ marginTop:14, width:"100%" }} onClick={next}>
              {index + 1 < total ? "Siguiente →" : "Ver resultado →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
  FLASHCARDS — 3 fases + creación propia
================================================================ */
function FlashcardsScreen({ book, onBack }) {
  const storageKey = `customCards_${book.id}`;
  const [customCards, setCustomCards] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(storageKey) || "[]"); } catch (e) { return []; }
  });
  const [showCreate, setShowCreate] = useState(false);
  const [newFront, setNewFront]     = useState("");
  const [newBack, setNewBack]       = useState("");

  const allCards = useMemo(() => [...book.flashcards, ...customCards], [book.flashcards, customCards]);
  const cards = allCards.slice(0, 3);
  const N = cards.length;

  const [phase, setPhase]           = useState("review");
  const [idx, setIdx]               = useState(0);
  const [flipped, setFlipped]       = useState(false);
  const [writeAns, setWriteAns]     = useState("");
  const [writeChecked, setWriteChecked] = useState(false);
  const [score, setScore]           = useState(0);
  const [triviaChosen, setTriviaChosen]   = useState(null);
  const [triviaAnswered, setTriviaAnswered] = useState(false);

  const triviaOpts = useMemo(() => {
    return cards.map(card => {
      const correct = card.back;
      const wrongs  = cards.filter(c => c.id !== card.id).map(c => c.back);
      const all = [correct, ...wrongs];
      for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor((i + 1) * 0.37);
        [all[i], all[j]] = [all[j], all[i]];
      }
      return all;
    });
  }, [book.id, customCards.length]);

  function saveCard() {
    if (!newFront.trim() || !newBack.trim()) return;
    const nc = { id: `custom_${Date.now()}`, front: newFront.trim(), back: newBack.trim() };
    const updated = [...customCards, nc];
    setCustomCards(updated);
    try { sessionStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
    setNewFront(""); setNewBack(""); setShowCreate(false);
  }

  const card = cards[idx];

  function goNext(p) {
    const ni = idx + 1;
    if (ni < N) { setIdx(ni); }
    else {
      setIdx(0);
      if (p === "review")  setPhase("write");
      else if (p === "write") setPhase("trivia");
      else setPhase("done");
    }
    setFlipped(false); setWriteAns(""); setWriteChecked(false);
    setTriviaChosen(null); setTriviaAnswered(false);
  }

  if (phase === "done") {
    return (
      <div>
        <TopBar onBack={onBack} title="Flashcards" subtitle={book.title} />
        <div style={{ padding:"40px 16px", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
          <h2 className="display" style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>¡Completado!</h2>
          <p className="sans" style={{ fontSize:15, color:"var(--ink2)", marginBottom:24 }}>
            Obtuviste {score} de {N * 2} puntos posibles
          </p>
          <button className="btn-gold" style={{ width:"100%" }} onClick={onBack}>Volver al libro</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar onBack={onBack} title="Flashcards" subtitle={book.title} />
      <div style={{ padding:"20px 16px 100px" }}>
        {/* Botón crear propia */}
        {!showCreate ? (
          <div style={{ marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div className="sans" style={{ fontSize:12, color:"var(--ink2)" }}>
              {allCards.length} cartas ({customCards.length} tuyas) · usando las primeras 3
            </div>
            <button className="btn-outline" style={{ fontSize:12, padding:"6px 12px" }} onClick={() => setShowCreate(true)}>+ Nueva carta</button>
          </div>
        ) : (
          <div className="info-card" style={{ marginBottom:16 }}>
            <div className="display" style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Crear flashcard</div>
            <input className="text-input" placeholder="Pregunta (frente)" value={newFront} onChange={e => setNewFront(e.target.value)} style={{ marginBottom:8 }} />
            <input className="text-input" placeholder="Respuesta (reverso)" value={newBack} onChange={e => setNewBack(e.target.value)} style={{ marginBottom:12 }} />
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-gold" style={{ flex:1 }} onClick={saveCard} disabled={!newFront.trim() || !newBack.trim()}>Guardar</button>
              <button className="btn-outline" style={{ flex:1 }} onClick={() => setShowCreate(false)}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <span className="chip">Carta {idx+1} de {N}</span>
          <span className="sans" style={{ fontSize:12, color:"var(--ink2)" }}>
            {phase === "review" ? "Fase 1: Repaso" : phase === "write" ? "Fase 2: Escribe" : "Fase 3: Trivia"}
          </span>
        </div>

        {/* ── FASE 1 ── */}
        {phase === "review" && (
          <div>
            <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
              <div className="sans" style={{ fontSize:12, color:"var(--ink2)", marginBottom:12 }}>
                {flipped ? "Respuesta" : "Toca para ver la respuesta"}
              </div>
              <div className="display" style={{ fontSize:18, fontWeight:600, lineHeight:1.5, color:"var(--ink)" }}>
                {flipped ? card.back : card.front}
              </div>
            </div>
            {flipped ? (
              <button className="btn-gold" style={{ width:"100%", marginTop:16 }} onClick={() => goNext("review")}>
                {idx+1 < N ? "Siguiente carta →" : "Pasar a escribir →"}
              </button>
            ) : (
              <p className="sans" style={{ textAlign:"center", fontSize:13, color:"var(--ink2)", marginTop:14 }}>Toca la carta para voltearla</p>
            )}
          </div>
        )}

        {/* ── FASE 2 ── */}
        {phase === "write" && (
          <div>
            <div className="info-card" style={{ marginBottom:16 }}>
              <div className="sans" style={{ fontSize:12, color:"var(--ink2)", marginBottom:6 }}>Pregunta</div>
              <div className="display" style={{ fontSize:17, fontWeight:600, lineHeight:1.5 }}>{card.front}</div>
            </div>
            <textarea className="text-input" value={writeAns} onChange={e => setWriteAns(e.target.value)}
              disabled={writeChecked} placeholder="Escribe la respuesta con tus palabras..."
              style={{ minHeight:90, marginBottom:writeChecked ? 0 : 12 }} />
            {!writeChecked ? (
              <button className="btn-gold" disabled={writeAns.trim().length < 3} style={{ width:"100%" }} onClick={() => setWriteChecked(true)}>
                Ver respuesta correcta
              </button>
            ) : (
              <div style={{ marginTop:16 }}>
                <div style={{ background:"#e8f5e9", border:"1px solid #2a7a2a", borderRadius:8, padding:"14px", marginBottom:14 }}>
                  <div className="sans" style={{ fontSize:12, color:"var(--green)", fontWeight:600, marginBottom:6 }}>Respuesta correcta:</div>
                  <div className="serif" style={{ fontSize:15, lineHeight:1.55 }}>{card.back}</div>
                </div>
                <p className="sans" style={{ fontSize:13, color:"var(--ink2)", marginBottom:10, textAlign:"center" }}>¿Tu respuesta era correcta?</p>
                <div style={{ display:"flex", gap:10 }}>
                  <button className="btn-outline" style={{ flex:1 }} onClick={() => goNext("write")}>✗ No del todo</button>
                  <button className="btn-gold" style={{ flex:1 }} onClick={() => { setScore(s => s+1); goNext("write"); }}>✓ Sí, lo sabía</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FASE 3 ── */}
        {phase === "trivia" && (
          <div>
            <div className="display" style={{ fontSize:18, fontWeight:600, lineHeight:1.45, marginBottom:20 }}>{card.front}</div>
            <div>
              {(triviaOpts[idx] || [card.back]).map((opt, i) => {
                const isCorr = opt === card.back;
                const isPick = triviaChosen === opt;
                let cls = "answer-btn";
                if (triviaAnswered) {
                  if (isCorr)       cls += " answer-correct";
                  else if (isPick)  cls += " answer-wrong";
                  else              cls += " answer-faded";
                } else if (isPick)  cls += " answer-selected";
                return (
                  <button key={i} className={cls} disabled={triviaAnswered}
                    onClick={() => {
                      if (triviaAnswered) return;
                      setTriviaChosen(opt); setTriviaAnswered(true);
                      if (isCorr) setScore(s => s+1);
                    }}>
                    <span>{opt}</span>
                    {triviaAnswered && isCorr && <span>✓</span>}
                    {triviaAnswered && isPick && !isCorr && <span>✗</span>}
                  </button>
                );
              })}
            </div>
            {triviaAnswered && (
              <button className="btn-gold" style={{ width:"100%", marginTop:20 }} onClick={() => goNext("trivia")}>
                {idx+1 < N ? "Siguiente →" : "Ver resultado →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
  DEBATE
================================================================ */
function DebateScreen({ book, debate, onBack, user }) {
  const [argument, setArgument]     = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [debateArgs, setDebateArgs] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { loadArgs(); }, [debate.id]);

  async function loadArgs() {
    try {
      const q = query(collection(db, "debates", debate.id, "arguments"), orderBy("timestamp","desc"));
      const snap = await getDocs(q);
      setDebateArgs(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch (e) {} finally { setLoading(false); }
  }

  async function submit() {
    if (argument.trim().length < 20) return;
    try {
      await addDoc(collection(db, "debates", debate.id, "arguments"), {
        text: argument.trim(), author: user?.email || "Invitado",
        timestamp: serverTimestamp(), likes:0, likedBy:[]
      });
      setSubmitted(true); await loadArgs();
    } catch (e) { alert("Error al publicar."); }
  }

  async function toggleLike(argId, likedBy) {
    const uid = user?.uid || "anon";
    const liked = (likedBy||[]).includes(uid);
    const ref = doc(db, "debates", debate.id, "arguments", argId);
    try {
      if (liked) await updateDoc(ref, { likes:increment(-1), likedBy:likedBy.filter(id => id !== uid) });
      else       await updateDoc(ref, { likes:increment(1),  likedBy:[...(likedBy||[]), uid] });
      await loadArgs();
    } catch (e) {}
  }

  return (
    <div>
      <TopBar onBack={onBack} title="Debate" subtitle={book.title} />
      <div style={{ padding:"20px 16px 100px" }}>
        <h2 className="display" style={{ fontSize:20, fontWeight:700, marginBottom:8, lineHeight:1.35 }}>❝ {debate.question}</h2>
        <p className="serif" style={{ fontSize:14, color:"var(--ink2)", lineHeight:1.7, marginBottom:24, fontStyle:"italic" }}>{debate.context}</p>

        {!submitted ? (
          <>
            <textarea className="text-input" value={argument} onChange={e => setArgument(e.target.value)}
              placeholder="Escribe tu argumento. Defiéndelo con razones del libro..." style={{ minHeight:140, marginBottom:6 }}
              onFocus={e => e.target.style.borderColor = "var(--gold)"}
              onBlur={e =>  e.target.style.borderColor = "var(--border)"} />
            <div className="sans" style={{ fontSize:12, color:"var(--ink2)", marginBottom:14, textAlign:"right" }}>{argument.length} · mínimo 20</div>
            <button className="btn-gold" disabled={argument.trim().length < 20} style={{ width:"100%" }} onClick={submit}>
              Publicar argumento
            </button>
          </>
        ) : (
          <div style={{ padding:"14px", borderLeft:"4px solid var(--green)", background:"rgba(42,92,42,0.06)", borderRadius:"0 8px 8px 0", marginBottom:20 }}>
            <div className="sans" style={{ fontSize:12, color:"var(--green)", marginBottom:6, fontWeight:600 }}>Tu argumento · publicado</div>
            <p className="serif" style={{ fontSize:14, lineHeight:1.6 }}>{argument}</p>
          </div>
        )}

        {loading ? (
          <p className="sans" style={{ textAlign:"center", color:"var(--ink2)", padding:20 }}>Cargando...</p>
        ) : (
          <div style={{ marginTop:28 }}>
            <div className="divider-text">Otros lectores ({debateArgs.length})</div>
            {debateArgs.length === 0 && (
              <p className="serif" style={{ textAlign:"center", color:"var(--ink2)", padding:20, fontStyle:"italic" }}>Sé el primero en argumentar.</p>
            )}
            {[...debateArgs].sort((a,b) => (b.likes||0)-(a.likes||0)).map(arg => {
              const liked = (arg.likedBy||[]).includes(user?.uid||"anon");
              return (
                <div key={arg.id} style={{ marginBottom:12, padding:"14px", background:"var(--cream)", border:"1px solid var(--border)", borderRadius:8 }}>
                  <p className="serif" style={{ fontSize:14, lineHeight:1.65, marginBottom:10 }}>{arg.text}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span className="sans" style={{ fontSize:12, color:"var(--ink2)" }}>— {arg.author}</span>
                    <button className={`like-btn ${liked ? "liked" : ""}`} onClick={() => toggleLike(arg.id, arg.likedBy)}>
                      👍 {arg.likes||0}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
  FORO
================================================================ */
function ForumScreen({ book, onBack, user }) {
  const [question, setQuestion] = useState("");
  const [threads, setThreads]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [openThread, setOpenThread] = useState(null);

  useEffect(() => { loadThreads(); }, [book.forumId]);

  async function loadThreads() {
    try {
      const q = query(collection(db, "forums", book.forumId, "threads"), orderBy("timestamp","desc"));
      const snap = await getDocs(q);
      setThreads(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch (e) {} finally { setLoading(false); }
  }

  async function submitQuestion() {
    if (question.trim().length < 10) return;
    try {
      await addDoc(collection(db, "forums", book.forumId, "threads"), {
        question: question.trim(), author: user?.email||"Invitado",
        timestamp: serverTimestamp(), replyCount:0
      });
      setQuestion(""); setLoading(true); await loadThreads();
    } catch (e) { alert("Error al publicar."); }
  }

  if (openThread) return <ThreadScreen book={book} thread={openThread} onBack={() => { setOpenThread(null); loadThreads(); }} user={user} forumId={book.forumId} />;

  return (
    <div>
      <TopBar onBack={onBack} title="Foro" subtitle={book.title} />
      <div style={{ padding:"20px 16px 100px" }}>
        <h2 className="display" style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Preguntas y dudas</h2>
        <p className="sans" style={{ fontSize:13, color:"var(--ink2)", marginBottom:20 }}>¿No entendiste algo? Pregunta aquí.</p>

        <textarea className="text-input" value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="¿Qué no entendiste del libro?" style={{ minHeight:90, marginBottom:6 }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e =>  e.target.style.borderColor = "var(--border)"} />
        <div className="sans" style={{ fontSize:12, color:"var(--ink2)", marginBottom:12, textAlign:"right" }}>{question.length} · mínimo 10</div>
        <button className="btn-gold" disabled={question.trim().length < 10} style={{ width:"100%", marginBottom:24 }} onClick={submitQuestion}>
          Publicar pregunta
        </button>

        {loading ? (
          <p className="sans" style={{ textAlign:"center", color:"var(--ink2)" }}>Cargando...</p>
        ) : (
          <>
            <div className="divider-text">Preguntas recientes</div>
            {threads.length === 0 && (
              <p className="serif" style={{ textAlign:"center", color:"var(--ink2)", padding:20, fontStyle:"italic" }}>Sé el primero en preguntar.</p>
            )}
            {threads.map(t => (
              <div key={t.id} className="thread-card" onClick={() => setOpenThread(t)}>
                <p className="display" style={{ fontSize:14, fontWeight:600, marginBottom:8, lineHeight:1.4 }}>{t.question}</p>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                  <span className="sans" style={{ color:"var(--ink2)" }}>— {t.author}</span>
                  <span className="sans" style={{ color:"var(--gold)" }}>{t.replyCount||0} respuestas · Ver →</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ThreadScreen({ book, thread, onBack, user, forumId }) {
  const [reply, setReply]     = useState("");
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReplies(); }, [thread.id]);

  async function loadReplies() {
    try {
      const q = query(collection(db, "forums", forumId, "threads", thread.id, "replies"), orderBy("timestamp","asc"));
      const snap = await getDocs(q);
      setReplies(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch (e) {} finally { setLoading(false); }
  }

  async function toggleReplyLike(rId, likedBy) {
    const uid = user?.uid||"anon";
    const liked = (likedBy||[]).includes(uid);
    const ref = doc(db, "forums", forumId, "threads", thread.id, "replies", rId);
    try {
      if (liked) await updateDoc(ref, { likes:increment(-1), likedBy:likedBy.filter(id=>id!==uid) });
      else       await updateDoc(ref, { likes:increment(1),  likedBy:[...(likedBy||[]),uid] });
      await loadReplies();
    } catch (e) {}
  }

  async function submitReply() {
    if (reply.trim().length < 5) return;
    try {
      await addDoc(collection(db, "forums", forumId, "threads", thread.id, "replies"), {
        text:reply.trim(), author:user?.email||"Invitado",
        timestamp:serverTimestamp(), likes:0, likedBy:[]
      });
      await updateDoc(doc(db, "forums", forumId, "threads", thread.id), { replyCount:increment(1) });
      setReply(""); await loadReplies();
    } catch (e) { alert("Error al publicar."); }
  }

  return (
    <div>
      <TopBar onBack={onBack} title="Respuestas" subtitle={book.title} />
      <div style={{ padding:"20px 16px 100px" }}>
        <div style={{ padding:"14px", borderLeft:"4px solid var(--gold)", background:"rgba(201,151,58,0.07)", borderRadius:"0 8px 8px 0", marginBottom:24 }}>
          <p className="display" style={{ fontSize:16, fontWeight:600, marginBottom:6, lineHeight:1.35 }}>{thread.question}</p>
          <p className="sans" style={{ fontSize:12, color:"var(--ink2)" }}>— {thread.author}</p>
        </div>

        {loading ? (
          <p className="sans" style={{ textAlign:"center", color:"var(--ink2)" }}>Cargando...</p>
        ) : (
          <div style={{ marginBottom:24 }}>
            {replies.length === 0 && (
              <p className="serif" style={{ textAlign:"center", color:"var(--ink2)", padding:16, fontStyle:"italic" }}>Sé el primero en responder.</p>
            )}
            {replies.map(r => {
              const liked = (r.likedBy||[]).includes(user?.uid||"anon");
              return (
                <div key={r.id} style={{ marginBottom:10, padding:"14px", background:"var(--cream)", border:"1px solid var(--border)", borderRadius:8 }}>
                  <p className="serif" style={{ fontSize:14, lineHeight:1.65, marginBottom:8 }}>{r.text}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span className="sans" style={{ fontSize:12, color:"var(--ink2)" }}>— {r.author}</span>
                    <button className={`like-btn ${liked ? "liked" : ""}`} onClick={() => toggleReplyLike(r.id, r.likedBy)}>
                      👍 {r.likes||0}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="divider-text">Tu respuesta</div>
        <textarea className="text-input" value={reply} onChange={e => setReply(e.target.value)}
          placeholder="Escribe tu respuesta..." style={{ minHeight:90, marginBottom:6 }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e =>  e.target.style.borderColor = "var(--border)"} />
        <div className="sans" style={{ fontSize:12, color:"var(--ink2)", marginBottom:12, textAlign:"right" }}>{reply.length} · mínimo 5</div>
        <button className="btn-gold" disabled={reply.trim().length < 5} style={{ width:"100%" }} onClick={submitReply}>
          Publicar respuesta
        </button>
      </div>
    </div>
  );
}

/* ================================================================
  PERFIL
================================================================ */
function ProfileScreen({ streak, points, completedBooks, user, onLogout }) {
  const [mode, setMode]         = useState("none");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  async function handleAuth() {
    try {
      setError("");
      if (mode === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      setMode("none");
    } catch (e) {
      if (e.code === "auth/email-already-in-use") setError("Email ya registrado");
      else if (e.code === "auth/weak-password")   setError("Mínimo 6 caracteres");
      else                                         setError("Credenciales incorrectas");
    }
  }

  const completedData = BOOKS.filter(b => completedBooks.includes(b.id));

  return (
    <div>
      {/* Header */}
      <div style={{ background:`linear-gradient(160deg, var(--woodD) 0%, var(--ink) 100%)`, padding:"32px 20px 28px" }}>
        <div className="sans" style={{ fontSize:11, color:"rgba(201,151,58,0.65)", letterSpacing:3, textTransform:"uppercase", marginBottom:6 }}>Tu lectura</div>
        <h1 className="display" style={{ fontSize:38, fontWeight:900, color:"#F8F4E9", lineHeight:1 }}>Perfil</h1>
        <div className="sans" style={{ fontSize:13, color:"rgba(248,244,233,0.5)", marginTop:8 }}>
          {user ? `✦ ${user.email}` : "Sesión no iniciada · progreso local"}
        </div>
      </div>

      <div style={{ padding:"20px 16px 100px" }}>
        {/* Cuenta */}
        {!user ? (
          <div className="info-card info-card-gold" style={{ marginBottom:16 }}>
            <p className="sans" style={{ fontSize:13, color:"var(--ink2)", marginBottom:14 }}>
              Inicia sesión para guardar tu progreso en la nube y sincronizarlo entre dispositivos.
            </p>
            {mode === "none" && (
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn-gold" style={{ flex:1 }} onClick={() => setMode("login")}>Iniciar sesión</button>
                <button className="btn-outline" style={{ flex:1 }} onClick={() => setMode("signup")}>Crear cuenta</button>
              </div>
            )}
            {mode !== "none" && (
              <div>
                <input type="email" className="text-input" placeholder="Email" value={email}
                  onChange={e => setEmail(e.target.value)} style={{ marginBottom:8 }} />
                <input type="password" className="text-input" placeholder="Contraseña (mín. 6)" value={password}
                  onChange={e => setPassword(e.target.value)} style={{ marginBottom:8 }} />
                {error && <p className="sans" style={{ color:"var(--red)", fontSize:12, marginBottom:8 }}>{error}</p>}
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn-gold" style={{ flex:1 }} onClick={handleAuth}>{mode === "login" ? "Entrar" : "Crear"}</button>
                  <button className="btn-outline" style={{ flex:1 }} onClick={() => { setMode("none"); setError(""); }}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="info-card" style={{ marginBottom:16, borderColor:"var(--green)", background:"rgba(42,92,42,0.05)" }}>
            <p className="sans" style={{ fontSize:13, marginBottom:12 }}>✓ Sesión iniciada: <strong>{user.email}</strong></p>
            <button className="btn-outline" style={{ width:"100%" }}
              onClick={async () => { await signOut(auth); onLogout(); }}>
              Cerrar sesión
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <div className="stat-card">
            <div className="sans" style={{ fontSize:11, color:"var(--ink2)", marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Racha</div>
            <div className="display" style={{ fontSize:42, fontWeight:900, color:"var(--gold)", lineHeight:1 }}>{streak}</div>
            <div className="sans" style={{ fontSize:11, color:"var(--ink2)", marginTop:3 }}>días</div>
          </div>
          <div className="stat-card">
            <div className="sans" style={{ fontSize:11, color:"var(--ink2)", marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Puntos</div>
            <div className="display" style={{ fontSize:42, fontWeight:900, color:"var(--gold)", lineHeight:1 }}>{points}</div>
          </div>
        </div>

        {/* Libros completados */}
        <div className="info-card">
          <div className="sans" style={{ fontSize:11, color:"var(--ink2)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>
            Libros practicados · {completedData.length} de {BOOKS.length}
          </div>
          {completedData.length === 0 ? (
            <p className="serif" style={{ fontSize:14, color:"var(--ink2)", fontStyle:"italic" }}>Aún no has completado ningún libro.</p>
          ) : (
            completedData.map(b => (
              <div key={b.id} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:"1px solid var(--border)", alignItems:"center" }}>
                <div style={{ width:8, height:40, borderRadius:2, backgroundColor:b.color, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div className="display" style={{ fontSize:14, fontWeight:600 }}>{b.title}</div>
                  <div className="sans" style={{ fontSize:12, color:"var(--ink2)" }}>{b.author}</div>
                </div>
                <span style={{ color:"var(--green)", fontSize:18 }}>✓</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
}
