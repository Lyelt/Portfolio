export class BowlingSeries {
    public name: string;
    public series: SeriesEntry[];
}

export class SeriesEntry {
    public name: Date;
    public value: number;
}

export class SingleSeriesEntry {
    public name: number;
    public value: number;
}
