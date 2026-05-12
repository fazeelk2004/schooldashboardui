-- Replace dueDate with startTime / endTime time window on QuizAssignment
ALTER TABLE "QuizAssignment" ADD COLUMN "startTime" TIMESTAMP(3);
ALTER TABLE "QuizAssignment" ADD COLUMN "endTime" TIMESTAMP(3);

-- Backfill: existing rows get startTime = createdAt, endTime = dueDate
UPDATE "QuizAssignment" SET "startTime" = "createdAt", "endTime" = "dueDate";

ALTER TABLE "QuizAssignment" ALTER COLUMN "startTime" SET NOT NULL;
ALTER TABLE "QuizAssignment" ALTER COLUMN "endTime" SET NOT NULL;

ALTER TABLE "QuizAssignment" DROP COLUMN "dueDate";
