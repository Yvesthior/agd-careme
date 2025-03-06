/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WeeklyEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "charityActs" TEXT,
    "comments" TEXT,
    "difficulties" TEXT,
    "improvements" TEXT,
    "successes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_WeeklyEntry" ("charityActs", "comments", "createdAt", "difficulties", "endDate", "id", "improvements", "startDate", "successes", "updatedAt", "userId") SELECT "charityActs", "comments", "createdAt", "difficulties", "endDate", "id", "improvements", "startDate", "successes", "updatedAt", "userId" FROM "WeeklyEntry";
DROP TABLE "WeeklyEntry";
ALTER TABLE "new_WeeklyEntry" RENAME TO "WeeklyEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
