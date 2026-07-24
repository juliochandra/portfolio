/*
  Warnings:

  - You are about to drop the `SmokeTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SmokeTest";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
