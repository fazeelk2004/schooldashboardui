-- Reset existing exams (cannot backfill a required date safely)
DELETE FROM "Result" WHERE "examId" IS NOT NULL;
DELETE FROM "Exam";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN "date" TIMESTAMP(3) NOT NULL;
