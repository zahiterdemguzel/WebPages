// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');  

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store information about detected pages
const detectedPages = [];

// NEW: Define the API endpoint for detected pages early
// This ensures it's registered before any dynamic static serving,
// though technically it shouldn't conflict given the paths.
app.get('/api/pages', (req, res) => {
    // Ensure detectedPages is populated before sending
    if (detectedPages.length === 0) {
        console.warn('API /api/pages requested, but detectedPages is empty. This might indicate issues with setupDynamicRoutes or no websites found.');
    }
    res.json(detectedPages);
});

/**
 * Scans the current directory for subfolders, treating each as a potential website.
 * Determines if a website has a backend based on the presence of a 'backend.js' file
 * or a single other .js file.
 * Sets up static file serving and backend routes for each detected website.
 */
function setupDynamicRoutes() {
    console.log('Scanning for websites...');
    const currentDir = __dirname;
    // IMPORTANT CHANGE HERE: Point to the WEBPAGES directory
    const webpagesRoot = path.join(currentDir, 'WEBPAGES');

    // Verify that the WEBPAGES directory exists
    if (!fs.existsSync(webpagesRoot)) {
        console.error(`Error: 'WEBPAGES' directory not found at "${webpagesRoot}". Please create it.`);
        return; // Exit the function if the main content directory is missing
    }
    if (!fs.statSync(webpagesRoot).isDirectory()) {
        console.error(`Error: "${webpagesRoot}" is not a directory.`);
        return;
    }

    try {
        // Read all entries within the WEBPAGES directory
        const dirents = fs.readdirSync(webpagesRoot, { withFileTypes: true });

        dirents.forEach(dirent => {
            // Only process directories that are not 'node_modules', '.git', or '.vscode'
            if (dirent.isDirectory() && dirent.name !== 'node_modules' && dirent.name !== '.git' && dirent.name !== '.vscode') {
                const folderName = dirent.name;
                // Construct path relative to the WEBPAGES root
                const folderPath = path.join(webpagesRoot, folderName);
                let backendFilePath = path.join(folderPath, 'backend.js');
                let hasBackend = fs.existsSync(backendFilePath);

                // If backend.js doesn't exist, check for a single other .js file
                if (!hasBackend) {
                    try {
                        const filesInFolder = fs.readdirSync(folderPath);
                        const jsFiles = filesInFolder.filter(file => file.endsWith('.js') && file !== 'backend.js'); // Exclude 'backend.js' if it somehow got in filter

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
                let defaultHtmlFile = 'index.html'; // Assume index.html by default

                if (!fs.existsSync(indexHtmlPath)) {
                    // If index.html doesn't exist, look for a single other HTML file
                    try {
                        const filesInFolder = fs.readdirSync(folderPath);
                        const htmlFiles = filesInFolder.filter(file => file.endsWith('.html'));

                        if (htmlFiles.length === 1) {
                            defaultHtmlFile = htmlFiles[0];
                            console.log(`- No index.html found in ${folderName}. Using ${defaultHtmlFile} as default.`);
                            // Set up a specific route to serve this single HTML file
                            app.get(`/${folderName}`, (req, res) => {
                                res.sendFile(path.join(folderPath, defaultHtmlFile));
                            });
                        } else if (htmlFiles.length > 1) {
                            console.warn(`- Warning: Multiple HTML files found in ${folderName} and no index.html. Defaulting to standard static serving (might require full path).`);
                        } else {
                            console.warn(`- Warning: No HTML files found in ${folderName} and no index.html. Defaulting to standard static serving.`);
                        }
                    } catch (error) {
                        console.error(`- Error reading files in ${folderName} for HTML detection:`, error.message);
                    }
                }

                // Serve static files for this folder at /folderName
                // This ensures that all other files (CSS, JS, images, and other HTML files) are accessible
                app.use(`/${folderName}`, express.static(folderPath));
                console.log(`- Serving static files for /${folderName} from ${folderPath}`);


                // If a backend.js file exists (or a single other .js file was designated), attempt to load it as an Express router
                if (hasBackend) {
                    try {
                        const backendRouter = require(backendFilePath);

                        // Check if the required module is a function (indicating an Express Router)
                        if (typeof backendRouter === 'function') {
                            app.use(`/${folderName}`, backendRouter);
                            console.log(`- Mounted backend router for /${folderName} from ${backendFilePath}`);
                        } else {
                            console.warn(`- Warning: ${backendFilePath} exists but does not export an Express Router function. Skipping backend.`);
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
