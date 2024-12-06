import React, {Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider,createRoutesFromElements,Route} from 'react-router-dom';
import App from './App';
import Leaderboard from './routes/Leaderboard';
import Stats from './routes/Stats';
import DataService from './api/DataService';
import {CircularProgress} from "@mui/material";

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route
                index
                element={<Leaderboard />}
                loader={async () => {
                    const regions = await DataService.fetchRegions();
                    const pipelines = await DataService.fetchPipelines();
                    return {regions, pipelines};
                }}
            />
            <Route
                path="leaderboard"
                element={<Leaderboard />}
                loader={async () => {
                    const regions = await DataService.fetchRegions();
                    const pipelines = await DataService.fetchPipelines();
                    return {regions, pipelines};
                }}
            />
            <Route
                path="stats"
                element={<Stats />}
                loader={async () => {
                    const pipelines = await DataService.fetchPipelines();
                    return {pipelines};
                }}
            />
        </Route>
    )
);
ReactDOM.createRoot(document.getElementById('root')).render(
    <Suspense fallback={<CircularProgress />}>
        <RouterProvider router={router} />
    </Suspense>
);
