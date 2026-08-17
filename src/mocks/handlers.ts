import { http, HttpResponse, delay } from 'msw';
import { students } from './data/students';
import { classes } from './data/classes';

export const handlers = [
  // ----------------------------------------
  // GET /api/classes
  // ----------------------------------------
  http.get('/api/classes', async () => {
    await delay(500);

    return HttpResponse.json({
      data: classes,
    });
  }),

  // ----------------------------------------
  // GET /api/classes/:classId
  // ----------------------------------------
  http.get('/api/classes/:classId', async ({ params }) => {
    await delay(500);

    const classId = params.classId;

    const schoolClass = classes.find(
      (item) => item.id === classId
    );

    if (!schoolClass) {
      return HttpResponse.json(
        {
          message: 'Class not found',
        },
        {
          status: 404,
        }
      );
    }

    return HttpResponse.json(schoolClass);
  }),

  // ----------------------------------------
  // GET /api/classes/:classId/students
  // ----------------------------------------
  http.get(
    '/api/classes/:classId/students',
    async ({ params, request }) => {
      await delay(500);

      const classId = params.classId;

      const schoolClass = classes.find(
        (item) => item.id === classId
      );

      if (!schoolClass) {
        return HttpResponse.json(
          {
            message: 'Class not found',
          },
          {
            status: 404,
          }
        );
      }

      const url = new URL(request.url);

      const search = url.searchParams
        .get('search')
        ?.toLowerCase();

      let classStudents = students.filter((student) =>
        schoolClass.studentIds.includes(student.id)
      );

      // Server-side search by name or student ID
      if (search) {
        classStudents = classStudents.filter((student) => {
          const fullName =
            `${student.firstName} ${student.lastName}`.toLowerCase();

          return (
            fullName.includes(search) ||
            student.id.toLowerCase().includes(search)
          );
        });
      }

      return HttpResponse.json({
        data: classStudents,
        total: classStudents.length,
      });
    }
  ),

  // ----------------------------------------
  // GET /api/students
  // ----------------------------------------
  http.get('/api/students', async () => {
    await delay(500);

    return HttpResponse.json({
      data: students,
      total: students.length,
    });
  }),

  // ----------------------------------------
  // GET /api/students/:studentId
  // ----------------------------------------
  http.get('/api/students/:studentId', async ({ params }) => {
    await delay(500);

    const student = students.find(
      (item) => item.id === params.studentId
    );

    if (!student) {
      return HttpResponse.json(
        {
          message: 'Student not found',
        },
        {
          status: 404,
        }
      );
    }

    return HttpResponse.json(student);
  }),

  // ----------------------------------------
  // POST /api/classes/:classId/students
  // ----------------------------------------
  http.post(
    '/api/classes/:classId/students',
    async ({ params, request }) => {
      await delay(500);

      const classId = params.classId;

      const schoolClass = classes.find(
        (item) => item.id === classId
      );

      if (!schoolClass) {
        return HttpResponse.json(
          {
            message: 'Class not found',
          },
          {
            status: 404,
          }
        );
      }

      const body = (await request.json()) as {
        studentId?: string;
      };

      const studentId = body.studentId;

      if (!studentId) {
        return HttpResponse.json(
          {
            message: 'Student ID is required',
          },
          {
            status: 400,
          }
        );
      }

      const student = students.find(
        (item) => item.id === studentId
      );

      if (!student) {
        return HttpResponse.json(
          {
            message: 'Student not found',
          },
          {
            status: 404,
          }
        );
      }

      // Prevent duplicate enrollment
      if (schoolClass.studentIds.includes(studentId)) {
        return HttpResponse.json(
          {
            message: 'Student is already enrolled in this class',
          },
          {
            status: 409,
          }
        );
      }

      // Add student to the class
      schoolClass.studentIds.push(studentId);

      return HttpResponse.json(
        {
          message: 'Student enrolled successfully',
          data: student,
        },
        {
          status: 201,
        }
      );
    }
  ),

  // ----------------------------------------
  // DELETE /api/classes/:classId/students/:studentId
  // ----------------------------------------
  http.delete(
  '/api/classes/:classId/students/:studentId',
  async ({ params }) => {
    await delay(500);

    const classId = params.classId;
    const studentId = params.studentId;

    if (
      typeof classId !== 'string' ||
      typeof studentId !== 'string'
    ) {
      return HttpResponse.json(
        {
          message: 'Invalid class or student ID',
        },
        {
          status: 400,
        }
      );
    }

    const schoolClass = classes.find(
      (item) => item.id === classId
    );

    if (!schoolClass) {
      return HttpResponse.json(
        {
          message: 'Class not found',
        },
        {
          status: 404,
        }
      );
    }

    const studentIndex =
      schoolClass.studentIds.indexOf(studentId);

    if (studentIndex === -1) {
      return HttpResponse.json(
        {
          message: 'Student is not enrolled in this class',
        },
        {
          status: 404,
        }
      );
    }

    // Remove student from the class
    schoolClass.studentIds.splice(studentIndex, 1);

    return HttpResponse.json({
      message: 'Student removed successfully',
    });
  }
  ),
];