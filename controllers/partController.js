import Part from "../models/partModel.js";

// CREATE Part
export const createPart = async (req, res, next) => {
  const part = new Part(req.body);
  const savedPart = await part.save();
  res.status(201).json(savedPart);
};

// GET Parts with filters, pagination, and optional keyword search
export const getParts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { category, brand, minPrice, maxPrice, keyword } = req.query;

  let filter = {};

  // Keyword search
  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { brand: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  // Category filter (ignore "all")
  if (category && category.toLowerCase() !== "all") {
    const categories = category
      .split(",")
      .map(c => new RegExp(`^${c.trim()}$`, "i"));
    filter.category = { $in: categories };
  }

  // Brand filter (ignore "all")
  if (brand && brand.toLowerCase() !== "all") {
    const brands = brand
      .split(",")
      .map(b => new RegExp(`^${b.trim()}$`, "i"));
    filter.brand = { $in: brands };
  }

  // Price filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  try {
    const total = await Part.countDocuments(filter);
    const parts = await Part.find(filter).skip(skip).limit(limit);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: parts,
    });
  } catch (error) {
    console.error("Error fetching parts:", error);
    res.status(500).json({ message: "Failed to fetch parts" });
  }
};

// ✅ GET Part by ID (ADDED – NO OTHER CHANGES)
export const getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.json(part);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch part" });
  }
};

// GET Parts by Category
export const getPartsByCategory = async (req, res, next) => {
  const { category } = req.params;

  try {
    const filter =
      category.toLowerCase() === "all"
        ? {}
        : { category: new RegExp(`^${category}$`, "i") };

    const parts = await Part.find(filter);
    res.json(parts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch parts by category" });
  }
};

// GET unique categories
export const getPartCategories = async (req, res) => {
  try {
    const categories = await Part.distinct("category");
    res.json({ success: true, categories: categories.filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// UPDATE Part
export const updatePart = async (req, res, next) => {
  try {
    const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!part) return res.status(404).json({ message: "Part not found" });
    res.json(part);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update part" });
  }
};

// DELETE Part
export const deletePart = async (req, res, next) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ message: "Part not found" });
    res.json({ message: "Part deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete part" });
  }
};

// SEARCH Parts
export const searchPartsByKeyword = async (req, res, next) => {
  const keyword = req.params.keyword;
  try {
    const parts = await Part.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ],
    });
    res.json({ results: parts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to search parts" });
  }
};

// GET unique brands
export const getPartBrands = async (req, res) => {
  try {
    const brands = await Part.distinct("brand");
    res.json({ success: true, brands: brands.filter(Boolean) });
  } catch (error) {
    console.error("Error fetching part brands:", error);
    res.status(500).json({ success: false, message: "Failed to fetch brands" });
  }
};
