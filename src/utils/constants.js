// User roles
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  PRINCIPAL: 'principal',
  HOD: 'hod',
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent',
  RECEPTIONIST: 'receptionist'
};

// Faculty designations
const FACULTY_DESIGNATIONS = {
  PROFESSOR: 'professor',
  ASSOCIATE_PROFESSOR: 'associate_professor',
  ASSISTANT_PROFESSOR: 'assistant_professor',
  LECTURER: 'lecturer',
  INSTRUCTOR: 'instructor',
  TEACHING_ASSISTANT: 'teaching_assistant'
};

// Student statuses
const STUDENT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  GRADUATED: 'graduated',
  DROPPED_OUT: 'dropped_out'
};

// Attendance statuses
const ATTENDANCE_STATUSES = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  HOLIDAY: 'holiday'
};

// Fee statuses
const FEE_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
  WAIVED: 'waived'
};

// Payment methods
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  ONLINE: 'online',
  OTHER: 'other'
};

// Exam types
const EXAM_TYPES = {
  MID_TERM: 'mid_term',
  FINAL: 'final',
  QUIZ: 'quiz',
  PRACTICAL: 'practical',
  VIVA: 'viva',
  COMPREHENSIVE: 'comprehensive'
};

// Notification types
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ALERT: 'alert'
};

// Message priorities
const MESSAGE_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Day of week
const DAYS_OF_WEEK = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday'
};

// Blood groups
const BLOOD_GROUPS = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-'
};

// File types
const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  TEXT: ['text/plain'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_COUNT = 5;

module.exports = {
  USER_ROLES,
  FACULTY_DESIGNATIONS,
  STUDENT_STATUSES,
  ATTENDANCE_STATUSES,
  FEE_STATUSES,
  PAYMENT_METHODS,
  EXAM_TYPES,
  NOTIFICATION_TYPES,
  MESSAGE_PRIORITIES,
  DAYS_OF_WEEK,
  BLOOD_GROUPS,
  FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILE_COUNT
};