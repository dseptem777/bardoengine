/**
 * ErrorBoundary.jsx
 * Catches React errors and displays a recovery UI instead of crashing
 * 
 * Usage:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

import React from 'react';
import { AlertTriangle, RotateCcw, Home, ClipboardCopy } from 'lucide-react';
import { logger } from '../utils/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so next render shows fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error
        logger.error('React Error Boundary caught an error:', error);
        logger.error('Component stack:', errorInfo.componentStack);

        this.setState({ errorInfo });
    }

    handleRestart = () => {
        // Clear all state and reload
        logger.info('User initiated restart from error boundary');
        window.location.reload();
    };

    handleGoToMenu = () => {
        // Try to reset state and go back to menu
        logger.info('User initiated return to menu from error boundary');
        this.setState({ hasError: false, error: null, errorInfo: null });

        // Clear story state from localStorage to avoid stuck state
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.includes('bardo_current_state')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            logger.warn('Failed to clear state:', e);
        }

        // Force reload to menu
        window.location.reload();
    };

    handleCopyLogs = async () => {
        try {
            const logs = logger.getLogsAsString();
            await navigator.clipboard.writeText(logs);
            alert('Logs copiados al portapapeles');
        } catch (e) {
            logger.error('Failed to copy logs:', e);
            alert('No se pudieron copiar los logs');
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <div className="error-icon"><AlertTriangle size={48} /></div>
                        <h1>Algo salió mal</h1>
                        <p className="error-message">
                            El juego encontró un error inesperado.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="error-details">
                                <summary>Detalles técnicos</summary>
                                <pre>{this.state.error.toString()}</pre>
                                {this.state.errorInfo && (
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                )}
                            </details>
                        )}

                        <div className="error-actions">
                            <button onClick={this.handleRestart} className="error-btn primary">
                                <RotateCcw size={16} className="inline mr-2" />Reiniciar Juego
                            </button>
                            <button onClick={this.handleGoToMenu} className="error-btn secondary">
                                <Home size={16} className="inline mr-2" />Volver al Menú
                            </button>
                            <button onClick={this.handleCopyLogs} className="error-btn tertiary">
                                <ClipboardCopy size={16} className="inline mr-2" />Copiar Logs
                            </button>
                        </div>

                        <p className="error-hint">
                            Si el problema persiste, por favor reportalo con los logs.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
