-- Drop dependent results so the FK column on Exam can be replaced safely
DELETE FROM "Result" WHERE "examId" IS NOT NULL;
DELETE FROM "Exam";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_lessonId_fkey";

-- AlterTable: replace lessonId with subjectId + gradeId
ALTER TABLE "Exam" DROP COLUMN "lessonId";
ALTER TABLE "Exam" ADD COLUMN "subjectId" INTEGER NOT NULL;
ALTER TABLE "Exam" ADD COLUMN "gradeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
