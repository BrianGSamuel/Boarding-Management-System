const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables from .env file
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 8070; // Fallback to 8070 if PORT is not defined

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON payloads

// MongoDB Connection URL (Ensure .env has MONGODB_URL and JWT_SECRET set)
const URL = process.env.MONGODB_URL;

if (!URL) {
  console.error("MONGODB_URL is not defined in the .env file");
  process.exit(1);
}

mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connection successful!"))
  .catch((err) => {
    console.error("MongoDB Connection failed:", err.message);
    process.exit(1); // Exit the process if connection fails
  });

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB is connected and ready!");
});

// Models
const Room = require("./models/Room");
const User = require("./models/User"); 
const Admin = require("./models/Employee");


// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Serve static files (images) from the 'uploads' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extname && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png) are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


// Admin Registration Route
app.post("/Adminregister", async (req, res) => {
  const { name, Lname, Phonenumber,  email, password, createdAt } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newAdmin = new Admin({
      name,
      Lname,
      Phonenumber,
      email,
      password: hashedPassword,
      createdAt
    });
    await newAdmin.save();

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(403).json({ error: "Invalid credentials" });

    // Ensure process.env.JWT_SECRET is set correctly
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT Secret is not defined" });
    }

    // Check if the user has any booked rooms where they are the owner
    const bookedRoom = await Room.findOne({ customerId: user._id, isBooked: true });

    let alertMessage = null;
    if (bookedRoom) {
      alertMessage = `Reminder: The room in ${bookedRoom.roomCity}  you Listed is  booked! View buyer infor in listings`;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ 
      token, 
      username: user.name, 
      userLname: user.Lname,
      alertMessage  // Send alert message if a room is booked
    });

  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Admin Login Route
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) return res.status(403).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, username: admin.name });
  } catch (err) {
    console.error("Error during admin login:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route to fetch all rooms (public)
app.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find(); // Fetch all rooms from the database
    if (rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found" });
    }
    res.json(rooms); // Send the room data as JSON response
  } catch (err) {
    console.error("Error fetching rooms:", err.message);
    res.status(500).json({ error: "An error occurred while fetching rooms" });
  }
});



// Access Customer routes
const CustomerRouter = require("./Routes/customerRoute");
app.use("/Customer", CustomerRouter);

// Access Customer routes
const roomRoutes = require("./Routes/roomRoute");
app.use("/Room", roomRoutes); 


// Error handling for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is up and running on port number: ${PORT}`);
});
