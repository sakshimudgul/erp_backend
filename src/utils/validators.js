const { body, param, query } = require('express-validator');

// Common validators
const validateEmail = () => body('email').isEmail().withMessage('Invalid email format');
const validatePassword = () => body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');
const validateRequired = (field) => body(field).notEmpty().withMessage(`${field} is required`);
const validateOptional = (field) => body(field).optional();

// Role validators
const validateRole = () => body('role').isIn(['super_admin', 'principal', 'hod', 'faculty', 'student', 'parent', 'receptionist'])
  .withMessage('Invalid role');

// User validators
const validateUserCreate = () => [
  validateEmail(),
  validatePassword(),
  validateRole(),
  validateRequired('firstName'),
  validateRequired('lastName')
];

const validateUserUpdate = () => [
  validateOptional('firstName'),
  validateOptional('lastName'),
  validateOptional('phone'),
  validateOptional('isActive'),
  validateOptional('isVerified')
];

// Student validators
const validateStudentCreate = () => [
  validateRequired('enrollmentNumber'),
  validateRequired('courseId'),
  validateRequired('batch'),
  validateRequired('semester'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
];

// Faculty validators
const validateFacultyCreate = () => [
  validateRequired('employeeId'),
  validateRequired('departmentId'),
  validateRequired('designation'),
  body('designation').isIn(['professor', 'associate_professor', 'assistant_professor', 'lecturer', 'instructor', 'teaching_assistant'])
];

// Course validators
const validateCourseCreate = () => [
  validateRequired('code'),
  validateRequired('name'),
  validateRequired('departmentId'),
  validateRequired('duration'),
  body('duration').isInt({ min: 1, max: 6 })
];

// Attendance validators
const validateAttendance = () => [
  validateRequired('subjectId'),
  validateRequired('date'),
  validateRequired('status'),
  body('status').isIn(['present', 'absent', 'late', 'excused'])
];

// Assignment validators
const validateAssignmentCreate = () => [
  validateRequired('subjectId'),
  validateRequired('title'),
  validateRequired('maxMarks'),
  body('maxMarks').isInt({ min: 1 }),
  validateRequired('dueDate'),
  body('dueDate').isISO8601().withMessage('Invalid date format')
];

// Fee validators
const validateFeeCreate = () => [
  validateRequired('studentId'),
  validateRequired('feeType'),
  validateRequired('amount'),
  body('amount').isFloat({ min: 0 }),
  validateRequired('dueDate'),
  validateRequired('semester'),
  validateRequired('academicYear')
];

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  validateOptional,
  validateRole,
  validateUserCreate,
  validateUserUpdate,
  validateStudentCreate,
  validateFacultyCreate,
  validateCourseCreate,
  validateAttendance,
  validateAssignmentCreate,
  validateFeeCreate
};