const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');

class FileService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      'profile',
      'documents',
      'assignments',
      'materials',
      'reports',
      'temporary'
    ];
    
    dirs.forEach(dir => {
      const fullPath = path.join(this.uploadDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  generateFileName(originalName) {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const uuid = uuidv4().slice(0, 8);
    return `${name}-${timestamp}-${uuid}${ext}`;
  }

  async saveFile(file, folder = 'documents', useCloudinary = false) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      const filename = this.generateFileName(file.originalname);
      const filepath = path.join(this.uploadDir, folder, filename);

      // Move file to destination
      fs.renameSync(file.path, filepath);

      let fileUrl = null;
      let publicId = null;

      // Upload to Cloudinary if configured
      if (useCloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(filepath, {
          folder: `college/${folder}`,
          resource_type: 'auto'
        });
        fileUrl = result.secure_url;
        publicId = result.public_id;
        
        // Delete local file after cloudinary upload
        fs.unlinkSync(filepath);
      }

      return {
        filename,
        filepath: useCloudinary ? fileUrl : filepath,
        publicId,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname
      };
    } catch (error) {
      logger.error('Save file error:', error);
      throw error;
    }
  }

  async deleteFile(filepath, publicId = null) {
    try {
      // Delete from Cloudinary if publicId provided
      if (publicId) {
        await deleteFromCloudinary(publicId);
        return true;
      }

      // Delete local file
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Delete file error:', error);
      throw error;
    }
  }

  async getFile(filepath) {
    try {
      if (!fs.existsSync(filepath)) {
        throw new Error('File not found');
      }
      
      return fs.readFileSync(filepath);
    } catch (error) {
      logger.error('Get file error:', error);
      throw error;
    }
  }

  async moveFile(sourcePath, destinationPath) {
    try {
      if (!fs.existsSync(sourcePath)) {
        throw new Error('Source file not found');
      }
      
      const destDir = path.dirname(destinationPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.renameSync(sourcePath, destinationPath);
      return true;
    } catch (error) {
      logger.error('Move file error:', error);
      throw error;
    }
  }

  async copyFile(sourcePath, destinationPath) {
    try {
      if (!fs.existsSync(sourcePath)) {
        throw new Error('Source file not found');
      }
      
      const destDir = path.dirname(destinationPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.copyFileSync(sourcePath, destinationPath);
      return true;
    } catch (error) {
      logger.error('Copy file error:', error);
      throw error;
    }
  }

  async getFileInfo(filepath) {
    try {
      if (!fs.existsSync(filepath)) {
        throw new Error('File not found');
      }
      
      const stats = fs.statSync(filepath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime
      };
    } catch (error) {
      logger.error('Get file info error:', error);
      throw error;
    }
  }

  async cleanupTempFiles() {
    try {
      const tempDir = path.join(this.uploadDir, 'temporary');
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        files.forEach(file => {
          const filepath = path.join(tempDir, file);
          const stats = fs.statSync(filepath);
          if (now - stats.mtimeMs > maxAge) {
            fs.unlinkSync(filepath);
          }
        });
      }
    } catch (error) {
      logger.error('Cleanup temp files error:', error);
    }
  }

  validateFile(file, allowedTypes = null, maxSize = 10 * 1024 * 1024) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check size
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` 
      };
    }

    // Check type
    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
      return { 
        valid: false, 
        error: `File type ${file.mimetype} not allowed` 
      };
    }

    return { valid: true };
  }

  getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  isImage(filename) {
    const images = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return images.includes(this.getFileExtension(filename));
  }

  isDocument(filename) {
    const docs = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
    return docs.includes(this.getFileExtension(filename));
  }

  isSpreadsheet(filename) {
    const sheets = ['.xls', '.xlsx', '.csv'];
    return sheets.includes(this.getFileExtension(filename));
  }
}

module.exports = new FileService();