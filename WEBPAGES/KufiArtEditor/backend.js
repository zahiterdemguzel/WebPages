const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router(); // Use Express Router for modularity

// Enable CORS for all routes (important for local development/testing)
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Define the base path for this sub-site.
// Assuming this backend.js is located in WEBPAGES/KufiArtEditor/backend.js
// And static files (like index.html) are in WEBPAGES/KufiArtEditor/
const KufiArtEditorBasePath = path.join(__dirname); // This points to WEBPAGES/KufiArtEditor/

// Serve static files for the KufiArtEditor sub-site
// For example, if your HTML is at /WEBPAGES/KufiArtEditor/index.html
// and this backend.js is also in WEBPAGES/KufiArtEditor/
router.use(express.static(KufiArtEditorBasePath));

// Define the path to the templates directory relative to the KufiArtEditorBasePath
// This means templates should be in WEBPAGES/KufiArtEditor/templates/
const templatesDir = path.join(KufiArtEditorBasePath, 'templates');

// Ensure the templates directory exists
if (!fs.existsSync(templatesDir)) {
    console.warn(`Templates directory not found at: ${templatesDir}. Creating it.`);
    fs.mkdirSync(templatesDir, { recursive: true });
    // Optionally, add some placeholder .obj files here for testing
    // For example:
    // fs.writeFileSync(path.join(templatesDir, 'cube.obj'), 'v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4');
    // fs.writeFileSync(path.join(templatesDir, 'pyramid.obj'), 'v 0 0 0\nv 1 0 0\nv 0.5 1 0\nf 1 2 3');
}

// API endpoint to list available OBJ templates
// This endpoint will be accessible at /KufiArtEditor/api/templates
router.get('/api/templates', (req, res) => {
    fs.readdir(templatesDir, (err, files) => {
        if (err) {
            console.error('Error reading templates directory:', err);
            return res.status(500).json({ error: 'Unable to list templates' });
        }

        const objFiles = files.filter(file => file.endsWith('.obj'));
        res.json(objFiles);
    });
});

// API endpoint to serve a specific OBJ template file
// This endpoint will be accessible at /KufiArtEditor/api/templates/:filename
router.get('/api/templates/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(templatesDir, filename);

    // Security check: Prevent directory traversal by ensuring the file is within the templates directory
    if (!filePath.startsWith(templatesDir)) {
        return res.status(400).json({ error: 'Invalid file path' });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filename}:`, err);
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'Template not found' });
            }
            return res.status(500).json({ error: 'Error reading template file' });
        }
        res.setHeader('Content-Type', 'text/plain'); // OBJ files are text
        res.send(data);
    });
});

// Export the router to be used by a main Express application
module.exports = router;
