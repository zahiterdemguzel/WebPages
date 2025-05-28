import React, { useState, useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Home, LayoutGrid, LogOut, Settings, UploadCloud, Download, ArrowLeft, Edit, CheckCircle, XCircle, Search,
PlusCircle, FileUp, Building, Workflow, Image, Upload } from 'lucide-react'; // Added Upload icon
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from
'recharts';

// Dummy data for multiple rooms
const dummyRooms = [
{
id: 'room-1',
name: 'A_BREMEN Alex Playground',
location: 'Mariahilferstrasse',
state: 'Design Requested', // Count: 1
size: 42,
people: 4,
description: 'A well-equipped meeting room suitable for small teams and collaborative sessions.',
floor: 'Ground Floor, Section A',
managedBy: 'Users',
overallScore: 8.5,
techScore: 9.0,
acousticScore: 7.8,
sharingTech: 'Wireless & Wired',
meetingProvider: 'Zoom, Google Meet',
bookingCapability: 'Integrated Calendar',
},
{
id: 'room-2',
name: 'B_VIENNA Collaboration Hub',
location: 'Stephansplatz',
state: 'Completed', // Count: 1
size: 60,
people: 8,
description: 'Large collaboration space with interactive whiteboards and advanced video conferencing.',
floor: '1st Floor, East Wing',
managedBy: 'IT Department',
overallScore: 9.2,
techScore: 9.5,
acousticScore: 8.9,
sharingTech: 'Wireless & Wired',
meetingProvider: 'Microsoft Teams, Webex',
bookingCapability: 'Outlook Calendar',
},
{
id: 'room-3',
name: 'C_BERLIN Focus Pod',
location: 'Brandenburg Gate',
state: 'In Progress', // Count: 1
size: 15,
people: 2,
description: 'Small, quiet pod for individual focus work or small, private calls.',
floor: '2nd Floor, North Section',
managedBy: 'Facilities',
overallScore: 7.0,
techScore: 6.5,
acousticScore: 7.5,
sharingTech: 'Wired Only',
meetingProvider: 'None',
bookingCapability: 'Manual Sign-up',
},
{
id: 'room-4',
name: 'D_MUNICH Innovation Lab',
location: 'Marienplatz',
state: 'Design Requested', // Count: 2
size: 120,
people: 12,
description: 'A cutting-edge lab for prototyping and creative workshops.',
floor: 'Basement, Innovation Zone',
managedBy: 'R&D Team',
overallScore: 8.8,
techScore: 9.3,
acousticScore: 8.0,
sharingTech: 'Wireless, Wired & VR',
meetingProvider: 'Custom Software',
bookingCapability: 'Dedicated App',
},
{
id: 'room-5',
name: 'E_PARIS Creative Studio',
location: 'Eiffel Tower',
state: 'Completed', // Count: 2
size: 75,
people: 6,
description: 'A vibrant studio designed for brainstorming and creative sessions.',
floor: '3rd Floor, West Wing',
managedBy: 'Marketing Team',
overallScore: 9.0,
techScore: 8.8,
acousticScore: 9.1,
sharingTech: 'Wireless',
meetingProvider: 'Google Meet',
bookingCapability: 'Integrated Calendar',
},
{
id: 'room-6',
name: 'F_ROME Amphitheater',
location: 'Colosseum',
state: 'In Progress', // Count: 2
size: 200,
people: 25,
description: 'Large tiered room for presentations and large group meetings.',
floor: 'Ground Floor, Main Hall',
managedBy: 'Event Management',
overallScore: 8.0,
techScore: 8.5,
acousticScore: 7.0,
sharingTech: 'Wired Only',
meetingProvider: 'Webex',
bookingCapability: 'Manual Booking',
},
{
id: 'room-7',
name: 'G_LONDON Meeting Suite',
location: 'Piccadilly Circus',
state: 'Completed', // Count: 3
size: 50,
people: 6,
description: 'Modern meeting suite with flexible seating arrangements.',
floor: '4th Floor, North Tower',
managedBy: 'Office Admin',
overallScore: 8.7,
techScore: 8.5,
acousticScore: 8.2,
sharingTech: 'Wireless',
meetingProvider: 'Zoom',
bookingCapability: 'Integrated Calendar',
},
{
id: 'room-8',
name: 'H_TOKYO Tech Hub',
location: 'Shibuya Crossing',
state: 'In Progress', // Count: 3
size: 90,
people: 10,
description: 'High-tech hub for software development teams.',
floor: '5th Floor, Innovation Wing',
managedBy: 'Engineering Dept',
overallScore: 9.1,
techScore: 9.6,
acousticScore: 8.8,
sharingTech: 'Wireless & Wired',
meetingProvider: 'Google Meet',
bookingCapability: 'Dedicated App',
},
{
id: 'room-9',
name: 'I_SYDNEY Conference Room',
location: 'Opera House',
state: 'In Progress', // Count: 4
size: 150,
people: 18,
description: 'Large conference room for international presentations.',
floor: 'Ground Floor, Main Building',
managedBy: 'Global Events',
overallScore: 8.9,
techScore: 9.0,
acousticScore: 8.5,
sharingTech: 'Wired Only',
meetingProvider: 'Webex',
bookingCapability: 'Manual Booking',
},
];

// Dummy data for Organizations
const dummyOrganizations = [
{ id: 1, name: 'Hotel Nationalpark' },
{ id: 2, name: 'BETTERMEETINGROOMS GmbH' },
{ id: 3, name: 'Dramaier' },
{ id: 4, name: 'Voest Alpine' },
{ id: 5, name: 'Steelcase' },
{ id: 6, name: 'Coco Systems' },
{ id: 7, name: 'Bosch Proc Demo' },
];

// Dummy data for Processes
const dummyProcesses = [
{ id: 1, name: 'BMR' },
{ id: 2, name: 'Create Process' },
];

// Dummy data for Markers (images)
const dummyMarkers = [
{ id: 1, name: 'Marker_001.png', url: 'https://placehold.co/150x266/A7F3D0/065F46?text=Marker+1', description: 'Front
view marker' }, // 150x266 is approx 9:16
{ id: 2, name: 'Marker_002.png', url: 'https://placehold.co/150x266/D1FAE5/065F46?text=Marker+2', description: 'Side
view marker' },
{ id: 3, name: 'Marker_003.png', url: 'https://placehold.co/150x266/6EE7B7/065F46?text=Marker+3', description: 'Overhead
view marker' },
{ id: 4, name: 'Marker_004.png', url: 'https://placehold.co/150x266/34D399/065F46?text=Marker+4', description: 'Detail
view marker' },
];

// --- START PARTICLE EXPLOSION LOGIC ---
const LOGO_URL = 'https://cdn.prod.website-files.com/670fcf1021f8b3655bb0ac84/670fd235affdf8ce5f4cc2e8_bmr-logo1.svg';
const PARTICLE_COUNT = 30; // Number of particles per explosion
const PARTICLE_LIFESPAN_MS = 1800; // How long particles live, in milliseconds
const PARTICLE_INITIAL_SPEED = 7; // Base speed of particles
const PARTICLE_GRAVITY = 0.15; // How much particles are pulled down
const PARTICLE_ROTATION_SPEED = 8; // Max rotation speed
const PARTICLE_SIZE = 30; // Base size of particles in px

// Single Particle Component
const Particle = React.memo(({ style }) => {
// Using React.memo to optimize rendering of individual particles
return <img src={LOGO_URL} alt="logo particle" style={style} className="pointer-events-none select-none" />;
});

// Particle Explosion System Component
const ParticleExplosion = forwardRef((props, ref) => {
const [particles, setParticles] = useState([]);
const animationFrameId = useRef(null);

// Expose a method to add particles via ref
useImperativeHandle(ref, () => ({
createExplosion: (startX, startY) => {
const newParticles = Array.from({ length: PARTICLE_COUNT }).map(() => {
const angle = Math.random() * Math.PI * 2; // Random angle
const speed = Math.random() * PARTICLE_INITIAL_SPEED + PARTICLE_INITIAL_SPEED * 0.5; // Random speed
return {
id: Math.random().toString(36).substring(2) + Date.now(), // Unique ID
x: startX,
y: startY,
vx: Math.cos(angle) * speed, // Velocity x
vy: Math.sin(angle) * speed - (PARTICLE_INITIAL_SPEED / 2.5), // Velocity y (initial upward boost)
rotation: Math.random() * 360, // Initial rotation
vRotation: (Math.random() - 0.5) * PARTICLE_ROTATION_SPEED * 2, // Rotational velocity
opacity: 1,
scale: 0.4 + Math.random() * 0.6, // Random scale (0.4 to 1.0)
createdAt: Date.now(), // Timestamp for lifespan calculation
};
});
setParticles(prev => [...prev, ...newParticles]);
}
}));

// Animation loop
useEffect(() => {
const animate = () => {
setParticles(prevParticles =>
prevParticles
.map(p => {
const age = Date.now() - p.createdAt;
if (age > PARTICLE_LIFESPAN_MS) {
return null; // Particle has lived its life
}
return {
...p,
x: p.x + p.vx,
y: p.y + p.vy,
vy: p.vy + PARTICLE_GRAVITY, // Apply gravity
rotation: p.rotation + p.vRotation,
opacity: 1 - (age / PARTICLE_LIFESPAN_MS), // Fade out
};
})
.filter(p => p !== null) // Remove dead particles
);
animationFrameId.current = requestAnimationFrame(animate);
};

if (particles.length > 0) {
animationFrameId.current = requestAnimationFrame(animate);
} else {
// Stop animation if no particles
if (animationFrameId.current) {
cancelAnimationFrame(animationFrameId.current);
}
}

return () => {
// Cleanup: cancel animation frame when component unmounts or particles array is empty
if (animationFrameId.current) {
cancelAnimationFrame(animationFrameId.current);
}
};
}, [particles]); // Rerun effect if particles array changes

return (
<div style={{ position: 'fixed' , top: 0, left: 0, width: '100vw' , height: '100vh' , pointerEvents: 'none' , // Allows
    clicks to pass through zIndex: 99999, // Ensure it's on top of everything }}>
    {particles.map(p => (
    <Particle key={p.id} style={{ position: 'absolute' , left: `${p.x}px`, top: `${p.y}px`, width: `${PARTICLE_SIZE *
        p.scale}px`, height: `${PARTICLE_SIZE * p.scale}px`, opacity: p.opacity, transform: `translate(-50%, -50%)
        rotate(${p.rotation}deg) scale(${p.scale})`, willChange: 'transform, opacity' , // Performance hint for the
        browser }} />
    ))}
</div>
);
});
// --- END PARTICLE EXPLOSION LOGIC ---


// Custom Modal component for notifications
const CustomModal = ({ message, type, onClose }) => {
let icon;
let bgColor;
let textColor;
let borderColor;

switch (type) {
case 'success':
icon =
<CheckCircle className="w-6 h-6 text-green-600" />;
bgColor = 'bg-green-50';
textColor = 'text-green-800';
borderColor = 'border-green-400';
break;
case 'error':
icon =
<XCircle className="w-6 h-6 text-red-600" />;
bgColor = 'bg-red-50';
textColor = 'text-red-800';
borderColor = 'border-red-400';
break;
case 'info':
default:
icon =
<Settings className="w-6 h-6 text-blue-600" />; // Using settings as a generic info icon
bgColor = 'bg-blue-50';
textColor = 'text-blue-800';
borderColor = 'border-blue-400';
break;
}

return (
<div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className={`${bgColor} rounded-xl border-2 ${borderColor} shadow-2xl p-6 max-w-sm w-full transform scale-100
        opacity-100 animate-slide-up`}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                {icon}
                <h3 className={`ml-3 text-lg font-semibold ${textColor}`}>Notification</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <XCircle className="w-5 h-5" />
            </button>
        </div>
        <p className={`text-sm ${textColor} mb-6`}>{message}</p>
        <div className="flex justify-end">
            <button onClick={onClose} className={`px-5 py-2 rounded-lg font-medium shadow-md transition duration-300
                ease-in-out ${type==='success' ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' :
                type==='error' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500' } focus:outline-none
                focus:ring-2 focus:ring-offset-2 focus:ring-opacity-75`}>
                Close
            </button>
        </div>
    </div>
</div>
);
};

// Component for the detailed room view
const RoomDetailView = ({ room, setCurrentView, showCustomModal, onUpdateRoom, triggerExplosion }) => {
const [activeTab, setActiveTab] = useState('generalInformation');
const [showEditRoomModal, setShowEditRoomModal] = useState(false);

// Component to display room details
const RoomDetails = () => (
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Room Type */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Room Type</h3>
        <p className="text-lg font-medium text-gray-800">MEETING ROOM</p>
    </div>

    {/* State */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">State</h3>
        <p className="text-lg font-medium text-gray-800">{room.state}</p>
    </div>

    {/* Size */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Size in m²</h3>
        <p className="text-lg font-medium text-gray-800">{room.size}</p>
    </div>

    {/* Number Of People */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Number Of People</h3>
        <p className="text-lg font-medium text-gray-800">{room.people}</p>
    </div>

    {/* Location */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Location</h3>
        <p className="text-lg font-medium text-gray-800">{room.location}</p>
    </div>

    {/* Assessment Notes */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Assessment Notes</h3>
        <p className="text-lg font-medium text-gray-800">-</p>
    </div>

    {/* Description */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm col-span-1 md:col-span-2 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
        <p className="text-lg font-medium text-gray-800">{room.description}</p>
    </div>

    {/* Floor or Section */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Floor Or Section</h3>
        <p className="text-lg font-medium text-gray-800">{room.floor}</p>
    </div>

    {/* Managed By */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-1">Managed By</h3>
        <p className="text-lg font-medium text-gray-800">{room.managedBy}</p>
    </div>
</div>
);

// Component to display the rating section
const RatingSection = () => (
<div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Rating</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h3 className="text-md font-medium text-emerald-700">Overall Score</h3>
            <p className="text-2xl font-bold text-emerald-800 mt-2">{room.overallScore} / 10</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h3 className="text-md font-medium text-emerald-700">Tech Score</h3>
            <p className="text-2xl font-bold text-emerald-800 mt-2">{room.techScore} / 10</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h3 className="text-md font-medium text-emerald-700">Acoustic Score</h3>
            <p className="text-2xl font-bold text-emerald-800 mt-2">{room.acousticScore} / 10</p>
        </div>
    </div>
</div>
);

// Component to display the capabilities section
const CapabilitiesSection = () => (
<div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Capabilities</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-600">Sharing Tech</h3>
            <p className="text-lg font-medium text-gray-800 mt-2">{room.sharingTech}</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-600">Meeting Provider</h3>
            <p className="text-lg font-medium text-gray-800 mt-2">{room.meetingProvider}</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-600">Booking Capability</h3>
            <p className="text-lg font-medium text-gray-800 mt-2">{room.bookingCapability}</p>
        </div>
    </div>
</div>
);

// Component to display designs and scans content
const DesignsScansContent = () => {
const designs = [
{ id: 1, description: "U Table 2", createDate: "2023-01-15", type: "DESIGN" },
{ id: 2, description: "Meeting 2", createDate: "2023-02-20", type: "DESIGN" },
{ id: 3, description: "Design 1", createDate: "2023-03-10", type: "DESIGN" },
{ id: 4, description: "Meeting", createDate: "2023-04-05", type: "DESIGN" },
{ id: 5, description: "Stand Up", createDate: "2023-05-12", type: "DESIGN" },
];

// Handler for download action
const handleDownload = (description) => {
showCustomModal(`Downloading "${description}"...`, 'info');
// Simulate download
setTimeout(() => {
showCustomModal(`"${description}" downloaded successfully!`, 'success');
}, 1500);
};

// Handler for view action
const handleView = (description) => {
showCustomModal(`Viewing "${description}"...`, 'info');
// Simulate view
setTimeout(() => {
showCustomModal(`Opened viewer for "${description}".`, 'success');
}, 1500);
};

// Handler for upload action
const handleUpload = (event) => {
triggerExplosion(event); // Particle effect
showCustomModal('Opening upload dialog...', 'info');
// Simulate upload process
setTimeout(() => {
showCustomModal('File uploaded successfully!', 'success');
}, 2000);
};

return (
<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Designs / Scans</h2>
        <button onClick={handleUpload} // Use the new handler
            className="flex items-center px-5 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-300 ease-in-out">
            <UploadCloud className="w-5 h-5 mr-2" />
            Upload new Scan/Design
        </button>
    </div>

    <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Create Date
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Export
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {designs.map((design, index) => (
                <tr key={design.id} className={index % 2===0 ? 'bg-white' : 'bg-gray-50' }>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={()=> handleView(design.description)}
                            className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors
                            duration-200"
                            >
                            View
                        </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {design.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {design.createDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {design.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={()=> handleDownload(design.description)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium
                            rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none
                            focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out"
                            >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>
);
};

// New component for Markers content
const MarkersContent = ({ showCustomModal, triggerExplosion }) => { // Added triggerExplosion prop
const handleDownloadMarker = (markerName) => {
showCustomModal(`Downloading "${markerName}"...`, 'info');
// Simulate download
setTimeout(() => {
showCustomModal(`"${markerName}" downloaded successfully!`, 'success');
}, 1500);
};

const handleDownloadAllMarkers = (event) => { // Added event parameter for explosion
triggerExplosion(event); // Particle effect
showCustomModal('Downloading all markers...', 'info');
// Simulate download of all markers
setTimeout(() => {
showCustomModal('All markers downloaded successfully!', 'success');
}, 2500);
};

const handleUploadMarkers = (event) => { // New handler for uploading markers
triggerExplosion(event); // Particle effect
showCustomModal('Opening marker upload dialog...', 'info');
// Simulate upload process (e.g., open a file dialog)
// In a real app, you would likely use an <input type="file">
// and handle the file selection.
setTimeout(() => {
showCustomModal('Marker upload initiated. Please select files.', 'success');
}, 1500);
};

return (
<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Markers</h2>
        <div className="flex flex-col sm:flex-row gap-3"> {/* Container for buttons */}
            <button onClick={handleUploadMarkers} // Use the new handler
                className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out">
                <Upload className="w-5 h-5 mr-2" /> {/* Using Upload icon */}
                Upload Markers
            </button>
            <button onClick={handleDownloadAllMarkers}
                className="flex items-center px-5 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-300 ease-in-out">
                <Download className="w-5 h-5 mr-2" />
                Download All Markers
            </button>
        </div>
    </div>

    {dummyMarkers.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dummyMarkers.map(marker => (
        <div key={marker.id}
            className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col items-center text-center relative group border border-gray-200">
            <img src={marker.url} alt={`Marker ${marker.id}`}
                className="w-48 h-80 object-cover rounded-md mb-2 border border-gray-300" onError={(e)=> {
            e.target.onerror = null; e.target.src = `https://placehold.co/150x266/CCCCCC/666666?text=Image+Error`; }}
            />
            <p className="text-sm font-medium text-gray-700 mb-2">{marker.name}</p>
            <button onClick={()=> handleDownloadMarker(marker.name)}
                className="absolute bottom-4 right-4 p-2 rounded-lg bg-emerald-600 text-white opacity-0
                group-hover:opacity-100 transition-opacity duration-300 ease-in-out focus:outline-none focus:ring-2
                focus:ring-offset-2 focus:ring-emerald-500 shadow-md"
                title="Download Marker"
                >
                <Download className="w-5 h-5" />
            </button>
        </div>
        ))}
    </div>
    ) : (
    <div className="text-center py-10 text-gray-500">
        No markers available for this room yet.
        <button onClick={(e)=> {
            triggerExplosion(e); // Particle effect
            showCustomModal('This feature is under development.', 'info');
            }}
            className="mt-4 px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300
            ease-in-out shadow-sm"
            >
            Add New Marker
        </button>
    </div>
    )}
</div>
);
};


return (
<>
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{room.name}</h1>
            <p className="text-gray-600 text-lg">Detailed view and management for {room.name} room.</p>
        </div>
        <button onClick={(e)=> {
            triggerExplosion(e); // Particle effect
            showCustomModal('Resubmitting design request...', 'info');
            // Add actual resubmit logic here
            }}
            className="mt-4 sm:mt-0 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md
            hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition
            duration-300 ease-in-out"
            >
            Resubmit Design Request
        </button>
    </header>

    {/* Tabs for General Information, Designs/Scans, Markers */}
    <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex flex-wrap justify-center gap-2 md:gap-4">
        <button onClick={()=> setActiveTab('generalInformation')}
            className={`px-6 py-3 rounded-lg text-base font-medium transition duration-300 ease-in-out
            ${activeTab === 'generalInformation'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-700'
            }`}
            >
            General Information
        </button>
        <button onClick={()=> setActiveTab('designsScans')}
            className={`px-6 py-3 rounded-lg text-base font-medium transition duration-300 ease-in-out
            ${activeTab === 'designsScans'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-700'
            }`}
            >
            Designs / Scans
        </button>
        <button onClick={()=> setActiveTab('markers')}
            className={`px-6 py-3 rounded-lg text-base font-medium transition duration-300 ease-in-out
            ${activeTab === 'markers'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-700'
            }`}
            >
            Markers
        </button>
    </div>

    {/* Conditional Content Rendering based on activeTab */}
    {activeTab === 'generalInformation' && (
    <>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Details</h2>
            <RoomDetails />
        </div>
        <RatingSection />
        <CapabilitiesSection />
    </>
    )}

    {activeTab === 'designsScans' && (
    <DesignsScansContent />
    )}

    {activeTab === 'markers' && (
    <MarkersContent showCustomModal={showCustomModal} triggerExplosion={triggerExplosion} />
    )}

    {/* Action Buttons at the bottom */}
    <footer
        className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <button onClick={()=> setCurrentView('roomsOverview')} // Back button to rooms overview
            className="flex items-center px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300
            focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-300 ease-in-out
            shadow-sm mb-4 sm:mb-0"
            >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Rooms
        </button>
        <div className="flex items-center gap-4">
            {activeTab === 'generalInformation' && ( // Conditionally render Edit button
            <button onClick={()=> setShowEditRoomModal(true)} // Open the edit modal
                className="flex items-center px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-300
                ease-in-out shadow-md"
                >
                <Edit className="w-5 h-5 mr-2" />
                Edit Room Details
            </button>
            )}
        </div>
    </footer>

    {showEditRoomModal && (
    <EditRoomModal room={room} onClose={()=> setShowEditRoomModal(false)}
        onUpdateRoom={onUpdateRoom}
        showCustomModal={showCustomModal}
        />
        )}
</>
);
};

// Component for the overview of all rooms
const RoomsOverview = ({ setCurrentView, setSelectedRoom, showCustomModal, onOpenCreateRoomModal, roomsData,
triggerExplosion }) => {
const [searchTerm, setSearchTerm] = useState('');
const [filterState, setFilterState] = useState('All');

const availableStates = ['All', ...new Set(roomsData.map(room => room.state))];

const filteredRooms = useMemo(() => {
return roomsData.filter(room => {
const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
room.location.toLowerCase().includes(searchTerm.toLowerCase());
const matchesFilter = filterState === 'All' || room.state === filterState;
return matchesSearch && matchesFilter;
});
}, [searchTerm, filterState, roomsData]);

const handleViewDetails = (room) => {
setSelectedRoom(room);
setCurrentView('roomDetail');
};

return (
<>
    <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">All Meeting Rooms</h1>
            <p className="text-gray-600 text-lg">Browse and manage your meeting room inventory.</p>
        </div>
        <button onClick={onOpenCreateRoomModal} // This now expects an event from App.js
            className="mt-4 sm:mt-0 flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-300 ease-in-out">
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Room
        </button>
    </header>

    {/* Search and Filter */}
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row gap-4 border border-gray-200">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by room name or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200 ease-in-out"
                value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex-shrink-0">
            <select
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200 ease-in-out"
                value={filterState} onChange={(e)=> setFilterState(e.target.value)}
                >
                {availableStates.map(state => (
                <option key={state} value={state}>{state}</option>
                ))}
            </select>
        </div>
    </div>

    {/* Rooms Grid/List */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length > 0 ? (
        filteredRooms.map(room => (
        <div key={room.id}
            className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{room.name}</h3>
                <p className="text-gray-600 mb-1"><span className="font-medium">Location:</span> {room.location}</p>
                <p className="text-gray-600 mb-1"><span className="font-medium">State:</span> <span
                        className={`font-semibold ${room.state==='Completed' ? 'text-green-600' :
                        room.state==='Design Requested' ? 'text-blue-600' : 'text-yellow-600' }`}>{room.state}</span>
                </p>
                <p className="text-gray-600 mb-1"><span className="font-medium">Size:</span> {room.size} m²</p>
                <p className="text-gray-600 mb-4"><span className="font-medium">Capacity:</span> {room.people} people
                </p>
            </div>
            <button onClick={()=> handleViewDetails(room)}
                className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-300
                ease-in-out shadow-md"
                >
                View Details
            </button>
        </div>
        ))
        ) : (
        <div className="col-span-full text-center py-10 text-gray-500 text-lg">
            No rooms found matching your criteria.
        </div>
        )}
    </div>
</>
);
};

// New component for creating a new room
const CreateRoomModal = ({ onClose, onSubmit, showCustomModal, triggerExplosion }) => {
const [roomName, setRoomName] = useState('');
const [location, setLocation] = useState('');
const [state, setState] = useState('Design Requested'); // Default state
const [size, setSize] = useState('');
const [people, setPeople] = useState('');
const [description, setDescription] = useState('');
const [floor, setFloor] = useState('');
const [managedBy, setManagedBy] = useState('');
const [selectedFile, setSelectedFile] = useState(null);

const handleFileChange = (event) => {
if (event.target.files && event.target.files[0]) {
setSelectedFile(event.target.files[0]);
} else {
setSelectedFile(null);
}
};

const handleSubmit = (e) => {
e.preventDefault(); // Prevent default form submission
if (!roomName || !location || !size || !people) {
showCustomModal('Please fill in all required fields (Room Name, Location, Size, Number of People).', 'error');
return;
}

const newRoom = {
id: `room-${Date.now()}`, // Simple unique ID
name: roomName,
location,
state,
size: parseInt(size),
people: parseInt(people),
description,
floor,
managedBy,
overallScore: 0, // Default scores for new rooms
techScore: 0,
acousticScore: 0,
sharingTech: 'N/A',
meetingProvider: 'N/A',
bookingCapability: 'N/A',
};

showCustomModal('Creating new room and uploading file...', 'info');

setTimeout(() => {
if (selectedFile) {
showCustomModal(`Room "${newRoom.name}" created and file "${selectedFile.name}" uploaded successfully!`, 'success');
} else {
showCustomModal(`Room "${newRoom.name}" created successfully!`, 'success');
}
onSubmit(newRoom); // Pass the new room data back to the parent
onClose(); // Close the modal
}, 2000);
};

return (
<div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full transform scale-100 opacity-100 overflow-y-auto max-h-[90vh] animate-slide-up border border-gray-200">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create New Room</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <XCircle className="w-6 h-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Room Name */}
            <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-1">Room Name <span
                        className="text-red-500">*</span></label>
                <input type="text" id="roomName"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={roomName} onChange={(e)=> setRoomName(e.target.value)}
                required
                />
            </div>
            {/* Location */}
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location <span
                        className="text-red-500">*</span></label>
                <input type="text" id="location"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={location} onChange={(e)=> setLocation(e.target.value)}
                required
                />
            </div>
            {/* State */}
            <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select id="state"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-800 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={state} onChange={(e)=> setState(e.target.value)}
                    >
                    <option>Design Requested</option>
                    <option>Completed</option>
                    <option>In Progress</option>
                </select>
            </div>
            {/* Size in m² */}
            <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">Size in m² <span
                        className="text-red-500">*</span></label>
                <input type="number" id="size"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={size} onChange={(e)=> setSize(e.target.value)}
                required
                />
            </div>
            {/* Number of People */}
            <div>
                <label htmlFor="people" className="block text-sm font-medium text-gray-700 mb-1">Number Of People <span
                        className="text-red-500">*</span></label>
                <input type="number" id="people"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={people} onChange={(e)=> setPeople(e.target.value)}
                required
                />
            </div>
            {/* Floor or Section */}
            <div>
                <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">Floor Or Section</label>
                <input type="text" id="floor"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={floor} onChange={(e)=> setFloor(e.target.value)}
                />
            </div>
            {/* Managed By */}
            <div>
                <label htmlFor="managedBy" className="block text-sm font-medium text-gray-700 mb-1">Managed By</label>
                <input type="text" id="managedBy"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={managedBy} onChange={(e)=> setManagedBy(e.target.value)}
                />
            </div>
            {/* Description */}
            <div className="md:col-span-2">
                <label htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="description" rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={description} onChange={(e)=> setDescription(e.target.value)}
            ></textarea>
            </div>
            {/* 3D Scan Upload */}
            <div className="md:col-span-2">
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Upload 3D Scan
                    (Optional)</label>
                <div
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                        <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only"
                                    onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                            {selectedFile ? selectedFile.name : 'No file chosen'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                <button type="button" onClick={onClose}
                    className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-300 ease-in-out">
                    Cancel
                </button>
                <button type="submit" onClick={(e)=> { // Trigger explosion on click, form submission will proceed
                    triggerExplosion(e);
                    }}
                    className="px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white
                    bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                    focus:ring-emerald-500 transition duration-300 ease-in-out"
                    >
                    Create Room
                </button>
            </div>
        </form>
    </div>
</div>
);
};

// New component for the general overview page
const OverviewContent = ({ roomsData }) => {
const roomCounts = useMemo(() => {
const counts = {
'Design Requested': 0,
'Completed': 0,
'In Progress': 0,
};
roomsData.forEach(room => {
if (counts.hasOwnProperty(room.state)) {
counts[room.state]++;
}
});
return counts;
}, [roomsData]);

const pieChartData = useMemo(() => [
{ name: 'Design Requested', value: roomCounts['Design Requested'] },
{ name: 'Completed', value: roomCounts['Completed'] },
{ name: 'In Progress', value: roomCounts['In Progress'] },
], [roomCounts]);

const barChartData = useMemo(() => [
{ state: 'Design Requested', count: roomCounts['Design Requested'] },
{ state: 'Completed', count: roomCounts['Completed'] },
{ state: 'In Progress', count: roomCounts['In Progress'] },
], [roomCounts]);

const COLORS = ['#F59E0B', '#10B981', '#3B82F6']; // Yellow for Design Requested, Green for Completed, Blue for In
Progress

return (
<div className="min-h-[calc(100vh-160px)]">
    <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Overview</h1>
        <p className="text-gray-600 text-lg">A quick glance at your meeting room statistics.</p>
    </header>

    {/* Room Statistics */}
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Status Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-200">
                <div>
                    <p className="text-sm font-medium text-blue-600">Design Requested</p>
                    <p className="text-2xl font-bold text-blue-800">{roomCounts['Design Requested']}</p>
                </div>
                <LayoutGrid className="w-10 h-10 text-blue-400" />
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between border border-green-200">
                <div>
                    <p className="text-sm font-medium text-green-600">Completed Rooms</p>
                    <p className="text-2xl font-bold text-green-800">{roomCounts['Completed']}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg flex items-center justify-between border border-yellow-200">
                <div>
                    <p className="text-sm font-medium text-yellow-600">Rooms In Progress</p>
                    <p className="text-2xl font-bold text-yellow-800">{roomCounts['In Progress']}</p>
                </div>
                <Workflow className="w-10 h-10 text-yellow-400" />
            </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Status Visuals</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Room Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8"
                            dataKey="value">
                            {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Room Status Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="state" axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                        <Legend />
                        <Bar dataKey="count" name="Number of Rooms" barSize={40} radius={[10, 10, 0, 0]}>
                            {barChartData.map((entry, index) => (
                            <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
</div>
);
};

// New component for Organizations panel
const OrganizationsPanel = ({ showCustomModal, triggerExplosion }) => {
const [organizations, setOrganizations] = useState(dummyOrganizations);
const [itemsPerPage, setItemsPerPage] = useState(10); // Changed default to 10 for better pagination simulation

const handleCreateOrganization = (event) => {
triggerExplosion(event); // Particle effect
showCustomModal('Initiating new organization creation...', 'info');
// In a real app, this would open a form to create a new organization
};

const handleEditOrganization = (orgName) => {
showCustomModal(`Editing "${orgName}"...`, 'info');
};

const handleDeleteOrganization = (orgName) => {
showCustomModal(`Deleting "${orgName}"...`, 'info');
setOrganizations(prev => prev.filter(org => org.name !== orgName));
};

// Simple pagination logic
const [currentPage, setCurrentPage] = useState(1);
const totalPages = Math.ceil(organizations.length / itemsPerPage);
const currentOrganizations = organizations.slice(
(currentPage - 1) * itemsPerPage,
currentPage * itemsPerPage
);

return (
<>
    <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Organizations</h1>
            <p className="text-gray-600 text-lg">Manage your business entities and their associated rooms.</p>
        </div>
        <button onClick={handleCreateOrganization} // Use new handler
            className="mt-4 sm:mt-0 flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-300 ease-in-out">
            <PlusCircle className="w-5 h-5 mr-2" />
            Create a new Organization
        </button>
    </header>

    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm">Items per page:</span>
                <select
                    className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200 ease-in-out"
                    value={itemsPerPage} onChange={(e)=> { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1);
                    }}
                    >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
            {/* Search bar can be added here if needed */}
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Organization Name
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrganizations.length > 0 ? (
                    currentOrganizations.map((org, index) => (
                    <tr key={org.id} className={index % 2===0 ? 'bg-white' : 'bg-gray-50' }>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {org.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={()=> handleEditOrganization(org.name)}
                                className="text-gray-600 hover:text-gray-900 mr-3 px-3 py-1.5 rounded-md bg-gray-200
                                hover:bg-gray-300 transition duration-200 ease-in-out shadow-sm"
                                >
                                Edit
                            </button>
                            <button onClick={()=> handleDeleteOrganization(org.name)}
                                className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition
                                duration-200 ease-in-out shadow-sm"
                                >
                                Delete
                            </button>
                        </td>
                    </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                            No organizations found.
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage,
                organizations.length)} of {organizations.length} items.</span>
            <div className="flex gap-2">
                <button onClick={()=> setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Previous
                </button>
                <span className="px-3 py-1 bg-gray-100 rounded-md">Page {currentPage} of {totalPages}</span>
                <button onClick={()=> setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Next
                </button>
            </div>
        </div>
    </div>
</>
);
};

// New component for Processes panel
const ProcessesPanel = ({ showCustomModal, triggerExplosion }) => {
const [processes, setProcesses] = useState(dummyProcesses);

const handleCreateProcess = (event) => {
triggerExplosion(event); // Particle effect
showCustomModal('Initiating new process creation...', 'info');
// In a real app, this would open a form to create a new process
};

const handleEditProcess = (processName) => {
showCustomModal(`Editing "${processName}"...`, 'info');
};

const handleDeleteProcess = (processName) => {
showCustomModal(`Deleting "${processName}"...`, 'info');
setProcesses(prev => prev.filter(proc => proc.name !== processName));
};

return (
<>
    <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Processes</h1>
            <p className="text-gray-600 text-lg">Define and manage workflows for room design and setup.</p>
        </div>
        <button onClick={handleCreateProcess} // Use new handler
            className="mt-4 sm:mt-0 flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-300 ease-in-out">
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Process
        </button>
    </header>

    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Process List</h2>
        <div className="grid grid-cols-1 gap-4">
            {processes.length > 0 ? (
            processes.map(process => (
            <div key={process.id}
                className="p-4 bg-gray-50 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-200">
                <p className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">{process.name}</p>
                <div className="flex items-center gap-2">
                    <button onClick={()=> handleEditProcess(process.name)}
                        className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md bg-gray-200
                        hover:bg-gray-300 transition duration-200 ease-in-out shadow-sm"
                        >
                        Edit
                    </button>
                    <button onClick={()=> handleDeleteProcess(process.name)}
                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition duration-200
                        ease-in-out shadow-sm"
                        >
                        Delete
                    </button>
                </div>
            </div>
            ))
            ) : (
            <p className="text-gray-600 text-center py-4">No processes available yet.</p>
            )}
        </div>
    </div>
</>
);
};

// New component for editing an existing room
const EditRoomModal = ({ room, onClose, onUpdateRoom, showCustomModal }) => {
const [roomName, setRoomName] = useState(room.name);
const [location, setLocation] = useState(room.location);
const [state, setState] = useState(room.state);
const [size, setSize] = useState(room.size);
const [people, setPeople] = useState(room.people);
const [description, setDescription] = useState(room.description);
const [floor, setFloor] = useState(room.floor);
const [managedBy, setManagedBy] = useState(room.managedBy);

const handleSubmit = (e) => {
e.preventDefault();
if (!roomName || !location || !size || !people) {
showCustomModal('Please fill in all required fields (Room Name, Location, Size, Number of People).', 'error');
return;
}

const updatedRoom = {
...room, // Keep existing properties
name: roomName,
location,
state,
size: parseInt(size),
people: parseInt(people),
description,
floor,
managedBy,
};

showCustomModal(`Updating room "${updatedRoom.name}"...`, 'info');

setTimeout(() => {
onUpdateRoom(updatedRoom); // Pass the updated room data back to the parent
showCustomModal(`Room "${updatedRoom.name}" updated successfully!`, 'success');
onClose(); // Close the modal
}, 1500);
};

return (
<div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full transform scale-100 opacity-100 overflow-y-auto max-h-[90vh] animate-slide-up border border-gray-200">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Room Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <XCircle className="w-6 h-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Room Name */}
            <div>
                <label htmlFor="editRoomName" className="block text-sm font-medium text-gray-700 mb-1">Room Name <span
                        className="text-red-500">*</span></label>
                <input type="text" id="editRoomName"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={roomName} onChange={(e)=> setRoomName(e.target.value)}
                required
                />
            </div>
            {/* Location */}
            <div>
                <label htmlFor="editLocation" className="block text-sm font-medium text-gray-700 mb-1">Location <span
                        className="text-red-500">*</span></label>
                <input type="text" id="editLocation"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={location} onChange={(e)=> setLocation(e.target.value)}
                required
                />
            </div>
            {/* State */}
            <div>
                <label htmlFor="editState" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select id="editState"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-800 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={state} onChange={(e)=> setState(e.target.value)}
                    >
                    <option>Design Requested</option>
                    <option>Completed</option>
                    <option>In Progress</option>
                </select>
            </div>
            {/* Size in m² */}
            <div>
                <label htmlFor="editSize" className="block text-sm font-medium text-gray-700 mb-1">Size in m² <span
                        className="text-red-500">*</span></label>
                <input type="number" id="editSize"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={size} onChange={(e)=> setSize(e.target.value)}
                required
                />
            </div>
            {/* Number of People */}
            <div>
                <label htmlFor="editPeople" className="block text-sm font-medium text-gray-700 mb-1">Number Of People
                    <span className="text-red-500">*</span></label>
                <input type="number" id="editPeople"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={people} onChange={(e)=> setPeople(e.target.value)}
                required
                />
            </div>
            {/* Floor or Section */}
            <div>
                <label htmlFor="editFloor" className="block text-sm font-medium text-gray-700 mb-1">Floor Or
                    Section</label>
                <input type="text" id="editFloor"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={floor} onChange={(e)=> setFloor(e.target.value)}
                />
            </div>
            {/* Managed By */}
            <div>
                <label htmlFor="editManagedBy" className="block text-sm font-medium text-gray-700 mb-1">Managed
                    By</label>
                <input type="text" id="editManagedBy"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={managedBy} onChange={(e)=> setManagedBy(e.target.value)}
                />
            </div>
            {/* Description */}
            <div className="md:col-span-2">
                <label htmlFor="editDescription"
                    className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="editDescription" rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out"
                    value={description} onChange={(e)=> setDescription(e.target.value)}
            ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                <button type="button" onClick={onClose}
                    className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-300 ease-in-out">
                    Cancel
                </button>
                <button type="submit"
                    className="px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-300 ease-in-out">
                    Save Changes
                </button>
            </div>
        </form>
    </div>
</div>
);
};

// New component for the Administration view with tabs
const AdministrationView = ({ showCustomModal, triggerExplosion }) => {
const [activeAdminTab, setActiveAdminTab] = useState('organizations'); // Default to 'organizations'

return (
<>
    <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Administration</h1>
        <p className="text-gray-600 text-lg">Manage organizations and processes.</p>
    </header>

    {/* Tabs for Organizations and Processes */}
    <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex flex-wrap justify-center gap-2 md:gap-4">
        <button onClick={()=> setActiveAdminTab('organizations')}
            className={`px-6 py-3 rounded-lg text-base font-medium transition duration-300 ease-in-out
            ${activeAdminTab === 'organizations'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-700'
            }`}
            >
            Organizations
        </button>
        <button onClick={()=> setActiveAdminTab('processes')}
            className={`px-6 py-3 rounded-lg text-base font-medium transition duration-300 ease-in-out
            ${activeAdminTab === 'processes'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-700'
            }`}
            >
            Processes
        </button>
    </div>

    {/* Conditional Content Rendering based on activeAdminTab */}
    {activeAdminTab === 'organizations' && (
    <OrganizationsPanel showCustomModal={showCustomModal} triggerExplosion={triggerExplosion} />
    )}
    {activeAdminTab === 'processes' && (
    <ProcessesPanel showCustomModal={showCustomModal} triggerExplosion={triggerExplosion} />
    )}
</>
);
};

// New component for Settings page content
const SettingsContent = ({ showCustomModal }) => {
const [notificationEnabled, setNotificationEnabled] = useState(true);
const [theme, setTheme] = useState('light');
const [dataRefreshInterval, setDataRefreshInterval] = useState('5min');

const handleSaveChanges = () => {
showCustomModal('Settings saved successfully!', 'success');
};

return (
<>
    <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 text-lg">Configure your application preferences.</p>
    </header>

    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">General Settings</h2>
        <div className="space-y-4">
            {/* Notification Setting */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <label htmlFor="notifications" className="text-gray-700 font-medium text-lg">Enable
                    Notifications</label>
                <input type="checkbox" id="notifications"
                    className="h-6 w-6 text-emerald-600 rounded focus:ring-emerald-500 transition duration-200 ease-in-out"
                    checked={notificationEnabled} onChange={(e)=> setNotificationEnabled(e.target.checked)}
                />
            </div>

            {/* Theme Selection */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <label htmlFor="theme" className="text-gray-700 font-medium text-lg">Application Theme</label>
                <select id="theme"
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200 ease-in-out"
                    value={theme} onChange={(e)=> setTheme(e.target.value)}
                    >
                    <option value="light">Light</option>
                    <option value="dark">Dark (Coming Soon)</option>
                </select>
            </div>

            {/* Data Refresh Interval */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <label htmlFor="dataRefresh" className="text-gray-700 font-medium text-lg">Data Refresh Interval</label>
                <select id="dataRefresh"
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200 ease-in-out"
                    value={dataRefreshInterval} onChange={(e)=> setDataRefreshInterval(e.target.value)}
                    >
                    <option value="1min">1 Minute</option>
                    <option value="5min">5 Minutes</option>
                    <option value="15min">15 Minutes</option>
                    <option value="manual">Manual</option>
                </select>
            </div>

            {/* Placeholder for more settings */}
            <div className="py-3">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Advanced Settings</h3>
                <p className="text-gray-600 text-base">More advanced configuration options will be available here soon.
                </p>
                <ul className="list-disc list-inside text-gray-600 text-sm mt-2 ml-4">
                    <li>Integration settings</li>
                    <li>User management permissions</li>
                    <li>Audit logs retention</li>
                </ul>
            </div>
        </div>
        <div className="mt-6 flex justify-end">
            <button onClick={handleSaveChanges}
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-300 ease-in-out">
                Save Changes
            </button>
        </div>
    </div>
</>
);
};


// Main App Component
export default function App() {
const [currentView, setCurrentView] = useState('overview'); // Default to 'overview'
const [selectedRoom, setSelectedRoom] = useState(null); // Stores the room object for detail view
const [rooms, setRooms] = useState(dummyRooms); // State to hold rooms data
const [showModal, setShowModal] = useState(false); // For general notifications
const [modalMessage, setModalMessage] = useState('');
const [modalType, setModalType] = useState('info');
const [showCreateRoomModal, setShowCreateRoomModal] = useState(false); // For the new room creation modal

// Ref for the ParticleExplosion component
const particleExplosionRef = useRef(null);

// Function to trigger particle explosion
const triggerExplosion = (event) => {
if (particleExplosionRef.current && event && event.target) {
// Get the center of the clicked button
const rect = event.target.getBoundingClientRect();
const x = rect.left + rect.width / 2;
const y = rect.top + rect.height / 2;
particleExplosionRef.current.createExplosion(x, y);
}
};

// Function to display a custom modal with a given message and type
const showCustomModal = (message, type = 'info') => {
setModalMessage(message);
setModalType(type);
setShowModal(true);
};

// Function to close the custom modal
const closeModal = () => {
setShowModal(false);
setModalMessage('');
setModalType('info');
};

// Function to handle new room submission
const handleCreateRoomSubmit = (newRoom) => {
setRooms(prevRooms => [...prevRooms, newRoom]);
setShowCreateRoomModal(false); // Close the creation modal
};

// Function to handle updating an existing room
const handleUpdateRoom = (updatedRoom) => {
setRooms(prevRooms => prevRooms.map(room =>
room.id === updatedRoom.id ? updatedRoom : room
));
setSelectedRoom(updatedRoom); // Ensure the detailed view is updated
};


return (
<div className="min-h-screen bg-gray-50 font-inter antialiased flex flex-col md:flex-row">
    {/* Tailwind CSS CDN */}
    <script src="https://cdn.tailwindcss.com"></script>
    {/* Custom CSS for animations */}
    <style>
        {
            ` @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

            body {
                font-family: 'Inter', sans-serif;
            }

            .animate-fade-in {
                animation: fadeIn 0.3s ease-out forwards;
            }

            .animate-slide-up {
                animation: slideUp 0.3s ease-out forwards;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }

                to {
                    opacity: 1;
                }
            }

            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }

                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            `
        }
    </style>

    {/* Sidebar */}
    <aside className="w-full md:w-64 bg-emerald-900 text-gray-200 flex flex-col p-4 shadow-xl">
        <div className="flex items-center justify-center md:justify-start mb-8 py-4">
            <img src="https://cdn.prod.website-files.com/670fcf1021f8b3655bb0ac84/670fd235affdf8ce5f4cc2e8_bmr-logo1.svg"
                alt="Better Rooms Logo" className="mr-3 h-16 md:h-12" // Adjusted height for better fit on different
                screens />
            <h1 className="text-xl font-bold text-white hidden md:block">Better Meeting Rooms</h1>
        </div>
        <nav className="flex-grow">
            <ul>
                <li className="mb-2">
                    <a href="#" onClick={()=> setCurrentView('overview')} className={`flex items-center py-3 px-4
                        rounded-lg text-lg ${currentView === 'overview' ? 'bg-emerald-800 text-white shadow-md' :
                        'hover:bg-emerald-800 hover:text-white'} transition duration-200 ease-in-out`}>
                        <Home className="w-6 h-6 mr-3" />
                        Overview
                    </a>
                </li>
                <li className="mb-2">
                    <a href="#" onClick={()=> setCurrentView('roomsOverview')} className={`flex items-center py-3 px-4
                        rounded-lg text-lg ${currentView === 'roomsOverview' || currentView === 'roomDetail' ?
                        'bg-emerald-800 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'} transition
                        duration-200 ease-in-out`}>
                        <LayoutGrid className="w-6 h-6 mr-3" />
                        Rooms
                    </a>
                </li>
                <li className="mb-2">
                    <a href="#" onClick={()=> setCurrentView('administration')}
                        className={`flex items-center py-3 px-4 rounded-lg text-lg ${currentView === 'administration' ?
                        'bg-emerald-800 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'} transition
                        duration-200 ease-in-out`}
                        >
                        <Building className="w-6 h-6 mr-3" />
                        Administration
                    </a>
                </li>
                <li className="mb-2">
                    <a href="#" onClick={()=> setCurrentView('settings')} className={`flex items-center py-3 px-4
                        rounded-lg text-lg ${currentView === 'settings' ? 'bg-emerald-800 text-white shadow-md' :
                        'hover:bg-emerald-800 hover:text-white'} transition duration-200 ease-in-out`}>
                        <Settings className="w-6 h-6 mr-3" />
                        Settings
                    </a>
                </li>
            </ul>
        </nav>
        <div className="mt-auto pt-6 border-t border-emerald-800">
            <a href="#" onClick={()=> showCustomModal('Signing out...', 'info')} className="flex items-center py-3 px-4
                rounded-lg hover:bg-emerald-800 transition duration-200 ease-in-out text-gray-200 text-lg">
                <LogOut className="w-6 h-6 mr-3" />
                Sign out
            </a>
            <p className="text-xs text-gray-400 mt-4 text-center md:text-left">© 2025 Better Meeting Rooms</p>
        </div>
    </aside>

    {/* Main Content Area */}
    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {currentView === 'overview' &&
        <OverviewContent roomsData={rooms} />}
        {currentView === 'roomsOverview' && (
        <RoomsOverview setCurrentView={setCurrentView} setSelectedRoom={setSelectedRoom}
            showCustomModal={showCustomModal} onOpenCreateRoomModal={(event)=> { // Modified to pass event
            triggerExplosion(event);
            setShowCreateRoomModal(true);
            }}
            roomsData={rooms}
            triggerExplosion={triggerExplosion} // Pass down for other potential buttons if any
            />
            )}
            {currentView === 'roomDetail' && selectedRoom && (
            <RoomDetailView room={selectedRoom} setCurrentView={setCurrentView} showCustomModal={showCustomModal}
                onUpdateRoom={handleUpdateRoom} triggerExplosion={triggerExplosion} // Pass down />
            )}
            {currentView === 'administration' &&
            <AdministrationView showCustomModal={showCustomModal} triggerExplosion={triggerExplosion} />}
            {currentView === 'settings' &&
            <SettingsContent showCustomModal={showCustomModal} />}
    </main>

    {/* General Notification Modal */}
    {showModal && (
    <CustomModal message={modalMessage} type={modalType} onClose={closeModal} />
    )}

    {/* Create New Room Modal */}
    {showCreateRoomModal && (
    <CreateRoomModal onClose={()=> setShowCreateRoomModal(false)}
        onSubmit={handleCreateRoomSubmit}
        showCustomModal={showCustomModal}
        triggerExplosion={triggerExplosion} // Pass to modal
        />
        )}

        {/* Particle Explosion Component - Rendered on top of everything */}
        <ParticleExplosion ref={particleExplosionRef} />
</div>
);
}