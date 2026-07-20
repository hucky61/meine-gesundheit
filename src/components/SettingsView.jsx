import React, { useState, useRef, useEffect } from 'react';
import { User, Database, Download, Upload, Trash2 } from 'lucide-react';
import { downloadFile } from '../utils/storage';

export default function SettingsView({ records, settings, onSaveSettings, onImportJSON, onClearData, showToast }) {
    const [height, setHeight] = useState(settings.height || '');
    const jsonInputRef = useRef(null);

    useEffect(() => {
        setHeight(settings.height || '');
    }, [settings]);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        const heightNum = parseInt(height) || null;
        if (heightNum && (heightNum < 100 || heightNum > 250)) {
            showToast('Bitte trage eine realistische Körpergröße ein (100 - 250 cm).', 'error');
            return;
        }
        onSaveSettings({ ...settings, height: heightNum });
        showToast('Profil erfolgreich gespeichert.', 'success');
    };

    const handleExportJSON = () => {
        if (records.length === 0) {
            showToast('Keine Daten zum Exportieren vorhanden.', 'error');
            return;
        }
        const jsonStr = JSON.stringify({ records, settings, version: '1.0' }, null, 2);
        downloadFile(jsonStr, 'healthsync_backup.json', 'application/json');
        showToast('JSON-Export gestartet.', 'success');
    };

    const handleImportJSON = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                if (data && Array.isArray(data.records)) {
                    onImportJSON(data.records, data.settings || settings);
                    showToast('Daten erfolgreich aus JSON-Backup wiederhergestellt.', 'success');
                } else {
                    showToast('Ungültiges Backup-Format: Keine Datensätze gefunden.', 'error');
                }
            } catch (err) {
                showToast('Fehler beim Lesen der Backup-Datei.', 'error');
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <section id="settings" className="tab-view active">
            <div className="view-header">
                <h2>Einstellungen</h2>
            </div>

            <div className="settings-grid">
                {/* Profile Form */}
                <div className="card settings-card">
                    <div className="settings-card-header">
                        <h3><User size={20} /> Benutzerprofil</h3>
                        <p>Informationen zur BMI-Berechnung</p>
                    </div>
                    <form className="settings-card-body" onSubmit={handleSaveProfile}>
                        <div className="form-group">
                            <label htmlFor="setting-height">Größe (cm)</label>
                            <input
                                type="number"
                                id="setting-height"
                                className="text-input"
                                placeholder="Z.B. 178"
                                min="100"
                                max="250"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                            <p className="form-help">Wird benötigt, um deinen Body Mass Index (BMI) zu ermitteln.</p>
                        </div>
                        <button type="submit" className="btn-primary">Profil speichern</button>
                    </form>
                </div>

                {/* Backup & Reset */}
                <div className="card settings-card">
                    <div className="settings-card-header">
                        <h3><Database size={20} /> Datensicherung & Reset</h3>
                        <p>Verwalte deine Daten im lokalen Speicher</p>
                    </div>
                    <div className="settings-card-body">
                        <div className="backup-actions">
                            <div className="backup-row">
                                <div>
                                    <strong>Komplett-Backup (JSON)</strong>
                                    <p className="form-help">Sichere alle Einträge und Einstellungen in einer JSON-Datei.</p>
                                </div>
                                <button className="btn-secondary" onClick={handleExportJSON}>
                                    <Download size={18} /> JSON Export
                                </button>
                            </div>

                            <div className="backup-row">
                                <div>
                                    <strong>Backup einspielen (JSON)</strong>
                                    <p className="form-help">Stelle deine Daten aus einem JSON-Backup wieder her.</p>
                                </div>
                                <button className="btn-secondary" onClick={() => jsonInputRef.current?.click()}>
                                    <Upload size={18} /> JSON Import
                                </button>
                                <input
                                    type="file"
                                    ref={jsonInputRef}
                                    accept=".json"
                                    className="hidden-input"
                                    onChange={handleImportJSON}
                                />
                            </div>

                            <div className="backup-row danger-zone">
                                <div>
                                    <strong>Alle Daten löschen</strong>
                                    <p class="form-help">Löscht unwiderruflich alle gespeicherten Messwerte und Einstellungen.</p>
                                </div>
                                <button className="btn-danger" onClick={onClearData}>
                                    <Trash2 size={18} /> Daten löschen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
