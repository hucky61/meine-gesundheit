// LocalStorage and Import/Export Utilities

const RECS_KEY = 'healthsync_records';
const SETTINGS_KEY = 'healthsync_settings';
const THEME_KEY = 'healthsync_theme';

export function loadRecords() {
    const saved = localStorage.getItem(RECS_KEY);
    if (!saved) return seedDemoData();
    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : seedDemoData();
    } catch (e) {
        console.error('Failed to parse records from localStorage', e);
        return seedDemoData();
    }
}

export function saveRecords(records) {
    localStorage.setItem(RECS_KEY, JSON.stringify(records));
}

export function loadSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return { height: 178 };
    try {
        return JSON.parse(saved);
    } catch (e) {
        return { height: 178 };
    }
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
}

export function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

export function seedDemoData() {
    const today = new Date();
    const demoRecords = [];

    for (let i = 14; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const randomFactor = Math.sin(i * 0.8);
        const randomFactor2 = Math.cos(i * 0.5);

        date.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

        demoRecords.push({
            id: 'demo_' + date.getTime(),
            datetime: date.toISOString().slice(0, 16),
            systolic: Math.round(118 + (randomFactor * 8) + (Math.random() * 4)),
            diastolic: Math.round(76 + (randomFactor2 * 5) + (Math.random() * 3)),
            pulse: Math.round(68 + (randomFactor * 6) + (Math.random() * 5)),
            weight: parseFloat((78.5 + (randomFactor * 0.8) + (Math.random() * 0.3)).toFixed(1)),
            notes: i === 14 ? 'Start der Messungen' : i === 7 ? 'Nach Spaziergang' : ''
        });
    }

    demoRecords.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    saveRecords(demoRecords);
    return demoRecords;
}

export function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

export function generateCSV(records) {
    let csvContent = 'Datum,Systolisch (mmHg),Diastolisch (mmHg),Puls (bpm),Gewicht (kg),Notizen\n';

    records.forEach(r => {
        const sys = r.systolic !== null && r.systolic !== undefined ? r.systolic : '';
        const dia = r.diastolic !== null && r.diastolic !== undefined ? r.diastolic : '';
        const pulse = r.pulse !== null && r.pulse !== undefined ? r.pulse : '';
        const weight = r.weight !== null && r.weight !== undefined ? r.weight : '';
        const notes = r.notes ? `"${r.notes.replace(/"/g, '""')}"` : '';

        csvContent += `${r.datetime},${sys},${dia},${pulse},${weight},${notes}\n`;
    });

    return csvContent;
}

export function parseCSV(csvText, existingRecords) {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return { count: 0, duplicates: 0, newRecords: [] };

    let importedCount = 0;
    let duplicateCount = 0;
    const newRecords = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = parseCSVLine(line);
        if (parts.length < 5) continue;

        const datetime = parts[0];
        const systolic = parseInt(parts[1]) || null;
        const diastolic = parseInt(parts[2]) || null;
        const pulse = parseInt(parts[3]) || null;
        const weight = parseFloat(parts[4]) || null;
        const notes = parts[5] || '';

        if (!datetime) continue;

        const isDuplicate = existingRecords.some(r => r.datetime === datetime) || newRecords.some(r => r.datetime === datetime);
        if (isDuplicate) {
            duplicateCount++;
            continue;
        }

        newRecords.push({
            id: 'rec_' + Date.now() + '_' + i,
            datetime,
            systolic,
            diastolic,
            pulse,
            weight,
            notes
        });
        importedCount++;
    }

    return { count: importedCount, duplicates: duplicateCount, newRecords };
}

function parseCSVLine(line) {
    const result = [];
    let startValueIdx = 0;
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            let val = line.substring(startValueIdx, i).trim();
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1).replace(/""/g, '"');
            }
            result.push(val);
            startValueIdx = i + 1;
        }
    }

    let val = line.substring(startValueIdx).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
    }
    result.push(val);

    return result;
}
