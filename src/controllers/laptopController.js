import Laptop from "../models/Laptop.js";

// GET all laptops
export const getLaptops = async (req, res, next) => {
  try {
    const laptops = await Laptop.find();
    res.json(laptops);
  } catch (err) {
    next(err);
  }
};

// GET by ID
export const getLaptopById = async (req, res, next) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) return res.status(404).json({ message: "Laptop not found" });
    res.json(laptop);
  } catch (err) {
    next(err);
  }
};

// GET by brand
export const getLaptopsByBrand = async (req, res, next) => {
  try {
    const laptops = await Laptop.find({ brand: req.params.brand });
    res.json(laptops);
  } catch (err) {
    next(err);
  }
};

// POST create new laptop
export const createLaptop = async (req, res, next) => {
  try {
    const laptop = await Laptop.create(req.body);
    res.status(201).json(laptop);
  } catch (err) {
    next(err);
  }
};

// PUT update laptop
export const updateLaptop = async (req, res, next) => {
  try {
    const laptop = await Laptop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!laptop) return res.status(404).json({ message: "Laptop not found" });
    res.json(laptop);
  } catch (err) {
    next(err);
  }
};

// DELETE laptop
export const deleteLaptop = async (req, res, next) => {
  try {
    const laptop = await Laptop.findByIdAndDelete(req.params.id);
    if (!laptop) return res.status(404).json({ message: "Laptop not found" });
    res.json({ message: "Laptop deleted" });
  } catch (err) {
    next(err);
  }
};
