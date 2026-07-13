import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SkillsSectionComponent } from './skills-section.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [SkillsSectionComponent],
  imports: [CommonModule, MatIconModule]
})
class SkillsSectionTestModule {}

describe('SkillsSectionComponent', () => {
  let component: SkillsSectionComponent;
  let fixture: ComponentFixture<SkillsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsSectionTestModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
