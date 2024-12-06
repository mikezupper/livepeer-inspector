import {
    aiLeaderboardStatsURL,
    aiPerfStatsURL,
    leaderboardStatsURL,
    orchDetailsURL,
    perfStatsURL,
    pipelinesURL,
    regionsURL
} from "../config.js";

/**
 * Class for handling API data fetching.
 */
class DataService {
    /**
     * Fetches the list of regions from the API.
     * @returns {Promise<Object[]>} A promise that resolves to an array of regions.
     * @throws {Error} If the request fails.
     */
    static async fetchRegions() {
        const response = await fetch(regionsURL);
        if (!response.ok) {
            throw new Error('Failed to fetch regions');
        }
        return response.json();
    }

    /**
     * Fetches the list of pipelines and models from the API.
     * @returns {Promise<Object[]>} A promise that resolves to an array of pipelines with models.
     * @throws {Error} If the request fails.
     */
    static async fetchPipelines() {
        const response = await fetch(pipelinesURL);
        if (!response.ok) {
            throw new Error('Failed to fetch pipelines');
        }
        const data = await response.json();
        // console.log("DataService - fetchPipelines data", data);
        return data.pipelines || [];
    }

    /**
     * Fetches leaderboard data based on pipeline, model, and region.
     * @param {Object} params - The parameters for the API call.
     * @param {string} params.pipeline - The selected pipeline.
     * @param {string} params.model - The selected model.
     * @param {string} params.region - The selected region.
     * @param {boolean} params.isAIType - Whether the AI type is true (both pipeline and model selected).
     * @returns {Promise<Object>} A promise that resolves to the leaderboard data.
     * @throws {Error} If the request fails.
     */
    static async fetchLeaderboardData({pipeline, model, region, isAIType}) {
        // console.log("DataService fetchLeaderboardData",pipeline,model,region,isAIType);
        const endpoint = isAIType ? aiLeaderboardStatsURL : leaderboardStatsURL;
        let url = `${endpoint}?`;

        if (region && !region.includes("GLOBAL"))
            url += `region=${region}&`;

        if (isAIType) {
            url += `pipeline=${pipeline}&model=${model}`;
        }
        // console.log("DataService fetchLeaderboardData url" ,url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard data');
        }

        const data = await response.json();

        const orchDetailResponse = await fetch(orchDetailsURL)
        const orchs = await orchDetailResponse.json();
        const orchestrators = new Map(orchs.map(obj => [obj.eth_address, obj]))
        return Object.entries(data).map(([orchestrator, regions], index) => {
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
                totalScore: (totalScore / regionCount) * 10,
                successRate: (totalSuccessRate / regionCount) * 100,
                latencyScore: (totalRoundTripScore / regionCount) * 10,
            };
        })
    }

    /**
     * Fetches stats data based on orchestrator address, pipeline, and model.
     * @param {Object} params - The parameters for the API call.
     * @param {string} params.orchestrator - The orchestrator Ethereum address.
     * @param {string} params.pipeline - The selected pipeline.
     * @param {string} params.model - The selected model.
     * @param {boolean} params.isAIType - Whether the AI type is true (both pipeline and model selected).
     * @returns {Promise<Object>} A promise that resolves to the stats data.
     * @throws {Error} If the request fails.
     */
    static async fetchStatsData({orchestrator, pipeline, model, isAIType}) {
        // console.log("DataService - fetchStatsData data", orchestrator, pipeline, model, isAIType);
        const endpoint = isAIType ? aiPerfStatsURL : perfStatsURL;
        let url = `${endpoint}?orchestrator=${orchestrator}`;

        if (isAIType && !(!model || !pipeline)) {
            url += `&pipeline=${pipeline}&model=${model}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch stats data');
        }
        return response.json();
    }
}

export default DataService;
