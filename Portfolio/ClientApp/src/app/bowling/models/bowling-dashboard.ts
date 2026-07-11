import { BowlingSeries } from './bowling-series';
import { BowlingSession } from './bowling-session';
import { BowlingStat } from './bowling-stat';

export interface BowlingDashboard {
  sessions: BowlingSession[];
  series: BowlingSeries[];
  stats: BowlingStat[];
}
