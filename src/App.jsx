import React from 'react';
import {Link, Outlet} from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import {CssBaseline, Stack} from '@mui/material';

import {createTheme, ThemeProvider} from '@mui/material/styles';
import "./styles/App.css"


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

/**
 * The main App component that provides navigation and renders child routes.
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
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
                            <Link to="/leaderboard">
                                <Button variant="outlined" color="inherit">
                                    Leaderboard
                                </Button>
                            </Link>
                            <Link to="/stats">
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
}

export default App;