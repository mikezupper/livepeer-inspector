import React from "react";
import { Avatar, Box, FormControl, Grid, InputLabel, Link, MenuItem, Select, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import { Visibility } from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";
import {getRouteApi, useRouter} from "@tanstack/react-router";

import {formatEthAddress, updateSearchParams, valueFormatter} from "../utils";

const LeaderboardTab = () => {
    const routeApi = getRouteApi('/')
    const loaderData = routeApi.useLoaderData()
    console.log("LeaderboardTab loader data", loaderData);
    const router = useRouter();
    const {model,pipeline,region,leaderboard,models, regions, pipelines,isAi} =loaderData;
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
                sx={{display: 'flex', alignItems: 'center', mt:1}}
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
    const handleViewStats = (ethAddress, model, pipeline) => {
        router.navigate({
            to: '/stats',
            search: { orchestrator: ethAddress, model, pipeline },
        });
    };

    const renderStatsCell = (params) => {
        const { orchestrator } = params.row;
        if (!orchestrator) return null;

        const ethAddress = orchestrator.eth_address;

        return (
            <IconButton
                onClick={() =>
                    handleViewStats(
                        ethAddress,
                        model,
                        pipeline
                    )
                }
            >
                <Visibility />
            </IconButton>
        );
    }
    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom sx={{mb: 2}}>
                {isAi ? "AI": "Transcoding"} Performance Leaderboard
            </Typography>
            <Grid container spacing={2} sx={{mb: 2}}>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel id="region-label">Select Region</InputLabel>
                        <Select
                            labelId="region-label"
                            value={region ||""}
                            label="Select Region"
                            onChange={
                                (e) =>{
                                    e.preventDefault()
                                    const selected = e.target.value;
                                    updateSearchParams(router,{
                                        region: selected,
                                    });
                                }
                            }
                        >
                            {regions.map((region, index) => (
                                <MenuItem key={`${region}-${index}`} value={region.id}>
                                    {region.name}
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
                            value={pipeline || ""}
                            label="Select Pipeline"
                            onChange={
                                (e) =>{
                                    e.preventDefault()
                                    const selected = e.target.value;
                                    updateSearchParams(router,{
                                        pipeline: selected,
                                        model: ""
                                    });
                                }
                            }
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
                        <FormControl fullWidth  disabled={!pipeline}>
                            <InputLabel id="model-label">Select Model</InputLabel>
                            <Select
                                labelId="model-label"
                                value={isAi ? model : ""}
                                label="Select Model"
                                onChange={
                                    (e) =>{
                                        e.preventDefault()
                                        const selected = e.target.value;
                                        updateSearchParams(router,{
                                            model: selected,
                                        });
                                    }
                                }
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {models.map((model,index) => (
                                    <MenuItem key={`${index}-${model.name}`} value={model}>
                                        {model}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
            </Grid>
            <Box sx={{height: "100%", width: "100%", mt: 3}} >
                    <DataGrid
                        rowHeight={45}
                        rows={leaderboard}
                        columns={[
                            {field: "orchestrator", headerName: "Orchestrator", flex: 1, renderCell},
                            {field: "totalScore", headerName: "Total Score", flex: 1, sortable: true, valueFormatter},
                            {field: "successRate",headerName: "Success Rate (%)",flex: 1,sortable: true,valueFormatter},
                            {field: "latencyScore",headerName: "Latency Score",flex: 1,sortable: true,valueFormatter},
                            {field: "viewStats",headerName: "View Stats",flex: 1,sortable: false,renderCell: renderStatsCell,}
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
    );
};

export default LeaderboardTab;
