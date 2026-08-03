const { Subject, Course, Faculty, Department, Timetable } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const subjectController = {
  // Get all subjects
  getSubjects: async (req, res) => {
    try {
      const { page, limit, offset, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.courseId) where.courseId = filters.courseId;
      if (filters.semester) where.semester = filters.semester;
      if (filters.facultyId) where.facultyId = filters.facultyId;

      const { count, rows } = await Subject.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Course,
            as: 'course',
            include: [
              {
                model: Department,
                as: 'department'
              }
            ]
          },
          {
            model: Faculty,
            as: 'faculty',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Subjects retrieved', {
        subjects: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get subjects error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subjects', null, 500));
    }
  },

  // Create subject
  createSubject: async (req, res) => {
    try {
      const { code, name, description, credits, courseId, semester, facultyId } = req.body;

      // Check if subject code exists
      const existingSubject = await Subject.findOne({ where: { code } });
      if (existingSubject) {
        return res.status(400).json(new ApiResponse(false, 'Subject code already exists', null, 400));
      }

      const subject = await Subject.create({
        code,
        name,
        description,
        credits,
        courseId,
        semester,
        facultyId
      });

      const createdSubject = await Subject.findByPk(subject.id, {
        include: [
          {
            model: Course,
            as: 'course'
          },
          {
            model: Faculty,
            as: 'faculty',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      res.status(201).json(new ApiResponse(true, 'Subject created', { subject: createdSubject }, 201));
    } catch (error) {
      logger.error('Create subject error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create subject', null, 500));
    }
  },

  // Get subject by ID
  getSubjectById: async (req, res) => {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course',
            include: [
              {
                model: Department,
                as: 'department'
              }
            ]
          },
          {
            model: Faculty,
            as: 'faculty',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          },
          {
            model: Timetable,
            as: 'timetables'
          }
        ]
      });

      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Subject retrieved', { subject }, 200));
    } catch (error) {
      logger.error('Get subject by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subject', null, 500));
    }
  },

  // Update subject
  updateSubject: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      await subject.update(updates);

      const updatedSubject = await Subject.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course'
          },
          {
            model: Faculty,
            as: 'faculty',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Subject updated', { subject: updatedSubject }, 200));
    } catch (error) {
      logger.error('Update subject error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update subject', null, 500));
    }
  },

  // Delete subject
  deleteSubject: async (req, res) => {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      await subject.destroy();

      res.status(200).json(new ApiResponse(true, 'Subject deleted', null, 200));
    } catch (error) {
      logger.error('Delete subject error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete subject', null, 500));
    }
  },

  // Get assigned faculty
  getAssignedFaculty: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const subject = await Subject.findByPk(subjectId, {
        include: [
          {
            model: Faculty,
            as: 'faculty',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
              }
            ]
          }
        ]
      });

      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Assigned faculty retrieved', { faculty: subject.faculty }, 200));
    } catch (error) {
      logger.error('Get assigned faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get assigned faculty', null, 500));
    }
  },

  // Assign faculty to subject
  assignFaculty: async (req, res) => {
    try {
      const { subjectId, facultyId } = req.params;

      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      const faculty = await Faculty.findByPk(facultyId);
      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      await subject.update({ facultyId });

      res.status(200).json(new ApiResponse(true, 'Faculty assigned to subject', null, 200));
    } catch (error) {
      logger.error('Assign faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to assign faculty', null, 500));
    }
  },

  // Remove faculty assignment
  removeFacultyAssignment: async (req, res) => {
    try {
      const { subjectId, facultyId } = req.params;

      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      if (subject.facultyId !== facultyId) {
        return res.status(400).json(new ApiResponse(false, 'Faculty not assigned to this subject', null, 400));
      }

      await subject.update({ facultyId: null });

      res.status(200).json(new ApiResponse(true, 'Faculty removed from subject', null, 200));
    } catch (error) {
      logger.error('Remove faculty assignment error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to remove faculty', null, 500));
    }
  },

  // Get subject timetable
  getSubjectTimetable: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const timetables = await Timetable.findAll({
        where: { subjectId },
        include: [
          {
            model: Faculty,
            as: 'faculty',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName']
              }
            ]
          }
        ],
        order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Subject timetable retrieved', { timetables }, 200));
    } catch (error) {
      logger.error('Get subject timetable error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subject timetable', null, 500));
    }
  },

  // Add timetable slot
  addTimetableSlot: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { facultyId, dayOfWeek, startTime, endTime, roomNumber, batch, semester, academicYear } = req.body;

      const timetable = await Timetable.create({
        subjectId,
        facultyId,
        dayOfWeek,
        startTime,
        endTime,
        roomNumber,
        batch,
        semester,
        academicYear
      });

      res.status(201).json(new ApiResponse(true, 'Timetable slot added', { timetable }, 201));
    } catch (error) {
      logger.error('Add timetable slot error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to add timetable slot', null, 500));
    }
  },

  // Remove timetable slot
  removeTimetableSlot: async (req, res) => {
    try {
      const { subjectId, slotId } = req.params;

      const timetable = await Timetable.findOne({
        where: { id: slotId, subjectId }
      });

      if (!timetable) {
        return res.status(404).json(new ApiResponse(false, 'Timetable slot not found', null, 404));
      }

      await timetable.destroy();

      res.status(200).json(new ApiResponse(true, 'Timetable slot removed', null, 200));
    } catch (error) {
      logger.error('Remove timetable slot error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to remove timetable slot', null, 500));
    }
  }
};

module.exports = subjectController;