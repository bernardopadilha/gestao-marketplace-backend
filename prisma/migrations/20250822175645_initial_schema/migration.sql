-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('BRINQUEDO', 'MOVEL', 'PAPELARIA', 'SAUDE_E_BELEZA', 'UTENSILIO', 'VESTUARIO');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ANUNCIADO', 'VENDIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."Category" NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ANUNCIADO',
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_phone_key" ON "public"."User"("email", "phone");

-- AddForeignKey
ALTER TABLE "public"."Products" ADD CONSTRAINT "Products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
