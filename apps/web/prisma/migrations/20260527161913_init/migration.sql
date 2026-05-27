-- CreateTable
CREATE TABLE "Headline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "recentScore" TEXT NOT NULL,
    "recentSummary" TEXT NOT NULL,
    "recentDetail" TEXT NOT NULL,
    "broadScore" TEXT NOT NULL,
    "broadSummary" TEXT NOT NULL,
    "broadDetail" TEXT NOT NULL,
    "humanScore" TEXT NOT NULL,
    "humanSummary" TEXT NOT NULL,
    "humanDetail" TEXT NOT NULL,
    "analyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forDate" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Headline_url_key" ON "Headline"("url");

-- CreateIndex
CREATE INDEX "Headline_forDate_idx" ON "Headline"("forDate");
