import prisma from "./prisma";

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

export const PLAN_PRICE_ENV: Record<PlanKey, string> = {
  FREE: "STRIPE_PRICE_FREE",
  PLUS: "STRIPE_PRICE_PLUS",
  PRO: "STRIPE_PRICE_PRO",
};

export const getPriceIdForPlan = (plan: PlanKey): string => {
  const envKey = PLAN_PRICE_ENV[plan];
  const priceId = process.env[envKey];
  if (!priceId) {
    throw new Error(`Missing Stripe price ID env var: ${envKey}`);
  }
  return priceId;
};

export const planFromPriceId = (priceId: string | null | undefined): PlanKey | null => {
  if (!priceId) return null;
  for (const plan of Object.keys(PLAN_PRICE_ENV) as PlanKey[]) {
    if (process.env[PLAN_PRICE_ENV[plan]] === priceId) return plan;
  }
  return null;
};

export const getSchoolPlan = async (schoolId: number): Promise<PlanKey> => {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { plan: true },
  });
  return (school?.plan as PlanKey) ?? "FREE";
};

export class PlanLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanLimitError";
  }
}

export const assertFeature = async (
  schoolId: number,
  feature: keyof PlanFeatures
) => {
  const plan = await getSchoolPlan(schoolId);
  const features = PLAN_FEATURES[plan];
  if (!features[feature]) {
    throw new PlanLimitError(
      `Feature "${String(feature)}" is not available on the ${plan} plan. Please upgrade.`
    );
  }
};

export const assertWithinLimit = async (
  schoolId: number,
  resource: "admins" | "teachers" | "students"
) => {
  const plan = await getSchoolPlan(schoolId);
  const features = PLAN_FEATURES[plan];
  const limitKey =
    resource === "admins"
      ? "maxAdmins"
      : resource === "teachers"
      ? "maxTeachers"
      : "maxStudents";
  const limit = features[limitKey];
  if (!Number.isFinite(limit)) return;

  const count = await (prisma[resource] as any).count({ where: { schoolId } });
  if (count >= limit) {
    throw new PlanLimitError(
      `Your ${plan} plan allows up to ${limit} ${resource}. Please upgrade to add more.`
    );
  }
};
