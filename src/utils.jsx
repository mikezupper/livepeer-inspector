import {Typography} from "@mui/material";
import React from "react";

export const valueFormatter = (params) => params.toFixed(2);

export const formatEthAddress = (address) => {
    if (address && address.length === 42 && address.startsWith('0x')) {
        return `${address.substring(2, 8)}...${address.substring(38)}`;
    }
    return address;
};

export const renderDecimalCell = (params) => params.value ? (<Typography variant="inherit">{params.value.toFixed(2)}</Typography>) : ( <Typography variant="inherit">0.00</Typography> )
export const renderTimestampCell = (params) => {
    let dateTime = new Date(params.value  * 1000).toLocaleString('en-US', { hour12: false});
    dateTime = dateTime.split(',').join('');
    return (
        <Typography variant="inherit">
            {dateTime}
        </Typography>
    )
}

export     const updateSearchParams = (router,updates) => {
    router.navigate({
        to: '.',
        search: (prev) => {
            const updatedSearch = { ...prev, ...updates };

            // Remove keys with empty values
            Object.keys(updatedSearch).forEach((key) => {
                if (!updatedSearch[key]) {
                    delete updatedSearch[key];
                }
            });

            return updatedSearch;
        },
    });
};
