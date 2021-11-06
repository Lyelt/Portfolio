import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role } from '../models/role';
import { RoleGroup } from '../models/role-group';
import { Voiceline } from '../models/voiceline';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class GameAudioService {
  background: HTMLAudioElement;

  currentVoiceline: HTMLAudioElement;
  allVoicelines: Voiceline[];
  voicelineIndex: number = -1;
  roleTimerSeconds: number = 8;

  pauseTimer: any;

  roles: Role[];
  roleGroups: RoleGroup[];

  private statusSubject: BehaviorSubject<string> = new BehaviorSubject("Not Playing"); 
  private voicelineSubject: BehaviorSubject<Voiceline> = new BehaviorSubject(null);

  constructor(private roleService: RoleService) { 
    this.roleService.getRoles().subscribe(roles => {
      this.roles = roles;
    });

    this.roleService.getRoleGroups().subscribe(groups => {
      this.roleGroups = groups;
    });
  }

  public status(): Observable<string> {
    return this.statusSubject.asObservable();
  }

  public voiceline(): Observable<Voiceline> {
    return this.voicelineSubject.asObservable();
  }

  public start() {
    this.startBackground();
    this.startNarrator();
  }

  public stop() {
    this.voicelineIndex = -1;
    clearTimeout(this.pauseTimer);

    if (this.currentVoiceline) {
      this.currentVoiceline.pause();
      this.currentVoiceline.currentTime = 0;
    }

    if (this.background) {
      this.background.pause();
      this.background.currentTime = 0;
    }
  }

  public pause() {
    this.currentVoiceline?.pause();
    this.background?.pause();
    clearTimeout(this.pauseTimer);
  }

  public resume() {
    this.background.play();
    if (this.currentVoiceline.currentTime === this.currentVoiceline.duration) {
      this.playNextNarratorLine();
    }
    else {
      this.currentVoiceline.play();
    }
  }

  private startBackground() {
    this.background = new Audio(`assets/one-night/music/dramatic.mp3`);
    this.background.loop = true;
    this.background.load();
    this.background.play();
  }

  private startNarrator() {
    this.allVoicelines = this.roles.filter(r => r.selected).flatMap(r => r.voicelines).concat(this.roleGroups.filter(rg => rg.isActive).flatMap(rg => rg.voicelines)).sort((a, b) => a.order - b.order);
    this.playNextNarratorLine();
  }

  private playNextNarratorLine() {
    this.voicelineIndex++;
    this.adjustBackgroundVolume(true);
    const svc = this;

    if (this.voicelineIndex < this.allVoicelines.length) {
      const vl: Voiceline = this.allVoicelines[this.voicelineIndex];
      this.currentVoiceline = new Audio(`assets/one-night/monkey/voicelines/${vl.audioFileName}.mp3`);
      this.currentVoiceline.load();
      this.statusSubject.next(`${vl.text}`);
      this.voicelineSubject.next(vl);

      this.currentVoiceline.onloadedmetadata = function() {
        svc.currentVoiceline.play();

        const pauseTimeSeconds: number = svc.roleTimerSeconds * vl.pauseMultiplier;
        const audioMs: number = svc.currentVoiceline.duration * 1000;
        
        svc.pauseTimer = setTimeout(() => { svc.playNextNarratorLine(); }, pauseTimeSeconds * 1000 + audioMs);
        setTimeout(() => { svc.adjustBackgroundVolume(false); }, audioMs);
        if (pauseTimeSeconds > 0) {
          setTimeout(() => { svc.setPausedStatus(pauseTimeSeconds); }, audioMs);
        }
      }
    }
    else {
      this.background.pause();
      this.statusSubject.next("Waking up!");
      this.voicelineSubject.next(null);
    }
  }

  private adjustBackgroundVolume(quieter: boolean, multiplier: number = 2) {
    if (this.background.paused) return;

    console.log(`adjusting volume to be ${quieter ? "quieter" : "louder"}`);
    if (quieter) {
      this.background.volume /= multiplier;
    }
    else {
      this.background.volume *= multiplier;
    }
  }

  private setPausedStatus(seconds: number) {
    this.statusSubject.next(`Pausing for ${seconds} seconds.`);
  }

}
