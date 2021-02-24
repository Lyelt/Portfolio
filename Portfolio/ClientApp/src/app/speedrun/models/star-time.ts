export class StarTime {
  time: string;

  timeDisplay: string;

  totalMilliseconds: number;

  lastUpdated: Date;

  videoUrl: string;

  starId: number;

  userId: string;
}

export class ArchivedStarTime extends StarTime {
  id: number;

  timestamp: Date;
}
