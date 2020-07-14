export enum SeriesCategoryEnum {
    SessionAverage,
    OverallAverage,
    Game,
    StrikePct,
    SinglePinSparePct,
    NumberOfGamesByScore
}

export class SeriesCategory {
    category: SeriesCategoryEnum;

    display: string;

    description: string;

    chartType: string;
}

