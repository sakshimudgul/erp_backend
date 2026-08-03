const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Generate unique ID
const generateId = () => uuidv4();

// Generate random string
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate unique receipt number
const generateReceiptNumber = () => {
  const date = moment().format('YYYYMMDD');
  const random = generateRandomString(6).toUpperCase();
  return `RCP-${date}-${random}`;
};

// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = generateRandomString(4).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

// Calculate age from date of birth
const calculateAge = (dob) => {
  return moment().diff(moment(dob), 'years');
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Check if date is valid
const isValidDate = (date) => {
  return moment(date).isValid();
};

// Check if date is in past
const isPastDate = (date) => {
  return moment(date).isBefore(moment());
};

// Check if date is in future
const isFutureDate = (date) => {
  return moment(date).isAfter(moment());
};

// Parse query parameters
const parseQueryParams = (query) => {
  const { page = 1, limit = 10, sort, ...filters } = query;
  const offset = (page - 1) * limit;
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    offset,
    sort,
    filters
  };
};

// Build search conditions
const buildSearchConditions = (search, fields) => {
  if (!search) return {};
  const conditions = fields.map(field => ({
    [field]: { [Op.like]: `%${search}%` }
  }));
  return { [Op.or]: conditions };
};

// Pagination helper
const getPaginationData = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

// Transform response data
const transformResponse = (data, pagination = null) => {
  const response = { data };
  if (pagination) {
    response.pagination = pagination;
  }
  return response;
};

module.exports = {
  generateId,
  generateRandomString,
  generateReceiptNumber,
  generateTransactionId,
  calculateAge,
  formatDate,
  isValidDate,
  isPastDate,
  isFutureDate,
  parseQueryParams,
  buildSearchConditions,
  getPaginationData,
  transformResponse
};