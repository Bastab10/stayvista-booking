const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
    
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj) => ({...obj , owner:"6985a3a849061c5c286b6fec"}));
    await Listing.insertMany(initData.data);
    console.log("Database initialized with sample data");
}

initDB();