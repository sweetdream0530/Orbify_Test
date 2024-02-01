const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const geojsonhint = require('@mapbox/geojsonhint');

const app = express();
const port = 5000;
app.use(cors());

const upload = multer({ dest: 'uploads/' }); // Configures Multer to save uploaded files

app.post('/api/projects', upload.single('areaOfInterest'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).send({ message: 'Internal server error reading AOI file.' });
        }

        try {
            const geoJson = JSON.parse(data);
            const errors = geojsonhint.hint(geoJson);

            if (errors.length > 0) {
                return res.status(400).send({ message: 'Invalid AOI: GeoJSON is not valid.', errors: errors });
            }

            res.send({ message: 'Project created successfully' });
        } catch (parseError) {
            console.error('Error parsing the file:', parseError);
            res.status(400).send({ message: 'Invalid AOI: File is not valid GeoJSON.' });
        } finally {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting the file:', unlinkErr);
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
