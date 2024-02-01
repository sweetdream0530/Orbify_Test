import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Container, TextField, Button, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function App() {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [aoiFile, setAoiFile] = useState(null);
    const [aoiData, setAoiData] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', projectName);
        formData.append('description', description);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('areaOfInterest', aoiFile);

        try {
            await axios.post('http://localhost:5000/api/projects', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSnackbarMessage('Project created successfully');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (error) {
            console.error('Error creating project:', error.response);
            setSnackbarMessage('Error creating project. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleAoiChange = (event) => {
        setAoiFile(event.target.files[0]);
        const reader = new FileReader();
        reader.onload = (e) => {
            setAoiData(JSON.parse(e.target.result));
        };
        reader.readAsText(event.target.files[0]);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Container maxWidth="sm">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                <TextField label="Project Name" variant="outlined" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                <TextField
                    label="Description"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <TextField
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />
                <TextField
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />
                <Button variant="contained" component="label">
                    Upload Area of Interest
                    <input type="file" hidden onChange={handleAoiChange} accept=".json" required />
                </Button>
                <Button type="submit" variant="contained" color="primary">
                    Create Project
                </Button>
            </form>
            {aoiData && (
                <MapContainer style={{ height: "400px", width: "100%", marginTop: '20px', marginBottom:'20px' }} center={[53.92370190337397, 17.86555225013043]} zoom={13}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polygon positions={aoiData.geometry.coordinates[0].map(coord => [coord[1], coord[0]])} />
                </MapContainer>
            )}
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default App;
