-- CreateTable
CREATE TABLE "GachaHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "rarity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GachaHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GachaItems" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "rarity" SMALLINT NOT NULL,
    "isRateUp" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "GachaItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GachaPity" (
    "userId" INTEGER NOT NULL,
    "fiveStarCounter" INTEGER NOT NULL DEFAULT 0,
    "fourStarCounter" INTEGER NOT NULL DEFAULT 0,
    "guaranteeStatus" TEXT NOT NULL DEFAULT 'none',

    CONSTRAINT "GachaPity_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GachaHistory_userId_idx" ON "GachaHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "GachaHistory" ADD CONSTRAINT "GachaHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GachaPity" ADD CONSTRAINT "GachaPity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
