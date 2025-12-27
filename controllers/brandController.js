import Brand from "../models/brandModel.js";

export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({})
      .sort({ name: 1 })      // A → Z
      .select("name -_id");   // only name

    // convert [{name:"Dell"}] → ["Dell"]
    const brandNames = brands.map(b => b.name);

    res.status(200).json({
      success: true,
      brands: brandNames
    });
  } catch (error) {
    console.error("Get Brands Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands"
    });
  }
};
