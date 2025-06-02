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

/**
 * Scans the current directory for subfolders, treating each as a potential website.
 * Determines if a website has a backend based on the presence of a 'backend.js' file
 * or a single other .js file.
 * Sets up static file serving and backend routes for each detected website.
 */
function setupDynamicRoutes() {
    console.log('Scanning for websites...');
    const currentDir = __dirname;

    // Read all entries in the current directory
    const dirents = fs.readdirSync(currentDir, { withFileTypes: true });

    dirents.forEach(dirent => {
        // Only process directories that are not 'node_modules', '.git', or '.vscode'
        if (dirent.isDirectory() && dirent.name !== 'node_modules' && dirent.name !== '.git' && dirent.name !== '.vscode') {
            const folderName = dirent.name;
            const folderPath = path.join(currentDir, folderName);
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
    console.log('Website scanning complete.');
}

// Call the function to set up routes when the server starts
setupDynamicRoutes();

/**
 * Generates the main HTML page dynamically.
 * This page will contain buttons to navigate to each detected website.
 * @returns {string} The generated HTML string.
 */
function generateMainPageHtml() {
    let buttonsHtml = '';
    if (detectedPages.length === 0) {
        buttonsHtml = '<p>No websites detected. Create subfolders with `index.html` files.</p>';
    } else {
        buttonsHtml = detectedPages.map(page => `
            <a href="/${page.name}" class="page-button">
                ${page.name} ${page.hasBackend ? '(Backend)' : '(Frontend Only)'}
            </a>
        `).join('');
    }

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Multi-Website Server</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0f4f8;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .container {
                    background-color: #ffffff;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 90%;
                    width: 600px;
                }
                h1 {
                    font-size: 2.5rem;
                    color: #1a202c;
                    margin-bottom: 30px;
                    font-weight: 600;
                }
                .button-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-top: 30px;
                }
                .page-button {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 15px 25px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                .page-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
                    background: linear-gradient(135deg, #5a67d8 0%, #6a3d9a 100%);
                }
                @media (max-width: 640px) {
                    h1 {
                        font-size: 2rem;
                    }
                    .container {
                        padding: 25px;
                    }
                    .button-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to Your Multi-Website Server!</h1>
                <p class="text-gray-600 text-lg">Select a website to visit:</p>
                <div class="button-grid">
                    ${buttonsHtml}
                </div>
            </div>
        </body>
        </html>
    `;
}

// Route for the main page
app.get('/', (req, res) => {
    res.send(generateMainPageHtml());
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Detected pages:', detectedPages.map(p => p.name).join(', ') || 'None');
    console.log('----------------------------------------------------');
    console.log('To add a new website:');
    console.log('1. Create a new folder (e.g., "my-new-site") next to server.js.');
    console.log('2. Inside "my-new-site", add an "index.html" file for the frontend.');
    console.log('3. (Optional) For a backend, add a "backend.js" file that exports an Express Router (e.g., `module.exports = router;`).');
    console.log('   Alternatively, if no `backend.js` is present, a single other `.js` file will be used as backend.');
    console.log('4. Restart the server to detect the new site.');
    console.log('----------------------------------------------------');
});
