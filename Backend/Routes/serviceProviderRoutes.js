// Inside Routes/serviceProviderRoutes.js

const express = require("express");
const router = express.Router();
const ServiceProvider = require("../models/serviceProvider"); // Correct path to the model

// ✅ Register a new service provider
router.post("/register", async (req, res) => {
  const { name, email, phoneNumber, serviceArea, serviceType, description } = req.body;

  try {
    const existingProvider = await ServiceProvider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newServiceProvider = new ServiceProvider({
      name,
      email,
      phoneNumber,
      serviceArea,
      serviceType,
      description
    });

    await newServiceProvider.save();
    res.json({ message: "Service provider registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all registered service providers
router.get("/", async (req, res) => {
  try {
    const providers = await ServiceProvider.find({ status: { $ne: "verified" } }); // Exclude verified

    if (providers.length === 0) {
      return res.status(404).json({ error: "No service providers found" });
    }

    res.json(providers);
  } catch (error) {
    console.error("Error fetching service providers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Reject service provider (Delete from DB)
router.delete("/reject/:id", async (req, res) => {
  try {
    await ServiceProvider.findByIdAndDelete(req.params.id);
    res.json({ message: "Service provider rejected and deleted." });
  } catch (error) {
    res.status(500).json({ error: "Error rejecting service provider" });
  }
});

// ✅ Accept service provider (Update status to "verified")
router.put("/accept/:id", async (req, res) => {
  try {
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { status: "verified" },
      { new: true } // Return updated document
    );

    if (!updatedProvider) {
      return res.status(404).json({ error: "Service provider not found" });
    }

    res.json({ message: "Service provider verified successfully", provider: updatedProvider });
  } catch (error) {
    console.error("Error verifying service provider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get all verified service providers
router.get("/verified", async (req, res) => {
  try {
    const verifiedProviders = await ServiceProvider.find({ status: "verified" });

    if (verifiedProviders.length === 0) {
      return res.status(404).json({ error: "No verified service providers found" });
    }

    res.json(verifiedProviders);
  } catch (error) {
    console.error("Error fetching verified service providers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;