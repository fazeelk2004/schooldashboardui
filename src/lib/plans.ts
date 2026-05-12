import prisma from "./prisma";
import {
  PLAN_FEATURES,
  PlanFeatures,
  PlanKey,
} from "./plans-shared";

export * from "./plans-shared";

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

  const modelKey =
    resource === "admins" ? "admin" : resource === "teachers" ? "teacher" : "student";
  const count = await (prisma as any)[modelKey].count({ where: { schoolId } });
  if (count >= limit) {
    throw new PlanLimitError(
      `Your ${plan} plan allows up to ${limit} ${resource}. Please upgrade to add more.`
    );
  }
};
