export enum SeriesCategoryEnum {
  SessionAverage,
  OverallAverage,
  Game,
  StrikePct,
  SinglePinSparePct
}

export class SeriesCategory {
  category: SeriesCategoryEnum;

  display: string;

  description: string;
}

