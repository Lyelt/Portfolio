import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/auth/user';
import { Course } from '../../models/course';
import { Star } from '../../models/star';
import { ArchivedStarTime } from '../../models/star-time';
import { SpeedrunService } from '../../services/speedrun.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit {
  @Input() star: Star;
  @Input() runner: User;

  archivedStarTimes: ArchivedStarTime[] = [];

  constructor(private speedrunService: SpeedrunService) { }

  ngOnInit(): void {
    this.speedrunService.archivedStarTimes().subscribe(data => {
      this.archivedStarTimes = data.filter(a => a.starId === this.star.starId);
    });
  }

  deleteArchive(archive: ArchivedStarTime): void {
    this.speedrunService.deleteArchive(archive);
  }

  get archives(): ArchivedStarTime[] {
    const archives = this.archivedStarTimes.filter(a => a.userId === this.runner.id);
    if (archives.length > 0) {
      archives.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return archives;
  }
}
