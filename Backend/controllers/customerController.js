const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Customer = require("../models/User");
const Room = require("../models/Room");

// Register a new customer
exports.addCustomer = async (req, res) => { // Destructure fields from request body
  const { name, Lname, Gender, Phonenumber, Address, email, password, profileImage } = req.body;

  if (!name || !email || !password) { // Check if essential fields are missing
    return res.status(400).json({ status: "Error", message: "Name, email, and password are required" });
  }

  try { // Check if a customer with the same email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ status: "Error", message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving
    const newCustomer = new Customer({ // Create a new Customer instance with provided data
      name,
      Lname,
      Gender,
      Phonenumber,
      Address,
      email,
      password: hashedPassword,
      profileImage,  // Adding profileImage here
    });

    await newCustomer.save(); // Save the new customer to the database
    const token = jwt.sign({ id: newCustomer._id, role: "customer" }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" }); // Token will expire in 1 hour

    // Send a success response with token and customer details
    res.status(201).json({ status: "Success", token, customer: newCustomer });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  } // Catch any server errors
};


// Get logged-in customer details
exports.getCustomerDetails = async (req, res) => {
  try { // Find customer by ID and exclude the password field
    const customer = await Customer.findById(req.user.id).select("-password");
    if (!customer) { // If no customer found, return 404
      return res.status(404).json({ status: "Error", message: "Customer not found" });
    }

    // Return the customer data
    res.status(200).json(customer);  // Profile image will be included in the response
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  } // Catch server errors
};


// Update customer details
exports.updateCustomer = async (req, res) => {
  const userId = req.params.id; // Get user ID from request
  const { name, email, password, Lname, Gender, Phonenumber, Address, profileImage } = req.body; // Destructure updated fields from request body

  try { // Find the user by ID
    const user = await Customer.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update fields if provided, otherwise keep old values
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password ? await bcrypt.hash(password, 10) : user.password;
    user.Lname = Lname || user.Lname;
    user.Gender = Gender || user.Gender;
    user.Phonenumber = Phonenumber || user.Phonenumber;
    user.Address = Address || user.Address;
    user.profileImage = profileImage || user.profileImage;  // Update profile image if provided

    await user.save(); // Save updated user data to database
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) { // Send success response
    res.status(500).json({ error: "An error occurred during the update" });
  } // Catch any errors
};


// Admin - Get all customers
exports.getAllCustomers = async (req, res) => {
  try { // Fetch all customers from the database
    const customers = await Customer.find();
    if (customers.length === 0) { // If no customers are found, return 404
      return res.status(404).json({ status: "Error", message: "No customers found" });
    }
    res.status(200).json({ status: "Success", customers }); // Return the list of customers
  } catch (err) { 
    res.status(500).json({ status: "Error", message: "Server Error: Unable to fetch customer details" });
  } // Catch server errors
};

// Get a customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer) {
      return res.status(404).json({ status: "Error", message: "Customer not found" });
    }
    res.status(200).json({ status: "Success", customer });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// Delete a customer and their associated rooms
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try { // Find customer by ID and exclude password field
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "Error", message: "Invalid Customer ID" });
    }

    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return res.status(404).json({ status: "Error", message: "Customer not found" });
    }

    const deletedRooms = await Room.deleteMany({ customerId: id });
    res.status(200).json({
      message: "Customer and associated rooms deleted successfully",
      deletedRoomsCount: deletedRooms.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the customer and their rooms" });
  }
};
