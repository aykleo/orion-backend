-- CreateTable
CREATE TABLE "authLinks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authLinks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authLinks_userId_key" ON "authLinks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "authLinks_code_key" ON "authLinks"("code");

-- AddForeignKey
ALTER TABLE "authLinks" ADD CONSTRAINT "authLinks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
