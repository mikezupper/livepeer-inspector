import React from 'react';
import { CssBaseline } from '@mui/material';
import { createRoot } from 'react-dom/client';
import App from "./App.jsx";

    const root = createRoot(document.getElementById('root'));
    root.render(
        <React.StrictMode>
            <CssBaseline />
            <App/>
        </React.StrictMode>
    );
