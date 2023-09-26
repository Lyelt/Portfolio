CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

CREATE TABLE `GameNightMeals` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext NOT NULL,
    `DateAdded` datetime(6) NOT NULL,
    CONSTRAINT `PK_GameNightMeals` PRIMARY KEY (`Id`)
) ;

CREATE TABLE `Games` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext  NOT NULL,
    `Image` longtext  NOT NULL,
    `MinPlayers` int NOT NULL,
    `MaxPlayers` int NOT NULL,
    CONSTRAINT `PK_Games` PRIMARY KEY (`Id`)
);

CREATE TABLE `GameNights` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Date` datetime(6) NOT NULL,
    `GameNightMealId` int NULL,
    `UserId` varchar(255) NOT NULL,
    CONSTRAINT `PK_GameNights` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_GameNights_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_GameNights_GameNightMeals_GameNightMealId` FOREIGN KEY (`GameNightMealId`) REFERENCES `GameNightMeals` (`Id`) ON DELETE CASCADE
) ;

CREATE TABLE `GameNightGameNightGame` (
    `GameNightId` int NOT NULL,
    `GamesId` int NOT NULL,
    CONSTRAINT `PK_GameNightGameNightGame` PRIMARY KEY (`GameNightId`, `GamesId`),
    CONSTRAINT `FK_GameNightGameNightGame_GameNights_GameNightId` FOREIGN KEY (`GameNightId`) REFERENCES `GameNights` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_GameNightGameNightGame_Games_GamesId` FOREIGN KEY (`GamesId`) REFERENCES `Games` (`Id`) ON DELETE CASCADE
);

CREATE INDEX `IX_GameNightGameNightGame_GamesId` ON `GameNightGameNightGame` (`GamesId`);

CREATE INDEX `IX_GameNights_GameNightMealId` ON `GameNights` (`GameNightMealId`);

CREATE INDEX `IX_GameNights_UserId` ON `GameNights` (`UserId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20230926043913_InitialCreate', '7.0.11');

COMMIT;

