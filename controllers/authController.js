import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// 🔐 Register User
export const registerUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();
    const phone = req.body.phoneNumber?.trim();

    // ✅ Manual password validation
    if (password.length < 8 || password.length > 12) {
      return res.status(400).json({ error: "Password must be 8–12 characters long" });
    }
    if (!/[A-Za-z]/.test(password)) {
      return res.status(400).json({ error: "Password must include at least one letter" });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({ error: "Password must include at least one number" });
    }
    if (!/[@$!%*?&]/.test(password)) {
      return res.status(400).json({ error: "Password must include one special character (@$!%*?&)" });
    }
    if (/[^A-Za-z\d@$!%*?&]/.test(password)) {
      return res.status(400).json({ error: "Invalid character used. Only @$!%*?& allowed" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "This email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone || null,
      token
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔓 Login User
export const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Wrong email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone || null,
      token
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// 🚪 Logout User
export const logoutUser = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

// 🔁 Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const oldPassword = req.body.oldPassword?.trim();
    const newPassword = req.body.newPassword?.trim();

    // ✅ Manual validation for new password
    if (newPassword.length < 8 || newPassword.length > 12) {
      return res.status(400).json({ error: "New password must be 8–12 characters long" });
    }
    if (!/[A-Za-z]/.test(newPassword)) {
      return res.status(400).json({ error: "New password must include at least one letter" });
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ error: "New password must include at least one number" });
    }
    if (!/[@$!%*?&]/.test(newPassword)) {
      return res.status(400).json({ error: "New password must include one special character (@$!%*?&)" });
    }
    if (/[^A-Za-z\d@$!%*?&]/.test(newPassword)) {
      return res.status(400).json({ error: "Invalid character used in new password" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// 📧 Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User with this email not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    res.json({ message: "Password reset token generated", resetToken });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔒 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const token = req.body.token?.trim();
    const newPassword = req.body.newPassword?.trim();

    // ✅ Manual validation for new password
    if (newPassword.length < 8 || newPassword.length > 12) {
      return res.status(400).json({ error: "New password must be 8–12 characters long" });
    }
    if (!/[A-Za-z]/.test(newPassword)) {
      return res.status(400).json({ error: "New password must include at least one letter" });
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ error: "New password must include at least one number" });
    }
    if (!/[@$!%*?&]/.test(newPassword)) {
      return res.status(400).json({ error: "New password must include one special character (@$!%*?&)" });
    }
    if (/[^A-Za-z\d@$!%*?&]/.test(newPassword)) {
      return res.status(400).json({ error: "Invalid character used in new password" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
