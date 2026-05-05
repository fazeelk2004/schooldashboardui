// @ts-nocheck
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Day, PrismaClient, UserSex } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // SCHOOLS
  const school1 = await prisma.school.create({
    data: {
      name: "Springfield Academy",
      address: "123 Education Lane, Springfield",
      phone: "555-0100",
      email: "info@springfieldacademy.edu",
      website: "https://springfieldacademy.edu",
      description: "A premier K-6 academy dedicated to academic excellence and holistic development.",
    },
  });

  const school2 = await prisma.school.create({
    data: {
      name: "Riverside International School",
      address: "456 River Road, Riverside",
      phone: "555-0200",
      email: "info@riversideinternational.edu",
      website: "https://riversideinternational.edu",
      description: "An international school offering a world-class education with a global perspective.",
    },
  });

  // ADMIN
  await prisma.admin.create({
    data: {
      id: "admin1",
      username: "admin1",
      schoolId: school1.id,
    },
  });
  await prisma.admin.create({
    data: {
      id: "admin2",
      username: "admin2",
      schoolId: school2.id,
    },
  });

  // GRADE (for both schools)
  for (let i = 1; i <= 6; i++) {
    await prisma.grade.create({
      data: {
        level: i,
        schoolId: school1.id,
      },
    });
  }
  for (let i = 1; i <= 6; i++) {
    await prisma.grade.create({
      data: {
        level: i,
        schoolId: school2.id,
      },
    });
  }

  // CLASS (for both schools)
  for (let i = 1; i <= 6; i++) {
    await prisma.class.create({
      data: {
        name: `${i}A`,
        gradeId: i, // school1 grades are ids 1-6
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
        schoolId: school1.id,
      },
    });
  }
  for (let i = 1; i <= 6; i++) {
    await prisma.class.create({
      data: {
        name: `${i}A`,
        gradeId: i + 6, // school2 grades are ids 7-12
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
        schoolId: school2.id,
      },
    });
  }

  // SUBJECT (for both schools)
  const subjectNames = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Art",
  ];

  for (const name of subjectNames) {
    await prisma.subject.create({ data: { name, schoolId: school1.id } });
  }
  for (const name of subjectNames) {
    await prisma.subject.create({ data: { name, schoolId: school2.id } });
  }

  // TEACHER (school1: teacher1-teacher15, school2: teacher16-teacher30)
  for (let i = 1; i <= 15; i++) {
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        subjects: { connect: [{ id: (i % 10) + 1 }] }, // school1 subjects: ids 1-10
        classes: { connect: [{ id: (i % 6) + 1 }] },   // school1 classes: ids 1-6
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
        schoolId: school1.id,
      },
    });
  }
  for (let i = 16; i <= 30; i++) {
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        bloodType: "B+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        subjects: { connect: [{ id: ((i - 16) % 10) + 11 }] }, // school2 subjects: ids 11-20
        classes: { connect: [{ id: ((i - 16) % 6) + 7 }] },    // school2 classes: ids 7-12
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 28)),
        schoolId: school2.id,
      },
    });
  }

  // LESSON (school1: 30 lessons, school2: 30 lessons)
  for (let i = 1; i <= 30; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson${i}`,
        day: Day[
          Object.keys(Day)[
            Math.floor(Math.random() * Object.keys(Day).length)
          ] as keyof typeof Day
        ],
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
        subjectId: (i % 10) + 1,
        classId: (i % 6) + 1,
        teacherId: `teacher${(i % 15) + 1}`,
        schoolId: school1.id,
      },
    });
  }
  for (let i = 31; i <= 60; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson${i}`,
        day: Day[
          Object.keys(Day)[
            Math.floor(Math.random() * Object.keys(Day).length)
          ] as keyof typeof Day
        ],
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
        subjectId: ((i - 31) % 10) + 11,
        classId: ((i - 31) % 6) + 7,
        teacherId: `teacher${((i - 31) % 15) + 16}`,
        schoolId: school2.id,
      },
    });
  }

  // PARENT (school1: parentId1-parentId25, school2: parentId26-parentId50)
  for (let i = 1; i <= 25; i++) {
    await prisma.parent.create({
      data: {
        id: `parentId${i}`,
        username: `parentId${i}`,
        name: `PName ${i}`,
        surname: `PSurname ${i}`,
        email: `parent${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        schoolId: school1.id,
      },
    });
  }
  for (let i = 26; i <= 50; i++) {
    await prisma.parent.create({
      data: {
        id: `parentId${i}`,
        username: `parentId${i}`,
        name: `PName ${i}`,
        surname: `PSurname ${i}`,
        email: `parent${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        schoolId: school2.id,
      },
    });
  }

  // STUDENT (school1: student1-student50, school2: student51-student100)
  for (let i = 1; i <= 50; i++) {
    await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname ${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: `parentId${Math.ceil(i / 2) % 25 || 25}`,
        gradeId: (i % 6) + 1,
        classId: (i % 6) + 1,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
        schoolId: school1.id,
      },
    });
  }
  for (let i = 51; i <= 100; i++) {
    await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname ${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: `parentId${((i - 51) % 25) + 26}`,
        gradeId: ((i - 51) % 6) + 7,
        classId: ((i - 51) % 6) + 7,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 11)),
        schoolId: school2.id,
      },
    });
  }

  // EXAM (school1: 10 exams, school2: 10 exams)
  for (let i = 1; i <= 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        lessonId: (i % 30) + 1,
        schoolId: school1.id,
      },
    });
  }
  for (let i = 11; i <= 20; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        lessonId: ((i - 11) % 30) + 31,
        schoolId: school2.id,
      },
    });
  }

  // ASSIGNMENT (school1: 10, school2: 10)
  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(new Date().setHours(new Date().getHours() + 1)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        lessonId: (i % 30) + 1,
        schoolId: school1.id,
      },
    });
  }
  for (let i = 11; i <= 20; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(new Date().setHours(new Date().getHours() + 1)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        lessonId: ((i - 11) % 30) + 31,
        schoolId: school2.id,
      },
    });
  }

  // RESULT (school1: 10, school2: 10)
  for (let i = 1; i <= 10; i++) {
    await prisma.result.create({
      data: {
        score: 90,
        studentId: `student${i}`,
        ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }),
      },
    });
  }
  for (let i = 1; i <= 10; i++) {
    await prisma.result.create({
      data: {
        score: 85,
        studentId: `student${i + 50}`,
        ...(i <= 5 ? { examId: i + 10 } : { assignmentId: i + 5 }),
      },
    });
  }

  // ATTENDANCE (school1: 10, school2: 10)
  for (let i = 1; i <= 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: true,
        studentId: `student${i}`,
        lessonId: (i % 30) + 1,
      },
    });
  }
  for (let i = 1; i <= 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: i % 2 === 0,
        studentId: `student${i + 50}`,
        lessonId: ((i - 1) % 30) + 31,
      },
    });
  }

  // EVENT (school1: 5 events, school2: 5 events)
  for (let i = 1; i <= 5; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        classId: (i % 5) + 1,
        schoolId: school1.id,
      },
    });
  }
  for (let i = 6; i <= 10; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        classId: ((i - 6) % 6) + 7,
        schoolId: school2.id,
      },
    });
  }

  // ANNOUNCEMENT (school1: 5, school2: 5)
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: (i % 5) + 1,
        schoolId: school1.id,
      },
    });
  }
  for (let i = 6; i <= 10; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: ((i - 6) % 6) + 7,
        schoolId: school2.id,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
