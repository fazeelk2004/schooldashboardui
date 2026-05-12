export type PlanKey = "FREE" | "PLUS" | "PRO";

export type PlanFeatures = {
  maxAdmins: number;
  maxTeachers: number;
  maxStudents: number;
  quizzes: boolean;
  aiQuiz: boolean;
  exams: boolean;
  financeChart: boolean;
  announcements: boolean;
  events: boolean;
  attendance: boolean;
  notifications: boolean;
};

export const PLAN_FEATURES: Record<PlanKey, PlanFeatures> = {
  FREE: {
    maxAdmins: 1,
    maxTeachers: 5,
    maxStudents: 50,
    quizzes: false,
    aiQuiz: false,
    exams: false,
    financeChart: false,
    announcements: true,
    events: true,
    attendance: true,
    notifications: false,
  },
  PLUS: {
    maxAdmins: 1,
    maxTeachers: 15,
    maxStudents: 250,
    quizzes: true,
    aiQuiz: false,
    exams: true,
    financeChart: true,
    announcements: true,
    events: true,
    attendance: true,
    notifications: true,
  },
  PRO: {
    maxAdmins: Infinity,
    maxTeachers: Infinity,
    maxStudents: Infinity,
    quizzes: true,
    aiQuiz: true,
    exams: true,
    financeChart: true,
    announcements: true,
    events: true,
    attendance: true,
    notifications: true,
  },
};

export const PLAN_DISPLAY: Record<PlanKey, {
  name: string;
  tagline: string;
  priceLabel: string;
  highlights: string[];
}> = {
  FREE: {
    name: "Free",
    tagline: "Get started with the essentials",
    priceLabel: "$0/mo",
    highlights: [
      "1 admin, 5 teachers, 50 students",
      "Announcements & events",
      "Attendance tracking",
    ],
  },
  PLUS: {
    name: "Plus",
    tagline: "For growing schools",
    priceLabel: "$29/mo",
    highlights: [
      "1 admin, 15 teachers, 250 students",
      "Quizzes (manual creation)",
      "Exams & results, finance dashboard",
      "Notifications",
    ],
  },
  PRO: {
    name: "Pro",
    tagline: "Everything, no limits",
    priceLabel: "$99/mo",
    highlights: [
      "Unlimited admins, teachers, students",
      "AI quiz generation",
      "All dashboards & analytics",
      "Priority support",
    ],
  },
};
