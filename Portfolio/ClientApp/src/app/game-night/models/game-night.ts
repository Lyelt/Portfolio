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