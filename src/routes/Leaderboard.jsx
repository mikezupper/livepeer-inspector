import React, {useEffect, useState} from 'react';
import {useLoaderData, useNavigate, useSearchParams} from 'react-router-dom';


import {
    Avatar,
    Box,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import {Visibility} from "@mui/icons-material";

import {DataGrid} from "@mui/x-data-grid";

import DataService from '../api/DataService';
import {formatEthAddress, valueFormatter} from "../utils.jsx";

/**
 * Leaderboard component for displaying aggregated stats based on selected pipeline, model, and region.
 * @returns {JSX.Element} The rendered Leaderboard component.
 */
function Leaderboard() {
    const {regions, pipelines} = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [leaderboardData, setLeaderboardData] = useState(null);

    const selectedRegion = searchParams.get('region') || '';
    const selectedPipeline = searchParams.get('pipeline') || '';
    const selectedModel = searchParams.get('model') || '';
    const isAIType = (selectedPipeline !=='' && selectedModel !=='');

    let regionsDetail = isAIType ? regions.regions.filter((region) => region.type === "ai") : regions.regions.filter((region) => region.type !== "ai")

    // console.log("Leaderboard",regionsDetail,selectedModel,selectedRegion,selectedPipeline,isAIType);

    /**
     * Updates the search parameters in the URL.
     * @param {string} param - The parameter name to update.
     * @param {string} value - The new value for the parameter.
     */
    const handleParamChange = (param, value) => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            if (param === 'pipeline') {
                newParams.delete('model'); // Remove the model parameter when pipeline changes
            }

            if (value) {
                newParams.set(param, value);
            } else {
                newParams.delete(param);
            }
            return newParams;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            // console.log("Leaderboard fetchData",selectedRegion,selectedPipeline,selectedModel,isAIType);
            let input = {isAIType};

            try {
                if (selectedRegion) {
                    input = {...input, region: selectedRegion}
                }

                if (isAIType) {
                    input = {
                        ...input,
                        pipeline: selectedPipeline, model: selectedModel
                    }
                }

                const data = await DataService.fetchLeaderboardData(input);
                setLeaderboardData(data);
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            }
        };

        fetchData();
    }, [selectedPipeline, selectedModel, selectedRegion]);

    const models = pipelines.find(p => p.id === selectedPipeline)?.models || [];


    const renderCell = (params) => {
        const {orchestrator} = params.row;
        if (!orchestrator) return null;

        const ethAddress = orchestrator.eth_address;
        const name = orchestrator.name || formatEthAddress(ethAddress);
        const avatar = orchestrator.avatar;

        return (
            <>
                <Link
                    href={`https://tools.livepeer.cloud/orchestrator/${ethAddress}`}
                    target="_blank"
                    underline="none"
                    sx={{display: 'flex', alignItems: 'center', mt: 1}}
                >
                    <Avatar
                        src={avatar}
                        alt={name}
                        sx={{width: 24, height: 24, mr: 1, mt: 1}}
                    />
                    <Typography variant="body2">{name}</Typography>
                </Link>
            </>
        );
    }
    const renderStatsCell = (params) => {
        const {orchestrator} = params.row;
        if (!orchestrator) return null;

        const ethAddress = orchestrator.eth_address;

        return (
            <IconButton
                onClick={() =>
                    navigate(`/stats?orchestrator=${ethAddress}&model=${selectedModel}&pipeline=${selectedPipeline}`)
                }
            >
                <Visibility/>
            </IconButton>
        );
    }

    return (
        <>
            <Box p={3}>
                <Typography variant="h5" gutterBottom sx={{mb: 2}}>
                    {isAIType ? "AI" : "Transcoding"} Performance Leaderboard
                </Typography>
                <Grid container spacing={2} sx={{mb: 2}}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="region-label">Select Region</InputLabel>
                            <Select
                                labelId="region-label"
                                value={selectedRegion}
                                label="Select Region"
                                onChange={(e) => handleParamChange('region', e.target.value)}
                            >
                                {regionsDetail.map((r, index) => (
                                    <MenuItem key={`${r}-${index}`} value={r.id}>
                                        {r.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth disabled={!pipelines}>
                            <InputLabel id="pipeline-label">Select Pipeline</InputLabel>
                            <Select
                                labelId="pipeline-label"
                                value={selectedPipeline || ""}
                                label="Select Pipeline"
                                onChange={(e) =>handleParamChange('pipeline', e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>None (Transcoding)</em>
                                </MenuItem>
                                {pipelines.map((pipeline) => (
                                    <MenuItem key={pipeline.id} value={pipeline.id}>
                                        {pipeline.id}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth disabled={!selectedPipeline}>
                            <InputLabel id="model-label">Select Model</InputLabel>
                            <Select
                                labelId="model-label"
                                value={isAIType ? selectedModel : ""}
                                label="Select Model"
                                onChange={(e) => handleParamChange('model', e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {models.map((model, index) => (
                                    <MenuItem key={`${index}-${model.name}`} value={model}>
                                        {model}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>


                <Box sx={{height: "100%", width: "100%", mt: 3}}>
                    <DataGrid
                        rowHeight={45}
                        rows={leaderboardData}
                        columns={[
                            {field: "orchestrator", headerName: "Orchestrator", flex: 1, renderCell},
                            {field: "totalScore", headerName: "Total Score", flex: 1, sortable: true, valueFormatter},
                            {
                                field: "successRate",
                                headerName: "Success Rate (%)",
                                flex: 1,
                                sortable: true,
                                valueFormatter
                            },
                            {
                                field: "latencyScore",
                                headerName: "Latency Score",
                                flex: 1,
                                sortable: true,
                                valueFormatter
                            },
                            {
                                field: "viewStats",
                                headerName: "View Stats",
                                flex: 1,
                                sortable: false,
                                renderCell: renderStatsCell,
                            }
                        ]}
                        pageSizeOptions={[20]}
                        initialState={{
                            pagination: {
                                paginationModel: {pageSize: 20, page: 0},
                            },
                            sorting: {
                                sortModel: [{field: 'totalScore', sort: 'desc'}],
                            },
                        }}
                    />
                </Box>
            </Box>
            {/*<h2>Leaderboard</h2>*/}

            {/*<select value={selectedPipeline} onChange={(e) => handleParamChange('pipeline', e.target.value)}>*/}
            {/*    <option value="">Select Pipeline</option>*/}
            {/*    {pipelines.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}*/}
            {/*</select>*/}

            {/*<select value={selectedModel} onChange={(e) => handleParamChange('model', e.target.value)}>*/}
            {/*    <option value="">Select Model</option>*/}
            {/*    {models.map(m => <option key={m} value={m}>{m}</option>)}*/}
            {/*</select>*/}

            {/*<select value={selectedRegion} onChange={(e) => handleParamChange('region', e.target.value)}>*/}
            {/*    <option value="">Select Region</option>*/}
            {/*    {regionsDetail.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}*/}
            {/*</select>*/}

            {/*<div>*/}
            {/*    {leaderboardData ? (*/}
            {/*        <pre>{JSON.stringify(leaderboardData, null, 2)}</pre>*/}
            {/*    ) : (*/}
            {/*        <p>Loading leaderboard data...</p>*/}
            {/*    )}*/}
            {/*</div>*/}
        </>
    );
}

export default Leaderboard;
