import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";

/* ═══════════════════════════════════════════════════════════════════
   ANÁLISIS — Plataforma de análisis crítico literario
   VERSIÓN REDUCIDA + FIREBASE
   
   CAMBIOS en esta versión:
   - Solo 2 libros (1984 + Rebelión en la granja - ambos de Orwell)
   - Firebase integrado: login + debates reales
   - Sin pestaña global de debates (están dentro de cada libro)
   - Feedback menos "examen", más conversacional
   - 1 argumento de muestra firmado "Joshua Walteros, 17"
   ═══════════════════════════════════════════════════════════════════ */

// ───────────────── FIREBASE CONFIG ─────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBv_ar9RlDchiq14xf-RMp420gttL2sCPE",
  authDomain: "analisis-literario-65346.firebaseapp.com",
  projectId: "analisis-literario-65346",
  storageBucket: "analisis-literario-65346.firebasestorage.app",
  messagingSenderId: "609852450783",
  appId: "1:609852450783:web:bc2763cec6a263d415466a",
  measurementId: "G-E1MCNZJRQQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ───────────────── DATOS DE LOS LIBROS (solo Orwell) ───────────────── */
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
        feedback: "Exacto. El Gran Hermano no necesita existir físicamente: su poder reside en ser un símbolo absoluto. Una persona real puede morir. Una idea no.",
        feedbackAlt: "Otra lectura posible: Orwell construye al Gran Hermano como símbolo, no como persona. El poder no está en un individuo sino en la idea misma, que no puede eliminarse matando a alguien."
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
        feedback: "Bien visto. Los totalitarismos anteriores perseguían objetivos externos. El Partido persigue solo el poder. Y no le basta la obediencia exterior: necesita el amor genuino del súbdito.",
        feedbackAlt: "Otra lectura: O'Brien explica que el Partido no tortura para reformar o castigar, sino para que Winston ame genuinamente al Gran Hermano antes de morir. Eso lo hace filosóficamente más radical que cualquier régimen basado solo en fuerza."
      },
      {
        mode: "context",
        text: "¿Qué revela Winston sobre el control del pasado?",
        fragment: "El pasado no solo se ha cambiado, sino que ha sido destruido. ¿Cómo puedes establecer el mayor de los hechos cuando no queda ni siquiera un registro fuera de tu propia memoria?",
        options: [
          "Winston tiene problemas personales de memoria",
          "El control del pasado equivale al control total de la realidad",
          "Los archivos del Partido son simplemente ineficientes",
          "La gente en Oceanía era naturalmente olvidadiza",
        ],
        correct: 1,
        feedback: "Exacto. Quien controla el pasado controla el presente. Sin memoria colectiva, no hay base material para la resistencia.",
        feedbackAlt: "Otra perspectiva: Orwell muestra que sin registros externos, la realidad se vuelve completamente maleable. El Partido no solo miente sobre el pasado: lo destruye materialmente."
      },
    ],
    debatePrompts: [
      {
        id: "1984-d1",
        question: "¿Winston Smith es un héroe o una víctima del sistema?",
        context: "Al final Winston ama al Gran Hermano. ¿Eso anula todo lo que hizo antes o lo vuelve más trágico?",
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
        feedback: "Bien leído. Los animales ya no pueden distinguir cerdos de humanos. El problema no era quién gobernaba sino la estructura del poder mismo.",
        feedbackAlt: "Otra interpretación: Orwell cierra la alegoría mostrando que la revolución no transformó el sistema, solo cambió quién lo operaba. Los nuevos gobernantes reproducen exactamente los métodos de los viejos."
      },
      {
        mode: "context",
        text: "¿Qué revela el fragmento sobre Squealer?",
        fragment: "Squealer podía convertir el negro en blanco. Siempre había una explicación, siempre había estadísticas, siempre había una razón por la que lo que parecía una traición era en realidad necesario para la seguridad de la granja.",
        options: [
          "Squealer es un científico que estudia el comportamiento",
          "Squealer representa la propaganda que legitima cada abuso del poder",
          "Squealer actúa de buena fe genuinamente",
          "Squealer es simplemente el más inteligente",
        ],
        correct: 1,
        feedback: "Exacto. Squealer es la propaganda institucionalizada. Todo régimen totalitario necesita su Squealer: quien hace el trabajo sucio del lenguaje.",
        feedbackAlt: "Otra lectura: Orwell personifica en Squealer la capacidad del poder de reescribir la realidad usando estadísticas, miedo y agotamiento del oyente. No necesita ser verdad: solo necesita ser repetido."
      },
      {
        mode: "critical",
        concept: "Imagen final",
        text: "¿Qué demuestra que los animales no puedan distinguir cerdos de humanos?",
        options: [
          "El éxito evolutivo biológico de los cerdos",
          "Que la corrupción fue tan completa que el régimen resultante es idéntico al derrocado",
          "Que los humanos aceptaron a los cerdos como iguales",
          "Que la memoria de los animales se deterioró",
        ],
        correct: 1,
        feedback: "Bien visto. La revolución no transformó el sistema, solo cambió quién lo operaba. Los nuevos gobernantes reproducen exactamente los métodos y la mentalidad de los viejos.",
        feedbackAlt: "Otra perspectiva: Orwell construye esta imagen como la más poderosa de la novela: la indistinción entre opresores viejos y nuevos demuestra que el poder mismo corrompe, independientemente de quién lo ejerza."
      },
    ],
    debatePrompts: [
      {
        id: "granja-d1",
        question: "¿Boxer era virtuoso o solo ingenuo?",
        context: "Trabaja hasta morir repitiendo 'Napoleón siempre tiene razón'. ¿Su lealtad absoluta es admirable o es parte del problema?",
      },
    ],
  },
];

/* ───────────────── ESTILOS GLOBALES ───────────────── */
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

.paper-bg {
  background: radial-gradient(ellipse at top, rgba(160, 137, 107, 0.08), transparent 60%), var(--papel);
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

.rule { border-top: 1px solid var(--linea); margin: 20px 0; }
.rule-vino { display: block; width: 40px; height: 2px; background: var(--vino); margin: 12px 0; }
`;

/* ───────────────── COMPONENTE PRINCIPAL ───────────────── */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [user, setUser] = useState(null); // Firebase user
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [completedBooks, setCompletedBooks] = useState([]);

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  function onChallengeComplete(bookId, earnedPoints) {
    setPoints((p) => p + earnedPoints);
    setStreak((s) => s + 1);
    if (!completedBooks.includes(bookId)) {
      setCompletedBooks((cb) => [...cb, bookId]);
    }
  }

  return (
    <div className="paper-bg" style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ flex: 1, overflow: "auto" }}>
        {screen === "home" && <HomeScreen onPickBook={(b) => { setSelectedBook(b); setScreen("book"); }} />}
        {screen === "book" && selectedBook && (
          <BookScreen
            book={selectedBook}
            onBack={() => setScreen("home")}
            onStartChallenge={() => setScreen("challenge")}
            onOpenDebate={(d) => { setSelectedDebate(d); setScreen("debate"); }}
          />
        )}
        {screen === "challenge" && selectedBook && (
          <ChallengeScreen book={selectedBook} onBack={() => setScreen("book")} onComplete={(pts) => onChallengeComplete(selectedBook.id, pts)} />
        )}
        {screen === "debate" && selectedDebate && selectedBook && (
          <DebateScreen book={selectedBook} debate={selectedDebate} onBack={() => setScreen("book")} user={user} />
        )}
        {screen === "profile" && <ProfileScreen streak={streak} points={points} completedBooks={completedBooks} user={user} onLogout={() => setScreen("home")} />}
      </div>
      {["home", "profile"].includes(screen) && <NavBar current={screen} onChange={setScreen} streak={streak} />}
    </div>
  );
}

/* ───────────────── COMPONENTES ───────────────── */

function TopBar({ onBack, title, subtitle }) {
  return (
    <div style={{ padding: "18px 20px", background: "var(--marfil)", borderBottom: "1px solid var(--linea)", display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", fontSize: 13, color: "var(--tinta2)", cursor: "pointer", fontFamily: "Inter, sans-serif", padding: 0 }}>
        ← Volver
      </button>
      <div style={{ flex: 1, textAlign: "center" }}>
        <div className="serif" style={{ fontSize: 16, fontWeight: 500, color: "var(--tinta)" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--sepia)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ width: 60 }} />
    </div>
  );
}

function NavBar({ current, onChange, streak }) {
  const items = [
    { id: "home", label: "Biblioteca", icon: "❦" },
    { id: "profile", label: "Perfil", icon: "✦" },
  ];
  return (
    <div style={{ position: "sticky", bottom: 0, background: "var(--marfil)", borderTop: "1px solid var(--linea)", display: "flex", zIndex: 50 }}>
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
            <span className="serif" style={{ fontSize: 18, lineHeight: 1 }}>{it.icon}</span>
            <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: active ? 600 : 400 }}>{it.label}</span>
            {it.id === "profile" && streak > 0 && (
              <span style={{ position: "absolute", top: 6, marginLeft: 28, background: "var(--vino)", color: "var(--marfil)", borderRadius: 8, fontSize: 9, padding: "1px 5px", letterSpacing: 0 }}>
                {streak}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════ HOME ═══════ */
function HomeScreen({ onPickBook }) {
  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      <div style={{ padding: "40px 24px 28px" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "var(--sepia)", textTransform: "uppercase" }}>Año I · Número 01</div>
        <span className="rule-vino" />
        <h1 className="serif" style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, color: "var(--tinta)", letterSpacing: "-0.02em" }}>Análisis</h1>
        <div className="serif-italic" style={{ fontSize: 16, marginTop: 4, color: "var(--tinta2)", fontStyle: "italic" }}>la lectura como pensamiento</div>
        <p style={{ fontSize: 13, marginTop: 20, color: "var(--tinta2)", lineHeight: 1.7, maxWidth: 380 }}>
          La primera plataforma dedicada exclusivamente al análisis crítico literario en español. No es un examen. No hay presión. Solo leer, pensar, y practicar cómo mirar un texto.
        </p>
      </div>
      <div style={{ padding: "0 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--sepia)" }}>
          <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
          <span className="serif-italic" style={{ fontSize: 13, fontStyle: "italic", color: "var(--tinta2)" }}>Biblioteca</span>
          <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
        </div>
      </div>
      <div style={{ padding: "0 20px 24px" }}>
        {BOOKS.map((book, i) => (
          <BookCard key={book.id} book={book} index={i} onClick={() => onPickBook(book)} />
        ))}
      </div>
      <div style={{ padding: "20px 24px 32px", textAlign: "center", color: "var(--sepia)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>
        Proyecto ExpoITC · Especialización en Sistemas
      </div>
    </div>
  );
}

function BookCard({ book, index, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ marginBottom: 16, padding: "20px 22px", background: "var(--marfil)", border: "1px solid var(--linea)", borderRadius: 2, cursor: "pointer", animation: `fadeUp 0.5s ${index * 0.05}s both`, position: "relative" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--vino)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--linea)")}
    >
      <div style={{ fontSize: 9, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 8 }}>{book.genre} · {book.year}</div>
      <h3 className="serif" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15, color: "var(--tinta)", letterSpacing: "-0.01em", marginBottom: 4 }}>{book.title}</h3>
      <div className="serif-italic" style={{ fontSize: 13, color: "var(--tinta2)", fontStyle: "italic", marginBottom: 12 }}>{book.author}</div>
      <p style={{ fontSize: 13, color: "var(--tinta2)", lineHeight: 1.6, marginBottom: 14 }}>{book.tagline}</p>
      <div style={{ display: "flex", gap: 16, fontSize: 10, letterSpacing: 1, color: "var(--sepia)", textTransform: "uppercase" }}>
        <span>{book.questions.length} preguntas</span>
        <span>·</span>
        <span>{book.debatePrompts.length} debates</span>
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE UN LIBRO ═══════ */
function BookScreen({ book, onBack, onStartChallenge, onOpenDebate }) {
  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <TopBar onBack={onBack} title={book.title} subtitle={book.author} />
      <div style={{ padding: "28px 24px" }}>
        <div style={{ fontSize: 10, letterSpacing: 2.5, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 6 }}>{book.genre} · {book.year}</div>
        <h1 className="serif" style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: "var(--tinta)", letterSpacing: "-0.02em", marginBottom: 8 }}>{book.title}</h1>
        <div className="serif-italic" style={{ fontSize: 16, color: "var(--tinta2)", fontStyle: "italic" }}>{book.author}</div>
        <span className="rule-vino" />
        <p className="serif" style={{ fontSize: 17, color: "var(--tinta)", lineHeight: 1.5, fontStyle: "italic", marginTop: 14 }}>"{book.tagline}"</p>

        <div style={{ marginTop: 36, padding: "22px 20px", background: "var(--marfil)", border: "1px solid var(--linea)" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 8 }}>Explorar ideas</div>
          <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: "var(--tinta)", marginBottom: 8 }}>Practica análisis crítico</h3>
          <p style={{ fontSize: 13, color: "var(--tinta2)", lineHeight: 1.7, marginBottom: 16 }}>
            {book.questions.length} preguntas de interpretación. Sin presión. Sin nota. Solo pensar.
          </p>
          <button className="btn-primary" onClick={onStartChallenge}>Empezar →</button>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 14 }}>Preguntas abiertas</div>
          {book.debatePrompts.map((dp) => (
            <div
              key={dp.id}
              onClick={() => onOpenDebate(dp)}
              style={{ padding: "16px 18px", background: "var(--marfil)", border: "1px solid var(--linea)", marginBottom: 10, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--vino)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--linea)")}
            >
              <div className="serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--tinta)", lineHeight: 1.4 }}>❝ {dp.question}</div>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--vino)", textTransform: "uppercase", marginTop: 8 }}>Argumentar →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE DESAFÍO ═══════ */
function ChallengeScreen({ book, onBack, onComplete }) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = book.questions[index];
  const total = book.questions.length;

  function isCorrect() {
    return chosen === q.correct;
  }

  function submitAnswer() {
    if (answered) return;
    setAnswered(true);
    if (isCorrect()) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setAnswered(false);
      setChosen(null);
    } else {
      onComplete(correctCount * 10);
      setFinished(true);
    }
  }

  if (finished) {
    return (
      <div style={{ animation: "fadeIn 0.4s" }}>
        <TopBar onBack={onBack} title="Sesión completada" />
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 12 }}>Tu lectura</div>
          <div className="serif" style={{ fontSize: 72, fontWeight: 900, color: "var(--vino)", lineHeight: 1, letterSpacing: "-0.04em" }}>{correctCount}</div>
          <div className="serif-italic" style={{ fontSize: 16, fontStyle: "italic", color: "var(--tinta2)", marginTop: 8 }}>
            {correctCount === total ? "ideas exploradas" : `de ${total} ideas`}
          </div>
          <div style={{ marginTop: 36, padding: "20px", background: "var(--marfil)", border: "1px solid var(--linea)", textAlign: "left" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 8 }}>Ganaste</div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--tinta)" }}>+{correctCount * 10} puntos</div>
            <div style={{ fontSize: 12, color: "var(--tinta2)", marginTop: 4 }}>y sumaste un día a tu racha de lectura.</div>
          </div>
          <button className="btn-primary" style={{ marginTop: 24, width: "100%" }} onClick={onBack}>Volver al libro</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar onBack={onBack} title={book.title} subtitle={`Pregunta ${index + 1} · ${book.title}`} />
      <div style={{ height: 2, background: "var(--linea)" }}>
        <div style={{ height: "100%", background: "var(--vino)", width: `${((index + (answered ? 1 : 0)) / total) * 100}%`, transition: "width 0.4s" }} />
      </div>
      <div style={{ padding: "24px 22px 40px", animation: "fadeUp 0.3s" }} key={index}>
        <div style={{ marginBottom: 14 }}>
          <span className="chip">
            {q.mode === "critical" && "Análisis"}
            {q.mode === "context" && "Contexto"}
          </span>
        </div>
        {q.concept && <div className="serif-italic" style={{ fontSize: 12, color: "var(--vino)", fontStyle: "italic", marginBottom: 6 }}>sobre {q.concept}</div>}
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, color: "var(--tinta)", lineHeight: 1.35, marginBottom: 22 }}>{q.text}</h2>
        {q.fragment && (
          <div style={{ padding: "18px 20px", background: "var(--marfil)", borderLeft: "3px solid var(--vino)", marginBottom: 20, fontFamily: "Fraunces, Georgia, serif", fontSize: 15, fontStyle: "italic", color: "var(--tinta2)", lineHeight: 1.65 }}>
            {q.fragment}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            const isCorr = i === q.correct;
            const isPicked = chosen === i;
            let bg = "var(--marfil)";
            let border = "var(--linea)";
            let color = "var(--tinta)";
            if (answered) {
              if (isCorr) { bg = "#e8f0e3"; border = "var(--verde)"; color = "var(--verde)"; }
              else if (isPicked) { bg = "#f6e6e3"; border = "var(--rojo)"; color = "var(--rojo)"; }
              else { color = "var(--sepia)"; }
            } else if (isPicked) { border = "var(--vino)"; bg = "#f9f2e9"; }
            return (
              <button key={i} disabled={answered} onClick={() => setChosen(i)}
                style={{ padding: "14px 18px", background: bg, border: `1px solid ${border}`, borderRadius: 2, color, textAlign: "left", fontSize: 14, fontFamily: "Inter, sans-serif", cursor: answered ? "default" : "pointer", lineHeight: 1.5, display: "flex", gap: 12 }}>
                <span className="serif" style={{ fontSize: 14, color: "var(--sepia)", fontWeight: 500, minWidth: 16 }}>{String.fromCharCode(97 + i)}.</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {answered && isCorr && <span style={{ color: "var(--verde)" }}>✓</span>}
                {answered && isPicked && !isCorr && <span style={{ color: "var(--rojo)" }}>✗</span>}
              </button>
            );
          })}
        </div>
        {!answered && (
          <button className="btn-primary" disabled={chosen === null} style={{ width: "100%", marginTop: 20 }} onClick={submitAnswer}>Confirmar respuesta</button>
        )}
        {answered && (
          <div style={{ marginTop: 22, padding: "20px", background: "var(--marfil)", borderLeft: `3px solid ${isCorrect() ? "var(--verde)" : "var(--vino)"}`, animation: "inkDrop 0.4s" }}>
            <div className="serif-italic" style={{ fontSize: 12, color: isCorrect() ? "var(--verde)" : "var(--vino)", fontStyle: "italic", marginBottom: 8, letterSpacing: 0.5 }}>
              {isCorrect() ? "Bien leído." : "Otra lectura:"}
            </div>
            <p style={{ fontSize: 14, color: "var(--tinta)", lineHeight: 1.7 }}>{isCorrect() ? q.feedback : q.feedbackAlt}</p>
            <button className="btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={next}>
              {index + 1 < total ? "Siguiente pregunta →" : "Ver mi lectura →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE DEBATE CON FIREBASE ═══════ */
function DebateScreen({ book, debate, onBack, user }) {
  const [argument, setArgument] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [args, setArgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar argumentos de Firestore
  useEffect(() => {
    loadArguments();
  }, [debate.id]);

  async function loadArguments() {
    try {
      const q = query(collection(db, "debates", debate.id, "arguments"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const args = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArgs(args);
    } catch (err) {
      console.error("Error cargando argumentos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (argument.trim().length < 20) return;
    try {
      await addDoc(collection(db, "debates", debate.id, "arguments"), {
        text: argument.trim(),
        author: user?.email || "Invitado",
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
      loadArguments(); // Recargar para ver el nuevo argumento
    } catch (err) {
      console.error("Error guardando argumento:", err);
      alert("Error al publicar. Intenta de nuevo.");
    }
  }

  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      <TopBar onBack={onBack} title="Debate" subtitle={book.title} />
      <div style={{ padding: "28px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 10 }}>{book.title} · {book.author}</div>
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--tinta)", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 14 }}>❝ {debate.question}</h1>
        <p className="serif-italic" style={{ fontSize: 14, fontStyle: "italic", color: "var(--tinta2)", lineHeight: 1.6, marginBottom: 28 }}>{debate.context}</p>

        {!submitted ? (
          <>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 10 }}>Tu argumento</div>
            <textarea
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Escribe tu lectura. Defiéndela con razones del libro..."
              style={{ width: "100%", minHeight: 160, padding: "16px", background: "var(--marfil)", border: "1px solid var(--linea)", borderRadius: 2, fontFamily: "Fraunces, Georgia, serif", fontSize: 15, lineHeight: 1.6, color: "var(--tinta)", resize: "vertical", outline: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--vino)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--linea)")}
            />
            <div style={{ fontSize: 11, color: "var(--sepia)", marginTop: 6, marginBottom: 20, textAlign: "right" }}>{argument.length} caracteres · mínimo 20</div>
            <button className="btn-primary" disabled={argument.trim().length < 20} style={{ width: "100%" }} onClick={submit}>Publicar argumento</button>
          </>
        ) : (
          <div style={{ padding: "20px", background: "var(--marfil)", borderLeft: "3px solid var(--verde)", marginBottom: 24, animation: "inkDrop 0.4s" }}>
            <div className="serif-italic" style={{ fontSize: 11, fontStyle: "italic", color: "var(--verde)", marginBottom: 8, letterSpacing: 0.5 }}>Tu argumento · publicado</div>
            <p className="serif" style={{ fontSize: 15, color: "var(--tinta)", lineHeight: 1.6 }}>{argument}</p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--sepia)" }}>Cargando argumentos...</div>
        ) : (
          <div style={{ marginTop: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
              <span className="serif-italic" style={{ fontSize: 13, fontStyle: "italic", color: "var(--tinta2)" }}>Otros lectores</span>
              <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
            </div>
            {args.length === 0 && (
              <p className="serif-italic" style={{ textAlign: "center", color: "var(--sepia)", fontSize: 13, fontStyle: "italic", padding: "20px" }}>
                Sé el primero en argumentar sobre esta pregunta.
              </p>
            )}
            {args.map((arg, i) => (
              <div key={arg.id} style={{ marginBottom: 14, padding: "16px 18px", background: "var(--marfil)", border: "1px solid var(--linea)", borderRadius: 2, animation: `fadeUp 0.4s ${i * 0.1}s both` }}>
                <p className="serif" style={{ fontSize: 14, color: "var(--tinta)", lineHeight: 1.6, marginBottom: 10 }}>{arg.text}</p>
                <div className="serif-italic" style={{ fontSize: 12, fontStyle: "italic", color: "var(--sepia)" }}>— {arg.author}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE PERFIL CON LOGIN ═══════ */
function ProfileScreen({ streak, points, completedBooks, user, onLogout }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      setError("");
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
    } catch (err) {
      setError("Credenciales incorrectas");
    }
  }

  async function handleSignup() {
    try {
      setError("");
      await createUserWithEmailAndPassword(auth, email, password);
      setShowSignup(false);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Este email ya está registrado");
      else if (err.code === "auth/weak-password") setError("La contraseña debe tener al menos 6 caracteres");
      else setError("Error al crear cuenta");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    onLogout();
  }

  const completedBookObjects = BOOKS.filter((b) => completedBooks.includes(b.id));

  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      <div style={{ padding: "36px 24px 24px" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "var(--sepia)", textTransform: "uppercase" }}>Sección 02</div>
        <span className="rule-vino" />
        <h1 className="serif" style={{ fontSize: 36, fontWeight: 900, color: "var(--tinta)", lineHeight: 1, letterSpacing: "-0.02em" }}>Tu lectura</h1>
        <p className="serif-italic" style={{ fontSize: 14, fontStyle: "italic", color: "var(--tinta2)", marginTop: 6 }}>en el año I de este diario</p>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Login/Logout Section */}
        {!user ? (
          <div style={{ marginBottom: 20, padding: "20px", background: "var(--marfil)", border: "1px solid var(--linea)" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 10 }}>Cuenta</div>
            <p style={{ fontSize: 13, color: "var(--tinta2)", lineHeight: 1.7, marginBottom: 14 }}>
              Inicia sesión para guardar tu racha y puntos en la nube.
            </p>
            {!showLogin && !showSignup && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={() => setShowLogin(true)} style={{ flex: 1 }}>Iniciar sesión</button>
                <button className="btn-ghost" onClick={() => setShowSignup(true)} style={{ flex: 1 }}>Crear cuenta</button>
              </div>
            )}
            {(showLogin || showSignup) && (
              <div style={{ animation: "fadeIn 0.3s" }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "12px", marginBottom: 8, border: "1px solid var(--linea)", borderRadius: 2, fontSize: 14, fontFamily: "Inter, sans-serif" }}
                />
                <input
                  type="password"
                  placeholder="Contraseña (min 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", padding: "12px", marginBottom: 8, border: "1px solid var(--linea)", borderRadius: 2, fontSize: 14, fontFamily: "Inter, sans-serif" }}
                />
                {error && <div style={{ color: "var(--rojo)", fontSize: 12, marginBottom: 8 }}>{error}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" onClick={showLogin ? handleLogin : handleSignup} style={{ flex: 1 }}>
                    {showLogin ? "Entrar" : "Crear"}
                  </button>
                  <button className="btn-ghost" onClick={() => { setShowLogin(false); setShowSignup(false); setError(""); }} style={{ flex: 1 }}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 20, padding: "20px", background: "var(--marfil)", border: "1px solid var(--verde)" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 10 }}>Cuenta</div>
            <p style={{ fontSize: 13, color: "var(--tinta)", marginBottom: 12 }}>✓ Sesión iniciada como: <strong>{user.email}</strong></p>
            <button className="btn-ghost" onClick={handleLogout} style={{ width: "100%" }}>Cerrar sesión</button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <StatCard label="Racha de días" value={streak} suffix="días" />
          <StatCard label="Puntos ganados" value={points} />
        </div>

        {/* Completed Books */}
        <div style={{ marginTop: 28, padding: "20px 22px", background: "var(--marfil)", border: "1px solid var(--linea)", marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 12 }}>
            Libros practicados · {completedBookObjects.length} de {BOOKS.length}
          </div>
          {completedBookObjects.length === 0 ? (
            <p className="serif-italic" style={{ fontSize: 14, fontStyle: "italic", color: "var(--tinta2)", lineHeight: 1.6 }}>
              Aún no has completado ningún libro. Empieza por el que más te intrigue.
            </p>
          ) : (
            <ul style={{ listStyle: "none" }}>
              {completedBookObjects.map((b) => (
                <li key={b.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--linea)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div className="serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--tinta)" }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: "var(--sepia)", letterSpacing: 0.5 }}>{b.author}</div>
                  </div>
                  <span style={{ color: "var(--verde)", fontSize: 14 }}>✓</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix }) {
  return (
    <div style={{ padding: "18px 16px", background: "var(--marfil)", border: "1px solid var(--linea)" }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div className="serif" style={{ fontSize: 40, fontWeight: 900, color: "var(--vino)", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
      {suffix && <div style={{ fontSize: 11, color: "var(--sepia)", marginTop: 4 }}>{suffix}</div>}
    </div>
  );
}
