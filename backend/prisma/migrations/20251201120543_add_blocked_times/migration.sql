-- CreateTable
CREATE TABLE "BlockedTime" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "BlockedTime_pkey" PRIMARY KEY ("id")
);
