-- Drop dependent results so the FK column on Assignment can be replaced safely
DELETE FROM "Result" WHERE "assignmentId" IS NOT NULL;
DELETE FROM "Assignment";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_lessonId_fkey";

-- AlterTable: drop title/startDate, replace lessonId with subjectId + gradeId
ALTER TABLE "Assignment" DROP COLUMN "title";
ALTER TABLE "Assignment" DROP COLUMN "startDate";
ALTER TABLE "Assignment" DROP COLUMN "lessonId";
ALTER TABLE "Assignment" ADD COLUMN "subjectId" INTEGER NOT NULL;
ALTER TABLE "Assignment" ADD COLUMN "gradeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
