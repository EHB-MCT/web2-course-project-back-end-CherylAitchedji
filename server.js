const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

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
//////////////CLOTHES
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

// Get route clothes
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

// Get route clothing item
app.get("/clothes/:id", async (req, res) => {
  try {
    const clothingId = req.params.id;
    const clothingItem = await clothes.findById(clothingId);

    if (clothingItem) {
      return res.status(200).json(clothingItem);
    } else {
      return res.status(404).json({ message: "Clothing item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching clothing item", error });
  }
});

// Post route clothing item
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

// Put route clothing item
app.put("/clothes/:id", async (req, res) => {
  try {
    const clothingId = req.params.id;
    const data = req.body;
    const updatedClothing = await clothes.findByIdAndUpdate(clothingId, data, {
      new: true,
    });

    if (updatedClothing) {
      return res.status(200).json({
        message: "Clothing item updated successfully",
        data: updatedClothing,
      });
    } else {
      return res.status(404).json({ message: "Clothing item not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Invalid input" });
  }
});

// Delete route clothing item
app.delete("/clothes/:id", async (req, res) => {
  try {
    const clothingId = req.params.id;
    const deletedClothing = await clothes.findByIdAndDelete(clothingId);

    if (deletedClothing) {
      res.status(200).json({ message: "Clothing item deleted successfully" });
    } else {
      return res.status(404).json({ message: "Clothing item not found" });
    }
  } catch (error) {
    console.error("Error deleting clothing item:", error);
    res.status(500).json({ message: "Error deleting clothing item", error });
  }
});
///////////////////////////////////////////////////////////////////////
//////////////OUTFITS
const outfitSchema = new mongoose.Schema({
  name: String,
  season: String,
  occasion: String,
  mainColor: String,
  liked: Boolean,
  rating: Number,
  image: String,
  description: String,
  clothes: [{ type: mongoose.Schema.Types.ObjectId, ref: "clothes" }], // Array of clothing item IDs
});
const outfit = mongoose.model("outfits", outfitSchema);

// Get route outfits
app.get("/outfits", async (req, res) => {
  //console.log("Received /outfits request with query:", req.query);
  try {
    console.log("Query params received:", req.query);
    const query = {};

    if (req.query.season) {
      query.season = req.query.season;
    }

    if (req.query.occasion) {
      query.occasion = req.query.occasion;
    }

    if (req.query.mainColor) {
      query.mainColor = req.query.mainColor;
    }
    console.log("Mongo query object:", query);
    const outfits = await outfit.find(query).populate("clothes");
    res.status(200).json(outfits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching outfits", error });
  }
});

// Get route outfit
app.get("/outfits/:id", async (req, res) => {
  try {
    const outfitItem = await outfit
      .find()
      .sort({ _id: -1 })
      .populate("clothes");
    if (outfitItem) {
      return res.status(200).json(outfitItem);
    } else {
      return res.status(404).json({ message: "Outfit not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching outfit", error });
  }
});

// Post route outfit
app.post("/outfits", async (req, res) => {
  try {
    const newOutfit = new outfit(req.body); // create a new outfit with posted data
    const savedOutfit = await newOutfit.save(); // save to DB
    res.status(201).json({
      message: "Outfit added successfully",
      data: savedOutfit,
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid input", error });
  }
});

// Put route outfit
app.put("/outfits/:id", async (req, res) => {
  try {
    const outfitId = req.params.id;
    const updateData = req.body;
    const updatedOutfit = await outfit.findByIdAndUpdate(outfitId, updateData, {
      new: true,
      runValidators: true,
    });

    if (updatedOutfit) {
      return res.status(200).json({
        message: "Outfit updated successfully",
        data: updatedOutfit,
      });
    } else {
      return res.status(404).json({ message: "Outfit not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Invalid input", error });
  }
});

// Delete route outfit
app.delete("/outfits/:id", async (req, res) => {
  try {
    const outfitId = req.params.id;
    const deletedOutfit = await outfit.findByIdAndDelete(outfitId);

    if (deletedOutfit) {
      return res.status(200).json({ message: "Outfit deleted successfully" });
    } else {
      return res.status(404).json({ message: "Outfit not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting outfit", error });
  }
});

/////////////////////////////// LISTENING PORT /////////////////////////////////////////
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The server is running in port: ${PORT}`);
});
