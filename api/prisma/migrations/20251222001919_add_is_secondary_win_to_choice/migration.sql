-- AlterTable
ALTER TABLE "choice" ADD COLUMN     "isSecondaryWin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "isPrimaryWin" SET DEFAULT false;
