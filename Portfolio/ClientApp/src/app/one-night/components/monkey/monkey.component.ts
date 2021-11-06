import { Component, OnInit } from '@angular/core';
import { Role } from '../../models/role';
import { Voiceline } from '../../models/voiceline';
import { GameAudioService } from '../../services/game-audio.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-monkey',
  templateUrl: './monkey.component.html',
  styleUrls: ['./monkey.component.scss']
})
export class MonkeyComponent implements OnInit {

  currentVoiceline: Voiceline;
  roles: Role[] = [];
  players: number[] = [];

  constructor(private audioService: GameAudioService, private roleService: RoleService) { }

  ngOnInit(): void {
    this.audioService.voiceline().subscribe(v => {
      this.currentVoiceline = v;    
    });

    this.roleService.getRoles().subscribe(r => {
      this.roles = r;
      this.players = Array(r.filter(r => r.selected).length - 3).fill(0);
    });
  }

}
