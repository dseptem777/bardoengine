import React from 'react'
import ReactDOM from 'react-dom/client'
import BardoEditor from './editor/BardoEditor.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BardoEditor onClose={() => {
                try { window.close() } catch (e) { /* ignore */ }
            }} />
        </ErrorBoundary>
    </React.StrictMode>,
)
