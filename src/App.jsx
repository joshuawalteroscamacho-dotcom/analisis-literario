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
@keyframes flip { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }

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

.highlight-word {
  background: var(--vino);
  color: var(--marfil);
  padding: 2px 4px;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.2s;
}

.highlight-word:hover { background: var(--vinoB); }
`;

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
    <div className="paper-bg" style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
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
    <div style={{ padding: "18px 20px", background: "var(--marfil)", borderBottom: "1px solid var(--linea)", display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", fontSize: 13, color: "var(--tinta2)", cursor: "pointer", fontFamily: "Inter, sans-serif", padding: 0 }}>
        ← Volver
      </button>
      <div style={{ flex: 1, textAlign: "center" }}>
        <div className="serif" style={{ fontSize: 16, fontWeight: 500, color: "var(--tinka)" }}>{title}</div>
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
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--marfil)", borderTop: "1px solid var(--linea)", display: "flex", zIndex: 50, maxWidth: 480, margin: "0 auto" }}>
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
function HomeScreen({ onPickBook, globalStats }) {
  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      <div style={{ padding: "40px 24px 28px" }}>
        <span className="rule-vino" />
        <h1 className="serif" style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, color: "var(--tinta)", letterSpacing: "-0.02em" }}>Análisis</h1>
        <div className="serif-italic" style={{ fontSize: 16, marginTop: 4, color: "var(--tinta2)", fontStyle: "italic" }}>la lectura como pensamiento</div>
        <p style={{ fontSize: 13, marginTop: 20, color: "var(--tinta2)", lineHeight: 1.7, maxWidth: 380 }}>
          La primera plataforma dedicada exclusivamente al análisis crítico literario en español.
        </p>
      </div>

      {/* Estadísticas globales */}
      {globalStats && (
        <div style={{ padding: "0 24px", marginBottom: 20 }}>
          <div style={{ background: "var(--marfil)", border: "1px solid var(--linea)", padding: "16px 18px" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 10 }}>Esta semana</div>
            <div className="serif" style={{ fontSize: 15, color: "var(--tinta)", lineHeight: 1.6 }}>
              <strong>{globalStats.totalChallenges || 0}</strong> personas completaron desafíos de análisis crítico
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "0 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--sepia)" }}>
          <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
          <span className="serif-italic" style={{ fontSize: 13, fontStyle: "italic", color: "var(--tinta2)" }}>Biblioteca</span>
          <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
        </div>
      </div>
      <div style={{ padding: "0 20px 24px" }}>
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
      style={{ marginBottom: 16, padding: "20px 22px", background: "var(--marfil)", border: "1px solid var(--linea)", borderRadius: 2, cursor: "pointer", animation: `fadeUp 0.5s ${index * 0.05}s both`, position: "relative" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--vino)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--linea)")}
    >
      <div style={{ fontSize: 9, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 8 }}>{book.genre} · {book.year}</div>
      <h3 className="serif" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15, color: "var(--tinta)", letterSpacing: "-0.01em", marginBottom: 4 }}>{book.title}</h3>
      <div className="serif-italic" style={{ fontSize: 13, color: "var(--tinta2)", fontStyle: "italic", marginBottom: 12 }}>{book.author}</div>
      <p style={{ fontSize: 13, color: "var(--tinta2)", lineHeight: 1.6, marginBottom: 14 }}>{book.tagline}</p>
      <div style={{ display: "flex", gap: 16, fontSize: 10, letterSpacing: 1, color: "var(--sepia)", textTransform: "uppercase", flexWrap: "wrap" }}>
        <span>{book.questions.length} preguntas</span>
        <span>·</span>
        <span>{book.flashcards.length} flashcards</span>
        {stats && stats.completions > 0 && (
          <>
            <span>·</span>
            <span style={{ color: "var(--vino)" }}>{stats.completions} completados</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════ PANTALLA DE UN LIBRO ═══════ */
function BookScreen({ book, onBack, onStartChallenge, onOpenDebate, onOpenFlashcards, onOpenForum }) {
  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <TopBar onBack={onBack} title={book.title} subtitle={book.author} />
      <div style={{ padding: "28px 24px", paddingBottom: 100 }}>
        <div style={{ fontSize: 10, letterSpacing: 2.5, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 6 }}>{book.genre} · {book.year}</div>
        <h1 className="serif" style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: "var(--tinta)", letterSpacing: "-0.02em", marginBottom: 8 }}>{book.title}</h1>
        <div className="serif-italic" style={{ fontSize: 16, color: "var(--tinta2)", fontStyle: "italic" }}>{book.author}</div>
        <span className="rule-vino" />
        <p className="serif" style={{ fontSize: 17, color: "var(--tinta)", lineHeight: 1.5, fontStyle: "italic", marginTop: 14 }}>"{book.tagline}"</p>

        {/* Desafíos */}
        <div style={{ marginTop: 36, padding: "22px 20px", background: "var(--marfil)", border: "1px solid var(--linea)" }}>
          <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: "var(--tinta)", marginBottom: 8 }}>Practica análisis crítico</h3>
          <p style={{ fontSize: 13, color: "var(--tinta2)", lineHeight: 1.7, marginBottom: 16 }}>
            {book.questions.length} preguntas de interpretación. Sin presión. Solo pensar.
          </p>
          <button className="btn-primary" onClick={onStartChallenge}>Empezar →</button>
        </div>

        {/* Flashcards */}
        <div style={{ marginTop: 16, padding: "22px 20px", background: "var(--marfil)", border: "1px solid var(--linea)" }}>
          <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: "var(--tinta)", marginBottom: 8 }}>Flashcards de repaso</h3>
          <p style={{ fontSize: 13, color: "var(--tinta2)", lineHeight: 1.7, marginBottom: 16 }}>
            {book.flashcards.length} conceptos clave para repasar.
          </p>
          <button className="btn-ghost" onClick={onOpenFlashcards}>Repasar conceptos →</button>
        </div>

        {/* Debates */}
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

        {/* Foro */}
        <div style={{ marginTop: 28, padding: "22px 20px", background: "var(--marfil)", border: "1px solid var(--linea)" }}>
          <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, color: "var(--tinta)", marginBottom: 8 }}>Foro · Preguntas y dudas</h3>
          <p style={{ fontSize: 13, color: "var(--tinta2)", lineHeight: 1.7, marginBottom: 16 }}>
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
      <div style={{ animation: "fadeIn 0.4s" }}>
        <TopBar onBack={onBack} title="Sesión completada" />
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 72, fontWeight: 900, color: "var(--vino)", lineHeight: 1, letterSpacing: "-0.04em" }}>{correctCount}</div>
          <div className="serif-italic" style={{ fontSize: 16, fontStyle: "italic", color: "var(--tinta2)", marginTop: 8 }}>
            {correctCount === total ? "ideas exploradas" : `de ${total} ideas`}
          </div>
          <div style={{ marginTop: 36, padding: "20px", background: "var(--marfil)", border: "1px solid var(--linea)", textAlign: "left" }}>
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
      <div style={{ padding: "24px 22px 100px", animation: "fadeUp 0.3s" }} key={index}>
        <div style={{ marginBottom: 14 }}>
          <span className="chip">
            {q.mode === "critical" && "Análisis"}
            {q.mode === "context" && "Contexto"}
            {q.mode === "fragment" && "Fragmento"}
            {q.mode === "highlight" && "Subrayar"}
          </span>
        </div>
        {q.concept && <div className="serif-italic" style={{ fontSize: 12, color: "var(--vino)", fontStyle: "italic", marginBottom: 6 }}>sobre {q.concept}</div>}
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, color: "var(--tinta)", lineHeight: 1.35, marginBottom: 22 }}>{q.text}</h2>

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
              <div style={{ padding: "18px 20px", background: "var(--marfil)", borderLeft: "3px solid var(--vino)", fontFamily: "Fraunces, Georgia, serif", fontSize: 15, fontStyle: "italic", color: "var(--tinta2)", lineHeight: 1.65, animation: "fadeIn 0.3s" }}>
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

/* ═══════ FLASHCARDS ═══════ */
function FlashcardsScreen({ book, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState([]);

  const card = book.flashcards[currentIndex];

  function nextCard() {
    if (currentIndex + 1 < book.flashcards.length) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      setCurrentIndex(0);
      setFlipped(false);
    }
  }

  function markMastered() {
    if (!mastered.includes(card.id)) {
      setMastered([...mastered, card.id]);
    }
    nextCard();
  }

  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      <TopBar onBack={onBack} title="Flashcards" subtitle={book.title} />
      <div style={{ padding: "40px 24px", minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span className="chip">{currentIndex + 1} / {book.flashcards.length}</span>
          {mastered.length > 0 && (
            <span style={{ marginLeft: 10, fontSize: 12, color: "var(--verde)" }}>✓ {mastered.length} dominadas</span>
          )}
        </div>

        <div
          onClick={() => setFlipped(!flipped)}
          style={{
            background: "var(--marfil)",
            border: "2px solid var(--vino)",
            borderRadius: 8,
            padding: "40px 30px",
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 0.3s",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
            <div className="serif" style={{ fontSize: 20, fontWeight: 500, color: "var(--tinta)", lineHeight: 1.5, textAlign: "center" }}>
              {flipped ? card.back : card.front}
            </div>
            <div style={{ fontSize: 11, color: "var(--sepia)", marginTop: 20, textAlign: "center", textTransform: "uppercase", letterSpacing: 1.5 }}>
              {flipped ? "Respuesta" : "Toca para voltear"}
            </div>
          </div>
        </div>

        {flipped && (
          <div style={{ marginTop: 30, display: "flex", gap: 10, animation: "fadeIn 0.3s" }}>
            <button className="btn-ghost" onClick={nextCard} style={{ flex: 1 }}>Revisar más tarde</button>
            <button className="btn-primary" onClick={markMastered} style={{ flex: 1 }}>✓ La domino</button>
          </div>
        )}
      </div>
    </div>
  );
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
    <div style={{ animation: "fadeIn 0.4s" }}>
      <TopBar onBack={onBack} title="Foro" subtitle={book.title} />
      <div style={{ padding: "28px 24px", paddingBottom: 100 }}>
        <h2 className="serif" style={{ fontSize: 24, fontWeight: 700, color: "var(--tinta)", marginBottom: 8 }}>Preguntas y dudas</h2>
        <p style={{ fontSize: 13, color: "var(--tinta2)", lineHeight: 1.7, marginBottom: 28 }}>
          ¿No entendiste algo? Pregunta. Otros lectores responden.
        </p>

        {/* Publicar pregunta */}
        <div style={{ marginBottom: 28 }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="¿Qué no entendiste del libro? Ej: No entendí por qué Winston traiciona a Julia..."
            style={{ width: "100%", minHeight: 100, padding: "16px", background: "var(--marfil)", border: "1px solid var(--linea)", borderRadius: 2, fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.6, color: "var(--tinta)", resize: "vertical", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--vino)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--linea)")}
          />
          <div style={{ fontSize: 11, color: "var(--sepia)", marginTop: 6, marginBottom: 12, textAlign: "right" }}>{question.length} caracteres · mínimo 10</div>
          <button className="btn-primary" disabled={question.trim().length < 10} style={{ width: "100%" }} onClick={submitQuestion}>Publicar pregunta</button>
        </div>

        {/* Lista de preguntas */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--sepia)" }}>Cargando preguntas...</div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
              <span className="serif-italic" style={{ fontSize: 13, fontStyle: "italic", color: "var(--tinta2)" }}>Preguntas recientes</span>
              <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
            </div>
            {threads.length === 0 && (
              <p className="serif-italic" style={{ textAlign: "center", color: "var(--sepia)", fontSize: 13, fontStyle: "italic", padding: "20px" }}>
                Sé el primero en preguntar algo sobre este libro.
              </p>
            )}
            {threads.map((thread, i) => (
              <div
                key={thread.id}
                onClick={() => setOpenThread(thread)}
                style={{ marginBottom: 14, padding: "16px 18px", background: "var(--marfil)", border: "1px solid var(--linea)", borderRadius: 2, cursor: "pointer", animation: `fadeUp 0.4s ${i * 0.1}s both` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--vino)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--linea)")}
              >
                <p className="serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--tinta)", lineHeight: 1.6, marginBottom: 10 }}>{thread.question}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="serif-italic" style={{ fontSize: 12, fontStyle: "italic", color: "var(--sepia)" }}>— {thread.author}</div>
                  <div style={{ fontSize: 11, color: "var(--vino)", letterSpacing: 0.5 }}>
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

  async function submitReply() {
    if (reply.trim().length < 5) return;
    try {
      // Guardar la respuesta en la subcolección
      await addDoc(
        collection(db, "forums", forumId, "threads", thread.id, "replies"),
        {
          text: reply.trim(),
          author: user?.email || "Invitado",
          timestamp: serverTimestamp(),
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
    <div style={{ animation: "fadeIn 0.4s" }}>
      <TopBar onBack={onBack} title="Respuestas" subtitle={book.title} />
      <div style={{ padding: "28px 24px", paddingBottom: 100 }}>

        {/* Pregunta original */}
        <div style={{ padding: "20px", background: "var(--marfil)", borderLeft: "3px solid var(--vino)", marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 8 }}>Pregunta</div>
          <p className="serif" style={{ fontSize: 17, fontWeight: 500, color: "var(--tinta)", lineHeight: 1.5, marginBottom: 10 }}>{thread.question}</p>
          <div className="serif-italic" style={{ fontSize: 12, fontStyle: "italic", color: "var(--sepia)" }}>— {thread.author}</div>
        </div>

        {/* Respuestas existentes */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--sepia)" }}>Cargando respuestas...</div>
        ) : (
          <div style={{ marginBottom: 28 }}>
            {replies.length === 0 && (
              <p className="serif-italic" style={{ textAlign: "center", color: "var(--sepia)", fontSize: 13, fontStyle: "italic", padding: "20px" }}>
                Nadie ha respondido aún. Sé el primero.
              </p>
            )}
            {replies.map((r, i) => (
              <div key={r.id} style={{ marginBottom: 12, padding: "14px 16px", background: "var(--marfil)", border: "1px solid var(--linea)", borderRadius: 2, animation: `fadeUp 0.3s ${i * 0.08}s both` }}>
                <p style={{ fontSize: 14, color: "var(--tinta)", lineHeight: 1.6, marginBottom: 8 }}>{r.text}</p>
                <div className="serif-italic" style={{ fontSize: 11, fontStyle: "italic", color: "var(--sepia)" }}>— {r.author}</div>
              </div>
            ))}
          </div>
        )}

        {/* Escribir respuesta */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
          <span className="serif-italic" style={{ fontSize: 13, fontStyle: "italic", color: "var(--tinta2)" }}>Tu respuesta</span>
          <span style={{ flex: 1, height: 1, background: "var(--linea)" }} />
        </div>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Escribe tu respuesta..."
          style={{ width: "100%", minHeight: 100, padding: "16px", background: "var(--marfil)", border: "1px solid var(--linea)", borderRadius: 2, fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.6, color: "var(--tinta)", resize: "vertical", outline: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--vino)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--linea)")}
        />
        <div style={{ fontSize: 11, color: "var(--sepia)", marginTop: 6, marginBottom: 12, textAlign: "right" }}>{reply.length} caracteres · mínimo 5</div>
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
      });
      setSubmitted(true);
      await loadDebateArgs();
    } catch (err) {
      console.error("Error guardando argumento:", err);
      alert("Error al publicar. Intenta de nuevo.");
    }
  }

  return (
    <div style={{ animation: "fadeIn 0.4s" }}>
      <TopBar onBack={onBack} title="Debate" subtitle={book.title} />
      <div style={{ padding: "28px 24px", paddingBottom: 100 }}>
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--tinta)", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 14 }}>❝ {debate.question}</h1>
        <p className="serif-italic" style={{ fontSize: 14, fontStyle: "italic", color: "var(--tinta2)", lineHeight: 1.6, marginBottom: 28 }}>{debate.context}</p>

        {!submitted ? (
          <>
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
            {debateArgs.length === 0 && (
              <p className="serif-italic" style={{ textAlign: "center", color: "var(--sepia)", fontSize: 13, fontStyle: "italic", padding: "20px" }}>
                Sé el primero en argumentar sobre esta pregunta.
              </p>
            )}
            {debateArgs.map((arg, i) => (
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
    <div style={{ animation: "fadeIn 0.4s" }}>
      <div style={{ padding: "36px 24px 24px" }}>
        <span className="rule-vino" />
        <h1 className="serif" style={{ fontSize: 36, fontWeight: 900, color: "var(--tinta)", lineHeight: 1, letterSpacing: "-0.02em" }}>Tu lectura</h1>
      </div>

      <div style={{ padding: "0 20px", paddingBottom: 100 }}>
        {!user ? (
          <div style={{ marginBottom: 20, padding: "20px", background: "var(--marfil)", border: "1px solid var(--linea)" }}>
            <p style={{ fontSize: 13, color: "var(--tinta2)", lineHeight: 1.7, marginBottom: 14 }}>
              Inicia sesión para sincronizar tu racha y puntos en la nube.
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
            <p style={{ fontSize: 13, color: "var(--tinta)", marginBottom: 12 }}>✓ Sesión iniciada como: <strong>{user.email}</strong></p>
            <button className="btn-ghost" onClick={handleLogout} style={{ width: "100%" }}>Cerrar sesión</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <StatCard label="Racha de días" value={streak} suffix="días" />
          <StatCard label="Puntos ganados" value={points} />
        </div>

        <div style={{ marginTop: 28, padding: "20px 22px", background: "var(--marfil)", border: "1px solid var(--linea)", marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--sepia)", textTransform: "uppercase", marginBottom: 12 }}>
            Libros practicados · {completedBookObjects.length} de {BOOKS.length}
          </div>
          {completedBookObjects.length === 0 ? (
            <p className="serif-italic" style={{ fontSize: 14, fontStyle: "italic", color: "var(--tinta2)", lineHeight: 1.6 }}>
              Aún no has completado ningún libro.
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
