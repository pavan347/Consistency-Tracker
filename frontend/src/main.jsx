import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A2E',
            color: '#FFF8F0',
            border: '3px solid #1A1A2E',
            borderRadius: '8px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: '700',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#FFF8F0' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#FFF8F0' },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
