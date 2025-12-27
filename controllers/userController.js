import User from "../models/User.js";

// @desc Get logged-in user's profile
export const getMyProfile = async (req, res) => {
  res.json(req.user);
};

// @desc Update profile (name, phone)
export const updateMyProfile = async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.name = name || user.name;
    user.phone = phone || user.phone;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc Admin: Get all users
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// @desc Admin: Delete a user
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
