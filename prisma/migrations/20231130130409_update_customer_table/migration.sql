/*
  Warnings:

  - Added the required column `result` to the `Customers` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "addresses" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "error" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Customers" ("addresses", "email", "id", "resource") SELECT "addresses", "email", "id", "resource" FROM "Customers";
DROP TABLE "Customers";
ALTER TABLE "new_Customers" RENAME TO "Customers";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
