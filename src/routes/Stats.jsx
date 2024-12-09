import React, {useEffect, useState} from 'react';
import {useLoaderData, useSearchParams} from 'react-router-dom';
import {Box, FormControl, Grid, InputLabel, MenuItem, Modal, Select, TextField, Typography,} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";

import {renderDecimalCell, renderTimestampCell} from "../utils";
import DataService from '../api/DataService';

/**
 * Stats component for displaying raw stats based on orchestrator, pipeline, and model selections.
 * @returns {JSX.Element} The rendered Stats component.
 */
function Stats() {
    const {pipelines} = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();
    const [statsData, setStatsData] = useState(null);

    const orchestrator = searchParams.get('orchestrator') || '';
    const selectedPipeline = searchParams.get('pipeline') || '';
    const selectedModel = searchParams.get('model') || '';
    const isAIType = (selectedPipeline !=='' && selectedModel !=='');

    const [openModal, setOpenModal] = useState(false);
    const [modalContent, setModalContent] = useState("");

    const handleOpenModal = (content) => {
        setModalContent(content);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setModalContent("");
    };

    /**
     * Updates the search parameters in the URL.
     * @param {string} param - The parameter name to update.
     * @param {string} value - The new value for the parameter.
     */
    const handleParamChange = (param, value) => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            if (value) {
                newParams.set(param, value);
            } else {
                newParams.delete(param);
            }
            return newParams;
        });
    };

    useEffect(() => {
        /**
         * Fetches the stats data based on the current selections.
         */
        const fetchData = async () => {
            let input = {orchestrator, isAIType};
            try {

                if (!orchestrator) {
                    setStatsData([]);
                    return;
                }

                if (isAIType) {
                    input = {
                        ...input,
                        pipeline: selectedPipeline, model: selectedModel
                    }
                }

                const data = await DataService.fetchStatsData(input);
                setStatsData(data);
            } catch (error) {
                console.error('Error fetching stats data:', error);
            }
        };

        fetchData();
    }, [orchestrator, selectedPipeline, selectedModel]);

    const pipeline = pipelines ? pipelines.find((p) => p.id === selectedPipeline) : undefined;
    const models = (pipeline ? pipeline.models : []);
    console.log("Stats ", selectedPipeline, selectedModel, orchestrator, pipeline, models, statsData)

// Prepare data for DataGrid
    const prepareDataGrid = () => {
        if (!statsData) return {columns: [], rows: []};

        const rows = [];
        Object.entries(statsData).forEach(([region, records]) => {
            records.forEach((record, index) => {
                const data = {
                    id: `${region}-${index}`,
                    region: region,
                    timestamp: record.timestamp,
                    success_rate: record.success_rate !== undefined ? record.success_rate : 0,
                    round_trip_time: record.round_trip_time !== undefined ? record.round_trip_time : 0,
                    pipeline: record.pipeline || "",
                    model: record.model || "",
                    model_is_warm: record.model_is_warm ? "Yes" : "No",
                    segments_sent: record.segments_sent || 0,
                    segments_received: record.segments_received || 0,
                    seg_duration: record.seg_duration !== undefined ? record.seg_duration : 0.00,
                    upload_time: record?.upload_time !== undefined ? record.upload_time : 0.00,
                    download_time: record?.download_time !== undefined ? record.download_time : 0.00,
                    transcode_time: record?.transcode_time !== undefined ? record.transcode_time : 0.00,
                    errors: record.errors,
                    input_parameters: record.input_parameters,
                    response_payload: record.response_payload,
                };
                const fast = data.seg_duration > data.round_trip_time;
                const isRealTime = fast && data.success_rate ? 'Yes' : 'No';
                rows.push({...data, real_time: isRealTime});
            });
        });

        let columns = [];
        if (isAIType) {
            // AI Performance Data Columns
            columns = [
                {field: "region", headerName: "Region", flex: 1},
                {
                    field: "timestamp", headerName: "Time", flex: 1,
                    renderCell: renderTimestampCell
                },
                {
                    field: "success_rate",
                    headerName: "Passed",
                    sortable: false,
                    flex: 1
                    ,
                    renderCell: (params) => (
                        <Typography variant="inherit">{params.value == 1 ? "Yes" : "No"}</Typography>)
                },
                {
                    field: "round_trip_time", headerName: "Round Trip Time", sortable: false, flex: 1,
                    renderCell: renderDecimalCell
                },
                {field: "model_is_warm", headerName: "Model Warm", sortable: false, flex: 1},
                {
                    field: "input_parameters", headerName: "Inputs", flex: 1, sortable: false,
                    renderCell: (params) => params.value ? (<Typography variant="inherit"
                                                                        onClick={() => handleOpenModal(JSON.parse(params.value))}>View</Typography>) : (""),
                },
                {
                    field: "response_payload", headerName: "Response", flex: 1, sortable: false,
                    renderCell: (params) => params.value ? (<Typography variant="inherit"
                                                                        onClick={() => handleOpenModal(JSON.parse(params.value))}>View</Typography>) : (""),
                },
            ];
        } else {
            // Transcoding Performance Data Columns
            columns = [
                {field: "region", headerName: "Region", flex: 1, maxWidth: 70},
                {
                    field: "timestamp", headerName: "Time", flex: 1, minWidth: 170,
                    renderCell: renderTimestampCell
                },
                {
                    field: "real_time", headerName: "RealTime", sortable: false, flex: 1, maxWidth: 85,
                    renderCell: params => (<Typography variant="inherit">{params.value}</Typography>)
                },
                {
                    field: "transcode_time", headerName: "Transcode", sortable: false, flex: 1,
                    renderCell: renderDecimalCell
                },
                {
                    field: "upload_time", headerName: "Upload", sortable: false, flex: 1,
                    renderCell: renderDecimalCell
                },
                {
                    field: "download_time", headerName: "Download", sortable: false, flex: 1,
                    renderCell: renderDecimalCell
                },
                {
                    field: "round_trip_time", headerName: "Round Trip", sortable: false, flex: 1,
                    renderCell: renderDecimalCell
                },
                {
                    field: "seg_duration", headerName: "Segment Duration", sortable: false, flex: 1,
                    renderCell: renderDecimalCell
                },
                {
                    field: "segments_received", headerName: "Segments Received", sortable: false, flex: 1,
                    renderCell: (params) => (<Typography variant="inherit">{params.value}/60</Typography>)
                },
            ];
        }

        return {columns, rows};
    };
    const {columns, rows} = prepareDataGrid();
    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom>
                {isAIType ? "AI" : "Transcoding"} Performance Stats
            </Typography>
            <Grid container spacing={2} sx={{mb: 2, mt: 2}}>
                {/* Orchestrator Address Input */}
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        label="Orchestrator Address"
                        placeholder="Enter Orchestrator Address"
                        value={orchestrator}
                        onChange={
                            (e) => {
                                handleParamChange('orchestrator', e.target.value)
                            }
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth disabled={!pipelines}>
                        <InputLabel id="pipeline-label">Select Pipeline</InputLabel>
                        <Select
                            labelId="pipeline-label"
                            value={selectedPipeline || ""}
                            label="Select Pipeline"
                            onChange={
                                (e) => {
                                    handleParamChange('pipeline', e.target.value)
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
                    <FormControl fullWidth disabled={!selectedPipeline}>
                        <InputLabel id="model-label">Select Model</InputLabel>
                        <Select
                            labelId="model-label"
                            value={isAIType ? selectedModel : ""}
                            label="Select Model"
                            onChange={
                                (e) => {
                                    handleParamChange('model', e.target.value)
                                }
                            }
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
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[20]}
                    initialState={{
                        pagination: {
                            paginationModel: {pageSize: 20, page: 0},
                        },
                        sorting: {
                            sortMode: [{field: 'timestamp', sort: 'desc'}],
                        },
                    }}
                    autosizeOptions={{
                        columns: ['time', 'real_time', 'region'],
                        includeOutliers: true,
                        includeHeaders: false,
                    }}

                    getRowClassName={(params) =>
                        params.row.success_rate === 0 ? "row-failed-test" : ""
                    }
                />
            </Box>

            {/* Modal Component for Details */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        border: "2px solid #000",
                        boxShadow: 24,
                        p: 4,
                        width: 600,
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }}
                >
                    <Typography id="modal-description" sx={{mt: 2}}>
                        {JSON.stringify(modalContent, null, 2)}
                    </Typography>
                </Box>
            </Modal>
        </Box>
    );
}

export default Stats;
