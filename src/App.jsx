import React, { useState, useEffect } from "react";
import {
    Tabs,
    Tab,
    Grid,
    TextField,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Box,
    Typography,
    Button,
} from "@mui/material";

const App = () => {
    const [tabIndex, setTabIndex] = useState(0);

    // Dropdown options
    const [pipelines, setPipelines] = useState([]);
    const [models, setModels] = useState([]);
    const [regions, setRegions] = useState([]);

    // Form states
    const [selectedPipeline, setSelectedPipeline] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [orchestratorAddress, setOrchestratorAddress] = useState("");

    // Performance data
    const [performanceData, setPerformanceData] = useState([]);

    useEffect(() => {
        // Fetch pipelines and regions data
        const fetchData = async () => {
            try {
                const pipelinesResponse = await fetch(
                    "https://lpc-leaderboard-serverless.vercel.app/api/pipelines"
                );
                const regionsResponse = await fetch(
                    "https://lpc-leaderboard-serverless.vercel.app/api/regions"
                );

                const pipelinesData = await pipelinesResponse.json();
                const regionsData = await regionsResponse.json();

                setPipelines(pipelinesData.pipelines);
                setRegions(regionsData.regions);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handlePipelineChange = (pipelineId) => {
        setSelectedPipeline(pipelineId);

        // Update models based on selected pipeline
        const pipeline = pipelines.find((p) => p.id === pipelineId);
        if (pipeline) {
            setModels(pipeline.models);
        } else {
            setModels([]);
        }
    };

    const fetchPerformanceData = async () => {
        if (!orchestratorAddress || !selectedModel || !selectedPipeline) {
            alert("Please fill in all form inputs.");
            return;
        }

        try {
            const response = await fetch(
                `https://lpc-leaderboard-serverless.vercel.app/api/aggregated_stats?orchestrator=${orchestratorAddress}&model=${encodeURIComponent(
                    selectedModel
                )}&pipeline=${encodeURIComponent(selectedPipeline)}`
            );

            const data = await response.json();
            setPerformanceData(data);
        } catch (error) {
            console.error("Error fetching performance data:", error);
            alert("Failed to fetch performance data.");
        }
    };

    const handleTabChange = (event, newIndex) => setTabIndex(newIndex);

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tabIndex} onChange={handleTabChange} centered>
                    <Tab label="Orchestrator Performance Stats" />
                    <Tab label="Orchestrator Performance Leaderboard" />
                </Tabs>
            </Box>
            {tabIndex === 0 && (
                <Box p={3}>
                    <Typography variant="h5" gutterBottom>
                        Orchestrator Performance Stats
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                            <Select
                                fullWidth
                                value={selectedPipeline}
                                onChange={(e) => handlePipelineChange(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">Select Pipeline</MenuItem>
                                {pipelines.map((pipeline) => (
                                    <MenuItem key={pipeline.id} value={pipeline.id}>
                                        {pipeline.id}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={4}>
                            <Select
                                fullWidth
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">Select Model</MenuItem>
                                {models.map((model, index) => (
                                    <MenuItem key={index} value={model}>
                                        {model}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Orchestrator Address"
                                placeholder="Enter Orchestrator Address"
                                value={orchestratorAddress}
                                onChange={(e) => setOrchestratorAddress(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={fetchPerformanceData}
                    >
                        Fetch Performance Data
                    </Button>
                    {performanceData.length > 0 && (
                        <Table sx={{ mt: 3 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Region</TableCell>
                                    <TableCell>Success Rate</TableCell>
                                    <TableCell>Round Trip Time</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(performanceData).map(
                                    ([region, stats], index) => (
                                        <TableRow key={index}>
                                            <TableCell>{region}</TableCell>
                                            <TableCell>{stats.success_rate}</TableCell>
                                            <TableCell>{stats.round_trip_time}</TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    )}
                </Box>
            )}
            {tabIndex === 1 && (
                <Box p={3}>
                    <Typography variant="h5" gutterBottom>
                        Orchestrator Performance Leaderboard
                    </Typography>
                    {/* Placeholder for leaderboard implementation */}
                    <Typography variant="body1">
                        Leaderboard functionality goes here.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default App;
