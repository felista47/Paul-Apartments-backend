const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const Property = require('../models/Property');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// Helper function to process file paths
const processFilePaths = (req, files) => {
  if (!files || files.length === 0) return [];
  return files.map(file => getFileUrl(req, file.path));
};

// Helper function to delete files
const deleteFiles = (files) => {
  if (!files || files.length === 0) return;
  
  files.forEach(filePath => {
    if (filePath) {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  });
};

exports.getAllProperties = catchAsync(async (req, res, next) => {
  const {
    search,
    city,
    state,
    beds,
    baths,
    min_price,
    max_price,
    is_featured,
    is_active,
    amenities,
    sort_by,
    order = 'DESC',
    page = 1,
    limit = 10
  } = req.query;

  const offset = (page - 1) * limit;

  const where = {};
  
  // Global search
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { address: { [Op.like]: `%${search}%` } }
    ];
  }

  // Filters
  if (city) where.city = city;
  if (state) where.state = state;
  if (beds) where.beds = beds;
  if (baths) where.baths = baths;
  
  // Price range
  if (min_price || max_price) {
    where.price_per_month = {};
    if (min_price) where.price_per_month[Op.gte] = min_price;
    if (max_price) where.price_per_month[Op.lte] = max_price;
  }

  // Boolean filters
  if (is_featured) where.is_featured = is_featured === 'true';
  if (is_active) where.is_active = is_active === 'true';

  // Amenities filter
  if (amenities) {
    const amenitiesArray = amenities.split(',');
    where.amenities = {
      [Op.overlap]: amenitiesArray
    };
  }

  // Sorting
  const orderClause = [];
  if (sort_by) {
    orderClause.push([sort_by, order]);
  } else {
    orderClause.push(['name', 'ASC']); // Default sort
  }

  const { count, rows } = await Property.findAndCountAll({
    where,
    order: orderClause,
    limit,
    offset,
    include: [
      {
        model: User,
        as: 'likedByUsers',
        attributes: ['id', 'name']
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: count,
    data: {
      properties: rows
    }
  });
});

exports.getProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'likedByUsers',
        attributes: ['id', 'name']
      }
    ]
  });

  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      property
    }
  });
});

exports.createProperty = catchAsync(async (req, res, next) => {
  const {
    name,
    address,
    city,
    state,
    floor,
    beds,
    baths,
    guest_wc,
    square_meters,
    price_per_night,
    price_per_month,
    description,
    neighborhood,
    is_featured,
    is_active
  } = req.body;

  let { amenities } = req.body;

  // Handle amenities format
  if (amenities) {
    try {
      if (typeof amenities === 'string') {
        if (amenities.startsWith('[')) {
          amenities = JSON.parse(amenities);
        } else {
          amenities = amenities.split(',').map(item => item.trim());
        }
      }
    } catch (err) {
      return next(new AppError('Invalid amenities format', 400));
    }
  }

  const files = req.files || {};

  // Featured image
  const featuredImage = files.featured_image?.[0]?.path || null;

  // Merge gallery_images and gallery_images[]
  const galleryImages = [
    ...(files.gallery_images || []),
    ...(files['gallery_images[]'] || [])
  ].map(file => file.path);

  // Merge videos and videos[]
  const videos = [
    ...(files.videos || []),
    ...(files['videos[]'] || [])
  ].map(file => file.path);

  const property = await Property.create({
    name,
    address,
    city,
    state,
    floor,
    beds,
    baths,
    guest_wc,
    square_meters,
    price_per_night,
    price_per_month,
    description,
    neighborhood,
    amenities: amenities || null,
    featured_image: featuredImage,
    gallery_images: galleryImages,
    videos,
    is_featured: is_featured === 'true' || is_featured === true,
    is_active: is_active === 'true' || is_active === true
  });

  res.status(201).json({
    status: 'success',
    data: {
      property
    }
  });
});


exports.updateProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findByPk(req.params.id);
  if (!property) return next(new AppError('No property found with that ID', 404));

  const updates = { ...req.body };
  const files = req.files;
console.log('Files:', files);
  console.log('Body:', req.body);
  // Handle amenities (string or JSON)
  if (updates.amenities) {
    try {
      if (typeof updates.amenities === 'string') {
        if (updates.amenities.startsWith('[')) {
          updates.amenities = JSON.parse(updates.amenities);
        } else {
          updates.amenities = updates.amenities.split(',').map(item => item.trim());
        }
      }
    } catch {
      return next(new AppError('Invalid amenities format', 400));
    }
  }

  // Featured image
  if (files.featured_image && files.featured_image[0]) {
    updates.featured_image = files.featured_image[0].path;
  }

  // Gallery images
  if (files.gallery_images) {
    const currentGallery = property.gallery_images || [];
    const newGallery = files.gallery_images.map(file => file.path);
    updates.gallery_images = [...currentGallery, ...newGallery];
  }

  // Videos
  if (files.videos) {
    const currentVideos = property.videos || [];
    const newVideos = files.videos.map(file => file.path);
    updates.videos = [...currentVideos, ...newVideos];
  }

  // Boolean fields
  if (updates.is_featured !== undefined)
    updates.is_featured = updates.is_featured === 'true' || updates.is_featured === true;
  if (updates.is_active !== undefined)
    updates.is_active = updates.is_active === 'true' || updates.is_active === true;

  // Save updates
  try {
    await property.update(updates);
  } catch (err) {
    return next(new AppError('Error updating the property in the database', 500));
  }

  res.status(200).json({
    status: 'success',
    data: {
      property
    }
  });
});



exports.deleteProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findByPk(req.params.id);
  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  // Delete associated files
  const filesToDelete = [];
  if (property.featured_image) filesToDelete.push(property.featured_image);
  if (property.gallery_images) filesToDelete.push(...property.gallery_images);
  if (property.videos) filesToDelete.push(...property.videos);

  deleteFiles(filesToDelete);

  await property.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.likeProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findByPk(req.params.id);
  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  // Check if already liked
  const alreadyLiked = await req.user.hasLikedProperty(property);
  if (alreadyLiked) {
    return next(new AppError('You have already liked this property', 400));
  }

  await req.user.addLikedProperty(property);

  res.status(200).json({
    status: 'success',
    message: 'Property liked successfully'
  });
});

exports.unlikeProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findByPk(req.params.id);
  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  await req.user.removeLikedProperty(property);

  res.status(200).json({
    status: 'success',
    message: 'Property unliked successfully'
  });
});

exports.getLikedProperties = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const result = await req.user.getLikedProperties({
    limit,
    offset,
    include: [
      {
        model: User,
        as: 'likedByUsers',
        attributes: ['id', 'name']
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      properties: result
    }
  });
});