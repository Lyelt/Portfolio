CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(95) NOT NULL,
    `ProductVersion` varchar(32) NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
);

CREATE TABLE `Courses` (
    `CourseId` int NOT NULL,
    `Name` longtext NOT NULL,
    `Abbreviation` varchar(5) NULL,
    CONSTRAINT `PK_Courses` PRIMARY KEY (`CourseId`)
);

CREATE TABLE `Stars` (
    `StarId` int NOT NULL,
    `Name` longtext NOT NULL,
    `CourseId` int NOT NULL,
    CONSTRAINT `PK_Stars` PRIMARY KEY (`StarId`),
    CONSTRAINT `FK_Stars_Courses_CourseId` FOREIGN KEY (`CourseId`) REFERENCES `Courses` (`CourseId`) ON DELETE CASCADE
);

CREATE TABLE `StarTimes` (
    `StarId` int NOT NULL,
    `UserId` varchar(255) NOT NULL,
    `LastUpdated` datetime(6) NOT NULL,
    `Time` time(6) NOT NULL,
    `VideoUrl` longtext NULL,
    CONSTRAINT `PK_StarTimes` PRIMARY KEY (`StarId`, `UserId`),
    CONSTRAINT `FK_StarTimes_Stars_StarId` FOREIGN KEY (`StarId`) REFERENCES `Stars` (`StarId`) ON DELETE CASCADE,
    CONSTRAINT `FK_StarTimes_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE
);

CREATE INDEX `IX_Stars_CourseId` ON `Stars` (`CourseId`);

CREATE INDEX `IX_StarTimes_UserId` ON `StarTimes` (`UserId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20190715024724_InitialCreate', '2.1.11-servicing-32099');

ALTER TABLE `StarTimes` MODIFY COLUMN `Time` bigint NOT NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20190715040918_TimespanTicks', '2.1.11-servicing-32099');

START TRANSACTION;

CREATE TABLE `ArchivedStarTimes` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Timestamp` datetime(6) NOT NULL,
    `StarId` int NOT NULL,
    `UserId` varchar(255) NULL,
    `LastUpdated` datetime(6) NOT NULL,
    `Time` bigint NOT NULL,
    `VideoUrl` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_ArchivedStarTimes` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_ArchivedStarTimes_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_ArchivedStarTimes_Stars_StarId` FOREIGN KEY (`StarId`) REFERENCES `Stars` (`StarId`) ON DELETE CASCADE
);

CREATE INDEX `IX_ArchivedStarTimes_StarId` ON `ArchivedStarTimes` (`StarId`);

CREATE INDEX `IX_ArchivedStarTimes_UserId` ON `ArchivedStarTimes` (`UserId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20210223065239_Add_ArchivedStarTimes', '5.0.2');

COMMIT;
