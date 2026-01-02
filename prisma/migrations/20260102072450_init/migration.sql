-- CreateEnum
CREATE TYPE "DayNight" AS ENUM ('Day', 'Night');

-- CreateTable
CREATE TABLE "WeatherForecast" (
    "id" BIGSERIAL NOT NULL,
    "region" VARCHAR(80) NOT NULL,
    "detail" TEXT,
    "tempC" DECIMAL(5,2),
    "clearPct" SMALLINT,
    "partlyCloudyPct" SMALLINT,
    "cloudyPct" SMALLINT,
    "rainPct" SMALLINT,
    "thunderstormPct" SMALLINT,
    "fogPct" SMALLINT,
    "maxTempC" DECIMAL(5,2),
    "minTempC" DECIMAL(5,2),
    "windText" VARCHAR(50),
    "waveText" VARCHAR(50),
    "dateTime" TIMESTAMP(3) NOT NULL,
    "type" "DayNight" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherNearbyArea" (
    "id" BIGSERIAL NOT NULL,
    "forecastId" BIGINT NOT NULL,
    "name" VARCHAR(120) NOT NULL,

    CONSTRAINT "WeatherNearbyArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeatherForecast_dateTime_idx" ON "WeatherForecast"("dateTime");

-- CreateIndex
CREATE INDEX "WeatherForecast_region_idx" ON "WeatherForecast"("region");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherForecast_region_dateTime_type_key" ON "WeatherForecast"("region", "dateTime", "type");

-- CreateIndex
CREATE INDEX "WeatherNearbyArea_forecastId_idx" ON "WeatherNearbyArea"("forecastId");

-- AddForeignKey
ALTER TABLE "WeatherNearbyArea" ADD CONSTRAINT "WeatherNearbyArea_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "WeatherForecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
