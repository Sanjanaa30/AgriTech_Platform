require('dotenv').config();   // reads .env from repo root
const path = require('path');

const datasetRoot = process.env.DATASET_PATH;           
const riceRaw = path.join(datasetRoot, 'raw', 'Rice');  

console.log('Dataset root:', datasetRoot);
console.log('Rice raw path:', riceRaw);
