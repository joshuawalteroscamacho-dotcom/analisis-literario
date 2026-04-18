# 🗓️ ROADMAP: ANÁLISIS — 4 Periodos hasta ExpoITC

---

## 📍 PERIODO 1 (ACTUAL) — Fundación sólida
**Objetivo:** Impresionar con diseño y funcionalidad básica

### ✅ Completado:
- [x] Interfaz editorial literaria (papel crema + serif + vino)
- [x] 6 libros con metadata completa
- [x] Sistema de desafíos (trivia sin sensación de examen)
- [x] 4 modos de pregunta: análisis crítico, subrayar, completar, contexto
- [x] Sistema de debates con preguntas abiertas
- [x] Argumentos de muestra (ficticios, para demo)
- [x] Racha diaria (en memoria, se pierde al recargar)
- [x] Perfil con puntos y libros completados
- [x] Navegación móvil bottom-bar
- [x] Responsive: funciona perfecto en PC y móvil
- [x] Código comentado en español para defensa del proyecto

### 🎯 Feedback esperado del profesor:
- "Se ve muy profesional"
- "Falta que los debates sean reales entre usuarios"
- "¿Cómo guardas la racha si cierras la app?"

### 📝 Lo que van a decir en la sustentación:
> "Somos conscientes de que los argumentos de debate aún son ficticios. En el periodo 2 vamos a integrar Firebase para que sean reales. Por ahora sirven para demostrar la experiencia de usuario y recoger feedback sobre la interfaz y los tipos de preguntas."

---

## 📍 PERIODO 2 — Datos reales + Persistencia local
**Objetivo:** Que los datos se compartan entre usuarios

### 🔥 Firebase Firestore (debates reales):
- [ ] Crear proyecto en Firebase
- [ ] Integrar SDK de Firebase en el código
- [ ] Conectar debates a Firestore
- [ ] Cuando alguien escribe un argumento → se guarda en la nube
- [ ] Cuando alguien entra a un debate → ve TODOS los argumentos
- [ ] Sistema de "Me gusta" (♥) funcional

### 💾 LocalStorage (racha personal):
- [ ] Guardar racha en `localStorage` del navegador
- [ ] Guardar puntos totales
- [ ] Guardar qué libros completaste
- [ ] Mensaje cuando la racha se rompe: "Perdiste tu racha de 5 días. ¡Empieza de nuevo!"

### 👤 Modo invitado mejorado:
- [ ] Al escribir un argumento: "¿Cómo quieres firmar?" → input simple
- [ ] Guardar el nombre en `localStorage` para no preguntarlo cada vez
- [ ] Los argumentos se firman como "Ana, 16" (texto plano, sin cuenta)

### 🎨 Feature visual nueva:
- [ ] **Citas destacadas:** sección nueva con pasajes memorables de cada libro
- [ ] Diseñadas como postales tipográficas
- [ ] Se pueden compartir (botón copy-to-clipboard)

### 📊 Estadísticas básicas:
- [ ] "24 personas completaron este desafío esta semana"
- [ ] "El debate más activo: ¿Pedro es víctima o cómplice?"
- [ ] Contador en tiempo real (Firebase)

### 🐛 Pulir bugs:
- [ ] Probar en Chrome, Safari, Firefox móvil
- [ ] Arreglar cualquier cosa que se vea rara
- [ ] Optimizar velocidad de carga

### 🎯 Feedback esperado:
- "Ahora sí se siente real"
- "Me gusta que pueda ver los argumentos de otros"
- "¿Y si quiero que mi racha se guarde en la nube?"

---

## 📍 PERIODO 3 — Login opcional + Comunidad
**Objetivo:** Persistencia en la nube + features sociales

### 🔐 Sistema de login (Firebase Auth):
- [ ] Botón "Iniciar sesión" en el perfil
- [ ] Opciones: Google, Email/Password
- [ ] Si NO inicias sesión: modo invitado sigue funcionando
- [ ] Si SÍ inicias sesión: tu racha/puntos se sincronizan en la nube

### ☁️ Datos en la nube (solo si tienes cuenta):
- [ ] Guardar racha en Firestore (no en `localStorage`)
- [ ] Guardar puntos totales
- [ ] Guardar historial completo de desafíos
- [ ] Sincronizar entre dispositivos: si cierras sesión en un celular y entras en otro → tu racha sigue ahí

### 🤝 Features sociales:
- [ ] **Comparar argumentos:** botón "Comparar con el mío" que muestra los dos textos lado a lado
- [ ] **Ranking de argumentos:** los más votados aparecen primero
- [ ] **Notificación:** "3 personas respondieron a tu argumento"

### 📚 Más contenido:
- [ ] Si tu compañero entrevistó usuarios: usar ese feedback para añadir más preguntas
- [ ] Añadir 2-3 libros más (sugeridos por usuarios o por feedback del profe)
- [ ] Sección "Análisis del mes": un artículo tuyo/de tu compañero sobre un libro

### 🎯 Feedback esperado:
- "El login opcional es buena idea, no obliga a crear cuenta"
- "Las features sociales le dan más vida"
- "Falta [X feature que no pensaste]"

---

## 📍 PERIODO 4 — Pulir + Preparar ExpoITC
**Objetivo:** Que se vea PROFESIONAL y funcione sin bugs

### 🎨 Detalles visuales:
- [ ] Animaciones más suaves (transiciones, micro-interacciones)
- [ ] Loading states bonitos: cuando carga datos de Firebase, mostrar skeleton o spinner
- [ ] Dark mode (opcional, pero impresiona)
- [ ] Ilustraciones custom para cada libro (dibujadas o con Midjourney/DALL-E)

### 🗺️ Feature ambiciosa (elige 1):
- [ ] **Mapas mentales:** herramienta para dibujar personajes/relaciones/temas (react-flow)
- [ ] **Flashcards:** repaso espaciado de conceptos de libros completados
- [ ] **Foros por libro:** espacio informal para preguntas y respuestas

### 📊 Dashboard de stats:
- [ ] Gráfico de tu progreso en el tiempo
- [ ] Heatmap de días activos (como GitHub)
- [ ] Comparación con la comunidad: "Estás en el top 15% de lectores más activos"

### 📱 Optimización móvil:
- [ ] Probar en 10 celulares distintos (Android + iOS)
- [ ] Optimizar imágenes si añadiste alguna
- [ ] Lazy loading: solo cargar datos cuando se necesitan
- [ ] Service Worker: funciona offline (opcional pero wow)

### 🎥 Material de presentación:
- [ ] Video demo de 30-45 segundos mostrando el flujo completo
- [ ] Slides de presentación: problema → solución → diferenciador → demo
- [ ] QR impreso en alta calidad (A4 o más grande)
- [ ] Cartel/banner con el nombre y el tagline

### 📝 Documentación:
- [ ] README detallado en el repo
- [ ] Documento "Cómo usar" para los visitantes de ExpoITC
- [ ] Licencia (MIT o similar)

### 🎯 Para la sustentación final:
- [ ] Tener números: "X personas usaron la app", "Y argumentos publicados", "Z libros completados"
- [ ] Mostrar feedback real de usuarios (capturas de comentarios)
- [ ] Comparación antes/después: código del año pasado vs este año
- [ ] Roadmap futuro: qué añadirías con más tiempo

---

## 📊 MÉTRICAS DE ÉXITO

### Técnicas:
- ✅ Funciona sin bugs en móvil y PC
- ✅ Carga en menos de 3 segundos
- ✅ Firebase sin errores
- ✅ Código limpio y comentado

### Pedagógicas:
- ✅ Los usuarios entienden cómo hacer análisis crítico mejor después de usarla
- ✅ Los debates muestran perspectivas distintas genuinas
- ✅ La gente vuelve (racha de 3+ días)

### De impacto:
- ✅ Al menos 50 personas lo usan durante ExpoITC
- ✅ 10+ argumentos publicados por otros usuarios
- ✅ Feedback positivo del jurado
- ✅ Los estudiantes de otros grados dicen "yo la usaría"

---

## 🎯 DIFERENCIADOR CLAVE (para la presentación)

### Lo que ya hay:
- Khan Academy, Brilliant, Duolingo → pero son de matemáticas/ciencias/idiomas
- Aplicaciones de lectura → pero solo te muestran el libro, no te enseñan a analizarlo
- Redes sociales de libros (Goodreads) → pero son para reseñas, no para análisis crítico

### Lo que tú haces único:
1. **SOLO análisis crítico literario en español** → no existe otra plataforma así
2. **Sin sensación de examen** → didáctico, no evaluativo
3. **Debates reales** → no es solo trivia, es comunidad pensante
4. **Diseño editorial** → se siente como leer un libro, no usar una app genérica
5. **Modo invitado + login opcional** → no obligas a crear cuenta

### El pitch de 30 segundos:
> "Mucha gente lee pero no sabe cómo analizar críticamente un texto. No hay plataformas dedicadas solo a eso. Nosotros creamos Análisis: desafíos de interpretación sin presión, debates abiertos con argumentos reales de otros lectores, y racha diaria para practicar. Es como Duolingo pero para pensar sobre lo que lees, no solo leerlo."

---

## ❓ PREGUNTAS QUE TE VAN A HACER (prepárate)

### "¿Por qué no usar IA para generar las preguntas?"
**R:** Porque queremos preguntas escritas por humanos que realmente enseñan a leer críticamente. Las preguntas de IA tienden a ser genéricas. Las nuestras están diseñadas para casos específicos de cada libro.

### "¿Cómo ganan dinero?"
**R:** Por ahora es un proyecto educativo sin fines de lucro. A futuro podríamos: (1) Suscripción premium con más libros, (2) Convenios con colegios, (3) Donaciones voluntarias.

### "¿Y si alguien copia las respuestas?"
**R:** No importa. El objetivo no es evaluar sino enseñar. Si alguien copia, no aprende, pero no estamos dando notas. El feedback es inmediato y explica el porqué, así que copiar no tiene sentido.

### "¿Por qué no incluir más libros del plan lector?"
**R:** Empezamos con 6 para pulir la experiencia. Cada libro requiere escribir 10-15 preguntas de calidad + debates. Preferimos 6 libros bien hechos que 20 mediocres. En el roadmap futuro añadimos más.

### "¿Cómo verifican que los argumentos no sean ofensivos?"
**R:** (Periodo 3-4) Vamos a añadir moderación: los usuarios pueden reportar argumentos inapropiados. Los reportados se ocultan automáticamente hasta que los revisamos.

### "Esto se parece mucho a [X app]. ¿Cuál es la diferencia?"
**R:** [Mira la sección "Diferenciador clave" arriba] — la diferencia es que SOLO hacemos análisis crítico literario en español. Las otras apps son generalistas.

---

## 🚀 TECNOLOGÍAS USADAS

### Frontend:
- React 18 (librería UI)
- Vite (build tool, más rápido que Create React App)
- CSS vanilla con variables (no Tailwind, para que entiendas todo el código)

### Backend (Periodo 2+):
- Firebase Firestore (base de datos NoSQL)
- Firebase Auth (login con Google/Email)
- Firebase Hosting (opcional, como alternativa a Netlify)

### Deploy:
- Netlify (gratis, auto-deploy desde GitHub)
- GitHub (control de versiones)

### Futuro (Periodo 4):
- react-flow (mapas mentales)
- Chart.js (gráficos de progreso)
- Service Worker (funcionalidad offline)

---

## ✅ CHECKLIST ANTES DE CADA PERIODO

### Antes de mostrarle al profesor:
- [ ] Funciona sin errores en consola (F12 en Chrome)
- [ ] Probado en móvil real (no solo emulador)
- [ ] Código subido a GitHub con commit descriptivo
- [ ] README actualizado con nuevas features
- [ ] Screenshots/video de las nuevas funcionalidades

### Antes de ExpoITC (Periodo 4):
- [ ] Funciona en red móvil 3G/4G (no solo WiFi)
- [ ] QR probado por al menos 5 personas distintas
- [ ] Backup de la base de datos (por si algo falla)
- [ ] Plan B si el internet falla: video demo pregrabado
- [ ] Cargar la batería del celular/laptop al 100%

---

**Este roadmap es tu guía. Imprímelo, pégalo en la pared, márcalo con highlighter. Cada periodo tiene objetivos claros y progresión lógica. ¡Éxito!** 🚀
