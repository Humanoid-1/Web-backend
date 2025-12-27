import Accessory from "../models/accessoryModel.js";

export const searchAccessories = async (req, res) => {
  // try {
    const { q, brand, category, type, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    let filter = {};

    // General search in multiple fields
    if (q) {
      const keywords = q.split(' ').filter(k => k.trim() !== '');
      filter.$or = keywords.flatMap(k => [
        { brand: { $regex: k, $options: "i" } },
        { model: { $regex: k, $options: "i" } },
        { type: { $regex: k, $options: "i" } },
        { category: { $regex: k, $options: "i" } },
        { features: { $elemMatch: { $regex: k, $options: "i" } } }
      ]);
    }

    // Additional filters
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (category) filter.category = { $regex: category, $options: "i" };
    if (type) filter.type = { $regex: type, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalCount = await Accessory.countDocuments(filter);

    // Exact match scoring applied to ALL relevant fields
    const keywords = q ? q.toLowerCase().split(' ').filter(k => k.trim() !== '') : [];

    const accessories = await Accessory.aggregate([
      { $match: filter },
      {
        $addFields: {
          exactMatchScore: {
            $sum: keywords.map(word => ({
              $add: [
                { $cond: [{ $eq: [{ $toLower: "$brand" }, word] }, 5, 0] },
                { $cond: [{ $eq: [{ $toLower: "$category" }, word] }, 4, 0] },
                { $cond: [{ $eq: [{ $toLower: "$type" }, word] }, 3, 0] },
                { $cond: [{ $eq: [{ $toLower: "$model" }, word] }, 2, 0] },
                { $cond: [{ $in: [word, { $map: { input: "$features", as: "f", in: { $toLower: "$$f" } } }] }, 1, 0] }
              ]
            }))
          }
        }
      },
      { $sort: { exactMatchScore: -1 } },
      { $skip: skip },
      { $limit: limitNumber }
    ]);

    res.json({
      success: true,
      count: accessories.length,
      total: totalCount,
      page: pageNumber,
      pages: Math.ceil(totalCount / limitNumber),
      data: accessories
    });

  // } catch (err) {
  //   res.status(500).json({ success: false, message: err.message });
  // }
};
