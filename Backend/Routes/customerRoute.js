const express = require("express"); // Import express to create routes
const router = express.Router(); // Create a new router instance
const { // Import controller functions to handle customer-related actions
  addCustomer,
  getCustomerDetails,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer
} = require("../controllers/customerController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
// Import middleware functions for authentication and admin verification

// Public Routes
router.post("/add", addCustomer); // Route to register a new customer (no authentication required)

// Protected Routes (Require JWT Authentication)
router.get("/display", verifyToken, getCustomerDetails); // Route to get details of the logged-in customer (token required)
router.put("/update/:id", verifyToken, updateCustomer); // Route to update customer info by ID (token required)
router.get("/get/:id", verifyToken, getCustomerById); // Route to get a customer by ID (token required)
router.delete("/delete/:id", verifyToken, deleteCustomer); // Route to delete a customer by ID (token required)

// Admin Routes
router.get("/admin/displayall", verifyToken, verifyAdmin, getAllCustomers); // Route to get all customers (admin token required)

module.exports = router; // Export the router so it can be used in the main app
