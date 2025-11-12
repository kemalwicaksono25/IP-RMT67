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
      const imageUrl = req.file
        ? req.file.path
        : null;

      const product = await db.Product.create({
        name,
        description: description || "",
        link: link || "",
        imageUrl,
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

      if (req.file) {
        updateData.imageUrl = req.file.path;
      }

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

