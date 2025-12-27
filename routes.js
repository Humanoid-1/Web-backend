import express from "express";

// ----------- Laptop Controllers -----------
import {
  getLaptops,
  getLaptopsByBrand,
  getCPUs,
  getRAMs,
  getStorages,
  createLaptop,
  updateLaptop,
  deleteLaptop,
  getLaptopById,
} from "./controllers/laptopController.js";

// ----------- Accessory Controllers -----------
import {
  getAccessories,
  createAccessory,
  updateAccessory,
  deleteAccessory,
  getAccessoryById,
} from "./controllers/accessoryController.js";

// ----------- Auth Controllers -----------
import {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
} from "./controllers/authController.js";

// ----------- Middleware -----------
import protect from "./middleware/authMiddleware.js";
import { addAddress, getUserAddresses, deleteAddress } from "./controllers/addressController.js";
import upload from "./middleware/upload.js";

// ----------- Search Controllers -----------
import { searchLaptops } from "./controllers/searchLaptop.js";
import { searchAccessories } from "./controllers/searchAccessory.js";
import { searchParts } from "./controllers/searchPart.js";

// ----------- Parts Controllers -----------
import {
  createPart,
  getParts,
  getPartsByCategory,
  updatePart,
  getPartById,
  deletePart,
} from "./controllers/partController.js";

// ----------- Slider Controllers -----------
import {
  uploadSliderImage,
  getAllSliderImages,
} from "./controllers/sliderController.js";

// ----------- Contact Controller -----------
import { submitContactForm } from "./controllers/contactController.js";

// ----------- Brand Controller -----------
import { getBrands } from "./controllers/brandController.js";

// ----------- Models -----------
import Accessory from "./models/accessoryModel.js";
import Part from "./models/partModel.js";

// ----------- Order Routes -----------

import {
  saveOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "./controllers/orderController.js";


const router = express.Router();

// ----------- Laptop Routes -----------
router.post("/createLaptop", upload.array("images", 4), createLaptop);
router.get("/getLaptops", getLaptops);
router.get("/getLaptopsByBrand/:brand", getLaptopsByBrand);
router.put("/updateLaptop/:id", upload.array("images", 4), updateLaptop);
router.delete("/deleteLaptop/:id", deleteLaptop);
router.get("/getLaptop/:id", getLaptopById);

// 🔹 ADDED (laptop only)
router.get("/getCPUs", getCPUs);
router.get("/getRAMs", getRAMs);
router.get("/getStorages", getStorages);

// ---------- Accessory Routes ----------
router.post("/createAccessory", createAccessory);
router.get("/getAccessories", getAccessories);
router.put("/updateAccessory/:id", updateAccessory);
router.delete("/deleteAccessory/:id", deleteAccessory);
router.get("/getAccessory/:id", getAccessoryById);

// --------- Get All Accessory Categories ---------
router.get("/getAccessoryCategories", async (req, res) => {
  try {
    const categories = await Accessory.distinct("category");
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
});

// --------- Get All Accessory Brands ---------
router.get("/getAccessoryBrands", async (req, res) => {
  try {
    const brands = await Accessory.distinct("brand");
    res.json({ success: true, brands });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch accessory brands",
    });
  }
});

// ------------- Auth Routes -------------
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post("/auth/logout", logoutUser);
router.put("/auth/change-password", protect, changePassword);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

// ------------- Parts Routes -------------
router.post("/createPart", createPart);
router.get("/getParts", getParts);
router.get("/getPartsByCategory/:category", getPartsByCategory);
router.put("/updatePart/:id", updatePart);
router.delete("/deletePart/:id", deletePart);
router.get("/getPart/:id", getPartById);

// --------- Get All Part Brands ---------
router.get("/getPartBrands", async (req, res) => {
  try {
    const brands = await Part.distinct("brand");
    res.json({ success: true, brands });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
});

// --------- Get All Part Categories ---------
router.get("/getPartCategories", async (req, res) => {
  try {
    const categories = await Part.distinct("category");
    res.json({ success: true, categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// ----------- Search Routes -----------
router.get("/laptops/search", searchLaptops);
router.get("/accessories/search", searchAccessories);
router.get("/parts/search", searchParts);

// ------------- Order Routes -------------
router.post("/save", protect, saveOrder);
router.get("/orders/my", protect, getMyOrders);
router.get("/orders/:id", protect, getOrderById);
router.put("/orders/:id/status", protect, updateOrderStatus);

// ----------- Slider Routes -----------
router.post("/slider/upload", upload.single("image"), uploadSliderImage);
router.get("/slider", getAllSliderImages);

// ----------- Contact Route -----------
router.post("/contact", submitContactForm);

// ----------- Brand Routes -----------
router.get("/getBrands", getBrands);

// ----------- Address Routes -----------
router.post("/address/add", protect, addAddress);
router.get("/address/user", protect, getUserAddresses);
router.delete("/address/delete/:id", protect, deleteAddress);

export default router;
