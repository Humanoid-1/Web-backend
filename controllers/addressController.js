import Address from "../models/addressModel.js";

// POST: Add address
export const addAddress = async (req, res) => {
  try {
    const { type, flat, street, name } = req.body;

    if (!type || !flat || !name) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newAddress = new Address({
      userId: req.user._id,
      email: req.user.email,
      type,
      flat,
      street,
      name,
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Address saved successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET: Get all addresses for logged-in user
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(addresses); // 🔹 return JSON array
  } catch (err) {
    console.error("Get Addresses Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE: Remove address by ID
export const deleteAddress = async (req, res) => {
  try {
    const deleted = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // ensure user can only delete their own
    });

    if (!deleted) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    console.error("Delete Address Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
