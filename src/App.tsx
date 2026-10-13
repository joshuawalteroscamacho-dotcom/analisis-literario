import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  getPortalContent,
  PortalContent,
  remoteDatabaseEnabled,
} from "./lib/api";

type IconName =
  | "arrow"
  | "calendar"
  | "camera"
  | "cube"
  | "location"
  | "mail"
  | "menu"
  | "mic"
  | "pause"
  | "play"
  | "quote"
  | "spark"
  | "trophy"
  | "users"
  | "x";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    camera: (
      <>
        <path d="M14.5 5 13 3H8L6.5 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
        <circle cx="10.5" cy="12.5" r="3.5" />
      </>
    ),
    cube: (
      <>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 7 9 5v10l-9-5V7ZM21 7l-9 5v10l9-5V7Z" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
      </>
    ),
    pause: (
      <>
        <path d="M9 6v12M15 6v12" />
      </>
    ),
    play: <path d="m9 6 9 6-9 6V6Z" />,
    quote: <path d="M9 11H5a4 4 0 0 1 4-4v8a4 4 0 0 1-4 4M20 11h-4a4 4 0 0 1 4-4v8a4 4 0 0 1-4 4" />,
    spark: (
      <>
        <path d="m12 2 1.5 5.3L19 9l-5.5 1.7L12 16l-1.5-5.3L5 9l5.5-1.7L12 2Z" />
        <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 4h8v4a4 4 0 0 1-8 0V4ZM12 12v5M8 21h8M9 17h6" />
        <path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 4 4.9V20" />
      </>
    ),
    x: <path d="M6 6l12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      {paths[name]}
    </svg>
  );
}

const navItems = [
  ["#proyecto", "El proyecto"],
  ["#museo", "Museo virtual"],
  ["#voces", "Voces"],
  ["#salidas", "Salidas"],
  ["#visitas", "Visitas y eventos"],
  ["#contacto", "Contacto"],
];

function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="Restauradores de la Memoria, ir al inicio">
      <span className="brand-mark" aria-hidden="true">
        <span>R</span>
      </span>
      <span className="brand-copy">
        <strong>Restauradores</strong>
        <small>de la Memoria</small>
      </span>
    </a>
  );
}

function ImagePlaceholder({
  label,
  className = "",
  number,
}: {
  label: string;
  className?: string;
  number?: string;
}) {
  return (
    <div className={`image-placeholder ${className}`} role="img" aria-label={`Placeholder: ${label}`}>
      {number && <span className="placeholder-number">{number}</span>}
      <span className="placeholder-icon">
        <Icon name="camera" />
      </span>
      <span>{label}</span>
    </div>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}>{children}</p>;
}

function SectionHeading({
  eyebrow,
  title,
  intro,
  light = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-heading ${light ? "section-heading-light" : ""}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
  );
}

function ArrowLink({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  return (
    <a className={`arrow-link ${light ? "arrow-link-light" : ""}`} href={href}>
      <span>{children}</span>
      <Icon name="arrow" size={18} />
    </a>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [playingInterview, setPlayingInterview] = useState<number | null>(null);
  const [activeInterview, setActiveInterview] = useState(0);
  const [activeAframeObject, setActiveAframeObject] = useState(0);
  const [portalContent, setPortalContent] = useState<PortalContent | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<"loading" | "connected" | "offline">("loading");

  const interviews = [
    {
      topic: "[Tema de la entrevista 1]",
      quote: "“[Fragmento significativo de la primera entrevista que invite a escuchar la historia completa.]”",
      person: "[Nombre o seudónimo 1]",
      meta: "[Relación con la comunidad] · [Año]",
      duration: "[Duración 1]",
      image: "Retrato de la persona entrevistada 1",
    },
    {
      topic: "[Tema de la entrevista 2]",
      quote: "“[Fragmento significativo de la segunda entrevista sobre el colegio, el barrio o la comunidad.]”",
      person: "[Nombre o seudónimo 2]",
      meta: "[Relación con la comunidad] · [Año]",
      duration: "[Duración 2]",
      image: "Retrato de la persona entrevistada 2",
    },
    {
      topic: "[Tema de la entrevista 3]",
      quote: "“[Fragmento significativo de la tercera entrevista que conserve una experiencia importante.]”",
      person: "[Nombre o seudónimo 3]",
      meta: "[Relación con la comunidad] · [Año]",
      duration: "[Duración 3]",
      image: "Retrato de la persona entrevistada 3",
    },
    {
      topic: "[Tema de la entrevista 4]",
      quote: "“[Fragmento significativo de la cuarta entrevista para cerrar este recorrido de voces.]”",
      person: "[Nombre o seudónimo 4]",
      meta: "[Relación con la comunidad] · [Año]",
      duration: "[Duración 4]",
      image: "Retrato de la persona entrevistada 4",
    },
  ];

  const changeInterview = (direction: number) => {
    setActiveInterview((current) => (current + direction + interviews.length) % interviews.length);
    setPlayingInterview(null);
  };

  const aframeObjects = [
    {
      name: "[Nombre del objeto digital 1]",
      file: "/models/objeto-01.glb",
      color: "#df604b",
      description: "[Descripción del objeto, su origen, quién lo utilizó y qué memoria conserva.]",
      credits: "[Estudiantes responsables] · Luma AI · [Fecha]",
    },
    {
      name: "[Nombre del objeto digital 2]",
      file: "/models/objeto-02.glb",
      color: "#d9a63d",
      description: "[Descripción del objeto, su procedencia y su importancia para la comunidad.]",
      credits: "[Estudiantes responsables] · Fotogrametría · [Fecha]",
    },
  ];

  const catalogObjects = portalContent?.objetos_museo?.length
    ? portalContent.objetos_museo.slice(0, 2).map((object, index) => ({
        name: object.nombre,
        file: object.modelo_3d_url,
        color: index === 0 ? "#df604b" : "#d9a63d",
        description: object.descripcion,
        credits: object.creditos,
        category: object.categoria,
      }))
    : aframeObjects.map((object) => ({ ...object, category: "[Categoría]" }));

  useEffect(() => {
    let mounted = true;

    if (!remoteDatabaseEnabled) {
      setDatabaseStatus("offline");
      return () => {
        mounted = false;
      };
    }

    const connectDatabase = async () => {
      try {
        const content = await getPortalContent();
        if (!mounted) return;
        setPortalContent(content);
        setDatabaseStatus("connected");
      } catch {
        if (mounted) setDatabaseStatus("offline");
      }
    };

    void connectDatabase();

    return () => {
      mounted = false;
    };
  }, []);

  const aframePreview = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script src="https://aframe.io/releases/1.4.0/aframe.min.js"><\/script>
    <style>body{margin:0;background:#101728} .hint{position:fixed;left:16px;bottom:14px;color:#c8d0df;font:11px Arial;z-index:2;background:rgba(16,23,40,.8);padding:8px 10px}</style>
  </head>
  <body>
    <div class="hint">Arrastra para mirar · Usa W A S D para moverte</div>
    <a-scene embedded renderer="colorManagement: true; antialias: true" background="color: #101728">
      <a-assets>
        <!-- Cuando tengas el archivo real:
        <a-asset-item id="modelo" src="${catalogObjects[activeAframeObject]?.file ?? ""}"></a-asset-item>
        -->
      </a-assets>
      <a-entity environment="preset: none"></a-entity>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="20" height="20" color="#202b42"></a-plane>
      <a-cylinder position="0 .28 -4" radius="1.15" height=".55" color="#27334c"></a-cylinder>
      <a-cylinder position="0 .58 -4" radius=".9" height=".08" color="#728dad"></a-cylinder>
      <a-entity position="0 1.65 -4" animation="property: rotation; to: 0 360 0; loop: true; dur: 14000; easing: linear">
        <!-- Sustituye la figura temporal por:
        <a-gltf-model src="#modelo" scale="1 1 1"></a-gltf-model>
        -->
        <a-entity geometry="primitive: dodecahedron; radius: .82" material="color: ${catalogObjects[activeAframeObject]?.color ?? "#df604b"}; metalness: .25; roughness: .45"></a-entity>
      </a-entity>
      <a-text value="OBJETO ${activeAframeObject + 1} - ESPACIO PARA MODELO GLB" align="center" color="#ffffff" width="5" position="0 2.95 -4"></a-text>
      <a-text value="${catalogObjects[activeAframeObject]?.file ?? ""}" align="center" color="#9ba6b9" width="3.5" position="0 .05 -2.65" rotation="-65 0 0"></a-text>
      <a-light type="ambient" color="#8ea3bd" intensity=".65"></a-light>
      <a-light type="point" color="${catalogObjects[activeAframeObject]?.color ?? "#df604b"}" intensity="1.2" position="2 4 0"></a-light>
      <a-sky color="#101728"></a-sky>
      <a-entity position="0 1.6 1.5">
        <a-camera wasd-controls="acceleration: 18" look-controls></a-camera>
      </a-entity>
    </a-scene>
  </body>
</html>`;

  const submitPlaceholder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSent(true);
  };

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navItems.map(([href, label]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
          <a className="header-cta" href="#museo">
            Explorar museo
            <Icon name="arrow" size={17} />
          </a>
          <button
            className="menu-button"
            type="button"
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "x" : "menu"} />
          </button>
        </div>
        <nav
          className={`mobile-nav ${menuOpen ? "mobile-nav-open" : ""}`}
          id="mobile-navigation"
          aria-label="Navegación móvil"
        >
          {navItems.map(([href, label], index) => (
            <a href={href} key={href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main id="contenido">
        <section className="hero" id="inicio">
          <div className="hero-grain" />
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span className="pulse-dot" />
                Proyecto escolar vivo · Bogotá
              </div>
              <h1>
                Recordar es una forma de <em>volver a encontrarnos.</em>
              </h1>
              <p className="hero-intro">
                Un portal para preservar las historias, los objetos y las voces que construyen la memoria del Colegio
                Tom Adams IED.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#museo">
                  Recorrer el museo
                  <Icon name="arrow" />
                </a>
                <a className="button button-ghost" href="#proyecto">
                  Conocer el proyecto
                </a>
              </div>
            </div>

            <div className="hero-visual" aria-label="Composición de imágenes del proyecto">
              <div className="hero-orbit hero-orbit-one" />
              <div className="hero-orbit hero-orbit-two" />
              <ImagePlaceholder className="hero-image-main" label="Fotografía principal del proyecto" />
              <ImagePlaceholder className="hero-image-small" label="Detalle de objeto histórico" />
              <div className="hero-stamp">
                <Icon name="spark" />
                <span>Memoria<br />que vive</span>
              </div>
              <span className="hero-caption">Archivo visual · Colegio Tom Adams IED</span>
            </div>
          </div>
          <div className="hero-foot">
            <span>Historias</span><i />
            <span>Patrimonio</span><i />
            <span>Comunidad</span><i />
            <span>Futuro</span>
          </div>
        </section>

        <nav className="section-directory" aria-label="Todas las secciones del portal">
          {[
            ["#inicio", "Inicio"],
            ["#proyecto", "Qué es Restauradores"],
            ["#museo", "Museo Escolar"],
            ["#salidas", "Salidas pedagógicas"],
            ["#fechas", "Fechas conmemorativas"],
            ["#visitas", "Visitas y eventos"],
            ["#reconocimientos", "Reconocimientos"],
            ["#alianzas", "Alianzas"],
            ["#galeria", "Galería multimedia"],
            ["#contacto", "Contacto"],
          ].map(([href, label], index) => (
            <a href={href} key={href}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </a>
          ))}
        </nav>

        <section className="project section" id="proyecto">
          <div className="container">
            <div className="project-intro">
              <SectionHeading
                eyebrow="01 · Nuestro propósito"
                title="¿Qué es Restauradores de la Memoria?"
              />
              <div className="project-lead">
                <p>
                  Restauradores de la Memoria es una iniciativa del Colegio Tom Adams IED que conecta a estudiantes,
                  docentes y comunidad alrededor del cuidado del patrimonio y la construcción colectiva de memoria.
                </p>
                <p className="content-note">Contenido introductorio de muestra · Reemplazar con el documento institucional.</p>
              </div>
            </div>

            <div className="project-grid">
              <ImagePlaceholder className="project-image" label="Equipo de estudiantes y docentes" number="01" />
              <article className="value-card value-card-dark">
                <span className="value-icon"><Icon name="spark" /></span>
                <p className="value-number">01</p>
                <h3>Nuestra misión</h3>
                <p>[Agregar misión oficial del proyecto y su impacto en la comunidad educativa.]</p>
              </article>
              <article className="value-card value-card-coral">
                <span className="value-icon"><Icon name="users" /></span>
                <p className="value-number">02</p>
                <h3>Una visión compartida</h3>
                <p>[Agregar visión oficial, alcance futuro y objetivos de apropiación social.]</p>
              </article>
              <article className="value-card value-card-paper">
                <p className="value-number">03</p>
                <h3>Trayectoria</h3>
                <div className="timeline">
                  <span><b>[Año]</b> Nace el proyecto</span>
                  <span><b>[Año]</b> Primer museo escolar</span>
                  <span><b>[Año]</b> Experiencia virtual</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="museum section" id="museo">
          <div className="museum-glow" />
          <div className="container">
            <div className="museum-heading">
              <SectionHeading
                eyebrow="02 · Museo Escolar de la Memoria"
                title="Un museo sin paredes."
                intro="Recorre nuestro archivo desde cualquier lugar. Cada objeto guarda una historia; cada historia abre una conversación."
                light
              />
              <div className="museum-instructions">
                <span><b>01</b> Haz clic para entrar</span>
                <span><b>02</b> Usa W A S D para moverte</span>
                <span><b>03</b> Explora cada objeto</span>
              </div>
            </div>

            <div className="immersive-museum">
              <div className="immersive-toolbar">
                <div>
                  <span className="live-dot" />
                  <span>RECORRIDO VIRTUAL · DELIGHTEX</span>
                </div>
                <a href="https://edu.delightex.com/SRH-SUX" target="_blank" rel="noreferrer">
                  Abrir en pantalla completa <Icon name="arrow" size={16} />
                </a>
              </div>
              <iframe
                src="https://edu.delightex.com/SRH-SUX"
                title="Museo Virtual de Restauradores de la Memoria"
                loading="lazy"
                allow="fullscreen; autoplay; accelerometer; gyroscope; xr-spatial-tracking"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <div className="immersive-fallback">
                <Icon name="cube" />
                <p>
                  Si el recorrido no carga dentro de la página, puedes
                  <a href="https://edu.delightex.com/SRH-SUX" target="_blank" rel="noreferrer"> abrirlo directamente aquí.</a>
                </p>
              </div>
            </div>

            <div className="aframe-lab">
              <div className="aframe-lab-heading">
                <div>
                  <Eyebrow light>Taller técnico · A‑Frame + Luma AI</Eyebrow>
                  <h3>Laboratorio de objetos digitales</h3>
                  <p>Una escena independiente para probar los modelos fotogramétricos antes de incorporarlos al recorrido completo.</p>
                </div>
                <div className="aframe-lab-badges">
                  <span className="aframe-version">A‑FRAME 1.4 · WEBXR</span>
                  <span className={`database-badge database-${databaseStatus}`}>
                    <i />
                    {databaseStatus === "connected" ? "SUPABASE CONECTADO" : databaseStatus === "loading" ? "CONECTANDO DATOS" : "MODO LOCAL"}
                  </span>
                </div>
              </div>

              <div className="aframe-lab-grid">
                <div className="aframe-preview">
                  <iframe
                    key={activeAframeObject}
                    srcDoc={aframePreview}
                    title={`Vista A-Frame del objeto ${activeAframeObject + 1}`}
                    loading="lazy"
                    sandbox="allow-scripts"
                    allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
                  />
                  <span className="aframe-preview-status"><i /> ESCENA A‑FRAME ACTIVA</span>
                </div>

                <div className="aframe-object-panel">
                  <div className="aframe-tabs" role="tablist" aria-label="Objetos digitales">
                    {catalogObjects.map((object, index) => (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeAframeObject === index}
                        className={activeAframeObject === index ? "aframe-tab-active" : ""}
                        onClick={() => setActiveAframeObject(index)}
                        key={object.file}
                      >
                        0{index + 1}
                        <span>Objeto digital</span>
                      </button>
                    ))}
                  </div>
                  <div className="aframe-object-info">
                    <p>MODELO FOTOGRAMÉTRICO · GLB</p>
                    <h4>{catalogObjects[activeAframeObject]?.name}</h4>
                    <span>{catalogObjects[activeAframeObject]?.description}</span>
                    <dl>
                      <div><dt>Archivo</dt><dd>{catalogObjects[activeAframeObject]?.file}</dd></div>
                      <div><dt>Créditos</dt><dd>{catalogObjects[activeAframeObject]?.credits}</dd></div>
                    </dl>
                  </div>
                  <div className="aframe-steps">
                    <strong>Cómo añadir el modelo real</strong>
                    <ol>
                      <li>Exporta el objeto desde Luma AI en formato <b>.glb</b>.</li>
                      <li>Guárdalo en <b>public/models</b> o en Supabase Storage.</li>
                      <li>Reemplaza la ruta temporal y activa <b>a-gltf-model</b>.</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="aframe-project-slot">
                <div className="aframe-project-icon"><Icon name="cube" size={32} /></div>
                <div>
                  <p>ESPACIO RESERVADO · PROYECTO A‑PLACE / A‑FRAME</p>
                  <h4>Escena completa del Museo Escolar</h4>
                  <span>Reemplaza el archivo de plantilla ubicado en <b>public/aframe/index.html</b> por la escena final del equipo. La ruta queda separada para evitar conflictos con React y facilitar su publicación en GitHub.</span>
                </div>
                <a href="/aframe/index.html" target="_blank" rel="noreferrer">
                  Abrir plantilla <Icon name="arrow" size={17} />
                </a>
              </div>
            </div>

            <div className="objects-heading">
              <div>
                <Eyebrow light>Colección digital</Eyebrow>
                <h3>Objetos con memoria</h3>
              </div>
              <p>Modelos propios creados con fotogrametría. Completa cada ficha con información, imágenes y créditos.</p>
            </div>

            <div className="objects-grid">
              {catalogObjects.map((object, index) => (
                <article className="object-card" key={`${object.file}-${index}`}>
                  <div className="object-visual">
                    <span className="object-index">0{index + 1}</span>
                    <Icon name="cube" size={56} />
                    <span>Modelo 3D del objeto {index + 1}</span>
                    <small>{object.file}</small>
                  </div>
                  <div className="object-copy">
                    <p className="object-type">Colección · {object.category}</p>
                    <h4>{object.name}</h4>
                    <p>{object.description}</p>
                    <div className="object-thumbs">
                      <ImagePlaceholder label="Foto 1" />
                      <ImagePlaceholder label="Foto 2" />
                      <ImagePlaceholder label="Foto 3" />
                    </div>
                    <p className="credits">Créditos · {object.credits}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="voices section" id="voces">
          <div className="container">
            <div className="voices-heading">
              <SectionHeading
                eyebrow="03 · Archivo oral"
                title="Voces que también son memoria."
                intro="Las entrevistas conservan recuerdos que no aparecen en los libros. Aquí reunimos las voces de estudiantes, docentes, familias y habitantes de la comunidad."
              />
              <div className="voices-database-note">
                <Icon name="mic" />
                <span>
                  <strong>Archivo conectado</strong>
                  Cada audio podrá guardar transcripción, fecha, tema, créditos y autorización.
                </span>
              </div>
            </div>

            <div className="interview-carousel">
              <button
                className="carousel-arrow carousel-arrow-left"
                type="button"
                aria-label="Ver entrevista anterior"
                onClick={() => changeInterview(-1)}
              >
                <Icon name="arrow" />
              </button>
              <div className="featured-interview" aria-live="polite">
              <ImagePlaceholder label={interviews[activeInterview].image} />
              <div className="featured-interview-copy">
                <p className="interview-type">Entrevista {activeInterview + 1} de {interviews.length} · {interviews[activeInterview].topic}</p>
                <h3>{interviews[activeInterview].quote}</h3>
                <p><strong>{interviews[activeInterview].person}</strong> · {interviews[activeInterview].meta}</p>
                <div className="audio-player">
                  <button
                    type="button"
                    aria-label={playingInterview === activeInterview ? `Pausar entrevista ${activeInterview + 1}` : `Reproducir entrevista ${activeInterview + 1}`}
                    onClick={() => setPlayingInterview(playingInterview === activeInterview ? null : activeInterview)}
                  >
                    <Icon name={playingInterview === activeInterview ? "pause" : "play"} />
                  </button>
                  <div className={`audio-track ${playingInterview === activeInterview ? "audio-track-active" : ""}`}>
                    {Array.from({ length: 34 }, (_, index) => <i key={index} />)}
                  </div>
                  <span>00:00 / {interviews[activeInterview].duration}</span>
                </div>
                <details>
                  <summary>Leer transcripción accesible</summary>
                  <p>[Inserta aquí la transcripción completa de la entrevista {activeInterview + 1}. Puedes dividirla por intervenciones e incluir marcas de tiempo.]</p>
                </details>
              </div>
              </div>
              <button
                className="carousel-arrow carousel-arrow-right"
                type="button"
                aria-label="Ver entrevista siguiente"
                onClick={() => changeInterview(1)}
              >
                <Icon name="arrow" />
              </button>
            </div>
            <div className="carousel-pagination" aria-label="Seleccionar entrevista">
              {interviews.map((interview, index) => (
                <button
                  className={activeInterview === index ? "carousel-dot-active" : ""}
                  type="button"
                  key={interview.person}
                  aria-label={`Mostrar entrevista ${index + 1}`}
                  aria-current={activeInterview === index ? "true" : undefined}
                  onClick={() => {
                    setActiveInterview(index);
                    setPlayingInterview(null);
                  }}
                >
                  <span>0{index + 1}</span>
                  <i />
                </button>
              ))}
            </div>

            <div className="voices-consent">
              <strong>Publicación responsable</strong>
              <p>Antes de publicar cada entrevista, registra la autorización de uso, define si se mostrará el nombre real o un seudónimo y evita exponer datos sensibles, especialmente de menores de edad.</p>
            </div>
          </div>
        </section>

        <section className="experiences section" id="salidas">
          <div className="container">
            <div className="experiences-heading">
              <SectionHeading
                eyebrow="04 · Aprender recorriendo"
                title="Salidas pedagógicas: la memoria también se camina."
                intro="Encuentros con lugares, archivos y personas que transforman la historia en una experiencia cercana."
              />
              <ArrowLink href="#galeria">Ver toda la galería</ArrowLink>
            </div>

            <div className="trip-grid">
              {[1, 2, 3].map((item) => (
                <article className={`trip-card trip-${item}`} key={item}>
                  <ImagePlaceholder label={`Fotografía de salida pedagógica ${item}`} number={`0${item}`} />
                  <div className="trip-copy">
                    <p>[Lugar de la visita]</p>
                    <h3>[Nombre de la salida pedagógica]</h3>
                    <span><Icon name="calendar" size={16} /> [Fecha] · [Curso participante]</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="commemorations" id="fechas">
          <div className="container commemorations-grid">
            <div className="commemorations-title">
              <Eyebrow>05 · Fechas conmemorativas</Eyebrow>
              <h2>Recordar<br />nos reúne.</h2>
              <p>[Explica por qué estas fechas son importantes para el proyecto y la comunidad.]</p>
            </div>
            <div className="dates-list">
              {[
                ["09", "ABR", "[Día Nacional de la Memoria]", "[Actividad o conmemoración realizada en el colegio]"],
                ["30", "AGO", "[Conmemoración destacada]", "[Actividad o conmemoración realizada en el colegio]"],
                ["10", "DIC", "[Día de los Derechos Humanos]", "[Actividad o conmemoración realizada en el colegio]"],
              ].map(([day, month, title, copy]) => (
                <article className="date-row" key={day + month}>
                  <div className="date"><strong>{day}</strong><span>{month}</span></div>
                  <div><h3>{title}</h3><p>{copy}</p></div>
                  <span className="date-arrow"><Icon name="arrow" /></span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="visits-archive section" id="visitas">
          <div className="container">
            <div className="visits-heading">
              <SectionHeading
                eyebrow="06 · Visitas y eventos"
                title="Encuentros que dejan memoria."
                intro="Un registro visual de los colegios, grupos y comunidades que han recorrido el museo y participado en nuestras actividades."
              />
              <p className="placeholder-notice">Reemplaza cada espacio con las fotografías reales y agrega una descripción corta cuando sea necesario.</p>
            </div>

            <div className="visit-stories">
              {[
                ["Visita destacada de institución educativa", "[Nombre del colegio visitante]", "[Fecha] · Visita guiada", "Grupo de estudiantes recorriendo la exposición y dialogando con el equipo del proyecto."],
                ["Registro fotográfico del evento", "[Nombre del evento]", "[Fecha] · Colegio Tom Adams IED", "Actividad de encuentro, aprendizaje y construcción colectiva de memoria."],
                ["Grupo participante", "[Nombre del colegio o grupo]", "[Fecha] · Recorrido escolar", ""],
                ["Momento de la actividad", "[Nombre de la actividad]", "[Fecha] · Taller", ""],
                ["Cierre del encuentro", "[Nombre de la visita]", "[Fecha] · Comunidad educativa", "Un espacio para compartir preguntas, relatos y nuevas formas de comprender nuestro pasado."],
              ].map(([image, title, meta, description], index) => (
                <article className={`visit-story-card visit-story-${index + 1}`} key={title + index}>
                  <ImagePlaceholder label={image} number={`0${index + 1}`} />
                  <div className="visit-story-copy">
                    <p>{meta}</p>
                    <h3>{title}</h3>
                    {description && <span>{description}</span>}
                  </div>
                </article>
              ))}
            </div>

            <div className="visit-archive-note">
              <Icon name="camera" />
              <div>
                <strong>Archivo de visitas y eventos</strong>
                <p>Esta sección puede obtener automáticamente imágenes, fechas, instituciones y descripciones desde las tablas Eventos, Actividades y Evidencias.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="recognition section" id="reconocimientos">
          <div className="container">
            <div className="recognition-grid">
              <div className="recognition-visual">
                <ImagePlaceholder label="Fotografía de reconocimiento o premiación" />
                <div className="recognition-seal"><Icon name="trophy" size={32} /><span>Logros que<br />nos inspiran</span></div>
              </div>
              <div className="recognition-copy">
                <SectionHeading eyebrow="07 · Reconocimientos" title="Una labor que deja huella." />
                <blockquote>
                  <Icon name="quote" size={28} />
                  “[Incluir aquí una frase, mención o testimonio que resuma el impacto del proyecto.]”
                </blockquote>
                <div className="awards">
                  {[
                    ["[Año]", "[Nombre del reconocimiento]", "[Entidad que lo otorga]"],
                    ["[Año]", "[Mención o participación destacada]", "[Entidad que lo otorga]"],
                  ].map(([year, title, entity]) => (
                    <div className="award-row" key={title}>
                      <span>{year}</span><div><strong>{title}</strong><small>{entity}</small></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="recognition-cards">
              {[1, 2, 3].map((item) => (
                <article key={item}>
                  <ImagePlaceholder label={`Diploma, premio o registro del reconocimiento ${item}`} number={`0${item}`} />
                  <p>[Entidad que reconoce] · [Año]</p>
                  <h3>[Nombre del reconocimiento o logro obtenido]</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="partners section" id="alianzas">
          <div className="container">
            <SectionHeading
              eyebrow="08 · Alianzas institucionales"
              title="La memoria se construye en compañía."
              intro="Organizaciones que respaldan el aprendizaje, la cultura y la preservación de nuestro patrimonio."
            />
            <div className="partner-grid">
              {[1, 2, 3, 4].map((item) => (
                <div className="partner-placeholder" key={item}>
                  <span>LOGO</span>
                  <strong>[Aliado institucional {item}]</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="gallery section" id="galeria">
          <div className="container">
            <div className="gallery-heading">
              <SectionHeading eyebrow="09 · Archivo vivo" title="Galería multimedia" />
              <p>Imágenes, voces y momentos que cuentan nuestro proceso.</p>
            </div>
            <div className="gallery-grid">
              <ImagePlaceholder className="gallery-tall" label="Fotografía destacada" number="01" />
              <ImagePlaceholder label="Fotografía de actividad" number="02" />
              <ImagePlaceholder label="Registro del museo" number="03" />
              <div className="media-placeholder video-placeholder">
                <span className="play"><Icon name="arrow" /></span>
                <div><small>VIDEO</small><strong>[Título del registro audiovisual]</strong></div>
              </div>
              <div className="media-placeholder audio-placeholder">
                <div className="waveform">{Array.from({ length: 22 }, (_, i) => <i key={i} />)}</div>
                <div><small>AUDIO</small><strong>[Testimonio de la comunidad]</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="team section" id="equipo">
          <div className="container">
            <div className="team-heading">
              <SectionHeading
                eyebrow="10 · Equipo RECO"
                title="El equipo detrás de la experiencia."
                intro="RECO reúne gestión, diseño, creación multimedia y desarrollo web para convertir la memoria en una experiencia viva."
              />
              <span className="team-monogram">RECO<br /><small>EQUIPO</small></span>
            </div>
            <div className="reco-meaning">
              <span className="reco-name">R.E.C.O.</span>
              <p>
                <strong>R</strong>estauradores de <strong>E</strong>xperiencias, <strong>C</strong>omunidades y <strong>O</strong>rígenes
              </p>
              <small>RECO nace de “reconocimiento”: reconocer las historias, las personas y los orígenes que construyen nuestra memoria.</small>
            </div>
            <div className="team-grid">
              <article className="team-card team-card-lead">
                <div className="team-card-top">
                  <span>01</span>
                  <ImagePlaceholder label="Retrato de Joshua Walteros" />
                </div>
                <p className="team-role">Líder de proyecto</p>
                <h3>Joshua Walteros</h3>
                <p>Coordina el trabajo del equipo y consolida la propuesta para que cada entrega responda a los requisitos del proyecto Restauradores de la Memoria.</p>
                <div className="team-contributions">
                  <strong>Responsabilidades y aportes</strong>
                  <ul>
                    <li>Organizar el cronograma, las etapas de trabajo y las fechas de entrega.</li>
                    <li>Distribuir responsabilidades y hacer seguimiento al avance de cada integrante.</li>
                    <li>Consolidar la documentación técnica, académica y de presentación.</li>
                    <li>Verificar que el portal, la base de datos y el museo virtual mantengan una misma visión.</li>
                    <li>Coordinar las revisiones y asegurar el cumplimiento de los plazos.</li>
                  </ul>
                </div>
                <div className="team-skills"><span>Gestión</span><span>Cronograma</span><span>Documentación</span></div>
              </article>

              <article className="team-card team-card-design">
                <div className="team-card-top">
                  <span>02</span>
                  <ImagePlaceholder label="Retrato de Ontibon Reyes" />
                </div>
                <p className="team-role">Diseñador UX/UI y creador multimedia</p>
                <h3>Ontibon Reyes</h3>
                <p>Define cómo se ve, se organiza y se recorre la experiencia, tanto en el portal web como dentro del Museo Escolar de la Memoria.</p>
                <div className="team-contributions">
                  <strong>Responsabilidades y aportes</strong>
                  <ul>
                    <li>Diseñar la arquitectura de información y la navegación de todas las secciones.</li>
                    <li>Crear la guía de estilo visual: colores, tipografías, jerarquías y componentes.</li>
                    <li>Prototipar la experiencia para móviles, tabletas y computadores.</li>
                    <li>Preparar fotografías, entrevistas, audios, videos y demás material multimedia.</li>
                    <li>Diseñar la experiencia inmersiva y desarrollar la escena interactiva en A‑Frame.</li>
                    <li>Preparar e integrar las piezas 3D del museo y sus fichas visuales.</li>
                  </ul>
                </div>
                <div className="team-skills"><span>UX/UI</span><span>Multimedia</span><span>A‑Frame</span><span>3D</span></div>
              </article>

              <article className="team-card team-card-code">
                <div className="team-card-top">
                  <span>03</span>
                  <ImagePlaceholder label="Retrato de Martin Palomares" />
                </div>
                <p className="team-role">Desarrollador Front-End Lead</p>
                <h3>Martin Palomares</h3>
                <p>Convierte los diseños y prototipos en un sitio funcional, fluido y adaptable, conectando la interfaz con las experiencias interactivas.</p>
                <div className="team-contributions">
                  <strong>Responsabilidades y aportes</strong>
                  <ul>
                    <li>Maquetar la estructura responsive del portal con HTML5 y CSS3.</li>
                    <li>Programar la lógica y las interacciones necesarias con JavaScript.</li>
                    <li>Desarrollar filtros, ventanas modales y validaciones de formularios.</li>
                    <li>Integrar técnicamente el visor 3D y la escena del museo en A‑Frame.</li>
                    <li>Conectar los objetos digitales, contenidos y controles de navegación.</li>
                    <li>Optimizar velocidad de carga, accesibilidad y funcionamiento en distintos dispositivos.</li>
                  </ul>
                </div>
                <div className="team-skills"><span>Front-End</span><span>JavaScript</span><span>Responsive</span><span>Accesibilidad</span></div>
              </article>
            </div>
            <div className="credits-note">
              <span>Créditos de contenido</span>
              <p>Los modelos 3D, fotografías, entrevistas, audios y documentos deberán acreditar individualmente a sus autores, estudiantes responsables, docentes, institución, herramienta utilizada y fecha de creación.</p>
            </div>
          </div>
        </section>

        <section className="contact section" id="contacto">
          <div className="container contact-grid">
            <div className="contact-copy">
              <Eyebrow light>11 · Contacto</Eyebrow>
              <h2>Sigamos construyendo memoria.</h2>
              <p>
                ¿Quieres visitar el museo, compartir una historia o conocer más del proyecto? Escríbenos.
              </p>
              <div className="contact-details">
                <span><Icon name="location" /><b>[Dirección del Colegio Tom Adams IED]</b></span>
                <span><Icon name="mail" /><b>[Correo institucional]</b></span>
              </div>
              <div className="data-note">
                <Icon name="cube" />
                <p>
                  <strong>
                    {databaseStatus === "connected" ? "Base de datos conectada" : databaseStatus === "loading" ? "Conectando con la base de datos" : "Contenido local disponible"}
                  </strong>
                  Visitantes · Eventos · Actividades · Objetos · Exposiciones · Evidencias · Aliados · Reconocimientos
                </p>
              </div>
            </div>
            <form className="contact-form" onSubmit={submitPlaceholder}>
              <div className="form-heading">
                <span>Formulario de contacto</span>
                <small>Todos los campos son obligatorios</small>
              </div>
              <label>
                <span>Nombre completo</span>
                <input name="nombre" type="text" placeholder="Escribe tu nombre" required />
              </label>
              <label>
                <span>Correo electrónico</span>
                <input name="correo" type="email" placeholder="nombre@correo.com" required />
              </label>
              <label>
                <span>Motivo de contacto</span>
                <select name="motivo" defaultValue="" required>
                  <option value="" disabled>Selecciona una opción</option>
                  <option>Agendar una visita</option>
                  <option>Compartir una historia</option>
                  <option>Alianza institucional</option>
                </select>
              </label>
              <label>
                <span>Mensaje</span>
                <textarea name="mensaje" placeholder="Cuéntanos cómo podemos ayudarte" rows={4} required />
              </label>
              <button className="button button-coral" type="submit">
                Enviar mensaje <Icon name="arrow" />
              </button>
              {formSent && (
                <p className="form-message" role="status">
                  Vista previa completada. Conecta este formulario a tu base de datos para guardar el mensaje.
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner">
          <Brand />
          <p>Un proyecto del Colegio Tom Adams IED<br />Bogotá, Colombia · [Año]</p>
          <div className="footer-links">
            <a href="#proyecto">Proyecto</a>
            <a href="#museo">Museo virtual</a>
            <a href="#galeria">Galería</a>
            <a href="#equipo">Créditos</a>
            <a href="#inicio">Volver arriba ↑</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© [Año] Restauradores de la Memoria</span>
          <span>Equipo RECO · Joshua Walteros · Ontibon Reyes · Martin Palomares</span>
        </div>
      </footer>
    </>
  );
}

export default App;
