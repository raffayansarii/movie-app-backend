const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Movie = require('../models/movies');
const { movieSchema } = require('../validations/schema');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create an uploads directory if it does not exist
const fs = require('fs');
const authenticateToken = require('../middlewares/authMiddleware');
const uploadsDir = './public';
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir);
}

// Create Movie
router.post('/', authenticateToken,upload.single('image'), async (req, res) => {
  const { error } = movieSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  const { title, publishing_date, description } = req.body;
  const image = req.file ? `images/${ req.file.filename }` : null;

  try {
    const movie = new Movie({ title, publishing_date, description, image });
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
});

// Get All Movies
router.get('/', authenticateToken, async (req, res) => {
  // Default values for pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Find movies with pagination
    const movies = await Movie.find()
      .skip(skip)
      .limit(limit);

    // Get the total count of documents
    const totalMovies = await Movie.countDocuments();

    // Send response with pagination details
    res.json({
      page,
      limit,
      totalMovies,
      totalPages: Math.ceil(totalMovies / limit),
      movies
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
});

// Get Movie by ID
router.get('/movies/:id', authenticateToken,async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
});

// Update Movie by ID
router.put('/:id',authenticateToken, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, publishing_date, description } = req.body;
  const image = req.file ? `images/${ req.file.filename }` : req?.body?.image;

  try {
    const movie = await Movie.findByIdAndUpdate(
      id,
      { title, publishing_date, description, image },
      { new: true }
    );
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
});

// Delete Movie by ID
router.delete('/movies/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    res.json({ msg: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
});
module.exports = router;
