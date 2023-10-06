import { User } from "src/app/auth/user";

export class GameNight {
    id: number;
    date: Date;
    userId?: string;
    gameNightMealId?: number;
    user?: User;
    meal?: GameNightMeal;
    games: GameNightGame[];
    isCancelled?: boolean;
    userStatuses: GameNightUserStatus[];
}

export class GameNightMeal {
    id: number;
    name: string;
    dateAdded: Date;
}

export class GameNightGame {
    id: number;
    name: string;
    image: string;
    minPlayers: number;
    maxPlayers: number;
}

export class GameNightUserStatus {
    id: number;
    gameNightId: number;
    userId: string;
    user: User;
    status: UserStatus;
}

export enum UserStatus {
    Available,
    Partial,
    NotAvailable,
    Unknown
}