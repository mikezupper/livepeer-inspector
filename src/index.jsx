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
                console.log(`[index] Service Worker registered:`, registration);
            })
            .catch((error) => {
                console.error(`[index] Service Worker registration failed:`, error);
            });
    });
}

//load reference data
const leaderboardLoader=async () => {
    console.log(`[index] leaderboardLoader loading...`);
    const regions = await DataService.fetchRegions();
    const pipelines = await DataService.fetchPipelines();
    console.log(`[index] leaderboardLoader completed.`);
    return {regions, pipelines};
}

const statsLoader=async () => {
    console.log(`[index] statsLoader loading...`);
    const pipelines = await DataService.fetchPipelines();
    console.log(`[index] statsLoader completed.`);
    return {pipelines};
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route
                index
                element={<Leaderboard />}
                loader={leaderboardLoader}
                hydrateFallbackElement={<CircularProgress />}
            />
            <Route
                path="leaderboard"
                element={<Leaderboard />}
                loader={leaderboardLoader}
                hydrateFallbackElement={<CircularProgress />}
            />
            <Route
                path="stats"
                element={<Stats />}
                loader={statsLoader}
                hydrateFallbackElement={<CircularProgress />}
            />
        </Route>
    )
);
ReactDOM.createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
