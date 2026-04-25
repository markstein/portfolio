# AI Instructions: cv.json Wartung & Enrichment

Diese Datei dient als Arbeitsanweisung für die KI bei der Bearbeitung der `public/cv.json`. Diese Regeln sollen bei jedem Hinzufügen oder Bearbeiten von Projekten automatisch angewendet werden.

## 1. Automatische Skill-Anreicherung (Enrichment)
Um die Datenqualität konsistent zu halten, sollen folgende Skills automatisch ergänzt werden, sofern die Voraussetzungen erfüllt sind:

- **NgRx:** Wenn `Angular` als Skill gelistet ist und das Projekt-Startdatum `>= 2017` ist.
- **nginx:** Wenn `Docker` als Skill gelistet ist und das Projekt-Startdatum `>= 2013` ist.
- **GitHub Actions:** Wenn das Projekt auf `GitHub` gehostet wird/wurde und das Datum `>= 2019` ist.
- **Storybook:** Wenn es sich um ein Frontend-Projekt (Angular/Vue/React) handelt und UI-Komponenten entwickelt wurden (Zeitraum >= 2018).

## 2. Nomenklatur & Standards
Skill-Namen sollen vereinheitlicht werden, um Dubletten in der Skill-Cloud zu vermeiden:

| Falsch / Varianten | Richtig (Standard) |
| :--- | :--- |
| IntelliJ IDEA, IDEA | **IntelliJ** |
| Visual Studio Code, VSCode | **VS Code** |
| Node, NodeJS | **Node.js** |
| Junit | **JUnit** |
| Typescript | **TypeScript** |
| Nginx | **nginx** |
| Github | **GitHub** |

## 3. Datenformatierung
- **Datumsformate:** Immer `YYYY-MM-DD` verwenden (z.B. `2023-09-01`).
- **Projektsortierung:** In der JSON-Datei sollten Projekte idealerweise chronologisch absteigend (neueste zuerst) gepflegt werden, obwohl das Frontend auch eine eigene Sortierung vornimmt.
- **Beschreibungen:** Professioneller, sachlicher Ton in deutscher Sprache.

## 4. Skill-Level Berechnung (Hintergrundwissen)
Die KI sollte im Hinterkopf behalten, dass das Frontend die Skill-Level (Junior, Middle, Expert) basierend auf der Summe der Projektmonate berechnet:
- `<= 6 Monate`: Junior
- `> 6 bis 24 Monate`: Middle
- `> 24 Monate`: Expert

Beim Hinzufügen von Skills sollte darauf geachtet werden, dass die Gesamtmonate die tatsächliche Erfahrung widerspiegeln.

## Weiteres 

- Bei neue Features bzw. Anpassung stets auch concept.md ergänzen.
