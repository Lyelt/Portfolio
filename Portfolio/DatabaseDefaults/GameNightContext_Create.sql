CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150)  NOT NULL,
    `ProductVersion` varchar(32)  NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) ;

START TRANSACTION;

CREATE TABLE `GameNightMeals` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext  NOT NULL,
    `DateAdded` datetime(6) NOT NULL,
    CONSTRAINT `PK_GameNightMeals` PRIMARY KEY (`Id`)
) ;

CREATE TABLE `Games` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext  NOT NULL,
    `Image` longtext  NULL,
    `MinPlayers` int NOT NULL,
    `MaxPlayers` int NOT NULL,
    CONSTRAINT `PK_Games` PRIMARY KEY (`Id`)
) ;

CREATE TABLE `GameNights` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Date` datetime(6) NOT NULL,
    `GameNightMealId` int NULL,
    `UserId` varchar(255)  NULL,
    `IsCancelled` tinyint(1) NULL,
    CONSTRAINT `PK_GameNights` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_GameNights_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`),
    CONSTRAINT `FK_GameNights_GameNightMeals_GameNightMealId` FOREIGN KEY (`GameNightMealId`) REFERENCES `GameNightMeals` (`Id`)
) ;

CREATE TABLE `GameNightGameNightGame` (
    `GameNightId` int NOT NULL,
    `GamesId` int NOT NULL,
    CONSTRAINT `PK_GameNightGameNightGame` PRIMARY KEY (`GameNightId`, `GamesId`),
    CONSTRAINT `FK_GameNightGameNightGame_GameNights_GameNightId` FOREIGN KEY (`GameNightId`) REFERENCES `GameNights` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_GameNightGameNightGame_Games_GamesId` FOREIGN KEY (`GamesId`) REFERENCES `Games` (`Id`) ON DELETE CASCADE
) ;

CREATE TABLE `GameNightUserStatuses` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `GameNightId` int NOT NULL,
    `UserId` varchar(255)  NOT NULL,
    `Status` int NOT NULL,
    CONSTRAINT `PK_GameNightUserStatuses` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_GameNightUserStatuses_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_GameNightUserStatuses_GameNights_GameNightId` FOREIGN KEY (`GameNightId`) REFERENCES `GameNights` (`Id`) ON DELETE CASCADE
) ;

CREATE INDEX `IX_GameNightGameNightGame_GamesId` ON `GameNightGameNightGame` (`GamesId`);

CREATE INDEX `IX_GameNights_GameNightMealId` ON `GameNights` (`GameNightMealId`);

CREATE INDEX `IX_GameNights_UserId` ON `GameNights` (`UserId`);

CREATE INDEX `IX_GameNightUserStatuses_GameNightId` ON `GameNightUserStatuses` (`GameNightId`);

CREATE INDEX `IX_GameNightUserStatuses_UserId` ON `GameNightUserStatuses` (`UserId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20231005041217_InitialCreate', '7.0.11');

COMMIT;

