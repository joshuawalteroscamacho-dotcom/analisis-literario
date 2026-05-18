import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, setDoc, getDoc, increment, updateDoc } from "firebase/firestore";

/* ═══════════════════════════════════════════════════════════════════
   ANÁLISIS — Plataforma de análisis crítico literario
   VERSIÓN 3.0
   
   NUEVAS FEATURES:
   - Fragmentos largos expandibles
   - Preguntas de subrayado
   - Flashcards de repaso
   - Estadísticas globales en Firebase
   - Foros informales por libro
   - Racha y progreso sincronizados en Firebase
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

/* ───────────────── DATOS DE LOS LIBROS ───────────────── */
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
        feedback: "Exacto. El Gran Hermano no necesita existir físicamente: su poder reside en ser un símbolo absoluto.",
        feedbackAlt: "Otra lectura posible: Orwell construye al Gran Hermano como símbolo, no como persona."
      },
      {
        mode: "fragment",
        concept: "Neolengua y control",
        text: "Lee el fragmento y responde: ¿Cuál es el propósito real de la Neolengua según Syme?",
        fragment: `—No comprendes la belleza de la destrucción de las palabras. ¿Sabes que la Neolengua es el único idioma del mundo cuyo vocabulario disminuye cada año? [...] ¿No ves que la finalidad de la Neolengua es limitar el alcance del pensamiento, estrechar el radio de acción de la mente? Al final acabaremos haciendo imposible todo crimen del pensamiento. En realidad no habrá pensamiento, tal como ahora lo entendemos. Ortodoxia es no pensar, no necesitar pensar. Ortodoxia es inconsciencia.`,
        options: [
          "Hacer el idioma más eficiente y fácil de aprender",
          "Destruir la posibilidad misma de pensar críticamente",
          "Simplificar la comunicación entre ciudadanos",
          "Crear un idioma universal para Oceanía",
        ],
        correct: 1,
        feedback: "Bien visto. La Neolengua no es simplificación lingüística sino aniquilación del pensamiento crítico.",
        feedbackAlt: "Otra perspectiva: Orwell muestra que el lenguaje no solo expresa pensamiento sino que lo hace posible."
      },
      {
        mode: "highlight",
        concept: "Momento de quiebre",
        text: "Subraya la frase que mejor captura el momento en que Winston pierde definitivamente su humanidad:",
        fragment: `Miró el retrato. Era impensable que pudiera ser vencido: contra el Gran Hermano no había apelación posible. Contempló los enormes ojos. Dos lágrimas perfumadas de ginebra le resbalaron por las mejillas. Pero ahora todo iba bien, todo estaba bien, la lucha había terminado. Había obtenido la victoria sobre sí mismo. Amaba al Gran Hermano.`,
        correctHighlight: "Amaba al Gran Hermano",
        feedback: "Exacto. Esa frase final es el colapso total: no solo obedece, genuinamente ama a su opresor.",
        feedbackAlt: "Fíjate en 'Había obtenido la victoria sobre sí mismo' — irónico, porque la 'victoria' es su destrucción."
      },
    ],
    flashcards: [
      {
        id: "fc1",
        front: "¿Qué significa 'doblepensar' en 1984?",
        back: "Sostener dos creencias contradictorias simultáneamente y aceptar ambas."
      },
      {
        id: "fc2",
        front: "¿Cuál es el lema del Partido?",
        back: "Guerra es Paz. Libertad es Esclavitud. Ignorancia es Fuerza."
      },
      {
        id: "fc3",
        front: "¿Qué representa Julia en contraste con Winston?",
        back: "Rebelión práctica y sensual vs rebelión intelectual y política."
      },
    ],
    debatePrompts: [
      {
        id: "1984-d1",
        question: "¿Winston Smith es un héroe o una víctima del sistema?",
        context: "Al final Winston ama al Gran Hermano. ¿Eso anula todo lo que hizo antes o lo vuelve más trágico?",
      },
    ],
    forumId: "1984-forum",
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
        feedbackAlt: "Otra interpretación: Orwell cierra la alegoría mostrando que la revolución no transformó el sistema."
      },
      {
        mode: "fragment",
        concept: "Propaganda",
        text: "Lee el fragmento. ¿Qué técnica de manipulación usa Squealer?",
        fragment: `Los cerdos no se reservaban la leche y las manzanas para ellos (egoísmo), sino para preservar su salud. —Camaradas —gritó Squealer—, espero que aprecien que nosotros los cerdos hacemos esto en un espíritu de sacrificio. Muchos de nosotros en realidad no nos gusta la leche y las manzanas. A mí no me gustan. Nuestro único objetivo al tomar estas cosas es preservar nuestra salud. La leche y las manzanas (esto ha sido probado por la Ciencia, camaradas) contienen sustancias absolutamente necesarias para el bienestar de un cerdo. Nosotros los cerdos somos trabajadores cerebrales.`,
        options: [
          "Apelar a la ciencia falsa y presentar el privilegio como sacrificio",
          "Usar amenazas directas para obtener obediencia",
          "Ofrecer recompensas a cambio de silencio",
          "Demostrar superioridad física sobre otros animales",
        ],
        correct: 0,
        feedback: "Exacto. Squealer invierte víctima y victimario: los cerdos no roban, 'se sacrifican' tomando privilegios.",
        feedbackAlt: "Fíjate en la apelación a 'la Ciencia' — autoridad abstracta que no puede cuestionarse."
      },
      {
        mode: "highlight",
        concept: "El mandamiento final",
        text: "Subraya la parte que revela la hipocresía total del nuevo régimen:",
        fragment: `Había un solo Mandamiento. Decía: TODOS LOS ANIMALES SON IGUALES PERO ALGUNOS ANIMALES SON MÁS IGUALES QUE OTROS`,
        correctHighlight: "PERO ALGUNOS ANIMALES SON MÁS IGUALES QUE OTROS",
        feedback: "Perfecto. La contradicción lógica refleja el cinismo total: ni siquiera pretenden ocultar la hipocresía.",
        feedbackAlt: "Esta frase resume toda la novela: el lenguaje se pervierte para que la desigualdad suene como igualdad."
      },
    ],
    flashcards: [
      {
        id: "fc1",
        front: "¿Qué representan los cerdos en la alegoría?",
        back: "La clase dirigente comunista (Stalin y los bolcheviques)."
      },
      {
        id: "fc2",
        front: "¿Qué le pasa a Boxer?",
        back: "Trabaja hasta el colapso y es vendido al matadero. Napoleón miente diciendo que murió en el hospital."
      },
      {
        id: "fc3",
        front: "¿Qué son los Siete Mandamientos?",
        back: "Las reglas de la rebelión que los cerdos modifican gradualmente hasta quedar en una sola contradictoria."
      },
    ],
    debatePrompts: [
      {
        id: "granja-d1",
        question: "¿Boxer era virtuoso o solo ingenuo?",
        context: "Trabaja hasta morir repitiendo 'Napoleón siempre tiene razón'. ¿Su lealtad absoluta es admirable o es parte del problema?",
      },
    ],
    forumId: "granja-forum",
  },
];

/* ───────────────── ESTILOS GLOBALES (SIMPLE) ───────────────── */
const GLOBAL_STYLES = `
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #ffffff;
  color: #111111;
  font-size: 15px;
}

.btn-primary {
  background: #0066cc;
  color: #ffffff;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.btn-primary:hover { background: #0055aa; }
.btn-primary:disabled { background: #aaaaaa; cursor: not-allowed; }

.btn-ghost {
  background: #ffffff;
  color: #111111;
  border: 1px solid #d0d0d0;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.btn-ghost:hover { background: #f0f0f0; }

.chip {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 11px;
  color: #555555;
  background: #f5f5f5;
}

.highlight-word {
  background: #ffe066;
  padding: 1px 3px;
  border-radius: 2px;
  cursor: pointer;
}
`

/* ───────────────── COMPONENTE PRINCIPAL ───────────────── */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [completedBooks, setCompletedBooks] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Cargar datos del usuario desde Firebase
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setStreak(data.streak || 0);
          setPoints(data.points || 0);
          setCompletedBooks(data.completedBooks || []);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Cargar estadísticas globales
  useEffect(() => {
    loadGlobalStats();
  }, []);

  async function loadGlobalStats() {
    try {
      const statsDoc = await getDoc(doc(db, "stats", "global"));
      if (statsDoc.exists()) {
        setGlobalStats(statsDoc.data());
      }
    } catch (err) {
      console.error("Error cargando stats:", err);
    }
  }

  async function onChallengeComplete(bookId, earnedPoints) {
    const newPoints = points + earnedPoints;
    const newStreak = streak + 1;
    const newCompleted = completedBooks.includes(bookId) ? completedBooks : [...completedBooks, bookId];

    setPoints(newPoints);
    setStreak(newStreak);
    setCompletedBooks(newCompleted);

    // Guardar en Firebase si hay usuario
    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        streak: newStreak,
        points: newPoints,
        completedBooks: newCompleted,
        lastActivity: serverTimestamp(),
      }, { merge: true });
    }

    // Actualizar estadísticas globales
    await updateDoc(doc(db, "stats", "global"), {
      [`books.${bookId}.completions`]: increment(1),
      totalChallenges: increment(1),
    });

    loadGlobalStats();
  }

  return (
    <div  style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ flex: 1, overflow: "auto", paddingBottom: 80 }}>
        {screen === "home" && <HomeScreen onPickBook={(b) => { setSelectedBook(b); setScreen("book"); }} globalStats={globalStats} />}
        {screen === "book" && selectedBook && (
          <BookScreen
            book={selectedBook}
            onBack={() => setScreen("home")}
            onStartChallenge={() => setScreen("challenge")}
            onOpenDebate={(d) => { setSelectedDebate(d); setScreen("debate"); }}
            onOpenFlashcards={() => setScreen("flashcards")}
            onOpenForum={() => setScreen("forum")}
          />
        )}
        {screen === "challenge" && selectedBook && (
          <ChallengeScreen book={selectedBook} onBack={() => setScreen("book")} onComplete={(pts) => onChallengeComplete(selectedBook.id, pts)} />
        )}
        {screen === "debate" && selectedDebate && selectedBook && (
          <DebateScreen book={selectedBook} debate={selectedDebate} onBack={() => setScreen("book")} user={user} />
        )}
        {screen === "flashcards" && selectedBook && (
          <FlashcardsScreen book={selectedBook} onBack={() => setScreen("book")} />
        )}
        {screen === "forum" && selectedBook && (
          <ForumScreen book={selectedBook} onBack={() => setScreen("book")} user={user} />
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
    <div style={{ padding: "18px 20px", background: "#ffffff", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", fontSize: 13, color: "#555555", cursor: "pointer", fontFamily: "Inter, sans-serif", padding: 0 }}>
        ← Volver
      </button>
      <div style={{ flex: 1, textAlign: "center" }}>
        <div  style={{ fontSize: 16, fontWeight: 500, color: "#111111" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 10, letterSpacing: 0, textTransform: "uppercase", color: "#888888", marginTop: 2 }}>{subtitle}</div>}
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
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#ffffff", borderTop: "1px solid #e0e0e0", display: "flex", zIndex: 50, maxWidth: 480, margin: "0 auto" }}>
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
              color: active ? "#0066cc" : "#555555",
              borderTop: active ? "2px solid #0066cc" : "2px solid transparent",
              marginTop: -1,
            }}
          >
            <span  style={{ fontSize: 18, lineHeight: 1 }}>{it.icon}</span>
            <span style={{ fontSize: 10, letterSpacing: 0, textTransform: "uppercase", fontWeight: active ? 600 : 400 }}>{it.label}</span>
            {it.id === "profile" && streak > 0 && (
              <span style={{ position: "absolute", top: 6, marginLeft: 28, background: "#0066cc", color: "#ffffff", borderRadius: 6, fontSize: 9, padding: "1px 5px", letterSpacing: 0 }}>
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
function HomeScreen({ onPickBook, globalStats }) {
  return (
    <div style={{  }}>
      <div style={{ padding: "20px 16px" }}>
        
        <h1  style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, color: "#111111", letterSpacing: "normal" }}>Análisis</h1>
        <div  style={{ fontSize: 16, marginTop: 4, color: "#555555",  }}>la lectura como pensamiento</div>
        <p style={{ fontSize: 13, marginTop: 20, color: "#555555", lineHeight: 1.7, maxWidth: 380 }}>
          La primera plataforma dedicada exclusivamente al análisis crítico literario en español.
        </p>
      </div>

      {/* Estadísticas globales */}
      {globalStats && (
        <div style={{ padding: "0 16px", marginBottom: 16 }}>
          <div style={{ background: "#ffffff", border: "1px solid #e0e0e0", padding: "16px 18px" }}>
            <div style={{ fontSize: 10, letterSpacing: 0, color: "#888888", textTransform: "uppercase", marginBottom: 10 }}>Esta semana</div>
            <div  style={{ fontSize: 15, color: "#111111", lineHeight: 1.6 }}>
              <strong>{globalStats.totalChallenges || 0}</strong> personas completaron desafíos de análisis crítico
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "0 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#888888" }}>
          <span style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
          <span style={{ fontSize: 13, color: "#555555" }}>Biblioteca</span>
          <span style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
        </div>
      </div>
      <div style={{ padding: "0 16px 20px" }}>
        {BOOKS.map((book, i) => (
          <BookCard key={book.id} book={book} index={i} onClick={() => onPickBook(book)} globalStats={globalStats} />
        ))}
      </div>
    </div>
  );
}

function BookCard({ book, index, onClick, globalStats }) {
  const stats = globalStats?.books?.[book.id];
  return (
    <div
      onClick={onClick}
      style={{ marginBottom: 16, padding: "20px 22px", background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 6, cursor: "pointer", position: "relative" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0066cc")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
    >
      <div style={{ fontSize: 9, letterSpacing: 0, color: "#888888", textTransform: "uppercase", marginBottom: 8 }}>{book.genre} · {book.year}</div>
      <h3  style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15, color: "#111111", letterSpacing: "normal", marginBottom: 4 }}>{book.title}</h3>
      <div  style={{ fontSize: 13, color: "#555555", marginBottom: 12 }}>{book.author}</div>
      <p style={{ fontSize: 13, color: "#555555", lineHeight: 1.6, marginBottom: 14 }}>{book.tagline}</p>
      <div style={{ display: "flex", gap: 16, fontSize: 10, letterSpacing: 0, color: "#888888", textTransform: "uppercase", flexWrap: "wrap" }}>
        <span>{book.questions.length} preguntas</span>
        <span>·</span>
        <span>{book.flashcards.length} flashcards</span>
        {stats && stats.completions > 0 && (
          <>
            <span>·</span>
            <span style={{ color: "#0066cc" }}>{stats.completions} completados</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE UN LIBRO ═══════ */
function BookScreen({ book, onBack, onStartChallenge, onOpenDebate, onOpenFlashcards, onOpenForum }) {
  return (
    <div style={{  }}>
      <TopBar onBack={onBack} title={book.title} subtitle={book.author} />
      <div style={{ padding: "20px 16px", paddingBottom: 100 }}>
        <div style={{ fontSize: 10, letterSpacing: 0, color: "#888888", textTransform: "uppercase", marginBottom: 6 }}>{book.genre} · {book.year}</div>
        <h1  style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: "#111111", letterSpacing: "normal", marginBottom: 8 }}>{book.title}</h1>
        <div  style={{ fontSize: 16, color: "#555555",  }}>{book.author}</div>
        
        <p  style={{ fontSize: 17, color: "#111111", lineHeight: 1.5, marginTop: 14 }}>"{book.tagline}"</p>

        {/* Desafíos */}
        <div style={{ marginTop: 36, padding: "22px 20px", background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <h3  style={{ fontSize: 20, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Practica análisis crítico</h3>
          <p style={{ fontSize: 13, color: "#555555", lineHeight: 1.7, marginBottom: 16 }}>
            {book.questions.length} preguntas de interpretación. Sin presión. Solo pensar.
          </p>
          <button className="btn-primary" onClick={onStartChallenge}>Empezar →</button>
        </div>

        {/* Flashcards */}
        <div style={{ marginTop: 16, padding: "22px 20px", background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <h3  style={{ fontSize: 20, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Flashcards de repaso</h3>
          <p style={{ fontSize: 13, color: "#555555", lineHeight: 1.7, marginBottom: 16 }}>
            {book.flashcards.length} conceptos clave para repasar.
          </p>
          <button className="btn-ghost" onClick={onOpenFlashcards}>Repasar conceptos →</button>
        </div>

        {/* Debates */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 0, color: "#888888", textTransform: "uppercase", marginBottom: 14 }}>Preguntas abiertas</div>
          {book.debatePrompts.map((dp) => (
            <div
              key={dp.id}
              onClick={() => onOpenDebate(dp)}
              style={{ padding: "16px 18px", background: "#ffffff", border: "1px solid #e0e0e0", marginBottom: 10, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0066cc")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
            >
              <div  style={{ fontSize: 15, fontWeight: 500, color: "#111111", lineHeight: 1.4 }}>❝ {dp.question}</div>
              <div style={{ fontSize: 10, letterSpacing: 0, color: "#0066cc", textTransform: "uppercase", marginTop: 8 }}>Argumentar →</div>
            </div>
          ))}
        </div>

        {/* Foro */}
        <div style={{ marginTop: 28, padding: "22px 20px", background: "#ffffff", border: "1px solid #e0e0e0" }}>
          <h3  style={{ fontSize: 20, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Foro · Preguntas y dudas</h3>
          <p style={{ fontSize: 13, color: "#555555", lineHeight: 1.7, marginBottom: 16 }}>
            Pregunta lo que no entendiste. Otros lectores responden.
          </p>
          <button className="btn-ghost" onClick={onOpenForum}>Entrar al foro →</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE DESAFÍO CON NUEVOS TIPOS ═══════ */
function ChallengeScreen({ book, onBack, onComplete }) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [fragmentExpanded, setFragmentExpanded] = useState(true);
  const [highlightedWords, setHighlightedWords] = useState([]);

  const q = book.questions[index];
  const total = book.questions.length;

  function isCorrect() {
    if (q.mode === "highlight") {
      return highlightedWords.includes(q.correctHighlight);
    }
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
      setHighlightedWords([]);
      setFragmentExpanded(true);
    } else {
      onComplete(correctCount * 10);
      setFinished(true);
    }
  }

  function toggleHighlight(word) {
    if (answered) return;
    if (highlightedWords.includes(word)) {
      setHighlightedWords(highlightedWords.filter(w => w !== word));
    } else {
      setHighlightedWords([...highlightedWords, word]);
    }
  }

  if (finished) {
    return (
      <div style={{  }}>
        <TopBar onBack={onBack} title="Sesión completada" />
        <div style={{ padding: "20px 16px", textAlign: "center" }}>
          <div  style={{ fontSize: 72, fontWeight: 900, color: "#0066cc", lineHeight: 1, letterSpacing: "normal" }}>{correctCount}</div>
          <div  style={{ fontSize: 16, color: "#555555", marginTop: 8 }}>
            {correctCount === total ? "ideas exploradas" : `de ${total} ideas`}
          </div>
          <div style={{ marginTop: 36, padding: "20px", background: "#ffffff", border: "1px solid #e0e0e0", textAlign: "left" }}>
            <div  style={{ fontSize: 22, fontWeight: 700, color: "#111111" }}>+{correctCount * 10} puntos</div>
            <div style={{ fontSize: 12, color: "#555555", marginTop: 4 }}>y sumaste un día a tu racha de lectura.</div>
          </div>
          <button className="btn-primary" style={{ marginTop: 24, width: "100%" }} onClick={onBack}>Volver al libro</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar onBack={onBack} title={book.title} subtitle={`Pregunta ${index + 1} · ${book.title}`} />
      <div style={{ height: 2, background: "#e0e0e0" }}>
        <div style={{ height: "100%", background: "#0066cc", width: `${((index + (answered ? 1 : 0)) / total) * 100}%`, transition: "width 0.4s" }} />
      </div>
      <div style={{ padding: "24px 22px 100px",  }} key={index}>
        <div style={{ marginBottom: 14 }}>
          <span className="chip">
            {q.mode === "critical" && "Análisis"}
            {q.mode === "context" && "Contexto"}
            {q.mode === "fragment" && "Fragmento"}
            {q.mode === "highlight" && "Subrayar"}
          </span>
        </div>
        {q.concept && <div  style={{ fontSize: 12, color: "#0066cc", marginBottom: 6 }}>sobre {q.concept}</div>}
        <h2  style={{ fontSize: 22, fontWeight: 500, color: "#111111", lineHeight: 1.35, marginBottom: 22 }}>{q.text}</h2>

        {/* Fragmento expandible */}
        {(q.mode === "fragment" || q.mode === "highlight") && q.fragment && (
          <div style={{ marginBottom: 20 }}>
            <button
              className="btn-ghost"
              onClick={() => setFragmentExpanded(!fragmentExpanded)}
              style={{ width: "100%", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span>{fragmentExpanded ? "Ocultar" : "Mostrar"} fragmento</span>
              <span>{fragmentExpanded ? "▲" : "▼"}</span>
            </button>
            {fragmentExpanded && (
              <div style={{ padding: "18px 20px", background: "#ffffff", borderLeft: "3px solid #0066cc", fontFamily: "system-ui, sans-serif", fontSize: 15, color: "#555555", lineHeight: 1.65,  }}>
                {q.mode === "highlight" ? (
                  <div>
                    {q.fragment.split(" ").map((word, i) => {
                      const isHighlighted = highlightedWords.includes(word);
                      return (
                        <span
                          key={i}
                          onClick={() => toggleHighlight(word)}
                          className={isHighlighted ? "highlight-word" : ""}
                          style={{ cursor: "pointer", marginRight: 4 }}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  q.fragment
                )}
              </div>
            )}
          </div>
        )}

        {/* Opciones (solo para preguntas que no son de subrayar) */}
        {q.mode !== "highlight" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              const isCorr = i === q.correct;
              const isPicked = chosen === i;
              let bg = "#ffffff";
              let border = "#e0e0e0";
              let color = "#111111";
              if (answered) {
                if (isCorr) { bg = "#e8f5e9"; border = "#2a7a2a"; color = "#2a7a2a"; }
                else if (isPicked) { bg = "#fde8e8"; border = "#cc2200"; color = "#cc2200"; }
                else { color = "#888888"; }
              } else if (isPicked) { border = "#0066cc"; bg = "#e8f0ff"; }
              return (
                <button key={i} disabled={answered} onClick={() => setChosen(i)}
                  style={{ padding: "14px 18px", background: bg, border: `1px solid ${border}`, borderRadius: 6, color, textAlign: "left", fontSize: 14, fontFamily: "Inter, sans-serif", cursor: answered ? "default" : "pointer", lineHeight: 1.5, display: "flex", gap: 12 }}>
                  <span  style={{ fontSize: 14, color: "#888888", fontWeight: 500, minWidth: 16 }}>{String.fromCharCode(97 + i)}.</span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {answered && isCorr && <span style={{ color: "#2a7a2a" }}>✓</span>}
                  {answered && isPicked && !isCorr && <span style={{ color: "#cc2200" }}>✗</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Botón de confirmar */}
        {!answered && (
          <button
            className="btn-primary"
            disabled={q.mode === "highlight" ? highlightedWords.length === 0 : chosen === null}
            style={{ width: "100%", marginTop: 20 }}
            onClick={submitAnswer}
          >
            Confirmar respuesta
          </button>
        )}

        {/* Feedback */}
        {answered && (
          <div style={{ marginTop: 22, padding: "20px", background: "#ffffff", borderLeft: `3px solid ${isCorrect() ? "#2a7a2a" : "#0066cc"}`,  }}>
            <div  style={{ fontSize: 12, color: isCorrect() ? "#2a7a2a" : "#0066cc", marginBottom: 8, letterSpacing: 0 }}>
              {isCorrect() ? "Bien leído." : "Otra lectura:"}
            </div>
            <p style={{ fontSize: 14, color: "#111111", lineHeight: 1.7 }}>{isCorrect() ? q.feedback : q.feedbackAlt}</p>
            <button className="btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={next}>
              {index + 1 < total ? "Siguiente pregunta →" : "Ver mi lectura →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ FLASHCARDS ═══════ */
// Flujo:
// FASE 1: Repasar 3 cartas (voltear y ver respuesta)
// FASE 2: Escribir la respuesta de cada carta
// FASE 3: Trivia con tus propias cartas (máximo 3)

function FlashcardsScreen({ book, onBack }) {
  const REVIEW_COUNT = Math.min(3, book.flashcards.length);
  const [phase, setPhase] = useState("review"); // "review" | "write" | "trivia" | "done"
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [writeAnswer, setWriteAnswer] = useState("");
  const [writeChecked, setWriteChecked] = useState(false);
  const [writeSelf, setWriteSelf] = useState(null); // true/false según auto-evaluación
  const [triviaChosen, setTriviaChosen] = useState(null);
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewedCards] = useState(book.flashcards.slice(0, REVIEW_COUNT));

  // Genera opciones falsas mezcladas con la correcta
  function getTriviaOptions(card) {
    const correct = card.back;
    const others = reviewedCards.filter(c => c.id !== card.id).map(c => c.back);
    // Si hay menos de 3 otras cartas, usamos las que hay
    const wrongOptions = others.slice(0, 3);
    const all = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    return all;
  }

  const currentCard = reviewedCards[currentIndex];
  const triviaOptions = phase === "trivia" ? getTriviaOptions(currentCard) : [];

  // ── FASE 1: Repaso ──
  function nextReview() {
    if (currentIndex + 1 < REVIEW_COUNT) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      setCurrentIndex(0);
      setPhase("write");
      setFlipped(false);
      setWriteAnswer("");
      setWriteChecked(false);
    }
  }

  // ── FASE 2: Escribir ──
  function checkWrite() {
    setWriteChecked(true);
  }

  function nextWrite(selfCorrect) {
    setWriteSelf(selfCorrect);
    if (selfCorrect) setScore(s => s + 1);
    if (currentIndex + 1 < REVIEW_COUNT) {
      setCurrentIndex(currentIndex + 1);
      setWriteAnswer("");
      setWriteChecked(false);
      setWriteSelf(null);
    } else {
      setCurrentIndex(0);
      setPhase("trivia");
      setTriviaChosen(null);
      setTriviaAnswered(false);
    }
  }

  // ── FASE 3: Trivia ──
  function answerTrivia(opt) {
    if (triviaAnswered) return;
    setTriviaChosen(opt);
    setTriviaAnswered(true);
    if (opt === currentCard.back) setScore(s => s + 1);
  }

  function nextTrivia() {
    if (currentIndex + 1 < REVIEW_COUNT) {
      setCurrentIndex(currentIndex + 1);
      setTriviaChosen(null);
      setTriviaAnswered(false);
    } else {
      setPhase("done");
    }
  }

  // ── DONE ──
  if (phase === "done") {
    return (
      <div>
        <TopBar onBack={onBack} title="Flashcards" subtitle={book.title} />
        <div style={{ padding: "40px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sesión completada</h2>
          <p style={{ fontSize: 15, color: "#555", marginBottom: 24 }}>
            Respondiste bien {score} de {REVIEW_COUNT * 2} preguntas
          </p>
          <button className="btn-primary" style={{ width: "100%" }} onClick={onBack}>Volver al libro</button>
        </div>
      </div>
    );
  }

  // ── FASE 1: REPASO ──
  if (phase === "review") {
    return (
      <div>
        <TopBar onBack={onBack} title="Flashcards · Repaso" subtitle={book.title} />
        <div style={{ padding: "20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="chip">Carta {currentIndex + 1} de {REVIEW_COUNT}</span>
            <span style={{ fontSize: 12, color: "#888" }}>Fase 1: Repaso</span>
          </div>

          {/* Carta */}
          <div
            onClick={() => setFlipped(!flipped)}
            style={{ border: "2px solid #0066cc", borderRadius: 8, padding: "32px 20px", minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: flipped ? "#e8f0ff" : "#fff", textAlign: "center" }}
          >
            <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>{flipped ? "Respuesta" : "Pregunta — toca para ver"}</p>
            <p style={{ fontSize: 17, fontWeight: 600, color: "#111", lineHeight: 1.5 }}>
              {flipped ? currentCard.back : currentCard.front}
            </p>
          </div>

          {flipped && (
            <button className="btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={nextReview}>
              {currentIndex + 1 < REVIEW_COUNT ? "Siguiente carta →" : "Pasar a escribir →"}
            </button>
          )}
          {!flipped && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 16 }}>Toca la carta para ver la respuesta</p>
          )}
        </div>
      </div>
    );
  }

  // ── FASE 2: ESCRIBIR ──
  if (phase === "write") {
    return (
      <div>
        <TopBar onBack={onBack} title="Flashcards · Escribe" subtitle={book.title} />
        <div style={{ padding: "20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="chip">Carta {currentIndex + 1} de {REVIEW_COUNT}</span>
            <span style={{ fontSize: 12, color: "#888" }}>Fase 2: Escribe la respuesta</span>
          </div>

          {/* Pregunta */}
          <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "20px", marginBottom: 16, background: "#f9f9f9" }}>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Pregunta</p>
            <p style={{ fontSize: 17, fontWeight: 600, color: "#111", lineHeight: 1.5 }}>{currentCard.front}</p>
          </div>

          {/* Input para escribir */}
          <textarea
            value={writeAnswer}
            onChange={(e) => setWriteAnswer(e.target.value)}
            disabled={writeChecked}
            placeholder="Escribe la respuesta con tus propias palabras..."
            style={{ width: "100%", minHeight: 100, padding: "12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none", background: writeChecked ? "#f5f5f5" : "#fff" }}
          />

          {!writeChecked && (
            <button className="btn-primary" disabled={writeAnswer.trim().length < 3} style={{ width: "100%", marginTop: 12 }} onClick={checkWrite}>
              Ver respuesta correcta
            </button>
          )}

          {/* Mostrar respuesta correcta */}
          {writeChecked && (
            <div style={{ marginTop: 16 }}>
              <div style={{ border: "1px solid #2a7a2a", borderRadius: 8, padding: "16px", background: "#e8f5e9", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#2a7a2a", marginBottom: 8, fontWeight: 600 }}>Respuesta correcta:</p>
                <p style={{ fontSize: 15, color: "#111", lineHeight: 1.5 }}>{currentCard.back}</p>
              </div>
              <p style={{ fontSize: 14, color: "#555", marginBottom: 12, textAlign: "center" }}>¿Tu respuesta era correcta?</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => nextWrite(false)}>✗ No del todo</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => nextWrite(true)}>✓ Sí, lo sabía</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── FASE 3: TRIVIA ──
  if (phase === "trivia") {
    return (
      <div>
        <TopBar onBack={onBack} title="Flashcards · Trivia" subtitle={book.title} />
        <div style={{ padding: "20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="chip">Pregunta {currentIndex + 1} de {REVIEW_COUNT}</span>
            <span style={{ fontSize: 12, color: "#888" }}>Fase 3: Trivia</span>
          </div>

          <p style={{ fontSize: 17, fontWeight: 600, color: "#111", lineHeight: 1.5, marginBottom: 20 }}>{currentCard.front}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {triviaOptions.map((opt, i) => {
              const isCorrect = opt === currentCard.back;
              const isPicked = triviaChosen === opt;
              let bg = "#fff";
              let border = "#e0e0e0";
              let color = "#111";
              if (triviaAnswered) {
                if (isCorrect) { bg = "#e8f5e9"; border = "#2a7a2a"; color = "#2a7a2a"; }
                else if (isPicked) { bg = "#fde8e8"; border = "#cc2200"; color = "#cc2200"; }
                else { color = "#aaa"; }
              } else if (isPicked) { border = "#0066cc"; bg = "#e8f0ff"; }
              return (
                <button
                  key={i}
                  onClick={() => answerTrivia(opt)}
                  disabled={triviaAnswered}
                  style={{ padding: "14px 16px", background: bg, border: `1px solid ${border}`, borderRadius: 6, textAlign: "left", fontSize: 14, color, cursor: triviaAnswered ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span>{opt}</span>
                  {triviaAnswered && isCorrect && <span>✓</span>}
                  {triviaAnswered && isPicked && !isCorrect && <span>✗</span>}
                </button>
              );
            })}
          </div>

          {triviaAnswered && (
            <button className="btn-primary" style={{ width: "100%", marginTop: 20 }} onClick={nextTrivia}>
              {currentIndex + 1 < REVIEW_COUNT ? "Siguiente →" : "Ver resultado →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════ FORO ═══════ */
function ForumScreen({ book, onBack, user }) {
  const [question, setQuestion] = useState("");
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openThread, setOpenThread] = useState(null); // hilo abierto para ver respuestas

  useEffect(() => {
    loadThreads();
  }, [book.forumId]);

  async function loadThreads() {
    try {
      const q = query(collection(db, "forums", book.forumId, "threads"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setThreads(items);
    } catch (err) {
      console.error("Error cargando foro:", err);
    } finally {
      setLoading(false);
    }
  }

  async function submitQuestion() {
    if (question.trim().length < 10) return;
    try {
      await addDoc(collection(db, "forums", book.forumId, "threads"), {
        question: question.trim(),
        author: user?.email || "Invitado",
        timestamp: serverTimestamp(),
        replyCount: 0,
      });
      setQuestion("");
      setLoading(true);
      await loadThreads();
    } catch (err) {
      console.error("Error publicando:", err);
      alert("Error al publicar. Intenta de nuevo.");
    }
  }

  // Si hay un hilo abierto, mostrar sus respuestas
  if (openThread) {
    return (
      <ThreadScreen
        book={book}
        thread={openThread}
        onBack={() => { setOpenThread(null); loadThreads(); }}
        user={user}
        forumId={book.forumId}
      />
    );
  }

  return (
    <div style={{  }}>
      <TopBar onBack={onBack} title="Foro" subtitle={book.title} />
      <div style={{ padding: "20px 16px", paddingBottom: 100 }}>
        <h2  style={{ fontSize: 24, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Preguntas y dudas</h2>
        <p style={{ fontSize: 13, color: "#555555", lineHeight: 1.7, marginBottom: 28 }}>
          ¿No entendiste algo? Pregunta. Otros lectores responden.
        </p>

        {/* Publicar pregunta */}
        <div style={{ marginBottom: 28 }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="¿Qué no entendiste del libro? Ej: No entendí por qué Winston traiciona a Julia..."
            style={{ width: "100%", minHeight: 100, padding: "16px", background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 6, fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.6, color: "#111111", resize: "vertical", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#0066cc")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          />
          <div style={{ fontSize: 11, color: "#888888", marginTop: 6, marginBottom: 12, textAlign: "right" }}>{question.length} caracteres · mínimo 10</div>
          <button className="btn-primary" disabled={question.trim().length < 10} style={{ width: "100%" }} onClick={submitQuestion}>Publicar pregunta</button>
        </div>

        {/* Lista de preguntas */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888888" }}>Cargando preguntas...</div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
              <span  style={{ fontSize: 13, color: "#555555" }}>Preguntas recientes</span>
              <span style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
            </div>
            {threads.length === 0 && (
              <p  style={{ textAlign: "center", color: "#888888", fontSize: 13, padding: "20px" }}>
                Sé el primero en preguntar algo sobre este libro.
              </p>
            )}
            {threads.map((thread, i) => (
              <div
                key={thread.id}
                onClick={() => setOpenThread(thread)}
                style={{ marginBottom: 14, padding: "16px 18px", background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 6, cursor: "pointer",  }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0066cc")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              >
                <p  style={{ fontSize: 15, fontWeight: 500, color: "#111111", lineHeight: 1.6, marginBottom: 10 }}>{thread.question}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div  style={{ fontSize: 12, color: "#888888" }}>— {thread.author}</div>
                  <div style={{ fontSize: 11, color: "#0066cc", letterSpacing: 0 }}>
                    {thread.replyCount || 0} respuestas · Ver →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ HILO DE RESPUESTAS ═══════ */
function ThreadScreen({ book, thread, onBack, user, forumId }) {
  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReplies();
  }, [thread.id]);

  async function loadReplies() {
    try {
      const q = query(
        collection(db, "forums", forumId, "threads", thread.id, "replies"),
        orderBy("timestamp", "asc")
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReplies(items);
    } catch (err) {
      console.error("Error cargando respuestas:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleReplyLike(replyId, likedBy) {
    const userId = user?.uid || "anon";
    const alreadyLiked = (likedBy || []).includes(userId);
    const replyRef = doc(db, "forums", forumId, "threads", thread.id, "replies", replyId);
    try {
      if (alreadyLiked) {
        await updateDoc(replyRef, { likes: increment(-1), likedBy: (likedBy||[]).filter(id=>id!==userId) });
      } else {
        await updateDoc(replyRef, { likes: increment(1), likedBy: [...(likedBy||[]), userId] });
      }
      await loadReplies();
    } catch(err) { console.error("Error like reply:", err); }
  }

  async function submitReply() {
    if (reply.trim().length < 5) return;
    try {
      await addDoc(
        collection(db, "forums", forumId, "threads", thread.id, "replies"),
        {
          text: reply.trim(),
          author: user?.email || "Invitado",
          timestamp: serverTimestamp(),
          likes: 0,
          likedBy: [],
        }
      );
      // Actualizar el contador de respuestas en el hilo
      await updateDoc(doc(db, "forums", forumId, "threads", thread.id), {
        replyCount: increment(1),
      });
      setReply("");
      await loadReplies();
    } catch (err) {
      console.error("Error al responder:", err);
      alert("Error al publicar. Intenta de nuevo.");
    }
  }

  return (
    <div style={{  }}>
      <TopBar onBack={onBack} title="Respuestas" subtitle={book.title} />
      <div style={{ padding: "20px 16px", paddingBottom: 100 }}>

        {/* Pregunta original */}
        <div style={{ padding: "20px", background: "#ffffff", borderLeft: "3px solid #0066cc", marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 0, color: "#888888", textTransform: "uppercase", marginBottom: 8 }}>Pregunta</div>
          <p  style={{ fontSize: 17, fontWeight: 500, color: "#111111", lineHeight: 1.5, marginBottom: 10 }}>{thread.question}</p>
          <div  style={{ fontSize: 12, color: "#888888" }}>— {thread.author}</div>
        </div>

        {/* Respuestas existentes */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#888888" }}>Cargando respuestas...</div>
        ) : (
          <div style={{ marginBottom: 28 }}>
            {replies.length === 0 && (
              <p  style={{ textAlign: "center", color: "#888888", fontSize: 13, padding: "20px" }}>
                Nadie ha respondido aún. Sé el primero.
              </p>
            )}
            {replies.map((r, i) => (
              <div key={r.id} style={{ marginBottom: 12, padding: "14px 16px", background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 6 }}>
                <p style={{ fontSize: 14, color: "#111", lineHeight: 1.6, marginBottom: 8 }}>{r.text}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#888" }}>— {r.author}</span>
                  <button
                    onClick={() => toggleReplyLike(r.id, r.likedBy)}
                    style={{ background: (r.likedBy||[]).includes(user?.uid||"anon") ? "#e8f0ff" : "transparent", border: `1px solid ${(r.likedBy||[]).includes(user?.uid||"anon") ? "#0066cc" : "#e0e0e0"}`, borderRadius: 20, padding: "3px 10px", fontSize: 12, color: (r.likedBy||[]).includes(user?.uid||"anon") ? "#0066cc" : "#888", cursor: "pointer" }}
                  >
                    👍 {r.likes || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Escribir respuesta */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
          <span  style={{ fontSize: 13, color: "#555555" }}>Tu respuesta</span>
          <span style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
        </div>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Escribe tu respuesta..."
          style={{ width: "100%", minHeight: 100, padding: "16px", background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 6, fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.6, color: "#111111", resize: "vertical", outline: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "#0066cc")}
          onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
        />
        <div style={{ fontSize: 11, color: "#888888", marginTop: 6, marginBottom: 12, textAlign: "right" }}>{reply.length} caracteres · mínimo 5</div>
        <button className="btn-primary" disabled={reply.trim().length < 5} style={{ width: "100%" }} onClick={submitReply}>
          Publicar respuesta
        </button>
      </div>
    </div>
  );
}

/* ═══════ DEBATE ═══════ */
function DebateScreen({ book, debate, onBack, user }) {
  const [argument, setArgument] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [debateArgs, setDebateArgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebateArgs();
  }, [debate.id]);

  async function loadDebateArgs() {
    try {
      const q = query(collection(db, "debates", debate.id, "arguments"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const args = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDebateArgs(args);
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
        likes: 0,
        likedBy: [],
      });
      setSubmitted(true);
      await loadDebateArgs();
    } catch (err) {
      console.error("Error guardando argumento:", err);
      alert("Error al publicar. Intenta de nuevo.");
    }
  }

  async function toggleLike(argId, likedBy) {
    const userId = user?.uid || "anon";
    const alreadyLiked = (likedBy || []).includes(userId);
    const argRef = doc(db, "debates", debate.id, "arguments", argId);
    try {
      if (alreadyLiked) {
        await updateDoc(argRef, {
          likes: increment(-1),
          likedBy: (likedBy || []).filter(id => id !== userId),
        });
      } else {
        await updateDoc(argRef, {
          likes: increment(1),
          likedBy: [...(likedBy || []), userId],
        });
      }
      await loadDebateArgs();
    } catch (err) {
      console.error("Error en like:", err);
    }
  }

  return (
    <div style={{  }}>
      <TopBar onBack={onBack} title="Debate" subtitle={book.title} />
      <div style={{ padding: "20px 16px", paddingBottom: 100 }}>
        <h1  style={{ fontSize: 28, fontWeight: 700, color: "#111111", lineHeight: 1.2, letterSpacing: "normal", marginBottom: 14 }}>❝ {debate.question}</h1>
        <p  style={{ fontSize: 14, color: "#555555", lineHeight: 1.6, marginBottom: 28 }}>{debate.context}</p>

        {!submitted ? (
          <>
            <textarea
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Escribe tu lectura. Defiéndela con razones del libro..."
              style={{ width: "100%", minHeight: 160, padding: "16px", background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 6, fontFamily: "system-ui, sans-serif", fontSize: 15, lineHeight: 1.6, color: "#111111", resize: "vertical", outline: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#0066cc")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
            <div style={{ fontSize: 11, color: "#888888", marginTop: 6, marginBottom: 20, textAlign: "right" }}>{argument.length} caracteres · mínimo 20</div>
            <button className="btn-primary" disabled={argument.trim().length < 20} style={{ width: "100%" }} onClick={submit}>Publicar argumento</button>
          </>
        ) : (
          <div style={{ padding: "20px", background: "#ffffff", borderLeft: "3px solid #2a7a2a", marginBottom: 24,  }}>
            <div  style={{ fontSize: 11, color: "#2a7a2a", marginBottom: 8, letterSpacing: 0 }}>Tu argumento · publicado</div>
            <p  style={{ fontSize: 15, color: "#111111", lineHeight: 1.6 }}>{argument}</p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888888" }}>Cargando argumentos...</div>
        ) : (
          <div style={{ marginTop: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
              <span  style={{ fontSize: 13, color: "#555555" }}>Otros lectores</span>
              <span style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
            </div>
            {debateArgs.length === 0 && (
              <p  style={{ textAlign: "center", color: "#888888", fontSize: 13, padding: "20px" }}>
                Sé el primero en argumentar sobre esta pregunta.
              </p>
            )}
            {debateArgs.sort((a,b) => (b.likes||0)-(a.likes||0)).map((arg, i) => {
              const userId = user?.uid || "anon";
              const liked = (arg.likedBy || []).includes(userId);
              return (
              <div key={arg.id} style={{ marginBottom: 14, padding: "16px 18px", background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 6 }}>
                <p style={{ fontSize: 14, color: "#111", lineHeight: 1.6, marginBottom: 10 }}>{arg.text}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>— {arg.author}</span>
                  <button
                    onClick={() => toggleLike(arg.id, arg.likedBy)}
                    style={{ background: liked ? "#e8f0ff" : "transparent", border: `1px solid ${liked ? "#0066cc" : "#e0e0e0"}`, borderRadius: 20, padding: "4px 12px", fontSize: 13, color: liked ? "#0066cc" : "#888", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    👍 {arg.likes || 0}
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

/* ═══════ PERFIL (con racha sincronizada) ═══════ */
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
    <div style={{  }}>
      <div style={{ padding: "20px 16px" }}>
        
        <h1  style={{ fontSize: 36, fontWeight: 900, color: "#111111", lineHeight: 1, letterSpacing: "normal" }}>Tu lectura</h1>
      </div>

      <div style={{ padding: "0 16px", paddingBottom: 100 }}>
        {!user ? (
          <div style={{ marginBottom: 20, padding: "20px", background: "#ffffff", border: "1px solid #e0e0e0" }}>
            <p style={{ fontSize: 13, color: "#555555", lineHeight: 1.7, marginBottom: 14 }}>
              Inicia sesión para sincronizar tu racha y puntos en la nube.
            </p>
            {!showLogin && !showSignup && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={() => setShowLogin(true)} style={{ flex: 1 }}>Iniciar sesión</button>
                <button className="btn-ghost" onClick={() => setShowSignup(true)} style={{ flex: 1 }}>Crear cuenta</button>
              </div>
            )}
            {(showLogin || showSignup) && (
              <div style={{  }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "12px", marginBottom: 8, border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 14, fontFamily: "Inter, sans-serif" }}
                />
                <input
                  type="password"
                  placeholder="Contraseña (min 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", padding: "12px", marginBottom: 8, border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 14, fontFamily: "Inter, sans-serif" }}
                />
                {error && <div style={{ color: "#cc2200", fontSize: 12, marginBottom: 8 }}>{error}</div>}
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
          <div style={{ marginBottom: 20, padding: "20px", background: "#ffffff", border: "1px solid #2a7a2a" }}>
            <p style={{ fontSize: 13, color: "#111111", marginBottom: 12 }}>✓ Sesión iniciada como: <strong>{user.email}</strong></p>
            <button className="btn-ghost" onClick={handleLogout} style={{ width: "100%" }}>Cerrar sesión</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <StatCard label="Racha de días" value={streak} suffix="días" />
          <StatCard label="Puntos ganados" value={points} />
        </div>

        <div style={{ marginTop: 28, padding: "20px 22px", background: "#ffffff", border: "1px solid #e0e0e0", marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 0, color: "#888888", textTransform: "uppercase", marginBottom: 12 }}>
            Libros practicados · {completedBookObjects.length} de {BOOKS.length}
          </div>
          {completedBookObjects.length === 0 ? (
            <p  style={{ fontSize: 14, color: "#555555", lineHeight: 1.6 }}>
              Aún no has completado ningún libro.
            </p>
          ) : (
            <ul style={{ listStyle: "none" }}>
              {completedBookObjects.map((b) => (
                <li key={b.id} style={{ padding: "10px 0", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div  style={{ fontSize: 15, fontWeight: 500, color: "#111111" }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: "#888888", letterSpacing: 0 }}>{b.author}</div>
                  </div>
                  <span style={{ color: "#2a7a2a", fontSize: 14 }}>✓</span>
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
    <div style={{ padding: "18px 16px", background: "#ffffff", border: "1px solid #e0e0e0" }}>
      <div style={{ fontSize: 9, letterSpacing: 0, color: "#888888", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div  style={{ fontSize: 40, fontWeight: 900, color: "#0066cc", lineHeight: 1, letterSpacing: "normal" }}>{value}</div>
      {suffix && <div style={{ fontSize: 11, color: "#888888", marginTop: 4 }}>{suffix}</div>}
    </div>
  );
}
