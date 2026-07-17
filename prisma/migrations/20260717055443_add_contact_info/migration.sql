-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "icon" VARCHAR(100),

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);
