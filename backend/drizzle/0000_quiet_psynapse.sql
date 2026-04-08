CREATE TYPE "public"."account_status" AS ENUM('active', 'inactive', 'locked', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('login', 'logout', 'register', 'create', 'update', 'delete', 'password_reset', 'account_lock', 'account_activate', 'account_deactivate', 'booking_confirm', 'payment_received');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending_payment', 'confirmed', 'cancelled', 'expired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."chatbot_session_status" AS ENUM('active', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."compliance_action" AS ENUM('nil_filing', 'revenue_report', 'tax_submission', 'audit_query');--> statement-breakpoint
CREATE TYPE "public"."compliance_status" AS ENUM('pending', 'submitted', 'acknowledged', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."furnishing" AS ENUM('furnished', 'semi_furnished', 'unfurnished');--> statement-breakpoint
CREATE TYPE "public"."house_type" AS ENUM('bedsitter', 'one_bedroom', 'two_bedroom', 'three_bedroom', 'four_bedroom_plus', 'studio', 'bungalow', 'mansion');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('active', 'booked', 'unavailable', 'draft', 'removed');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('mpesa', 'bank_transfer', 'cash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('seeker', 'landlord', 'admin');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"log_id" serial PRIMARY KEY NOT NULL,
	"performed_by_id" integer,
	"action" "audit_action" NOT NULL,
	"table_name" varchar(100),
	"record_id" varchar(100),
	"previous_values" text,
	"new_values" text,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth" (
	"auth_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_temporary_password" boolean DEFAULT false,
	"temporary_password_expires_at" timestamp,
	"login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp,
	"password_reset_token" varchar(255),
	"password_reset_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"booking_id" serial PRIMARY KEY NOT NULL,
	"seeker_id" integer NOT NULL,
	"house_id" integer NOT NULL,
	"chatbot_session_id" integer,
	"status" "booking_status" DEFAULT 'pending_payment' NOT NULL,
	"booking_fee" numeric(10, 2) NOT NULL,
	"move_in_date" date,
	"special_requests" text,
	"rejection_reason" text,
	"confirmed_at" timestamp,
	"cancelled_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chatbot_sessions" (
	"session_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_token" varchar(255) NOT NULL,
	"status" "chatbot_session_status" DEFAULT 'active' NOT NULL,
	"preferred_county" varchar(100),
	"preferred_town" varchar(100),
	"budget_min" numeric(10, 2),
	"budget_max" numeric(10, 2),
	"preferred_house_type" "house_type",
	"preferred_furnishing" "furnishing",
	"preferred_bedrooms" integer,
	"additional_preferences" text,
	"conversation_history" text,
	"result_house_ids" text,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"last_activity_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "chatbot_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "compliance_logs" (
	"log_id" serial PRIMARY KEY NOT NULL,
	"initiated_by_id" integer,
	"action" "compliance_action" NOT NULL,
	"status" "compliance_status" DEFAULT 'pending' NOT NULL,
	"period_start" date,
	"period_end" date,
	"total_revenue_kes" numeric(14, 2),
	"total_booking_fees" numeric(14, 2),
	"gava_connect_request_id" varchar(255),
	"gava_connect_response" text,
	"acknowledged_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "house_images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"house_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"caption" varchar(255),
	"is_primary" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "houses" (
	"house_id" serial PRIMARY KEY NOT NULL,
	"landlord_id" integer NOT NULL,
	"location_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"house_type" "house_type" NOT NULL,
	"furnishing" "furnishing" DEFAULT 'unfurnished' NOT NULL,
	"bedrooms" integer DEFAULT 1 NOT NULL,
	"bathrooms" integer DEFAULT 1 NOT NULL,
	"monthly_rent" numeric(12, 2) NOT NULL,
	"deposit_amount" numeric(12, 2),
	"is_deposit_negotiable" boolean DEFAULT false,
	"available_from" date,
	"gps_latitude" numeric(10, 7),
	"gps_longitude" numeric(10, 7),
	"address_line" text,
	"amenities" text,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"is_verified" boolean DEFAULT false,
	"verified_by_id" integer,
	"verified_at" timestamp,
	"view_count" integer DEFAULT 0,
	"booking_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"location_id" serial PRIMARY KEY NOT NULL,
	"county" varchar(100) NOT NULL,
	"sub_county" varchar(100),
	"town" varchar(100),
	"neighborhood" varchar(100),
	"gps_latitude" numeric(10, 7),
	"gps_longitude" numeric(10, 7),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_location" UNIQUE("county","sub_county","town","neighborhood")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"payment_id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"payer_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"method" "payment_method" DEFAULT 'mpesa' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"mpesa_phone_number" varchar(20),
	"mpesa_checkout_request_id" varchar(100),
	"mpesa_merchant_request_id" varchar(100),
	"mpesa_receipt_number" varchar(50),
	"mpesa_transaction_date" timestamp,
	"transaction_reference" varchar(255),
	"failure_reason" text,
	"paid_at" timestamp,
	"refunded_at" timestamp,
	"refund_reason" text,
	"idempotency_key" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_transaction_reference_unique" UNIQUE("transaction_reference"),
	CONSTRAINT "payments_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"national_id" varchar(50),
	"role" "user_role" DEFAULT 'seeker' NOT NULL,
	"account_status" "account_status" DEFAULT 'pending_verification' NOT NULL,
	"profile_image" varchar(500),
	"region" varchar(255),
	"last_login_at" timestamp,
	"total_bookings" integer DEFAULT 0,
	"total_listings" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_national_id_unique" UNIQUE("national_id")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_id_users_user_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth" ADD CONSTRAINT "auth_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_seeker_id_users_user_id_fk" FOREIGN KEY ("seeker_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_house_id_houses_house_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("house_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_chatbot_session_id_chatbot_sessions_session_id_fk" FOREIGN KEY ("chatbot_session_id") REFERENCES "public"."chatbot_sessions"("session_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_sessions" ADD CONSTRAINT "chatbot_sessions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_logs" ADD CONSTRAINT "compliance_logs_initiated_by_id_users_user_id_fk" FOREIGN KEY ("initiated_by_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_images" ADD CONSTRAINT "house_images_house_id_houses_house_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("house_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_landlord_id_users_user_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_verified_by_id_users_user_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("booking_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payer_id_users_user_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_seeker_house" ON "bookings" USING btree ("seeker_id","house_id") WHERE "bookings"."status" NOT IN ('cancelled', 'expired', 'rejected');--> statement-breakpoint
CREATE INDEX "idx_houses_landlord_status" ON "houses" USING btree ("landlord_id","status");--> statement-breakpoint
CREATE INDEX "idx_houses_location_rent" ON "houses" USING btree ("location_id","monthly_rent");--> statement-breakpoint
CREATE INDEX "idx_payments_idempotency" ON "payments" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_mpesa_checkout" ON "payments" USING btree ("mpesa_checkout_request_id");