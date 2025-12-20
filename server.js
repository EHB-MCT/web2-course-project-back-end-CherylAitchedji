const express = require("express");
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

// Connection with MongoDb
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

/////////////////////////////// API ROUTES /////////////////////////////////////////
app.post("/clothes", (req, res) => {
  res.send("Get testyyy");
});

app.post("/outfits", (req, res) => {
  res.send("Get testyyy");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The server is running in port: ${PORT}`);
});
