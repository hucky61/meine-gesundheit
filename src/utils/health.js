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
