-- CreateTable
CREATE TABLE "UserCharacters" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "health" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "attack" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "defense" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "critRate" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "critDamage" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UserCharacters_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserCharacters" ADD CONSTRAINT "UserCharacters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCharacters" ADD CONSTRAINT "UserCharacters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "GachaItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
