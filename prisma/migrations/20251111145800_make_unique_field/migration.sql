/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Organizations_ownerId_key" ON "Organizations"("ownerId");
