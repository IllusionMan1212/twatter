-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "geolocation" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "accessTokenExpiresAt" SET DEFAULT now() + interval '2 hours',
ALTER COLUMN "refreshTokenExpiresAt" SET DEFAULT now() + interval '7 days';
