-- CreateTable
CREATE TABLE "MusicLike" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "MusicLike_videoId_idx" ON "MusicLike"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "MusicLike_email_videoId_key" ON "MusicLike"("email", "videoId");
