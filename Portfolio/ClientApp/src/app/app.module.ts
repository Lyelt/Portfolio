import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { AboutComponent } from './about/about.component';
import { MaterialModule } from './material/material.module';
import { HomeComponent } from './home/home.component';
import { EncounterComponent } from './encounter/encounter.component';
import { TypingComponent } from './typing/typing.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent
  },
  {
    path: 'encounter', component: EncounterComponent
  },
  {
    path: 'typing', component: TypingComponent
  },
  {
    path: 'portfolio', component: PortfolioComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidenavComponent,
    AboutComponent,
    HomeComponent,
    EncounterComponent,
    TypingComponent,
    PortfolioComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot(routes, { useHash: false }),
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
