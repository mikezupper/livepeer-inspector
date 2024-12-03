import React from 'react';
import {
    RouterProvider
} from '@tanstack/react-router'
import {createRoot} from 'react-dom/client';
import {router} from "./routes";

const rootElement = document.getElementById('root')

if (!rootElement.innerHTML) {
    const root = createRoot(rootElement)
    root.render(<RouterProvider router={router} />)
}
