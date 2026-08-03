const User = require('./User');
const Department = require('./Department');
const Faculty = require('./Faculty');
const Student = require('./Student');
const Parent = require('./Parent');
const Course = require('./Course');
const Subject = require('./Subject');
const Enrollment = require('./Enrollment');
const Attendance = require('./Attendance');
const Assignment = require('./Assignment');
const Submission = require('./Submission');
const Exam = require('./Exam');
const Result = require('./Result');
const Fee = require('./Fee');
const Payment = require('./Payment');
const Library = require('./Library');
const Book = require('./Book');
const Hostel = require('./Hostel');
const Room = require('./Room');
const Transport = require('./Transport');
const Visitor = require('./Visitor');
const Inquiry = require('./Inquiry');
const Notification = require('./Notification');
const Message = require('./Message');
const Timetable = require('./Timetable');

// Define associations
// User associations
User.hasOne(Faculty, { foreignKey: 'userId', as: 'faculty' });
User.hasOne(Student, { foreignKey: 'userId', as: 'student' });
User.hasOne(Parent, { foreignKey: 'userId', as: 'parent' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

// Department associations
Department.belongsTo(User, { foreignKey: 'headId', as: 'head' });
Department.hasMany(Faculty, { foreignKey: 'departmentId', as: 'faculties' });
Department.hasMany(Course, { foreignKey: 'departmentId', as: 'courses' });
Department.hasMany(Subject, { foreignKey: 'departmentId', as: 'subjects' });

// Faculty associations
Faculty.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Faculty.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Faculty.hasMany(Subject, { foreignKey: 'facultyId', as: 'subjects' });
Faculty.hasMany(Timetable, { foreignKey: 'facultyId', as: 'timetables' });

// Student associations
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Student.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Student.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollments' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });
Student.hasMany(Submission, { foreignKey: 'studentId', as: 'submissions' });
Student.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Student.hasMany(Fee, { foreignKey: 'studentId', as: 'fees' });

// Course associations
Course.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Course.hasMany(Student, { foreignKey: 'courseId', as: 'students' });
Course.hasMany(Subject, { foreignKey: 'courseId', as: 'subjects' });

// Subject associations
Subject.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Subject.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Subject.hasMany(Enrollment, { foreignKey: 'subjectId', as: 'enrollments' });
Subject.hasMany(Attendance, { foreignKey: 'subjectId', as: 'attendances' });
Subject.hasMany(Assignment, { foreignKey: 'subjectId', as: 'assignments' });
Subject.hasMany(Exam, { foreignKey: 'subjectId', as: 'exams' });
Subject.hasMany(Timetable, { foreignKey: 'subjectId', as: 'timetables' });

// Enrollment associations
Enrollment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Enrollment.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Assignment associations
Assignment.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Assignment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Assignment.hasMany(Submission, { foreignKey: 'assignmentId', as: 'submissions' });

// Submission associations
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });
Submission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Submission.belongsTo(User, { foreignKey: 'gradedBy', as: 'grader' });

// Exam associations
Exam.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Exam.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Exam.hasMany(Result, { foreignKey: 'examId', as: 'results' });

// Result associations
Result.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Result.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });
Result.belongsTo(User, { foreignKey: 'enteredBy', as: 'enteredByUser' });

// Fee associations
Fee.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Fee.hasMany(Payment, { foreignKey: 'feeId', as: 'payments' });

// Payment associations
Payment.belongsTo(Fee, { foreignKey: 'feeId', as: 'fee' });
Payment.belongsTo(User, { foreignKey: 'receivedBy', as: 'receiver' });

// Library associations
Library.hasMany(Book, { foreignKey: 'libraryId', as: 'books' });
Library.belongsTo(User, { foreignKey: 'librarianId', as: 'librarian' });

// Book associations
Book.belongsTo(Library, { foreignKey: 'libraryId', as: 'library' });
Book.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Hostel associations
Hostel.hasMany(Room, { foreignKey: 'hostelId', as: 'rooms' });
Hostel.belongsTo(User, { foreignKey: 'wardenId', as: 'warden' });

// Room associations
Room.belongsTo(Hostel, { foreignKey: 'hostelId', as: 'hostel' });

// Visitor associations
Visitor.belongsTo(User, { foreignKey: 'registeredBy', as: 'registrar' });

// Inquiry associations
Inquiry.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedToUser' });

// Message associations
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Message, { foreignKey: 'parentMessageId', as: 'parentMessage' });

// Timetable associations
Timetable.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Timetable.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });

module.exports = {
  User,
  Department,
  Faculty,
  Student,
  Parent,
  Course,
  Subject,
  Enrollment,
  Attendance,
  Assignment,
  Submission,
  Exam,
  Result,
  Fee,
  Payment,
  Library,
  Book,
  Hostel,
  Room,
  Transport,
  Visitor,
  Inquiry,
  Notification,
  Message,
  Timetable
};