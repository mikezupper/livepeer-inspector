import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import {CssBaseline, Stack} from '@mui/material';
import {Outlet,Link} from "@tanstack/react-router";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import "./App.css"
const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                outlined: {
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                        borderColor: 'lightgray',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                },
            },
        },
    },
});

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <AppBar position="static">
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <Typography variant="h6" style={{flexGrow: 1}}>
                            Orchestrator Performance
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Link to="/" activeOptions={{ exact: true }}>
                            <Button variant="outlined" color="inherit">
                                Leaderboard
                            </Button>
                            </Link>
                            <Link to="/stats" activeOptions={{ exact: true }}>
                                <Button variant="outlined" color="inherit">
                                    Stats
                                </Button>
                            </Link>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>
            <Container maxWidth="lg">
                <Outlet/>
            </Container>
        </ThemeProvider>
    );
};

export default App;
