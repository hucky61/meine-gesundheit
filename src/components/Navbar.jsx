import React, { useState } from 'react';
import { Activity, LayoutDashboard, Calendar, Settings, Sun, Moon, Plus, Menu, X, Printer, Mail } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, theme, onToggleTheme, onOpenModal, onSendEmail }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleTabClick = (tab) => {
        onTabChange(tab);
        setIsMobileMenuOpen(false);
    };

    const handleOpenModalClick = () => {
        onOpenModal();
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="navbar animate-fade-in">
            <div className="nav-header-top">
                <div className="nav-brand">
                    <div className="brand-icon">
                        <Activity className="brand-logo-icon" />
                    </div>
                    <div className="brand-info">
                        <h1>HealthSync</h1>
                        <p>Deine Gesundheit im Blick</p>
                    </div>
                </div>

                <div className="nav-actions-mobile">
                    <button
                        className="btn-icon theme-toggle-btn"
                        onClick={onToggleTheme}
                        title="Design umschalten"
                    >
                        {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button
                        className="btn-icon btn-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menü umschalten"
                        title="Menü umschalten"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            <nav className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <button
                    className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleTabClick('dashboard')}
                >
                    <LayoutDashboard size={18} />
                    <span>Übersicht</span>
                </button>
                <button
                    className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => handleTabClick('history')}
                >
                    <Calendar size={18} />
                    <span>Verlauf</span>
                </button>
                <button
                    className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => handleTabClick('settings')}
                >
                    <Settings size={18} />
                    <span>Einstellungen</span>
                </button>
            </nav>

            <div className={`nav-actions ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <button
                    id="theme-toggle"
                    className="btn-icon theme-toggle-desktop"
                    onClick={onToggleTheme}
                    title="Design umschalten"
                >
                    {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="btn-secondary no-print" onClick={() => { setIsMobileMenuOpen(false); window.print(); }} title="Arztbericht drucken">
                    <Printer size={18} />
                    <span>Arztbericht (PDF)</span>
                </button>
                <button className="btn-secondary no-print" onClick={() => { setIsMobileMenuOpen(false); onSendEmail(); }} title="Bericht per E-Mail vorbereiten">
                    <Mail size={18} />
                    <span>E-Mail</span>
                </button>
                <button className="btn-primary" onClick={handleOpenModalClick}>
                    <Plus size={18} />
                    <span>Neuer Eintrag</span>
                </button>
            </div>
        </header>
    );
}
