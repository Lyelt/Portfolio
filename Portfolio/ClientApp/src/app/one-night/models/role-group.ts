import { Voiceline } from "./voiceline";

export class RoleGroup {
    public id: number;
    public name: string;
    public roleIds: number[];
    public isActive: boolean;
    public mustIncludeAllRoles: boolean;
    public voicelines: Voiceline[];
}