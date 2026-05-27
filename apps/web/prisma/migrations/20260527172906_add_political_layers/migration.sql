-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Headline" (
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
    "isPolitical" BOOLEAN NOT NULL DEFAULT false,
    "politicianName" TEXT,
    "partyName" TEXT,
    "campaignScore" TEXT,
    "campaignSummary" TEXT,
    "campaignDetail" TEXT,
    "partyScore" TEXT,
    "partySummary" TEXT,
    "partyDetail" TEXT,
    "analyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forDate" TEXT NOT NULL
);
INSERT INTO "new_Headline" ("analyzedAt", "broadDetail", "broadScore", "broadSummary", "category", "forDate", "headline", "humanDetail", "humanScore", "humanSummary", "id", "publishedAt", "recentDetail", "recentScore", "recentSummary", "source", "url") SELECT "analyzedAt", "broadDetail", "broadScore", "broadSummary", "category", "forDate", "headline", "humanDetail", "humanScore", "humanSummary", "id", "publishedAt", "recentDetail", "recentScore", "recentSummary", "source", "url" FROM "Headline";
DROP TABLE "Headline";
ALTER TABLE "new_Headline" RENAME TO "Headline";
CREATE UNIQUE INDEX "Headline_url_key" ON "Headline"("url");
CREATE INDEX "Headline_forDate_idx" ON "Headline"("forDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
