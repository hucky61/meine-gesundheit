// Health classification and calculation utilities

export function getBPClassification(systolic, diastolic) {
    if (!systolic || !diastolic) return { label: 'Unbekannt', class: '' };

    if (systolic > 180 || diastolic > 120) {
        return { label: 'Krise / Notfall', class: 'status-crisis' };
    }
    if (systolic >= 140 || diastolic >= 90) {
        return { label: 'Hypertonie Grad 2', class: 'status-stage2' };
    }
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
        return { label: 'Hypertonie Grad 1', class: 'status-stage1' };
    }
    if ((systolic >= 120 && systolic <= 129) && diastolic < 80) {
        return { label: 'Erhöhter Blutdruck', class: 'status-elevated' };
    }
    if (systolic < 120 && diastolic < 80) {
        return { label: 'Optimal', class: 'status-normal' };
    }

    return { label: 'Hypertonie Grad 1', class: 'status-stage1' };
}

export function getBMIClassification(bmi) {
    if (!bmi) return { label: '--', class: '' };

    if (bmi < 18.5) return { label: 'Untergewicht', class: 'status-elevated' };
    if (bmi >= 18.5 && bmi < 25) return { label: 'Normalgewicht', class: 'status-normal' };
    if (bmi >= 25 && bmi < 30) return { label: 'Übergewicht', class: 'status-elevated' };
    return { label: 'Adipositas', class: 'status-stage2' };
}

export function calculateBMI(weight, heightCm) {
    if (!weight || !heightCm) return null;
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

export function formatDate(isoString) {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--';
    return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatShortDate(isoString) {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--';
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function filterRecordsByRange(records, rangeDays) {
    if (rangeDays === 'all') return [...records].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(rangeDays));

    return records
        .filter(r => new Date(r.datetime) >= cutoffDate)
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime)); // Oldest first for charts
}

export function calculatePulsdruck(systolic, diastolic) {
    if (!systolic || !diastolic) return null;
    return systolic - diastolic;
}

export function calculateMAP(systolic, diastolic) {
    if (!systolic || !diastolic) return null;
    return parseFloat((diastolic + (systolic - diastolic) / 3).toFixed(1));
}

export function getMorningEveningStats(records) {
    const morningRecords = [];
    const eveningRecords = [];

    records.forEach(r => {
        if (!r.datetime) return;
        const date = new Date(r.datetime);
        const hour = date.getHours();

        if (hour >= 4 && hour < 12) {
            morningRecords.push(r);
        } else if (hour >= 17 && hour <= 23) {
            eveningRecords.push(r);
        }
    });

    const getAverages = (recs) => {
        const bpRecs = recs.filter(r => r.systolic !== null && r.diastolic !== null);
        const pulseRecs = recs.filter(r => r.pulse !== null);

        const avgSys = bpRecs.length > 0 ? Math.round(bpRecs.reduce((sum, r) => sum + r.systolic, 0) / bpRecs.length) : null;
        const avgDia = bpRecs.length > 0 ? Math.round(bpRecs.reduce((sum, r) => sum + r.diastolic, 0) / bpRecs.length) : null;
        const avgPulse = pulseRecs.length > 0 ? Math.round(pulseRecs.reduce((sum, r) => sum + r.pulse, 0) / pulseRecs.length) : null;

        return {
            avgSys,
            avgDia,
            avgPulse,
            bpCount: bpRecs.length,
            pulseCount: pulseRecs.length
        };
    };

    return {
        morning: getAverages(morningRecords),
        evening: getAverages(eveningRecords)
    };
}

export function generateEmailReport(records, settings) {
    if (!records || records.length === 0) {
        return {
            subject: 'HealthSync Arztbericht',
            body: 'Keine Messdaten vorhanden.'
        };
    }

    const nameStr = settings?.name ? ` für ${settings.name}` : '';
    const subject = `HealthSync Arztbericht${nameStr} (${new Date().toLocaleDateString('de-DE')})`;

    // Latest individual records
    const latestBP = records.find(r => r.systolic !== null && r.diastolic !== null);
    const latestPulse = records.find(r => r.pulse !== null);
    const latestWeight = records.find(r => r.weight !== null);

    const bpClass = latestBP ? getBPClassification(latestBP.systolic, latestBP.diastolic) : null;
    const bmiVal = latestWeight && settings?.height ? calculateBMI(latestWeight.weight, settings.height) : null;
    const bmiClass = bmiVal ? getBMIClassification(bmiVal) : null;

    // Averages (overall and morning/evening)
    const bpRecs = records.filter(r => r.systolic !== null && r.diastolic !== null);
    const avgSys = bpRecs.length > 0 ? Math.round(bpRecs.reduce((sum, r) => sum + r.systolic, 0) / bpRecs.length) : null;
    const avgDia = bpRecs.length > 0 ? Math.round(bpRecs.reduce((sum, r) => sum + r.diastolic, 0) / bpRecs.length) : null;

    const meStats = getMorningEveningStats(records);

    let body = `Hallo,\n\nanbei sende ich meine aktuellen Gesundheitsdaten aus der HealthSync App:\n\n`;

    if (settings?.name) {
        body += `Patient: ${settings.name}\n`;
    }
    if (settings?.height) {
        body += `Körpergröße: ${settings.height} cm\n`;
    }
    body += `Erstellt am: ${new Date().toLocaleDateString('de-DE')}\n\n`;

    body += `--- LETZTE MESSWERTE ---\n`;
    if (latestBP) {
        body += `• Blutdruck: ${latestBP.systolic}/${latestBP.diastolic} mmHg (${bpClass ? bpClass.label : ''})\n`;
    }
    if (latestPulse) {
        body += `• Puls: ${latestPulse.pulse} bpm\n`;
    }
    if (latestWeight) {
        body += `• Gewicht: ${latestWeight.weight.toFixed(1)} kg${bmiVal ? ` (BMI: ${bmiVal} - ${bmiClass.label})` : ''}\n`;
    }
    body += `\n`;

    body += `--- DURCHSCHNITTSWERTE (Ø) ---\n`;
    if (avgSys && avgDia) {
        body += `• Blutdruck gesamt: ${avgSys}/${avgDia} mmHg (${bpRecs.length} Messungen)\n`;
    }
    if (meStats.morning.avgSys) {
        body += `• Ø Morgens (04-12 Uhr): ${meStats.morning.avgSys}/${meStats.morning.avgDia} mmHg (Puls: ${meStats.morning.avgPulse || '--'} bpm)\n`;
    }
    if (meStats.evening.avgSys) {
        body += `• Ø Abends (17-24 Uhr): ${meStats.evening.avgSys}/${meStats.evening.avgDia} mmHg (Puls: ${meStats.evening.avgPulse || '--'} bpm)\n`;
    }
    body += `\n`;

    body += `Hinweis: Der vollständige PDF-Bericht (mit Diagrammen und Detailtabelle) kann bei Bedarf als Anhang beigefügt werden.\n\n`;
    body += `Viele Grüße,\n${settings?.name || ''}`;

    return { subject, body };
}


