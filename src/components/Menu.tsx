import { currentUser } from "@clerk/nextjs/server";
import MenuClient, { MenuGroup } from "./MenuClient";

const menuItems: MenuGroup[] = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["superadmin", "admin", "teacher", "student", "parent"],
      },
      {
        icon: "/class.png",
        label: "Schools",
        href: "/list/schools",
        visible: ["superadmin"],
      },
      {
        icon: "/parent.png",
        label: "Admins",
        href: "/list/admins",
        visible: ["superadmin"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["superadmin", "admin", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["superadmin", "admin", "teacher"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["superadmin", "admin", "teacher"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["superadmin", "admin"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["superadmin", "admin", "teacher"],
      },
      {
        icon: "/class.png",
        label: "Grades",
        href: "/list/grades",
        visible: ["superadmin", "admin"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["superadmin", "admin", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["superadmin", "admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["superadmin", "admin", "teacher", "student", "parent"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["superadmin", "admin", "teacher", "student", "parent"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["superadmin", "admin", "teacher", "student", "parent"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["superadmin", "admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["superadmin", "admin", "teacher", "student", "parent"],
      },
      {
        icon: "/exam.png",
        label: "Quiz Generator",
        href: "/list/quiz-generator",
        visible: ["teacher"],
      },
      {
        icon: "/assignment.png",
        label: "My Quizzes",
        href: "/list/my-quizzes",
        visible: ["student"],
      },
    ],
  },
];

const Menu = async () => {
  const user = await currentUser();
  const role = (user?.publicMetadata.role as string) ?? "";
  return <MenuClient groups={menuItems} role={role} />;
};

export default Menu;
