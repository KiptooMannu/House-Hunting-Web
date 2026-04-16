ALTER TYPE "public"."payment_method" ADD VALUE 'card';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "checkout_date" date;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "total_price" numeric(12, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_method" varchar(20);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "mpesa_checkout_request_id" varchar(100);--> statement-breakpoint
ALTER TABLE "compliance_logs" ADD COLUMN "booking_id" integer;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "booking_fee" numeric(10, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "daily_rate" numeric(12, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "compliance_logs" ADD CONSTRAINT "compliance_logs_booking_id_bookings_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("booking_id") ON DELETE set null ON UPDATE no action;