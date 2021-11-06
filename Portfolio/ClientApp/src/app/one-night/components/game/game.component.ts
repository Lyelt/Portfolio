import { Component, OnInit } from '@angular/core';
import { Role } from '../../models/role';
import { RoleService } from '../../services/role.service';
import { GameAudioService } from '../../services/game-audio.service';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Voiceline } from '../../models/voiceline';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  status: string = 'stopped';
  audioStatus: string;
  currentVoiceline: Voiceline;
  currentRole: Role;

  roles: Role[] = [];

  protected narrator: HTMLAudioElement;
  protected background: HTMLAudioElement;

  constructor(protected roleService: RoleService, protected audioService: GameAudioService, private router: Router) { 
    router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe((event: NavigationEnd) => {
      audioService.stop();
    });
  }

  ngOnInit(): void {
    this.roleService.getRoles().subscribe(roles => {
      this.roles = roles;
    });

    this.audioService.status().subscribe(status => {
      this.audioStatus = status;
    });

    this.audioService.voiceline().subscribe(voiceline => {
      this.currentVoiceline = voiceline;
    });
  }

  start() {
    this.audioService.start();
    this.status = 'started';
  }

  pause() {
    this.audioService.pause();
    this.status = 'paused';
  }

  resume() {
    this.audioService.resume();
    this.status = 'started';
  }

  stop() {
    this.audioService.stop();
    this.status = 'stopped';
  }

  toggleRoleSelected(role: Role) {
    this.roleService.toggleRoleSelected(role);
  }

  get selectedRoleCount(): number {
    return this.roles?.filter(r => r.selected)?.length;
  }
}
