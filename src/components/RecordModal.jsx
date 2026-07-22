import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function RecordModal({ isOpen, initialData, onClose, onSave, showToast }) {
    const [datetime, setDatetime] = useState('');
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [pulse, setPulse] = useState('');
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [tag, setTag] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setDatetime(initialData.datetime || getCurrentLocalISO());
                setSystolic(initialData.systolic !== null && initialData.systolic !== undefined ? initialData.systolic : '');
                setDiastolic(initialData.diastolic !== null && initialData.diastolic !== undefined ? initialData.diastolic : '');
                setPulse(initialData.pulse !== null && initialData.pulse !== undefined ? initialData.pulse : '');
                setWeight(initialData.weight !== null && initialData.weight !== undefined ? initialData.weight : '');
                setNotes(initialData.notes || '');
                setTag(initialData.tag || '');
            } else {
                setDatetime(getCurrentLocalISO());
                setSystolic('');
                setDiastolic('');
                setPulse('');
                setWeight('');
                setNotes('');
                setTag('');
            }
        }
    }, [isOpen, initialData]);

    function getCurrentLocalISO() {
        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    }

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const sysNum = parseInt(systolic) || null;
        const diaNum = parseInt(diastolic) || null;
        const pulseNum = parseInt(pulse) || null;
        const weightNum = parseFloat(weight) || null;

        if (!sysNum && !diaNum && !pulseNum && !weightNum) {
            showToast('Bitte trage mindestens einen Messwert ein (Blutdruck, Puls oder Gewicht).', 'error');
            return;
        }

        if ((sysNum && !diaNum) || (!sysNum && diaNum)) {
            showToast('Für den Blutdruck müssen Systole und Diastole eingetragen werden.', 'error');
            return;
        }

        onSave({
            id: initialData?.id || undefined,
            datetime,
            systolic: sysNum,
            diastolic: diaNum,
            pulse: pulseNum,
            weight: weightNum,
            notes: notes.trim(),
            tag
        });
    };

    return (
        <div className="modal-overlay active">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{initialData ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label htmlFor="input-datetime">Datum & Uhrzeit <span className="required">*</span></label>
                            <input
                                type="datetime-local"
                                id="input-datetime"
                                className="text-input"
                                value={datetime}
                                onChange={(e) => setDatetime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="input-tag">Messkontext (Tag)</label>
                            <select
                                id="input-tag"
                                className="select-input"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                            >
                                <option value="">Keiner</option>
                                <option value="morgens">Morgens (M)</option>
                                <option value="abends">Abends (A)</option>
                                <option value="ruhe">Ruhe (R)</option>
                                <option value="sport">Aktivität / Sport (S)</option>
                                <option value="medikamente">Medikamente (Med)</option>
                                <option value="stress">Stress (St)</option>
                            </select>
                            <p className="form-help">Optionale Messbedingung</p>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label htmlFor="input-systolic">Blutdruck Systolisch (mmHg)</label>
                            <input
                                type="number"
                                id="input-systolic"
                                className="text-input"
                                placeholder="Z.B. 120"
                                min="50"
                                max="250"
                                value={systolic}
                                onChange={(e) => setSystolic(e.target.value)}
                            />
                            <p className="form-help">Oberer Wert</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="input-diastolic">Blutdruck Diastolisch (mmHg)</label>
                            <input
                                type="number"
                                id="input-diastolic"
                                className="text-input"
                                placeholder="Z.B. 80"
                                min="30"
                                max="150"
                                value={diastolic}
                                onChange={(e) => setDiastolic(e.target.value)}
                            />
                            <p className="form-help">Unterer Wert</p>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label htmlFor="input-pulse">Puls (bpm)</label>
                            <input
                                type="number"
                                id="input-pulse"
                                className="text-input"
                                placeholder="Z.B. 72"
                                min="30"
                                max="220"
                                value={pulse}
                                onChange={(e) => setPulse(e.target.value)}
                            />
                            <p className="form-help">Herzschläge pro Min.</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="input-weight">Gewicht (kg)</label>
                            <input
                                type="number"
                                id="input-weight"
                                className="text-input"
                                placeholder="Z.B. 75.5"
                                min="20"
                                max="300"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                            <p className="form-help">Mit Dezimalpunkt</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="input-notes">Notizen / Bemerkung</label>
                        <textarea
                            id="input-notes"
                            className="textarea-input"
                            placeholder="Z.B. Nach dem Sport, Befinden, Medikamenteneinnahme..."
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Abbrechen</button>
                        <button type="submit" className="btn-primary">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
