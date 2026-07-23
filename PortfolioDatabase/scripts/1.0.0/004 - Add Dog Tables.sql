CREATE TABLE "DogTimes" (
    "Dog" int NOT NULL,
    "Timestamp" timestamp(6) NOT NULL,
    CONSTRAINT "PK_DogTimes" PRIMARY KEY ("Dog", "Timestamp")
);
