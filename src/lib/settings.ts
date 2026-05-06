export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/superadmin(.*)": ["superadmin"],
  "/admin(.*)": ["admin"],
  "/admin/billing": ["admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/list/schools": ["superadmin"],
  "/list/admins": ["superadmin"],
  "/list/teachers": ["superadmin", "admin", "teacher"],
  "/list/students": ["superadmin", "admin", "teacher"],
  "/list/parents": ["superadmin", "admin", "teacher"],
  "/list/subjects": ["superadmin", "admin"],
  "/list/classes": ["superadmin", "admin", "teacher"],
  "/list/exams": ["superadmin", "admin", "teacher", "student", "parent"],
  "/list/assignments": ["superadmin", "admin", "teacher", "student", "parent"],
  "/list/results": ["superadmin", "admin", "teacher", "student", "parent"],
  "/list/attendance": ["superadmin", "admin", "teacher", "student", "parent"],
  "/list/events": ["superadmin", "admin", "teacher", "student", "parent"],
  "/list/announcements": ["superadmin", "admin", "teacher", "student", "parent"],
  "/list/quiz-generator": ["teacher"],
  "/list/my-quizzes": ["student"],
  "/list/quiz-take(.*)": ["student"],
};