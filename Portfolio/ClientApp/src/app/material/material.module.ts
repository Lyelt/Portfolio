import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MatButtonModule, MatStepperModule, MatInputModule, MatFormFieldModule,
  MatAutocompleteModule, MatCardModule, MatDatepickerModule, MatNativeDateModule,
  MatExpansionModule, MatToolbarModule, MatSnackBarModule, MatMenuModule, MatProgressBarModule,
  MatProgressSpinnerModule, MatDialogModule, MatTableModule, MatSortModule, MatCheckboxModule,
  MatIconModule, MatTooltipModule, MatSelectModule, MatDividerModule, MatSidenavModule, MatChipsModule,
  MatBadgeModule, MatListModule
} from '@angular/material';


const modules = [
  ReactiveFormsModule,
  FormsModule,
  BrowserAnimationsModule,
  MatButtonModule,
  MatStepperModule,
  MatInputModule,
  MatFormFieldModule,
  MatAutocompleteModule,
  MatCardModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatExpansionModule,
  MatToolbarModule,
  MatSnackBarModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatTableModule,
  MatSortModule,
  MatCheckboxModule,
  MatIconModule,
  MatTooltipModule,
  MatSelectModule,
  MatDividerModule,
  MatSidenavModule,
  MatChipsModule,
  MatBadgeModule,
  MatListModule
]

@NgModule({
  imports: [...modules],
  exports: [...modules],
})

export class MaterialModule { }
