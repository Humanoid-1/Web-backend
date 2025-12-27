import Laptop from "../models/Laptop.js";

const makeFullUrl = (req, path) => {
  if (!path) return null;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

/* 🔹 Helper: convert comma values to regex array */
const toRegexArray = (value) =>
  typeof value === "string" && value.includes(",")
    ? value.split(",").map(v => new RegExp(`^${v}$`, "i"))
    : new RegExp(`^${value}$`, "i");

// Get all laptops with pagination + filters
const getLaptops = async (req, res) => {
  const {
    page = 1,
    limit = 12,
    brand,
    category,
    minPrice,
    maxPrice,
    minRating,
    maxRating,
    q,
    cpu,
    ram,
    storage,
  } = req.query;

  const skip = (page - 1) * limit;
  let filter = {};

  // 🔍 Search
  if (q) {
    filter.$or = [
      { brand: { $regex: q, $options: "i" } },
      { model: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { specs: { $regex: q, $options: "i" } },
    ];
  }

  // ✅ Multi-select filters
  if (brand && brand !== "All") {
    const b = toRegexArray(brand);
    filter.brand = Array.isArray(b) ? { $in: b } : b;
  }

  if (category && category !== "All") {
    const c = toRegexArray(category);
    filter.category = Array.isArray(c) ? { $in: c } : c;
  }

  if (cpu) {
    const c = toRegexArray(cpu);
    filter.cpu = Array.isArray(c) ? { $in: c } : c;
  }

  if (ram) {
    const r = toRegexArray(ram);
    filter.ram = Array.isArray(r) ? { $in: r } : r;
  }

  if (storage) {
    const s = toRegexArray(storage);
    filter.storage = Array.isArray(s) ? { $in: s } : s;
  }

  // 💰 Price filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // ⭐ Rating filter
  if (minRating || maxRating) {
    filter.ratings = {};
    if (minRating) filter.ratings.$gte = Number(minRating);
    if (maxRating) filter.ratings.$lte = Number(maxRating);
  }

  const laptops = await Laptop.find(filter)
    .skip(skip)
    .limit(Number(limit));

  const total = await Laptop.countDocuments(filter);

  const updatedLaptops = laptops.map((l) => ({
    ...l._doc,
    image_url: l.image_url?.map((img) => makeFullUrl(req, img)),
  }));

  res.json({
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    data: updatedLaptops,
  });
};

// Get laptops by brand (NOW supports multi-brand + filters)
const getLaptopsByBrand = async (req, res) => {
  const { brand } = req.params;
  const { page = 1, limit = 12, cpu, ram, storage } = req.query;

  const skip = (page - 1) * limit;
  let filter = {};

  // ✅ Multi-brand support
  const b = toRegexArray(brand);
  filter.brand = Array.isArray(b) ? { $in: b } : b;

  // ✅ Multi-select filters
  if (cpu) {
    const c = toRegexArray(cpu);
    filter.cpu = Array.isArray(c) ? { $in: c } : c;
  }

  if (ram) {
    const r = toRegexArray(ram);
    filter.ram = Array.isArray(r) ? { $in: r } : r;
  }

  if (storage) {
    const s = toRegexArray(storage);
    filter.storage = Array.isArray(s) ? { $in: s } : s;
  }

  const laptops = await Laptop.find(filter)
    .skip(skip)
    .limit(Number(limit));

  const total = await Laptop.countDocuments(filter);

  const updatedLaptops = laptops.map((l) => ({
    ...l._doc,
    image_url: l.image_url?.map((img) => makeFullUrl(req, img)),
  }));

  res.json({
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    data: updatedLaptops,
  });
};

// Dropdown APIs
const getCPUs = async (req, res) => {
  const cpus = await Laptop.distinct("cpu");
  res.json({ success: true, cpus });
};

const getRAMs = async (req, res) => {
  const rams = await Laptop.distinct("ram");
  res.json({ success: true, rams });
};

const getStorages = async (req, res) => {
  const storages = await Laptop.distinct("storage");
  res.json({ success: true, storages });
};

// CRUD
const createLaptop = async (req, res) => {
  const newLaptop = new Laptop(req.body);
  const savedLaptop = await newLaptop.save();
  res.status(201).json({
    ...savedLaptop._doc,
    image_url: savedLaptop.image_url?.map((img) => makeFullUrl(req, img)),
  });
};

const updateLaptop = async (req, res) => {
  const updated = await Laptop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated) return res.status(404).json({ message: "Laptop not found" });

  res.json({
    ...updated._doc,
    image_url: updated.image_url?.map((img) => makeFullUrl(req, img)),
  });
};

const getLaptopById = async (req, res) => {
  try {
    const laptop = await Laptop.findById(req.params.id);

    if (!laptop) {
      return res.status(404).json({
        success: false,
        message: "Laptop not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...laptop._doc,
        image_url: laptop.image_url?.map((img) => makeFullUrl(req, img)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Invalid laptop ID or server error",
    });
  }
};


const deleteLaptop = async (req, res) => {
  const deleted = await Laptop.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Laptop not found" });
  res.json({ message: "Laptop deleted" });
};

export {
  getLaptops,
  getLaptopsByBrand,
  getCPUs,
  getRAMs,
  getStorages,
  createLaptop,
  updateLaptop,
  deleteLaptop,
  getLaptopById,
};
