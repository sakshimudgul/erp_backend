const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/config/database');
const { User, Department, Course, Student, Faculty } = require('../../src/models');

describe('College Management E2E Tests', () => {
  let adminToken;
  let hodToken;
  let facultyToken;
  let studentToken;
  let departmentId;
  let courseId;
  let subjectId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create admin
    const admin = await User.create({
      email: 'admin@college.com',
      password: 'admin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isVerified: true
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@college.com',
        password: 'admin123'
      });
    adminToken = adminLogin.body.data.token;

    // Create department
    const department = await Department.create({
      code: 'CSE',
      name: 'Computer Science Engineering',
      establishedYear: 2020
    });
    departmentId = department.id;

    // Create course
    const course = await Course.create({
      code: 'B.Tech-CSE',
      name: 'B.Tech in Computer Science',
      departmentId: departmentId,
      duration: 4,
      totalSemesters: 8
    });
    courseId = course.id;

    // Create HOD
    const hodUser = await User.create({
      email: 'hod@cse.com',
      password: 'hod123',
      firstName: 'HOD',
      lastName: 'CSE',
      role: 'hod',
      isVerified: true
    });

    const hodFaculty = await Faculty.create({
      userId: hodUser.id,
      departmentId: departmentId,
      employeeId: 'HOD001',
      designation: 'professor',
      isHod: true
    });

    const hodLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'hod@cse.com',
        password: 'hod123'
      });
    hodToken = hodLogin.body.data.token;

    // Create faculty
    const facultyUser = await User.create({
      email: 'faculty@cse.com',
      password: 'faculty123',
      firstName: 'Faculty',
      lastName: 'CSE',
      role: 'faculty',
      isVerified: true
    });

    await Faculty.create({
      userId: facultyUser.id,
      departmentId: departmentId,
      employeeId: 'FAC001',
      designation: 'assistant_professor'
    });

    const facultyLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'faculty@cse.com',
        password: 'faculty123'
      });
    facultyToken = facultyLogin.body.data.token;

    // Create student
    const studentUser = await User.create({
      email: 'student@cse.com',
      password: 'student123',
      firstName: 'Student',
      lastName: 'CSE',
      role: 'student',
      isVerified: true
    });

    await Student.create({
      userId: studentUser.id,
      enrollmentNumber: 'CSE2024001',
      courseId: courseId,
      batch: '2024-2028',
      semester: 1,
      status: 'active'
    });

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@cse.com',
        password: 'student123'
      });
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Complete Workflow', () => {
    it('should create a subject (HOD)', async () => {
      const response = await request(app)
        .post('/api/hod/subjects')
        .set('Authorization', `Bearer ${hodToken}`)
        .send({
          code: 'CS101',
          name: 'Introduction to Computer Science',
          credits: 3,
          courseId: courseId,
          semester: 1
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      subjectId = response.body.data.subject.id;
    });

    it('should assign faculty to subject (HOD)', async () => {
      const response = await request(app)
        .post(`/api/hod/subjects/${subjectId}/faculty/FAC001`)
        .set('Authorization', `Bearer ${hodToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should mark attendance (Faculty)', async () => {
      const response = await request(app)
        .post(`/api/faculty/attendance/subjects/${subjectId}/mark`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          studentId: 1,
          status: 'present',
          date: new Date().toISOString().split('T')[0]
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should create assignment (Faculty)', async () => {
      const response = await request(app)
        .post(`/api/faculty/assignments/subjects/${subjectId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Assignment 1',
          description: 'Complete the first assignment',
          maxMarks: 100,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should view timetable (Student)', async () => {
      const response = await request(app)
        .get('/api/student/timetable/current')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should get academic progress (Student)', async () => {
      const response = await request(app)
        .get('/api/student/academic/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('progress');
    });

    it('should generate report (HOD)', async () => {
      const response = await request(app)
        .get(`/api/hod/reports/attendance?departmentId=${departmentId}`)
        .set('Authorization', `Bearer ${hodToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should get dashboard stats (HOD)', async () => {
      const response = await request(app)
        .get('/api/hod/analytics/dashboard')
        .set('Authorization', `Bearer ${hodToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('dashboardData');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle not found', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid',
          password: '123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('data');
    });
  });
});