-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('romantic', 'dreamy', 'elegant', 'cute');

-- CreateTable
CREATE TABLE "MemoryProject" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "accentText" TEXT,
    "musicUrl" TEXT,
    "eventDate" TIMESTAMP(3),
    "theme" "Theme" NOT NULL DEFAULT 'romantic',
    "coverImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoryProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemoryProject_slug_key" ON "MemoryProject"("slug");

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MemoryProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
