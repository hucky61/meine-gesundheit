import React from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function ToastContainer({ toasts }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => {
                let Icon = Info;
                if (toast.type === 'success') Icon = CheckCircle;
                if (toast.type === 'error') Icon = AlertTriangle;

                return (
                    <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
                        <Icon className="toast-icon" size={18} />
                        <span>{toast.message}</span>
                    </div>
                );
            })}
        </div>
    );
}
