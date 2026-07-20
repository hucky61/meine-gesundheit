# HealthSync - Gesundheits-App

Eine moderne, responsive Webanwendung zur Erfassung, Visualisierung und Auswertung persönlicher Gesundheitsdaten wie **Blutdruck**, **Puls** und **Körpergewicht**.

---

## ✨ Features

- 🩸 **Blutdruck- & Pulstracking**:
  - Erfassung von systolischem und diastolischem Blutdruckwert sowie dem Ruhepuls.
  - Automatische medizinische Einordnung nach ESC/AHA-Richtlinien (Optimal, Erhöht, Hypertonie Grad 1, Hypertonie Grad 2, Krise/Gefahr).
  
- ⚖️ **Gewicht & BMI-Analyse**:
  - Erfassung des Körpergewichts mit automatischer **Body Mass Index (BMI)**-Berechnung und Gewichtsklassifikation.
  - Gewichtsverlaufstrend über wählbare Zeiträume (7 Tage, 30 Tage, 90 Tage oder Gesamtzustand).

- 📊 **Interaktive Diagramme**:
  - Visualisierung von Blutdruck, Puls und Gewichtsverlauf mittels [Chart.js](https://www.chartjs.org/).

- 📋 **Messwert-Verlauf & Suche**:
  - Tabellarische Übersicht aller historischen Einträge.
  - Volltextsuche in Notizen und schnelle Filterfunktionen.
  - Nachträgliches Bearbeiten und Löschen von Datensätzen.

- 🔒 **Datenschutz & Backup**:
  - 100 % clientseitig: Alle Daten verbleiben lokal in deinem Browser (`localStorage`).
  - **CSV-Export & Import** für die Auswertung in Tabellenkalkulationen (z. B. Excel).
  - **JSON-Backup** zur vollständigen Sicherung und Wiederherstellung.

- 🌙 **Design & UI**:
  - Glassmorphic UI im modernen Dark Mode mit integriertem Light-Mode-Umschalter.
  - Toast-Benachrichtigungen für direkte Rückmeldungen.

---

## 🛠️ Technologie-Stack

- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vite.dev/)
- **Diagramme**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS3 (Custom Properties, Flexbox & CSS Grid)

---

## 🚀 Erste Schritte

### Voraussetzungen

Stelle sicher, dass **Node.js** (mindestens v18+) auf deinem System installiert ist.

### Installation

1. Repository klonen oder herunterladen:
   ```bash
   git clone <repository-url>
   cd gesundheit
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

### Entwicklungsserver starten

Starte den lokalen Vite-Entwicklungsserver mit Hot Reload:

```bash
npm run dev
```

Die Anwendung ist anschließend unter `http://localhost:5173` im Browser erreichbar.

---

## 📦 Skripte

| Befehl | Beschreibung |
| :--- | :--- |
| `npm run dev` | Startet den Entwicklungsserver |
| `npm run build` | Erstellt das optimierte Produktions-Bundle in `dist/` |
| `npm run preview` | Voransicht des Produktions-Bundles lokal |

---

## 📄 Lizenz

Private & persönliche Nutzung.
