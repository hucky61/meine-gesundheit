import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import RecordModal from './components/RecordModal';
import ToastContainer from './components/ToastContainer';
import {
    loadRecords,
    saveRecords,
    loadSettings,
    saveSettings,
    loadTheme,
    saveTheme
} from './utils/storage';
import { generateEmailReport } from './utils/health';

export default function App() {
    const [records, setRecords] = useState([]);
    const [settings, setSettings] = useState({ height: 178, name: '' });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [theme, setTheme] = useState('dark');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [toasts, setToasts] = useState([]);

    // Initialize state on load
    useEffect(() => {
        const loadedRecs = loadRecords();
        const loadedSett = loadSettings();
        const loadedThm = loadTheme();

        setRecords(loadedRecs);
        setSettings(loadedSett);
        setTheme(loadedThm);

        if (loadedThm === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        }
    }, []);

    const showToast = (message, type = 'info') => {
        const id = Date.now() + '_' + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const handleToggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        saveTheme(nextTheme);

        if (nextTheme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        }

        showToast('Design geändert', 'info');
    };

    const handleOpenModal = (recordToEdit = null) => {
        setEditingRecord(recordToEdit);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    const handleSaveRecord = (recordData) => {
        let updatedRecords = [];
        if (recordData.id) {
            // Edit existing
            updatedRecords = records.map(r => r.id === recordData.id ? { ...r, ...recordData } : r);
            showToast('Eintrag erfolgreich aktualisiert.', 'success');
        } else {
            // New record
            const newRecord = {
                ...recordData,
                id: 'rec_' + Date.now()
            };
            updatedRecords = [newRecord, ...records];
            showToast('Eintrag erfolgreich hinzugefügt.', 'success');
        }

        // Keep records sorted (newest first)
        updatedRecords.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

        setRecords(updatedRecords);
        saveRecords(updatedRecords);
        handleCloseModal();
    };

    const handleDeleteRecord = (id) => {
        if (confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
            const updated = records.filter(r => r.id !== id);
            setRecords(updated);
            saveRecords(updated);
            showToast('Eintrag gelöscht.', 'info');
        }
    };

    const handleSaveSettings = (newSettings) => {
        setSettings(newSettings);
        saveSettings(newSettings);
    };

    const handleImportRecords = (newRecords) => {
        const combined = [...records, ...newRecords];
        combined.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        setRecords(combined);
        saveRecords(combined);
    };

    const handleImportJSON = (importedRecords, importedSettings) => {
        const sorted = [...importedRecords].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        setRecords(sorted);
        saveRecords(sorted);

        if (importedSettings) {
            setSettings(importedSettings);
            saveSettings(importedSettings);
        }
    };

    const handleClearData = () => {
        if (confirm('Bist du sicher, dass du alle Daten unwiderruflich löschen möchtest? Dies kann nicht rückgängig gemacht werden.')) {
            setRecords([]);
            saveRecords([]);
            setSettings({ height: null });
            saveSettings({ height: null });
            showToast('Alle Daten wurden gelöscht.', 'info');
        }
    };

    const handleSendEmail = async () => {
        if (records.length === 0) {
            showToast('Keine Daten zum Versenden vorhanden.', 'error');
            return;
        }

        const { subject, body } = generateEmailReport(records, settings);
        showToast('PDF-Arztbericht wird erstellt...', 'info');

        try {
            const element = document.querySelector('.main-content') || document.body;
            const filename = `Arztbericht_${settings?.name ? settings.name.replace(/\s+/g, '_') : 'Gesundheit'}_${new Date().toISOString().slice(0, 10)}.pdf`;

            const opt = {
                margin: [10, 10, 10, 10],
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const html2pdfModule = (await import('html2pdf.js')).default;
            const pdfWorker = html2pdfModule().set(opt).from(element);

            // Check if Web Share API with files support is available (e.g. mobile Safari / Chrome)
            const pdfBlob = await pdfWorker.output('blob');
            const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                try {
                    await navigator.share({
                        title: subject,
                        text: body,
                        files: [pdfFile]
                    });
                    showToast('Arztbericht inklusive PDF erfolgreich geteilt!', 'success');
                    return;
                } catch (shareErr) {
                    if (shareErr.name !== 'AbortError') {
                        console.warn('Share error:', shareErr);
                    }
                }
            }

            // Fallback for Desktop & Browsers without Web Share file support:
            // 1. Download PDF file automatically
            pdfWorker.save();

            // 2. Open E-Mail client via mailto
            setTimeout(() => {
                const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoUrl;
            }, 500);

            showToast('PDF heruntergeladen & E-Mail-Entwurf geöffnet! Bitte PDF anhängen.', 'success');
        } catch (err) {
            console.error('PDF Generation Error:', err);
            // Fallback to mailto link
            const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoUrl;
            showToast('E-Mail-Entwurf geöffnet.', 'info');
        }
    };

    return (
        <div className="app-layout">
            <Navbar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onOpenModal={handleOpenModal}
                onSendEmail={handleSendEmail}
            />

            <main className="main-content">
                <DashboardView
                    records={records}
                    settings={settings}
                    onSelectTab={setActiveTab}
                    active={activeTab === 'dashboard'}
                />

                <HistoryView
                    records={records}
                    settings={settings}
                    onEditRecord={handleOpenModal}
                    onDeleteRecord={handleDeleteRecord}
                    onImportRecords={handleImportRecords}
                    showToast={showToast}
                    active={activeTab === 'history'}
                />

                <SettingsView
                    records={records}
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                    onImportJSON={handleImportJSON}
                    onClearData={handleClearData}
                    showToast={showToast}
                    active={activeTab === 'settings'}
                />
            </main>

            <RecordModal
                isOpen={isModalOpen}
                initialData={editingRecord}
                onClose={handleCloseModal}
                onSave={handleSaveRecord}
                showToast={showToast}
            />

            <ToastContainer toasts={toasts} />
        </div>
    );
}
