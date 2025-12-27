import Laptop from "../models/Laptop.js";

// Search Laptops with filtering + pagination + partial match boost (including RAM)
export const searchLaptops = async (req, res) => {
  // try {
    const { q, brand, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    let filter = {};
    let keywords = [];

    if (q) {
      keywords = q.split(' ').filter(k => k.trim() !== '');
      filter.$or = keywords.flatMap(k => [
        { name: { $regex: k, $options: "i" } },
        { brand: { $regex: k, $options: "i" } },
        { model: { $regex: k, $options: "i" } },
        { description: { $regex: k, $options: "i" } },
        { processor: { $regex: k, $options: "i" } },
        { ram: { $regex: k, $options: "i" } } 
      ]);
    }

    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalCount = await Laptop.countDocuments(filter);

    // Aggregation:
    const laptops = await Laptop.aggregate([
      { $match: filter },
      {
        $addFields: {
          exactMatchScore: {
            $sum: keywords.map(k => ({
              $cond: [
                { $or: [
                    { $regexMatch: { input: { $toLower: "$model" }, regex: k.toLowerCase() } },
                    { $regexMatch: { input: { $toLower: "$processor" }, regex: k.toLowerCase() } },
                    { $regexMatch: { input: { $toLower: "$ram" }, regex: k.toLowerCase() } } 
                ] },
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
      count: laptops.length,
      total: totalCount,
      page: pageNumber,
      pages: Math.ceil(totalCount / limitNumber),
      data: laptops
    });
  // } catch (err) {
  //   res.status(500).json({ success: false, message: err.message });
  // }
};
