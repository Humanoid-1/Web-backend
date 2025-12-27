import Part from "../models/partModel.js";

// Search parts with filters, pagination, and exact match boost
export const searchParts = async (req, res) => {
  // try {
    const { q, category, brand, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    let filter = {};
    let keywords = [];

    if (q) {
      keywords = q.split(' ').filter(k => k.trim() !== '');
      filter.$or = keywords.flatMap(k => [
        { name: { $regex: k, $options: "i" } },
        { category: { $regex: k, $options: "i" } },
        { brand: { $regex: k, $options: "i" } },
        { ram: { $regex: k, $options: "i" } },
        { processor: { $regex: k, $options: "i" } }
      ]);
    }

    if (category) filter.category = { $regex: category, $options: "i" };
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalCount = await Part.countDocuments(filter);

    const parts = await Part.aggregate([
      { $match: filter },
      {
        $addFields: {
          exactMatchScore: {
            $sum: keywords.map(k => ({
              $cond: [
                {
                  $or: [
                    { $regexMatch: { input: { $ifNull: ["$name", ""] }, regex: k, options: "i" } },
                    { $regexMatch: { input: { $ifNull: ["$brand", ""] }, regex: k, options: "i" } },
                    { $regexMatch: { input: { $ifNull: ["$category", ""] }, regex: k, options: "i" } },
                    { $regexMatch: { input: { $ifNull: ["$ram", ""] }, regex: k, options: "i" } },
                    { $regexMatch: { input: { $ifNull: ["$processor", ""] }, regex: k, options: "i" } },
                  ]
                },
                1,
                0
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
      count: parts.length,
      total: totalCount,
      page: pageNumber,
      pages: Math.ceil(totalCount / limitNumber),
      data: parts,
    });
  // } catch (err) {
  //   res.status(500).json({ success: false, message: err.message });
  // }
};
