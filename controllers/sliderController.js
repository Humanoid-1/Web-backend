// sliderController.js
import Slider from '../models/Slider.js';

const makeFullUrl = (req, path) => {
  if (!path) return null;
  // ensure there's exactly one leading slash
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${req.protocol}://${req.get('host')}/${normalized}`;
};

export const uploadSliderImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image required' });
    }

    const { title, link } = req.body;

    // keep relative path in DB (no leading slash required)
    const relativePath = `uploads/${req.file.filename}`;

    const newSlider = new Slider({
      image_url: relativePath,
      title,
      link
    });

    const saved = await newSlider.save();

    // return full URL in response
    res.status(201).json({
      message: 'Slider image added',
      data: {
        ...saved._doc,
        image_url: makeFullUrl(req, saved.image_url)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllSliderImages = async (req, res, next) => {
  try {
    const images = await Slider.find({}, { __v: 0 }).sort({ createdAt: -1 });

    const updated = images.map(img => {
      // img.image_url may be 'uploads/filename.jpg' or '/uploads/fliename.jpg' etc.
      return {
        ...img._doc,
        imageUrl: makeFullUrl(req, img.imageUrl)
      };
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};
