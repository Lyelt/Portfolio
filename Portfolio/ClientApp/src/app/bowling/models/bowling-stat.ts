export class BowlingStat {
  name: string;

  value: number;

  unit: string;

  details: string;
}

export enum StatCategory {
  Overall,
  Count,
  Split,
  Record
}
