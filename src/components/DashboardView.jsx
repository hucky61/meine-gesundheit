import React, { useState } from 'react';
import {
    Heart,
    HeartPulse,
    Scale,
    TrendingUp,
    Clock,
    Activity,
    Info,
    Inbox
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
    getBPClassification,
    getBMIClassification,
    calculateBMI,
    formatDate,
    formatShortDate,
    filterRecordsByRange
} from '../utils/health';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function DashboardView({ records, settings, onSelectTab }) {
    const [timeRange, setTimeRange] = useState('30');

    // Filtered chronological records (oldest first for charts)
    const filteredRecords = filterRecordsByRange(records, timeRange);

    // Latest individual records for KPIs
    const latestBP = records.find(r => r.systolic !== null && r.diastolic !== null);
    const latestPulse = records.find(r => r.pulse !== null);
    const latestWeight = records.find(r => r.weight !== null);

    // BP & BMI Statuses
    const bpClass = latestBP ? getBPClassification(latestBP.systolic, latestBP.diastolic) : null;
    const bmiVal = latestWeight && settings.height ? calculateBMI(latestWeight.weight, settings.height) : null;
    const bmiClass = bmiVal ? getBMIClassification(bmiVal) : null;

    // Weight trend in selected time range
    const weightRecordsInRange = filteredRecords.filter(r => r.weight !== null && r.weight !== undefined);
    let weightTrendString = '--';
    let weightTrendBadgeClass = 'kpi-badge';
    if (weightRecordsInRange.length >= 2) {
        const oldest = weightRecordsInRange[0].weight;
        const newest = weightRecordsInRange[weightRecordsInRange.length - 1].weight;
        const diff = newest - oldest;
        weightTrendString = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
        weightTrendBadgeClass = diff < 0 ? 'kpi-badge status-normal' : diff > 0 ? 'kpi-badge status-elevated' : 'kpi-badge';
    }

    // Average BP in range
    const bpRecordsInRange = filteredRecords.filter(r => r.systolic !== null && r.diastolic !== null);
    let avgBPText = 'Ø BP: -- / -- mmHg';
    if (bpRecordsInRange.length > 0) {
        const avgSys = Math.round(bpRecordsInRange.reduce((sum, r) => sum + r.systolic, 0) / bpRecordsInRange.length);
        const avgDia = Math.round(bpRecordsInRange.reduce((sum, r) => sum + r.diastolic, 0) / bpRecordsInRange.length);
        avgBPText = `Ø BP: ${avgSys} / ${avgDia} mmHg`;
    }

    // Chart Data Preparation
    const chartLabels = filteredRecords.map(r => formatShortDate(r.datetime));

    const bpChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Systolisch (mmHg)',
                data: filteredRecords.map(r => r.systolic),
                borderColor: '#f43f5e',
                backgroundColor: 'transparent',
                borderWidth: 3,
                pointBackgroundColor: '#f43f5e',
                tension: 0.15,
                yAxisID: 'y'
            },
            {
                label: 'Diastolisch (mmHg)',
                data: filteredRecords.map(r => r.diastolic),
                borderColor: '#fda4af',
                backgroundColor: 'transparent',
                borderWidth: 3,
                pointBackgroundColor: '#fda4af',
                tension: 0.15,
                yAxisID: 'y'
            },
            {
                label: 'Puls (bpm)',
                data: filteredRecords.map(r => r.pulse),
                borderColor: '#06b6d4',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointBackgroundColor: '#06b6d4',
                tension: 0.15,
                yAxisID: 'yPulse'
            }
        ]
    };

    const bpChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Outfit', weight: 600 } } },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.06)' }, ticks: { color: '#94a3b8' } },
            y: {
                position: 'left',
                grid: { color: 'rgba(255, 255, 255, 0.06)' },
                ticks: { color: '#94a3b8' },
                title: { display: true, text: 'Blutdruck (mmHg)', color: '#94a3b8', font: { family: 'Outfit', weight: 700 } },
                min: 40,
                max: 200
            },
            yPulse: {
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: '#94a3b8' },
                title: { display: true, text: 'Puls (bpm)', color: '#94a3b8', font: { family: 'Outfit', weight: 700 } },
                min: 40,
                max: 150
            }
        }
    };

    const weightChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Gewicht (kg)',
                data: filteredRecords.map(r => r.weight),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                fill: true,
                borderWidth: 3,
                pointBackgroundColor: '#8b5cf6',
                tension: 0.25
            }
        ]
    };

    const weightChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Outfit', weight: 600 } } },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.06)' }, ticks: { color: '#94a3b8' } },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.06)' },
                ticks: { color: '#94a3b8' },
                title: { display: true, text: 'Körpergewicht (kg)', color: '#94a3b8', font: { family: 'Outfit', weight: 700 } }
            }
        }
    };

    const recentRecords = records.slice(0, 3);

    return (
        <section id="dashboard" className="tab-view active">
            <div className="view-header">
                <h2>Übersicht</h2>
                <div className="filter-group">
                    <label htmlFor="time-range-select">Zeitraum:</label>
                    <select
                        id="time-range-select"
                        className="select-input"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="7">Letzte 7 Tage</option>
                        <option value="30">Letzte 30 Tage</option>
                        <option value="90">Letzte 90 Tage</option>
                        <option value="all">Alle Einträge</option>
                    </select>
                </div>
            </div>

            {/* KPI Metric Cards Grid */}
            <div className="kpi-grid">
                {/* Blood Pressure Card */}
                <div className="card kpi-card" id="kpi-bp">
                    <div className="card-icon-wrapper bp-color">
                        <Heart size={24} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Letzter Blutdruck</span>
                        <div className="kpi-value-wrapper">
                            <span className="kpi-value">
                                {latestBP ? `${latestBP.systolic} / ${latestBP.diastolic}` : '-- / --'}
                            </span>
                            <span className="kpi-unit">mmHg</span>
                        </div>
                        <div className={`kpi-badge ${bpClass ? bpClass.class : ''}`}>
                            {bpClass ? bpClass.label : 'Keine Daten'}
                        </div>
                    </div>
                    <div className="kpi-footer">
                        <Clock size={12} />
                        <span>{latestBP ? formatDate(latestBP.datetime) : 'Keine Messungen'}</span>
                    </div>
                </div>

                {/* Pulse Card */}
                <div className="card kpi-card" id="kpi-pulse">
                    <div className="card-icon-wrapper pulse-color">
                        <HeartPulse size={24} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Letzter Puls</span>
                        <div className="kpi-value-wrapper">
                            <span className="kpi-value">{latestPulse ? latestPulse.pulse : '--'}</span>
                            <span className="kpi-unit">bpm</span>
                        </div>
                        <div className={`kpi-badge ${latestPulse ? (latestPulse.pulse > 100 ? 'status-stage2' : latestPulse.pulse < 60 ? 'status-elevated' : 'status-normal') : ''}`}>
                            {latestPulse ? (latestPulse.pulse > 100 ? 'Tachykardie (Hoch)' : latestPulse.pulse < 60 ? 'Bradykardie (Niedrig)' : 'Normal') : 'Keine Daten'}
                        </div>
                    </div>
                    <div className="kpi-footer">
                        <Clock size={12} />
                        <span>{latestPulse ? formatDate(latestPulse.datetime) : 'Keine Messungen'}</span>
                    </div>
                </div>

                {/* Weight Card */}
                <div className="card kpi-card" id="kpi-weight">
                    <div className="card-icon-wrapper weight-color">
                        <Scale size={24} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Letztes Gewicht</span>
                        <div className="kpi-value-wrapper">
                            <span className="kpi-value">{latestWeight ? latestWeight.weight.toFixed(1) : '--.-'}</span>
                            <span className="kpi-unit">kg</span>
                        </div>
                        <div className={`kpi-badge ${bmiClass ? bmiClass.class : ''}`}>
                            {bmiVal ? `BMI: ${bmiVal} (${bmiClass.label})` : 'BMI: Größe eintragen'}
                        </div>
                    </div>
                    <div className="kpi-footer">
                        <Clock size={12} />
                        <span>{latestWeight ? formatDate(latestWeight.datetime) : 'Keine Messungen'}</span>
                    </div>
                </div>

                {/* Weight Trend Card */}
                <div className="card kpi-card" id="kpi-trends">
                    <div className="card-icon-wrapper stats-color">
                        <TrendingUp size={24} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Gewichtsverlauf</span>
                        <div className="kpi-value-wrapper">
                            <span className="kpi-value">{weightTrendString}</span>
                            <span className="kpi-unit">kg</span>
                        </div>
                        <div className={weightTrendBadgeClass}>
                            {weightRecordsInRange.length >= 2 ? 'Gewichtsveränderung' : 'Zu wenig Daten'}
                        </div>
                    </div>
                    <div className="kpi-footer">
                        <Activity size={12} />
                        <span>{avgBPText}</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                <div className="card chart-card">
                    <div className="chart-header">
                        <h3><Heart className="header-icon bp-color" size={18} /> Blutdruck- & Pulsverlauf</h3>
                        <span className="chart-subtitle">Systolisch, Diastolisch & Puls</span>
                    </div>
                    <div className="chart-wrapper">
                        {filteredRecords.some(r => r.systolic !== null || r.pulse !== null) ? (
                            <Line data={bpChartData} options={bpChartOptions} />
                        ) : (
                            <div className="empty-state">
                                <Inbox size={32} />
                                <p>Keine Blutdruck- oder Pulsdaten im ausgewählten Zeitraum</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card chart-card">
                    <div className="chart-header">
                        <h3><Scale className="header-icon weight-color" size={18} /> Gewichtsverlauf</h3>
                        <span className="chart-subtitle">Körpergewicht in kg</span>
                    </div>
                    <div className="chart-wrapper">
                        {filteredRecords.some(r => r.weight !== null) ? (
                            <Line data={weightChartData} options={weightChartOptions} />
                        ) : (
                            <div className="empty-state">
                                <Inbox size={32} />
                                <p>Keine Gewichtsdaten im ausgewählten Zeitraum</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dashboard Footer Grid */}
            <div className="dashboard-footer-grid">
                <div className="card info-card">
                    <div className="info-header">
                        <h3><Info className="info-icon" size={18} /> Blutdruck-Klassifizierung</h3>
                    </div>
                    <div className="bp-class-guide">
                        <div className="guide-row normal">
                            <span className="guide-color-indicator"></span>
                            <span className="guide-label">Optimal</span>
                            <span className="guide-values">&lt; 120 / &lt; 80 mmHg</span>
                        </div>
                        <div className="guide-row elevated">
                            <span className="guide-color-indicator"></span>
                            <span className="guide-label">Erhöht</span>
                            <span className="guide-values">120-129 / &lt; 80 mmHg</span>
                        </div>
                        <div className="guide-row stage1">
                            <span className="guide-color-indicator"></span>
                            <span className="guide-label">Hypertonie Grad 1</span>
                            <span className="guide-values">130-139 oder 80-89 mmHg</span>
                        </div>
                        <div className="guide-row stage2">
                            <span className="guide-color-indicator"></span>
                            <span className="guide-label">Hypertonie Grad 2</span>
                            <span className="guide-values">&ge; 140 oder &ge; 90 mmHg</span>
                        </div>
                        <div className="guide-row crisis">
                            <span className="guide-color-indicator animate-pulse"></span>
                            <span className="guide-label">Krise / Gefahr</span>
                            <span className="guide-values">&gt; 180 oder &gt; 120 mmHg</span>
                        </div>
                    </div>
                </div>

                <div className="card recent-logs-card">
                    <div className="recent-header">
                        <h3>Letzte Einträge</h3>
                        <button className="btn-text" onClick={() => onSelectTab('history')}>Alle anzeigen</button>
                    </div>
                    <div className="recent-list">
                        {recentRecords.length === 0 ? (
                            <div className="empty-state">
                                <Inbox size={32} />
                                <p>Keine Einträge vorhanden</p>
                            </div>
                        ) : (
                            recentRecords.map(r => (
                                <div key={r.id} className="recent-item">
                                    <div className="recent-item-meta">
                                        <span className="recent-item-date">{formatShortDate(r.datetime)}</span>
                                        <div className="recent-item-values">
                                            {r.systolic && r.diastolic && (
                                                <span className="recent-item-value-pill bp-color">
                                                    <Heart size={12} /> {r.systolic}/{r.diastolic}
                                                </span>
                                            )}
                                            {r.pulse && (
                                                <span className="recent-item-value-pill pulse-color">
                                                    <HeartPulse size={12} /> {r.pulse} bpm
                                                </span>
                                            )}
                                            {r.weight && (
                                                <span className="recent-item-value-pill weight-color">
                                                    <Scale size={12} /> {r.weight.toFixed(1)} kg
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {r.notes && <span className="recent-item-notes" title={r.notes}>{r.notes}</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
