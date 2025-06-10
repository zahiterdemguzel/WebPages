// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Make sure to have 'node-fetch' installed: npm install node-fetch

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- NEW ---
// Serve static files from the 'public' directory at the root level.
// This makes files like /files/sedus.glb accessible.
// This should come BEFORE the dynamic routes setup.
const publicPath = path.join(__dirname, 'public');
console.log(`- Serving static files from root at: ${publicPath}`);
app.use(express.static(publicPath));


// Store information about detected pages
const detectedPages = [];

// API endpoint for detected pages
app.get('/api/pages', (req, res) => {
    if (detectedPages.length === 0) {
        console.warn('API /api/pages requested, but detectedPages is empty. This might indicate issues with setupDynamicRoutes or no websites found.');
    }
    res.json(detectedPages);
});

/**
 * Scans the 'WEBPAGES' directory for subfolders, treating each as a potential website.
 * Sets up static file serving and backend routes for each detected website.
 */
function setupDynamicRoutes() {
    console.log('Scanning for websites...');
    const currentDir = __dirname;
    const webpagesRoot = path.join(currentDir, 'WEBPAGES');

    if (!fs.existsSync(webpagesRoot) || !fs.statSync(webpagesRoot).isDirectory()) {
        console.error(`Error: 'WEBPAGES' directory not found or is not a directory at "${webpagesRoot}". Please create it.`);
        return;
    }

    try {
        const dirents = fs.readdirSync(webpagesRoot, { withFileTypes: true });

        dirents.forEach(dirent => {
            if (dirent.isDirectory() && !['node_modules', '.git', '.vscode'].includes(dirent.name)) {
                const folderName = dirent.name;
                const folderPath = path.join(webpagesRoot, folderName);
                let backendFilePath = path.join(folderPath, 'backend.js');
                let hasBackend = fs.existsSync(backendFilePath);

                // If backend.js doesn't exist, check for a single other .js file
                if (!hasBackend) {
                    try {
                        const filesInFolder = fs.readdirSync(folderPath);
                        const jsFiles = filesInFolder.filter(file => file.endsWith('.js') && file !== 'backend.js');

                        if (jsFiles.length === 1) {
                            backendFilePath = path.join(folderPath, jsFiles[0]);
                            hasBackend = true;
                            console.log(`- No backend.js found in ${folderName}. Using ${jsFiles[0]} as the backend file.`);
                        } else if (jsFiles.length > 1) {
                            console.warn(`- Warning: Multiple .js files found in ${folderName} and no explicit backend.js. Skipping backend detection.`);
                        }
                    } catch (error) {
                        console.error(`- Error reading files in ${folderName} for backend detection:`, error.message);
                    }
                }

                detectedPages.push({
                    name: folderName,
                    hasBackend: hasBackend
                });

                // Check for index.html or a single other HTML file
                const indexHtmlPath = path.join(folderPath, 'index.html');
                if (!fs.existsSync(indexHtmlPath)) {
                    try {
                        const filesInFolder = fs.readdirSync(folderPath);
                        const htmlFiles = filesInFolder.filter(file => file.endsWith('.html'));

                        if (htmlFiles.length === 1) {
                            const defaultHtmlFile = htmlFiles[0];
                            console.log(`- No index.html found in ${folderName}. Using ${defaultHtmlFile} as default.`);
                            app.get(`/${folderName}`, (req, res) => {
                                res.sendFile(path.join(folderPath, defaultHtmlFile));
                            });
                        } else if (htmlFiles.length > 1) {
                            console.warn(`- Warning: Multiple HTML files in ${folderName} and no index.html. Defaulting to standard static serving.`);
                        } else {
                            console.warn(`- Warning: No HTML files found in ${folderName}.`);
                        }
                    } catch (error) {
                        console.error(`- Error reading files in ${folderName} for HTML detection:`, error.message);
                    }
                }

                // Serve static files for this folder at /folderName
                app.use(`/${folderName}`, express.static(folderPath));
                console.log(`- Serving static files for /${folderName} from ${folderPath}`);

                // If a backend file exists, load it as a router
                if (hasBackend) {
                    try {
                        const backendRouter = require(backendFilePath);
                        if (typeof backendRouter === 'function') {
                            app.use(`/${folderName}`, backendRouter);
                            console.log(`- Mounted backend router for /${folderName} from ${backendFilePath}`);
                        } else {
                            console.warn(`- Warning: ${backendFilePath} exists but does not export an Express Router. Skipping backend.`);
                        }
                    } catch (error) {
                        console.error(`- Error loading backend for /${folderName} from ${backendFilePath}:`, error.message);
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Error during initial scan of WEBPAGES directory:`, error.message);
    }
    console.log('Website scanning complete.');
}

// Call the function to set up routes when the server starts
setupDynamicRoutes();

// Serve the main index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Self-ping feature for Render.com free tier
const RENDER_EXTERNAL_HOSTNAME = process.env.RENDER_EXTERNAL_HOSTNAME;
if (RENDER_EXTERNAL_HOSTNAME) {
    const PING_INTERVAL = 5 * 60 * 1000; // Ping every 5 minutes
    setInterval(() => {
        const url = `https://${RENDER_EXTERNAL_HOSTNAME}/api/pages`; // Use https for Render
        fetch(url)
            .then(res => {
                if (res.ok) {
                    console.log(`Self-ping successful to ${url} at ${new Date().toLocaleString()}`);
                } else {
                    console.error(`Self-ping failed to ${url} with status: ${res.status}`);
                }
            })
            .catch(error => {
                console.error(`Error during self-ping to ${url}:`, error.message);
            });
    }, PING_INTERVAL);
    console.log(`Self-ping enabled to ${RENDER_EXTERNAL_HOSTNAME} every ${PING_INTERVAL / 1000 / 60} minutes.`);
} else {
    console.log('Self-ping not enabled (RENDER_EXTERNAL_HOSTNAME not found, likely running locally).');
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Detected pages:', detectedPages.map(p => p.name).join(', ') || 'None');
    console.log('----------------------------------------------------');
    console.log('To add a new website:');
    console.log('1. Create a new folder (e.g., "my-new-site") inside the "WEBPAGES" folder.');
    console.log('2. Inside "my-new-site", add an "index.html" file for the frontend (or a single other .html file).');
    console.log('3. (Optional) For a backend, add a "backend.js" file that exports an Express Router (e.g., `module.exports = router;`).');
    console.log('   Alternatively, if no `backend.js` is present, a single other `.js` file will be used as backend.');
    console.log('4. Commit changes and trigger a new deploy on Render.');
    console.log('----------------------------------------------------');
});
