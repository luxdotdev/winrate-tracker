-- CreateTable
CREATE TABLE "match" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "map" TEXT NOT NULL,
    "mapType" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "groupSize" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_hero" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "hero" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,

    CONSTRAINT "match_hero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_userId_idx" ON "match"("userId");

-- CreateIndex
CREATE INDEX "match_hero_matchId_idx" ON "match_hero"("matchId");

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_hero" ADD CONSTRAINT "match_hero_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
