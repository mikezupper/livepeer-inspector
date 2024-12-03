import {createRootRoute, createRoute, createRouter} from "@tanstack/react-router";
import {z} from "zod";

import {fetchLeaderboardLoader, fetchStatsLoader} from "./loaders";
import App from "./components/App";
import PerformanceTab from "./components/PerformanceTab";
import LeaderboardTab from "./components/LeaderboardTab";

const rootRoute = createRootRoute({
    component: App,
})

const statsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'stats',
    component: PerformanceTab,
    loader: fetchStatsLoader,
    validateSearch: z.object({
        orchestrator: z.string().optional(),
        pipeline: z.string().optional(),
        model: z.string().optional(),
    }),
})
const leaderboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LeaderboardTab,
    validateSearch: z.object({
        region: z.string().optional(),
        pipeline: z.string().optional(),
        model: z.string().optional(),
    }),
    loader: fetchLeaderboardLoader,
})
const routeTree = rootRoute.addChildren([
    statsRoute,
    leaderboardRoute
])

export const router = createRouter({
    routeTree,
    // defaultPreload: 'intent',
})
