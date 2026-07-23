import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { A11yModule } from '@angular/cdk/a11y';


const modules = [
  A11yModule,
  ReactiveFormsModule,
  FormsModule,
  BrowserAnimationsModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatIconModule,
  MatTooltipModule,
  MatChipsModule,
  MatTabsModule
]

@NgModule({
  imports: [...modules],
  exports: [...modules],
})

export class MaterialModule { }
