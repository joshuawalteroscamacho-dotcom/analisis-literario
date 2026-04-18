# ANÁLISIS — Plataforma de análisis crítico literario

La primera plataforma dedicada exclusivamente al análisis crítico literario en español.

---

## 📦 ESTRUCTURA DEL PROYECTO

```
analisis-literario/
├── index.html          → Punto de entrada HTML
├── package.json        → Dependencias del proyecto
├── vite.config.js      → Configuración de Vite
└── src/
    ├── main.jsx        → Monta React en el DOM
    └── App.jsx         → Componente principal (tu código)
```

---

## 🚀 PASO 1: PREPARAR TU COMPUTADOR

### Instalar Node.js (si no lo tienes):
1. Ve a https://nodejs.org
2. Descarga la versión **LTS** (recomendada)
3. Instala haciendo clic en "Next" todo el rato
4. Abre una terminal y verifica:
   ```bash
   node --version
   # Debe mostrar algo como: v20.10.0
   
   npm --version
   # Debe mostrar algo como: 10.2.3
   ```

---

## 🏗️ PASO 2: CREAR EL PROYECTO

### Opción A: Desde los archivos que te di

1. **Crea una carpeta** en tu computador:
   ```bash
   mkdir analisis-literario
   cd analisis-literario
   ```

2. **Crea la estructura de carpetas:**
   ```bash
   mkdir src
   ```

3. **Copia los archivos en su lugar:**
   - `package.json` → raíz del proyecto
   - `vite.config.js` → raíz del proyecto
   - `index.html` → raíz del proyecto
   - `main.jsx` → dentro de carpeta `src/`
   - `App.jsx` → dentro de carpeta `src/`

4. **Instala las dependencias:**
   ```bash
   npm install
   ```
   
   Esto crea una carpeta `node_modules/` con todo lo necesario.

5. **Prueba que funcione localmente:**
   ```bash
   npm run dev
   ```
   
   Abre http://localhost:3000 en tu navegador → debería ver tu app funcionando.

---

## 🌐 PASO 3: SUBIR A GITHUB

Netlify se conecta a GitHub para desplegar automáticamente.

1. **Crea un repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre: `analisis-literario`
   - Público o privado (da igual)
   - NO marques "Initialize with README" (ya tienes archivos)
   - Click en "Create repository"

2. **Sube tu código:**
   ```bash
   # En la terminal, dentro de tu carpeta analisis-literario:
   
   git init
   git add .
   git commit -m "Primer commit - app funcionando"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/analisis-literario.git
   git push -u origin main
   ```

3. **Añade un `.gitignore`** para no subir carpetas innecesarias:
   
   Crea un archivo `.gitignore` en la raíz con este contenido:
   ```
   node_modules/
   dist/
   .env
   ```

---

## 🚀 PASO 4: DESPLEGAR EN NETLIFY

1. **Crea cuenta en Netlify:**
   - Ve a https://app.netlify.com/signup
   - Usa tu cuenta de GitHub para registrarte (más fácil)

2. **Conecta tu repositorio:**
   - Click en "Add new site" → "Import an existing project"
   - Elige "Deploy with GitHub"
   - Busca tu repo `analisis-literario`
   - Click en el repositorio

3. **Configurar el build:**
   Netlify detecta automáticamente que es un proyecto Vite, pero verifica:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - Click en "Deploy site"

4. **¡Listo!** En 1-2 minutos tu app está en línea.
   - Te da un link tipo: `https://random-name-12345.netlify.app`
   - Puedes cambiar el nombre: Site settings → Change site name

---

## 📱 PASO 5: GENERAR QR PARA EXPOITC

1. **Copia tu URL de Netlify**
   Ejemplo: `https://analisis-literario.netlify.app`

2. **Genera QR gratis en:**
   - https://www.qr-code-generator.com
   - https://www.qrcode-monkey.com
   - O cualquier generador de QR

3. **Descarga el QR como PNG** (alta resolución si lo vas a imprimir)

4. **Pruébalo:** Escanea con tu celular → debe abrir tu app

---

## 🔄 ACTUALIZACIONES FUTURAS

Cada vez que hagas cambios:

```bash
# 1. Prueba localmente
npm run dev

# 2. Si funciona, sube a GitHub
git add .
git commit -m "Descripción del cambio"
git push

# 3. Netlify despliega automáticamente en 1-2 minutos
```

No necesitas hacer nada en Netlify — se actualiza solo cuando haces `git push`.

---

## 🐛 PROBLEMAS COMUNES

### "npm: command not found"
→ Node.js no está instalado. Ve al PASO 1.

### "Cannot find module 'react'"
→ Olvidaste hacer `npm install`. Corre ese comando.

### "This site can't be reached" al abrir localhost:3000
→ El servidor no está corriendo. Corre `npm run dev` primero.

### "Build failed" en Netlify
→ Revisa los logs en Netlify. Usualmente es:
   - Olvidaste subir `package.json`
   - Hay un error de sintaxis en tu código
   - Falta algún archivo

### La app se ve rara en móvil
→ Abre Chrome DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M) → Elige un modelo de celular → Prueba la app ahí antes de desplegar.

---

## 📈 SIGUIENTE PASO: FIREBASE (PERIODO 2)

Cuando estés listo para que los argumentos sean reales entre usuarios:

1. Crea cuenta en https://firebase.google.com
2. Crea un proyecto
3. Activa Firestore Database
4. Dime y te doy el código actualizado con Firebase integrado

---

## 🎯 RESUMEN RÁPIDO

```bash
# PREPARAR
mkdir analisis-literario && cd analisis-literario
mkdir src
# [copiar archivos]
npm install
npm run dev  # prueba local

# SUBIR
git init
git add .
git commit -m "Primera versión"
git remote add origin https://github.com/TU-USUARIO/analisis-literario.git
git push -u origin main

# DESPLEGAR
# → Ve a Netlify → Import from GitHub → Selecciona repo → Deploy

# QR
# → Copia URL de Netlify → qr-code-generator.com → Descargar QR
```

---

## 📞 CONTACTO

Si algo no funciona o necesitas ayuda con Firebase/Login, avísame.

**Proyecto hecho para ExpoITC — Especialización en Sistemas**
