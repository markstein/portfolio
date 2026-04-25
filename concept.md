# Konzept: Dynamisches Entwickler-Portfolio (Mark Stein)

Dieses Dokument beschreibt die Architektur und die Kern-Features des Developer-Portfolios.

## 1. Vision & Single Source of Truth
Die gesamte Applikation ist datengetrieben. Die Datei `public/cv.json` dient als **Single Source of Truth**. Alle Inhalte (Personendaten, Projekte, Skills, Biographie) werden zur Laufzeit geladen und gerendert.

## 2. Technische Basis
- **Framework:** Vite (Vanilla JS / HTML5 / CSS3)
- **Deployment:** GitHub Actions CI/CD auf GitHub Pages
- **Sprache:** Deutsch

## 3. Kern-Features

### 3.1 Dynamisches Theming-System
Die Seite verfügt über vier verschiedene Design-Profile, die über CSS-Variablen gesteuert werden:
- **Default:** Modernes Dark-Mode Design mit Indigo-Akzenten.
- **Business:** Clean, hell und professionell (Serifenlose Schrift, Blau-Töne).
- **Minimalist:** Reduziert auf das Wesentliche (Schwarz/Weiß, viel Whitespace).
- **Nerd:** Terminal-Style (Monospace-Schrift, grüne Akzente, eckige Formen).
- **Robot:** Metallisch, eisig und futuristisch (Cyan-Glow, scharfe Kanten, technischer Look).
- **Kandinsky:** Abstrakt und künstlerisch (Geometrische Formen, Primärfarben, asymmetrische Layouts).

**Steuerung:**
- Aktivierung über URL-Anker (z.B. `#nerd`).
- **Persistence:** Der gewählte Style wird im `sessionStorage` gespeichert.
- **Cycle-Logik:** Ein Neuladen der Seite innerhalb von 10 Sekunden wechselt zum nächsten Profil in der Reihenfolge.
- **Avatar:** Jedes Theme lädt ein spezifisches Profilbild (`default.png`, `business.png`, etc.).

### 3.2 Interaktives Skill-Management
- **Expertise-Level:** Die Erfahrung wird pro Skill basierend auf der Projektdauer berechnet (Junior, Middle, Expert) und als Kreisdiagramm (Pie-Chart) visualisiert.
- **Filter-Logik:** Durch Klicken auf Skills werden Projekte gefiltert (OR-Logik). Bei Auswahl erscheint ein "Selected Skills"-Bereich mit Statistiken (Anzahl Projekte, Gesamtmonate, letzter Einsatz).
- **Suche:** Ein dezentes Suchfeld ermöglicht das Filtern der Skill-Liste.
  - **Shortcut:** `CMD/Ctrl + K` fokussiert die Suche und scrollt automatisch zum Skill-Bereich.
- **URL-Integration:** Vorauswahl von Skills via Query-Parameter (z.B. `?skills=Angular,TypeScript`). Die URL wird **reaktiv synchronisiert**, d.h. beim Klicken auf Skills wird die URL automatisch aktualisiert (`replaceState`), sodass Filter-Links direkt geteilt werden können.

### 3.3 Projekt-Präsentation
- **Timeline:** Die Projekte werden chronologisch (absteigend) sortiert.
- **Floating Year Indicator:** Beim Scrollen durch die Projekte erscheint am rechten Rand dezent die Jahreszahl des aktuell sichtbaren Projekts.
- **Matching:** Bei aktiven Skill-Filtern werden Projekte nach der Anzahl der Treffer sortiert und passende Tech-Tags hervorgehoben.

### 3.4 Design & UX
- **Performance:** Schnelle Ladezeiten durch Verzicht auf schwere Bibliotheken.
- **Responsivität:** Optimiert für Mobile (angepasste Grids, kompaktere Skill-Tags).
- **Animationen:** Dezente Einblendeffekte und Micro-Interaktionen (Hover-Effekte auf Skill-Tags und Projektkarten).

## 4. Wartung & Erweiterung
Um das Portfolio zu aktualisieren, muss lediglich die `cv.json` angepasst werden. Neue Projekte werden automatisch sortiert und die Skill-Statistiken bei jedem Build/Load neu berechnet.
