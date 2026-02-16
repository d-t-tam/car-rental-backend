-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Customer', 'Staff', 'Manager', 'Admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Inactive', 'Disabled');

-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('Available', 'Rented', 'Reserved', 'Maintenance', 'Disabled');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Deposit Paid');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Unpaid', 'Partially Paid', 'Paid', 'Refunded');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('Handover', 'Return');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('OK', 'Damaged', 'Missing');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Payment', 'Refund', 'Deposit', 'Penalty');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Banking', 'E-Wallet', 'Wallet');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('Pending', 'Success', 'Failed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Booking', 'Payment', 'System');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "user_id" INTEGER NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "license_number" VARCHAR(50),
    "address" VARCHAR(255),
    "wallet_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "user_id" INTEGER NOT NULL,
    "staff_code" VARCHAR(50) NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "car_categories" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "min_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "car_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "cars" (
    "car_id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "license_plate" VARCHAR(20) NOT NULL,
    "vin_number" VARCHAR(50) NOT NULL,
    "status" "CarStatus" NOT NULL,
    "rental_price_per_day" DECIMAL(10,2) NOT NULL,
    "current_mileage" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("car_id")
);

-- CreateTable
CREATE TABLE "car_images" (
    "image_id" SERIAL NOT NULL,
    "car_id" INTEGER NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "is_thumbnail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "car_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "car_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "total_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "BookingStatus" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "booking_inspections" (
    "inspection_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "type" "InspectionType" NOT NULL,
    "inspection_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "odometer_reading" INTEGER NOT NULL,
    "fuel_level" INTEGER NOT NULL,
    "condition_summary" TEXT,
    "customer_signature_url" VARCHAR(255),

    CONSTRAINT "booking_inspections_pkey" PRIMARY KEY ("inspection_id")
);

-- CreateTable
CREATE TABLE "inspection_items" (
    "item_id" SERIAL NOT NULL,
    "inspection_id" INTEGER NOT NULL,
    "item_name" VARCHAR(50) NOT NULL,
    "status" "ItemStatus" NOT NULL,
    "notes" TEXT,
    "photo_url" VARCHAR(255),

    CONSTRAINT "inspection_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transaction_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "gateway_txn_id" VARCHAR(100),
    "status" "TransactionStatus" NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "feedback_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_staff_code_key" ON "staff_profiles"("staff_code");

-- CreateIndex
CREATE UNIQUE INDEX "cars_license_plate_key" ON "cars"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "cars_vin_number_key" ON "cars"("vin_number");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_booking_id_key" ON "feedbacks"("booking_id");

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "car_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_images" ADD CONSTRAINT "car_images_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("car_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("car_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_inspections" ADD CONSTRAINT "booking_inspections_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_inspections" ADD CONSTRAINT "booking_inspections_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_items" ADD CONSTRAINT "inspection_items_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "booking_inspections"("inspection_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
