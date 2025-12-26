const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcrypt");

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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const query = { userId };

    if (req.query.clothingType) query.clothingType = req.query.clothingType;
    if (req.query.season) query.season = req.query.season;
    if (req.query.occasion) query.occasion = req.query.occasion;
    if (req.query.mainColor) query.mainColor = req.query.mainColor;
    if (req.query.liked === "true") query.liked = true;

    let clothesQuery = clothes.find(query);

    if (req.query.sort === "highest-rated") {
      clothesQuery = clothesQuery.sort({ rating: -1 });
    } else if (req.query.sort === "newest") {
      clothesQuery = clothesQuery.sort({ _id: -1 });
    } else {
      clothesQuery = clothesQuery.sort({ _id: -1 });
    }

    const clothesResult = await clothesQuery;
    res.status(200).json(clothesResult);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching clothes", error: error.message });
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
    const { userId, ...clothingData } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newClothing = new clothes({
      ...clothingData,
      userId,
    });

    const savedClothing = await newClothing.save();

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
      res.status(200).json(updatedClothing);
    } else {
      return res.status(404).json({ message: "Clothing not found" });
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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

app.get("/outfits", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const query = { userId };

    if (req.query.season) query.season = req.query.season;
    if (req.query.occasion) query.occasion = req.query.occasion;
    if (req.query.mainColor) query.mainColor = req.query.mainColor;
    if (req.query.liked === "true") query.liked = true;

    let outfitsQuery = outfit.find(query).populate("clothes");

    if (req.query.sort === "highest-rated") {
      outfitsQuery = outfitsQuery.sort({ rating: -1 });
    } else if (req.query.sort === "newest") {
      outfitsQuery = outfitsQuery.sort({ _id: -1 });
    } else {
      outfitsQuery = outfitsQuery.sort({ _id: -1 });
    }

    const outfits = await outfitsQuery;
    res.status(200).json(outfits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching outfits", error });
  }
});

// Get route outfit
app.get("/outfits/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const outfitItem = await outfit.findById(id).populate("clothes");
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
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const newOutfit = new outfit({
      ...req.body,
      userId,
    });

    const savedOutfit = await newOutfit.save();

    res.status(201).json(savedOutfit);
  } catch (error) {
    res.status(400).json({
      message: "Invalid input",
      error,
    });
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
      res.status(200).json(updatedOutfit);
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
///////////////////////////////////// USERS_ROUTES //////////////////////////////////////////////////////
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

//Register Post route
app.post("/register", async (req, res) => {
  try {
    //TODO: Must have an email and password
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "missing fields" });
    }
    // Email already exsist? "User already exsist"
    const exsistingUser = await User.findOne({ email });
    if (exsistingUser) {
      return res.status(409).json({ message: "User already exsist!" });
    }
    //save user (with hashed password)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register " });
  }
});

app.post("/login", async (req, res) => {
  //TODO: Post Login
  //Check if user exist in database
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    //Check if email and password are a match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password is not a match" });
    }
    res.status(200).json({
      message: "Login successful",
      userId: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

/////////////////////////////// LISTENING PORT /////////////////////////////////////////
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The server is running in port: ${PORT}`);
});
