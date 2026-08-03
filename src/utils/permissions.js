const { USER_ROLES } = require('./constants');

// Define permissions for each role
const PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'create_user',
    'update_user',
    'delete_user',
    'view_all_users',
    'create_role',
    'update_role',
    'delete_role',
    'view_all_college',
    'manage_college',
    'manage_departments',
    'manage_courses',
    'manage_subjects',
    'manage_faculty',
    'manage_students',
    'manage_fees',
    'manage_hostel',
    'manage_transport',
    'manage_library',
    'view_all_reports',
    'generate_all_reports',
    'manage_system_settings'
  ],
  [USER_ROLES.PRINCIPAL]: [
    'view_all_users',
    'view_all_college',
    'manage_college',
    'manage_departments',
    'manage_courses',
    'manage_subjects',
    'manage_faculty',
    'manage_students',
    'manage_fees',
    'manage_hostel',
    'manage_transport',
    'manage_library',
    'view_all_reports',
    'generate_all_reports',
    'approve_admissions',
    'manage_admissions'
  ],
  [USER_ROLES.HOD]: [
    'view_department_users',
    'manage_department_faculty',
    'manage_department_students',
    'manage_department_subjects',
    'manage_department_courses',
    'manage_department_attendance',
    'manage_department_exams',
    'manage_department_results',
    'view_department_reports',
    'generate_department_reports',
    'approve_leave_requests',
    'manage_department_budget'
  ],
  [USER_ROLES.FACULTY]: [
    'view_my_profile',
    'update_my_profile',
    'manage_assigned_subjects',
    'manage_attendance',
    'manage_assignments',
    'manage_exams',
    'manage_grades',
    'view_student_details',
    'view_class_timetable',
    'send_messages',
    'view_notifications',
    'upload_materials'
  ],
  [USER_ROLES.STUDENT]: [
    'view_my_profile',
    'update_my_profile',
    'view_my_courses',
    'view_my_attendance',
    'view_my_assignments',
    'submit_assignments',
    'view_my_exams',
    'view_my_results',
    'view_my_timetable',
    'view_my_fees',
    'pay_fees',
    'view_notifications',
    'send_messages',
    'view_library_books'
  ],
  [USER_ROLES.PARENT]: [
    'view_child_profile',
    'view_child_attendance',
    'view_child_results',
    'view_child_fees',
    'pay_child_fees',
    'view_notifications',
    'send_messages'
  ],
  [USER_ROLES.RECEPTIONIST]: [
    'manage_admissions',
    'manage_visitors',
    'manage_inquiries',
    'view_student_details',
    'issue_id_cards',
    'manage_appointments'
  ]
};

// Check if user has permission
const hasPermission = (userRole, permission) => {
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
};

// Check if user has any of the permissions
const hasAnyPermission = (userRole, permissions) => {
  const userPermissions = PERMISSIONS[userRole] || [];
  return permissions.some(permission => userPermissions.includes(permission));
};

// Check if user has all permissions
const hasAllPermissions = (userRole, permissions) => {
  const userPermissions = PERMISSIONS[userRole] || [];
  return permissions.every(permission => userPermissions.includes(permission));
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions
};