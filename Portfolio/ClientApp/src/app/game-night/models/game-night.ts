import { User } from "src/app/auth/user";

export class GameNight {
    id: number;
    date: Date;
    userId?: string;
    gameNightMealId?: number;
    user: User;
}

export class GameNightMeal {
    id: number;
    name: string;
    dateAdded: Date;
}

export class GameNightGame {
    id: number;
    name: string;
    meal: string;
    image: string;
    minPlayers: number;
    maxPlayers: number;
}