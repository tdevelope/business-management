-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" INTEGER NOT NULL,
    "workingDays" JSONB NOT NULL,
    "openingHours" JSONB NOT NULL,
    "maxAdvanceBookingDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);
