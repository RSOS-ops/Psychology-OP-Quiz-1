import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const correctVideosDir = path.join(__dirname, 'public', 'RewardVideos', 'CorrectVideos');
const streakVideosDir = path.join(__dirname, 'public', 'RewardVideos', '5-InARowVideos');
const percent80VideosDir = path.join(__dirname, 'public', 'RewardVideos', '80Percent');
const percent90VideosDir = path.join(__dirname, 'public', 'RewardVideos', '90Percent');
const perfectScoreVideosDir = path.join(__dirname, 'public', 'RewardVideos', 'PerfectScore');
const musicDir = path.join(__dirname, 'public', 'Music');
const appFile = path.join(__dirname, 'src', 'App.jsx');

// Get all .mp4 files
const correctFiles = fs.readdirSync(correctVideosDir).filter(file => file.endsWith('.mp4'));
const streakFiles = fs.readdirSync(streakVideosDir).filter(file => file.endsWith('.mp4'));
const percent80Files = fs.existsSync(percent80VideosDir) ? fs.readdirSync(percent80VideosDir).filter(file => file.endsWith('.mp4')) : [];
const percent90Files = fs.existsSync(percent90VideosDir) ? fs.readdirSync(percent90VideosDir).filter(file => file.endsWith('.mp4')) : [];
const perfectScoreFiles = fs.existsSync(perfectScoreVideosDir) ? fs.readdirSync(perfectScoreVideosDir).filter(file => file.endsWith('.mp4')) : [];
const musicFiles = fs.existsSync(musicDir) ? fs.readdirSync(musicDir).filter(file => file.endsWith('.mp3')) : [];

// Generate the array strings
const correctArrayString = `const CORRECT_VIDEOS = [
    ${correctFiles.map(f => `'${f}'`).join(',\n    ')}
];`;

const streakArrayString = `const STREAK_VIDEOS = [
    ${streakFiles.map(f => `'${f}'`).join(',\n    ')}
];`;

const percent80ArrayString = `const PERCENT_80_VIDEOS = [
    ${percent80Files.map(f => `'${f}'`).join(',\n    ')}
];`;

const percent90ArrayString = `const PERCENT_90_VIDEOS = [
    ${percent90Files.map(f => `'${f}'`).join(',\n    ')}
];`;

const perfectScoreArrayString = `const PERFECT_SCORE_VIDEOS = [
    ${perfectScoreFiles.map(f => `'${f}'`).join(',\n    ')}
];`;

const musicArrayString = `const MUSIC_TRACKS = [
    ${musicFiles.map(f => `'${f}'`).join(',\n    ')}
];`;

// Read App.jsx
let appCode = fs.readFileSync(appFile, 'utf8');

// Replace the arrays in App.jsx
appCode = appCode.replace(/const CORRECT_VIDEOS = \[[^\]]*\];/s, correctArrayString);
appCode = appCode.replace(/const STREAK_VIDEOS = \[[^\]]*\];/s, streakArrayString);
appCode = appCode.replace(/const PERCENT_80_VIDEOS = \[[^\]]*\];/s, percent80ArrayString);
appCode = appCode.replace(/const PERCENT_90_VIDEOS = \[[^\]]*\];/s, percent90ArrayString);
appCode = appCode.replace(/const PERFECT_SCORE_VIDEOS = \[[^\]]*\];/s, perfectScoreArrayString);
appCode = appCode.replace(/const MUSIC_TRACKS = \[[^\]]*\];/s, musicArrayString);

// Write back to App.jsx
fs.writeFileSync(appFile, appCode);

console.log('Videos updated!');
console.log('Correct Videos:', correctFiles.length);
console.log('Streak Videos:', streakFiles.length);
console.log('80% Videos:', percent80Files.length);
console.log('90% Videos:', percent90Files.length);
console.log('Perfect Score Videos:', perfectScoreFiles.length);
console.log('Music Tracks:', musicFiles.length);
