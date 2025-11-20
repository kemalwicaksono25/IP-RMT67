const db = require("../models");
const AIService = require("../services/aiService");
const AppError = require("../errors/AppError");

class ProductController {
  static async getAll(req, res, next) {
    try {
      const products = await db.Product.findAll({
        where: { ProjectId: req.user.ProjectId },
        order: [["createdAt", "DESC"]],
      });

      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const product = await db.Product.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!product) {
        throw new AppError("Produk tidak ditemukan", 404);
      }

      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name, description, link } = req.body;
      
      // Handle multiple images
      // Support both req.files (array) and req.files.images/req.files.image (fields)
      let imageUrls = [];
      if (req.files) {
        if (Array.isArray(req.files)) {
          // upload.array() - files is array
          imageUrls = req.files.map(file => file.path);
        } else if (req.files.images) {
          // upload.fields() - files is object with 'images' field
          imageUrls = req.files.images.map(file => file.path);
        } else if (req.files.image) {
          // upload.fields() - files is object with 'image' field (backward compatibility)
          imageUrls = [req.files.image[0].path];
        }
      } else if (req.file) {
        // Backward compatibility: single file (upload.single())
        imageUrls = [req.file.path];
      }
      
      // Set imageUrl for backward compatibility (first image)
      const imageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

      const product = await db.Product.create({
        name,
        description: description || "",
        link: link || "",
        imageUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : [],
        ProjectId: req.user.ProjectId,
      });

      try {
        const pgg = await AIService.generatePGG(product);
        await product.update({
          pains: Array.isArray(pgg.pains) ? pgg.pains : [],
          gains: Array.isArray(pgg.gains) ? pgg.gains : [],
          goals: Array.isArray(pgg.goals) ? pgg.goals : [],
        });
      } catch (aiError) {
        console.error("AI Generation Error:", aiError);
      }
      await product.reload();

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, link, pains, gains, goals } = req.body;

      const product = await db.Product.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!product) {
        throw new AppError("Produk tidak ditemukan", 404);
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (link !== undefined) updateData.link = link;
      
      if (pains !== undefined) {
        try {
          updateData.pains = typeof pains === 'string' ? JSON.parse(pains) : pains;
          if (!Array.isArray(updateData.pains)) updateData.pains = [];
        } catch (e) {
          updateData.pains = Array.isArray(pains) ? pains : [];
        }
      }
      if (gains !== undefined) {
        try {
          updateData.gains = typeof gains === 'string' ? JSON.parse(gains) : gains;
          if (!Array.isArray(updateData.gains)) updateData.gains = [];
        } catch (e) {
          updateData.gains = Array.isArray(gains) ? gains : [];
        }
      }
      if (goals !== undefined) {
        try {
          updateData.goals = typeof goals === 'string' ? JSON.parse(goals) : goals;
          if (!Array.isArray(updateData.goals)) updateData.goals = [];
        } catch (e) {
          updateData.goals = Array.isArray(goals) ? goals : [];
        }
      }

      // Handle multiple images
      // Support both req.files (array) and req.files.images/req.files.image (fields)
      let newImageUrls = [];
      if (req.files) {
        if (Array.isArray(req.files)) {
          // upload.array() - files is array
          newImageUrls = req.files.map(file => file.path);
        } else if (req.files.images) {
          // upload.fields() - files is object with 'images' field
          newImageUrls = req.files.images.map(file => file.path);
        } else if (req.files.image) {
          // upload.fields() - files is object with 'image' field (backward compatibility)
          newImageUrls = [req.files.image[0].path];
        }
      } else if (req.file) {
        // Backward compatibility: single file (upload.single())
        newImageUrls = [req.file.path];
      }
      
      // Get remaining existing images from request body
      let remainingExistingUrls = [];
      if (req.body.existingImageUrls) {
        try {
          remainingExistingUrls = typeof req.body.existingImageUrls === 'string' 
            ? JSON.parse(req.body.existingImageUrls) 
            : req.body.existingImageUrls;
          if (!Array.isArray(remainingExistingUrls)) {
            remainingExistingUrls = [];
          }
        } catch (e) {
          // Invalid JSON, ignore
          remainingExistingUrls = [];
        }
      }
      
      // Merge remaining existing images with new images
      if (newImageUrls.length > 0 || remainingExistingUrls.length > 0) {
        // Merge: remaining existing + new images
        const mergedImageUrls = [...remainingExistingUrls, ...newImageUrls];
        
        // Check total doesn't exceed 10
        if (mergedImageUrls.length > 10) {
          // Keep only first 10
          updateData.imageUrls = mergedImageUrls.slice(0, 10);
        } else {
          updateData.imageUrls = mergedImageUrls;
        }
        
        // Set first image for backward compatibility
        updateData.imageUrl = updateData.imageUrls.length > 0 ? updateData.imageUrls[0] : null;
      }
      // If no files uploaded and no existingImageUrls in body, keep existing images (don't update imageUrls)

      await product.update(updateData);

      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const product = await db.Product.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!product) {
        throw new AppError("Produk tidak ditemukan", 404);
      }

      await product.destroy();

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;

