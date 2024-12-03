import {
    aiLeaderboardStatsURL, aiPerfStatsURL,
    leaderboardStatsURL,
    orchDetailsURL,
    perfStatsURL,
    pipelinesURL,
    regionsURL
} from "./config.js";
import { defer } from '@tanstack/react-router'

const fetchBaseData =async (params) => {
    const {region, pipeline,model, orchestrator} = params.location.search;
    const isAi = ((model !== undefined && model !== '') && (pipeline !== undefined && pipeline !== ''))
    // console.log("fetchBaseData ",region, pipeline,model, orchestrator,isAi)

    const [orchestratorsResponse, regionsResponse, pipelinesResponse] = await Promise.all([
        fetch(orchDetailsURL),
        fetch(regionsURL),
        fetch(pipelinesURL),
    ]);
    if (!orchestratorsResponse.ok) {
        throw new Error("Failed to fetch orchestrators");
    }
    if (!regionsResponse.ok) {
        throw new Error("Failed to fetch regions");
    }
    if (!pipelinesResponse.ok) {
        throw new Error("Failed to fetch pipelines");
    }

    const [orchestratorsData, regionsData, pipelinesData] = await Promise.all([
        orchestratorsResponse.json(),
        regionsResponse.json(),
        pipelinesResponse.json(),
    ]);

    let defaultRegionValue  = "GLOBAL";
    let regions = []
    if(isAi){
        regions = regionsData.regions.filter(region => region.type === "ai")
    } else{
        regions=regionsData.regions.filter(region => region.type !== "ai")
    }

    const orchestrators = new Map(
        orchestratorsData.map(obj => [obj.eth_address, obj])
    );

    const {pipelines}=pipelinesData;
    const selectedPipeline = pipelines.find((p) => p.id === pipeline);
    const models= (selectedPipeline ? selectedPipeline.models : []);

    return {orchestrators: orchestrators,regions,pipelines, models,region: (region? region:defaultRegionValue),pipeline,model,orchestrator,isAi};
}

export const fetchLeaderboardLoader=async (params) => {
    const {region, pipeline,model} = params.location.search;
    const baseData = await fetchBaseData(params)
    const {isAi,orchestrators,} =baseData;
    let url = new URL(leaderboardStatsURL);
    if (isAi) {
        url = new URL(aiLeaderboardStatsURL);
    }
    if (region && region !== "GLOBAL") url.searchParams.append("region", region);
    if (isAi) url.searchParams.append("pipeline", pipeline );
    if (isAi) url.searchParams.append("model", model);
    const response = await fetch(url);
    if (!response.ok) {
        return {...baseData,leaderboard:null, error: "response not ok"}
    }
    const data = await response.json();

    const leaderboard = Object.entries(data).map(
        ([orchestrator, regions], index) => {
            let totalScore = 0;
            let totalSuccessRate = 0;
            let totalRoundTripScore = 0;
            const regionCount = Object.keys(regions).length;

            Object.values(regions).forEach((stats) => {
                totalScore += stats.score;
                totalSuccessRate += stats.success_rate;
                totalRoundTripScore += stats.round_trip_score;
            });
            return {
                id: index,
                orchestrator: orchestrators.get(orchestrator),
                totalScore: (totalScore / regionCount * 10),
                successRate: ((totalSuccessRate / regionCount) * 100),
                latencyScore: (totalRoundTripScore / regionCount * 10),
            };
        }
    );
    return {...baseData,leaderboard,isAi,error: null}
}

export const fetchStatsLoader=async (params) => {
    const {orchestrator, pipeline,model} = params.location.search;
    const baseData = await fetchBaseData(params)
    const {isAi,} =baseData;
    let url = new URL(perfStatsURL);
    if (isAi) {
        url = new URL(aiPerfStatsURL);
    }
    if (orchestrator) url.searchParams.append("orchestrator", orchestrator);
    if (isAi) url.searchParams.append("pipeline", pipeline );
    if (isAi) url.searchParams.append("model", model);

    let performanceData=[];
    if (orchestrator){
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch performance data");
        }
        performanceData = await response.json();
    }
    return {...baseData,...params.location.search,performanceData}
}
