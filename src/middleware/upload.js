const { upload, uploadSingle, uploadMultiple, uploadFields } = require('../config/multer');

// Profile image upload
const uploadProfileImage = uploadSingle('profileImage');

// Document upload
const uploadDocument = uploadSingle('document');

// Assignment upload
const uploadAssignment = uploadSingle('assignment');

// Multiple file upload
const uploadMultipleFiles = uploadMultiple('files');

// Multiple field upload
const uploadMultipleFields = uploadFields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'attachments', maxCount: 3 }
]);

module.exports = {
  uploadProfileImage,
  uploadDocument,
  uploadAssignment,
  uploadMultipleFiles,
  uploadMultipleFields
};