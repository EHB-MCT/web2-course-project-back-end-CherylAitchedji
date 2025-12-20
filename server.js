const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

app.use(express.json());

// Connection with MongoDb
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

/////////////////////////////// API ROUTES /////////////////////////////////////////
// CLOTHES
const clothesSchema = new mongoose.Schema({
  name: String,
  clothingType: String,
  season: String,
  occasion: String,
  mainColor: String,
  liked: Boolean,
  rating: Number,
  image: String,
  description: String,
});

const clothes = mongoose.model("clothes", clothesSchema);
module.exports = clothes;

app.get("/clothes", async (req, res) => {
  try {
    const allClothes = await clothes.find();
    res.status(200).json({
      message: "Clothing items found",
      data: allClothes,
    });
  } catch (error) {
    res.status(500).json({ message: "No clothing items found", error });
  }
});

app.post("/clothes", async (req, res) => {
  try {
    const newClothing = new clothes(req.body);
    const savedClothing = await newClothing.save();
    console.log("saved item:", savedClothing);
    res.status(201).json({
      message: "Clothing item added successfully",
      data: savedClothing,
    });
  } catch (error) {
    res.status(400).json({ message: "Error saving clothing item", error });
  }
});

app.post("/outfits", (req, res) => {
  res.send("Get testyyy");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The server is running in port: ${PORT}`);
});
