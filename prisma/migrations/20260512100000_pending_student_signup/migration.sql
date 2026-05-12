-- Pending student signup workflow

CREATE TYPE "PendingSignupStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
CREATE TYPE "ParentMode" AS ENUM ('NEW', 'EXISTING', 'NONE');

CREATE TABLE "PendingStudentSignup" (
    "id" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "status" "PendingSignupStatus" NOT NULL DEFAULT 'PENDING',
    "studentData" JSONB NOT NULL,
    "parentMode" "ParentMode" NOT NULL,
    "parentData" JSONB,
    "existingParentUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "PendingStudentSignup_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PendingStudentSignup_schoolId_status_idx" ON "PendingStudentSignup"("schoolId", "status");
