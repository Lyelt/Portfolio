import { Voiceline } from "./voiceline";

export class Role {
    public id: number;
    public name: string;
    public selected: boolean;
    public displayOrder: number;
    public voicelines: Voiceline[];
}