import React from 'react';
import { Activity, LayoutDashboard, Calendar, Settings, Sun, Moon, Plus } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, theme, onToggleTheme, onOpenModal }) {
    return (
        <header className="navbar">
            <div className="nav-brand">
                <div className="brand-icon">
                    <Activity className="brand-logo-icon" />
                </div>
                <div className="brand-info">
                    <h1>HealthSync</h1>
                    <p>Deine Gesundheit im Blick</p>
                </div>
            </div>

            <nav className="nav-menu">
                <button
                    className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => onTabChange('dashboard')}
                >
                    <LayoutDashboard size={18} />
                    <span>Übersicht</span>
                </button>
                <button
                    className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => onTabChange('history')}
                >
                    <Calendar size={18} />
                    <span>Verlauf</span>
                </button>
                <button
                    className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => onTabChange('settings')}
                >
                    <Settings size={18} />
                    <span>Einstellungen</span>
                </button>
            </nav>

            <div className="nav-actions">
                <button
                    id="theme-toggle"
                    className="btn-icon"
                    onClick={onToggleTheme}
                    title="Design umschalten"
                >
                    {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="btn-primary" onClick={() => onOpenModal()}>
                    <Plus size={18} />
                    <span>Neuer Eintrag</span>
                </button>
            </div>
        </header>
    );
}
