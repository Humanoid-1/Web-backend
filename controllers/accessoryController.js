import Accessory from "../models/accessoryModel.js";

// GET Accessories with filters, pagination, and multi-select support
const getAccessories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { brand, category, minPrice, maxPrice, inStock, keyword } = req.query;

    let filter = {};

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ];
    }

    if (category) {
      const categoriesArray = category.split(",").map(c => c.trim());
      filter.category = { $in: categoriesArray };
    }

    if (brand) {
      const brandsArray = brand.split(",").map(b => b.trim());
      filter.brand = { $in: brandsArray };
    }

    if (inStock !== undefined) {
      filter.inStock = inStock === "true";
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const accessories = await Accessory.find(filter).skip(skip).limit(limit);
    const total = await Accessory.countDocuments(filter);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: accessories,
    });
  } catch (error) {
    next(error);
  }
};

// Other Accessory Controllers
const createAccessory = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.files) data.images = req.files.map(f => `/uploads/${f.filename}`);
    const newAccessory = new Accessory(data);
    const saved = await newAccessory.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

const updateAccessory = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.files) data.images = req.files.map(f => `/uploads/${f.filename}`);
    const updated = await Accessory.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: "Accessory not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const deleteAccessory = async (req, res, next) => {
  try {
    const deleted = await Accessory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Accessory not found" });
    res.json({ message: "Accessory deleted" });
  } catch (err) {
    next(err);
  }
};

const getAccessoryById = async (req, res, next) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) return res.status(404).json({ message: "Accessory not found" });
    res.json(accessory);
  } catch (err) {
    next(err);
  }
};

// ✅ Export all controllers
export {
  getAccessories,
  createAccessory,
  updateAccessory,
  deleteAccessory,
  getAccessoryById,
};

//export another as you need