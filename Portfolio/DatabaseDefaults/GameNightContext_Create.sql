CREATE TABLE `Games` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext NOT NULL,
    `Image` longtext NOT NULL,
    `MinPlayers` int NOT NULL,
    `MaxPlayers` int NOT NULL,
    CONSTRAINT `PK_Games` PRIMARY KEY (`Id`)
);

CREATE TABLE `GameNightPresets` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext NOT NULL,
    `UserId` varchar(255) NOT NULL,
    CONSTRAINT `PK_GameNightPresets` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_GameNightPresets_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE
);

CREATE TABLE `GameNightGameGameNightPreset` (
    `GameNightPresetId` int NOT NULL,
    `GamesId` int NOT NULL,
    CONSTRAINT `PK_GameNightGameGameNightPreset` PRIMARY KEY (`GameNightPresetId`, `GamesId`),
    CONSTRAINT `FK_GameNightGameGameNightPreset_GameNightPresets_GameNightPrese~` FOREIGN KEY (`GameNightPresetId`) REFERENCES `GameNightPresets` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_GameNightGameGameNightPreset_Games_GamesId` FOREIGN KEY (`GamesId`) REFERENCES `Games` (`Id`) ON DELETE CASCADE
);

CREATE TABLE `GameNights` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Date` datetime(6) NOT NULL,
    `UserId` varchar(255) NOT NULL,
    `GameNightPresetId` int NOT NULL,
    CONSTRAINT `PK_GameNights` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_GameNights_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_GameNights_GameNightPresets_GameNightPresetId` FOREIGN KEY (`GameNightPresetId`) REFERENCES `GameNightPresets` (`Id`) ON DELETE CASCADE
);

CREATE INDEX `IX_GameNightGameGameNightPreset_GamesId` ON `GameNightGameGameNightPreset` (`GamesId`);

CREATE INDEX `IX_GameNightPresets_UserId` ON `GameNightPresets` (`UserId`);

CREATE INDEX `IX_GameNights_GameNightPresetId` ON `GameNights` (`GameNightPresetId`);

CREATE INDEX `IX_GameNights_UserId` ON `GameNights` (`UserId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20230921191344_InitialCreate', '7.0.11');


