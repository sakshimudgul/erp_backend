const { ApiResponse } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

// In real application, this would use a Material model
const materials = [];
const categories = ['Lecture Notes', 'Presentations', 'Reference Materials', 'Videos', 'Practice Problems'];

const materialController = {
  // Get materials
  getMaterials: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const subjectMaterials = materials.filter(m => m.subjectId === subjectId);

      res.status(200).json(new ApiResponse(true, 'Materials retrieved', { materials: subjectMaterials }, 200));
    } catch (error) {
      logger.error('Get materials error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get materials', null, 500));
    }
  },

  // Upload material
  uploadMaterial: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { title, description, category, type } = req.body;

      if (!req.file) {
        return res.status(400).json(new ApiResponse(false, 'No file uploaded', null, 400));
      }

      const material = {
        id: Date.now(),
        subjectId,
        title,
        description,
        category,
        type,
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        uploadedBy: req.userId,
        uploadedAt: new Date(),
        downloads: 0
      };

      materials.push(material);

      res.status(201).json(new ApiResponse(true, 'Material uploaded', { material }, 201));
    } catch (error) {
      logger.error('Upload material error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to upload material', null, 500));
    }
  },

  // Get material by ID
  getMaterialById: async (req, res) => {
    try {
      const { id } = req.params;

      const material = materials.find(m => m.id === parseInt(id));

      if (!material) {
        return res.status(404).json(new ApiResponse(false, 'Material not found', null, 404));
      }

      // Increment download count
      material.downloads += 1;

      res.status(200).json(new ApiResponse(true, 'Material retrieved', { material }, 200));
    } catch (error) {
      logger.error('Get material by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get material', null, 500));
    }
  },

  // Update material
  updateMaterial: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const materialIndex = materials.findIndex(m => m.id === parseInt(id));

      if (materialIndex === -1) {
        return res.status(404).json(new ApiResponse(false, 'Material not found', null, 404));
      }

      materials[materialIndex] = {
        ...materials[materialIndex],
        ...updates,
        updatedAt: new Date()
      };

      res.status(200).json(new ApiResponse(true, 'Material updated', { material: materials[materialIndex] }, 200));
    } catch (error) {
      logger.error('Update material error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update material', null, 500));
    }
  },

  // Delete material
  deleteMaterial: async (req, res) => {
    try {
      const { id } = req.params;

      const materialIndex = materials.findIndex(m => m.id === parseInt(id));

      if (materialIndex === -1) {
        return res.status(404).json(new ApiResponse(false, 'Material not found', null, 404));
      }

      materials.splice(materialIndex, 1);

      res.status(200).json(new ApiResponse(true, 'Material deleted', null, 200));
    } catch (error) {
      logger.error('Delete material error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete material', null, 500));
    }
  },

  // Get categories
  getCategories: async (req, res) => {
    try {
      res.status(200).json(new ApiResponse(true, 'Categories retrieved', { categories }, 200));
    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get categories', null, 500));
    }
  },

  // Create category
  createCategory: async (req, res) => {
    try {
      const { name } = req.body;

      if (categories.includes(name)) {
        return res.status(400).json(new ApiResponse(false, 'Category already exists', null, 400));
      }

      categories.push(name);

      res.status(201).json(new ApiResponse(true, 'Category created', { category: name }, 201));
    } catch (error) {
      logger.error('Create category error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create category', null, 500));
    }
  },

  // Get material statistics
  getMaterialStatistics: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const subjectMaterials = materials.filter(m => m.subjectId === subjectId);

      const statistics = {
        totalMaterials: subjectMaterials.length,
        byCategory: {},
        totalDownloads: subjectMaterials.reduce((sum, m) => sum + m.downloads, 0)
      };

      subjectMaterials.forEach(m => {
        if (m.category) {
          statistics.byCategory[m.category] = (statistics.byCategory[m.category] || 0) + 1;
        }
      });

      res.status(200).json(new ApiResponse(true, 'Material statistics retrieved', { statistics }, 200));
    } catch (error) {
      logger.error('Get material statistics error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get material statistics', null, 500));
    }
  }
};

module.exports = materialController;