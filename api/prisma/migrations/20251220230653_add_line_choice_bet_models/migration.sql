-- CreateTable
CREATE TABLE "line" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "choiceLimit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choice" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "flag" TEXT,
    "primaryPoints" INTEGER NOT NULL,
    "secondaryPoints" INTEGER NOT NULL,
    "isPrimaryWin" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "choice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bet" (
    "id" TEXT NOT NULL,
    "choiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "choice" ADD CONSTRAINT "choice_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "line"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bet" ADD CONSTRAINT "bet_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "choice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bet" ADD CONSTRAINT "bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
