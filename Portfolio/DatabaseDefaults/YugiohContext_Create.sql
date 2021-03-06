﻿CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(95) NOT NULL,
    `ProductVersion` varchar(32) NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
);

CREATE TABLE `CardCollections` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` varchar(255) NOT NULL,
    `Name` varchar(255) NOT NULL,
    CONSTRAINT `PK_CardCollections` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_CardCollections_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE
);

CREATE TABLE `CardIds` (
    `Id` int NOT NULL,
    `Section` varchar(255) NOT NULL,
    `SetCode` longtext NULL,
    `Quantity` int NOT NULL,
    `CardCollectionId` int NOT NULL,
    CONSTRAINT `PK_CardIds` PRIMARY KEY (`Id`, `Section`),
    CONSTRAINT `FK_CardIds_CardCollections_CardCollectionId` FOREIGN KEY (`CardCollectionId`) REFERENCES `CardCollections` (`Id`) ON DELETE CASCADE
);

CREATE UNIQUE INDEX `IX_CardCollections_UserId_Name` ON `CardCollections` (`UserId`, `Name`);

CREATE INDEX `IX_CardIds_CardCollectionId` ON `CardIds` (`CardCollectionId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20200306044139_InitialCreate', '2.1.11-servicing-32099');

