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

