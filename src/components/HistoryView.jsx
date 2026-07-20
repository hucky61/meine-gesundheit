import React, { useState, useRef } from 'react';
import { Search, Download, Upload, Edit3, Trash2, DatabaseBackup } from 'lucide-react';
import { formatDate, getBPClassification, calculateBMI } from '../utils/health';
import { generateCSV, parseCSV, downloadFile } from '../utils/storage';

export default function HistoryView({ records, settings, onEditRecord, onDeleteRecord, onImportRecords, showToast }) {
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef(null);

    const filteredRecords = records.filter(r =>
        !searchQuery || (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleExportCSV = () => {
        if (records.length === 0) {
            showToast('Keine Daten zum Exportieren vorhanden.', 'error');
            return;
        }
        const csv = generateCSV(records);
        downloadFile(csv, 'healthsync_messwerte.csv', 'text/csv;charset=utf-8;');
        showToast('CSV-Export gestartet.', 'success');
    };

    const handleImportCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const { count, duplicates, newRecords } = parseCSV(evt.target.result, records);
            if (count > 0) {
                onImportRecords(newRecords);
                showToast(`${count} Einträge importiert.${duplicates > 0 ? ` (${duplicates} Duplikate übersprungen)` : ''}`, 'success');
            } else {
                showToast('Keine neuen Einträge importiert.', 'info');
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <section id="history" className="tab-view active">
            <div className="view-header">
                <h2>Messwert-Verlauf</h2>
                <div className="history-actions">
                    <div className="search-box">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Notizen durchsuchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn-secondary" onClick={handleExportCSV} title="Als CSV herunterladen">
                        <Download size={18} />
                        <span>CSV Export</span>
                    </button>
                    <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} title="Aus CSV importieren">
                        <Upload size={18} />
                        <span>CSV Import</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        className="hidden-input"
                        onChange={handleImportCSV}
                    />
                </div>
            </div>

            <div className="card history-table-card">
                {filteredRecords.length === 0 ? (
                    <div className="table-empty-state">
                        <DatabaseBackup size={48} />
                        <p>Noch keine Daten erfasst oder keine Treffer bei der Suche.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Datum / Uhrzeit</th>
                                    <th>Blutdruck (mmHg)</th>
                                    <th>Puls (bpm)</th>
                                    <th>Gewicht (kg)</th>
                                    <th>BMI</th>
                                    <th>Notizen</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map(r => {
                                    const bpClass = r.systolic && r.diastolic ? getBPClassification(r.systolic, r.diastolic) : null;
                                    const bmi = r.weight && settings.height ? calculateBMI(r.weight, settings.height) : null;

                                    return (
                                        <tr key={r.id}>
                                            <td><strong>{formatDate(r.datetime)}</strong></td>
                                            <td>
                                                {r.systolic && r.diastolic ? (
                                                    <span className={`table-val-pill ${bpClass ? bpClass.class : ''}`}>
                                                        {r.systolic} / {r.diastolic}
                                                    </span>
                                                ) : '--'}
                                            </td>
                                            <td>{r.pulse || '--'}</td>
                                            <td>{r.weight ? r.weight.toFixed(1) : '--'}</td>
                                            <td><small className="kpi-badge">{bmi || '--'}</small></td>
                                            <td className="notes-cell" title={r.notes || ''}>{r.notes || ''}</td>
                                            <td className="table-actions">
                                                <button
                                                    className="btn-table-action edit"
                                                    onClick={() => onEditRecord(r)}
                                                    title="Bearbeiten"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className="btn-table-action delete"
                                                    onClick={() => onDeleteRecord(r.id)}
                                                    title="Löschen"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
