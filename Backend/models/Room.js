const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema(
  {
    roomAddress: { type: String, required: true },
    roomCity: { type: String, required: true },
    roomType: { type: String, required: true },
    price: { type: Number, required: true },
    isNegotiable: { type: Boolean, required: true },
    ownerName: { type: String, required: true },
    ownerContactNumber: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the customer who added the room
    isVerified: { type: Boolean, default: false }, // Admin verification
    isBooked: { type: Boolean, default: false },
    isBookedconfirm: { type: Boolean, default: false },
    buyerContactNumber: { type: String },
    buyerNIC: { type: String },
    buyingDate: { type: Date },
    buyingDuration: { type: Number },
    buyerName: { type: String },
    buyerCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Embedded rating history schema
    ratingHistory: [
      {
        buyerName:  { type: String },
        rating: { type: Number, min: 1, max: 5, required: true }, // Rating given by the owner
        description: { type: String }, // Description of the rating
        createdAt: { type: Date, default: Date.now }, // Timestamp for when the rating is created
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema); 