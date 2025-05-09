const mongoose = require('mongoose'); // Import mongoose to work with MongoDB
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

// Correct capitalization of Schema
const Schema = mongoose.Schema;

// Define the schema with email and password
const CustomerSchema = new Schema({
    name: { // Customer's first name (required)
        type: String,
        required: true,
    },
    
    Lname: {
        type: String,
        required: false, // (optional)
    },
    
    Gender: {
        type: String,
        required: false,
    },
   
    Phonenumber: {
        type: Number,
        required: false,
    },
    email: { // Customer's email (required, must be unique and in valid format)
        type: String,
        required: true,
        unique: true, // No two users can register with the same email
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'], // Basic email validation format
    },
    Address: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Customer's password (required, must be at least 6 characters)
    },
    profileImage: {  // URL or path to the customer's profile image (optional)
        type: String,
    },
});

// this is a method to compare passwords during login with the hashed one in the DB
CustomerSchema.methods.comparePassword = async function (candidatePassword) {
    try { // compare the candidate password with stored hashed password
        return await bcrypt.compare(candidatePassword, this.password); // Compare provided password with hashed password
    } catch (err) {
        throw new Error('Password comparison failed');
    }
};

// Create the model
const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
