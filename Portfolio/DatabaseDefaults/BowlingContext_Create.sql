CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(95) NOT NULL,
    `ProductVersion` varchar(32) NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
);

CREATE TABLE `BowlingSessions` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Date` datetime(6) NOT NULL,
    CONSTRAINT `PK_BowlingSessions` PRIMARY KEY (`Id`)
);

CREATE TABLE `BowlingGames` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` varchar(255) NOT NULL,
    `BowlingSessionId` int NOT NULL,
    `TotalScore` int NOT NULL,
    `GameNumber` int NOT NULL,
    CONSTRAINT `PK_BowlingGames` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_BowlingGames_BowlingSessions_BowlingSessionId` FOREIGN KEY (`BowlingSessionId`) REFERENCES `BowlingSessions` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_BowlingGames_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE
);

CREATE TABLE `BowlingFrames` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `BowlingGameId` int NOT NULL,
    `FrameNumber` int NOT NULL,
    `Roll1Score` int NOT NULL,
    `Roll2Score` int NOT NULL DEFAULT 0,
    `Roll3Score` int NOT NULL DEFAULT 0,
    `IsSplit` bit NOT NULL DEFAULT FALSE,
    CONSTRAINT `PK_BowlingFrames` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_BowlingFrames_BowlingGames_BowlingGameId` FOREIGN KEY (`BowlingGameId`) REFERENCES `BowlingGames` (`Id`) ON DELETE CASCADE
);

CREATE UNIQUE INDEX `IX_BowlingFrames_BowlingGameId_FrameNumber` ON `BowlingFrames` (`BowlingGameId`, `FrameNumber`);

CREATE INDEX `IX_BowlingGames_UserId` ON `BowlingGames` (`UserId`);

CREATE UNIQUE INDEX `IX_BowlingGames_BowlingSessionId_GameNumber_UserId` ON `BowlingGames` (`BowlingSessionId`, `GameNumber`, `UserId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20190724051017_InitialCreate', '2.1.11-servicing-32099');

