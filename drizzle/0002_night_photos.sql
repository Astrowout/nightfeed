CREATE TABLE "night_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"night_id" text NOT NULL,
	"mime" text NOT NULL,
	"data" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "night_photos_night_id_unique" UNIQUE("night_id")
);
--> statement-breakpoint
ALTER TABLE "night_photos" ADD CONSTRAINT "night_photos_night_id_nights_id_fk" FOREIGN KEY ("night_id") REFERENCES "public"."nights"("id") ON DELETE cascade ON UPDATE no action;