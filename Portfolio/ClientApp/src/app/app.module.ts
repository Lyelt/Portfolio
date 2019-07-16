import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AboutComponent } from './about/about.component';
import { MaterialModule } from './material/material.module';
import { HomeComponent } from './home/home.component';
import { EncounterComponent } from './encounter/encounter.component';
import { TypingComponent } from './typing/typing.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { SpeedrunComponent } from './speedrun/speedrun.component';
import { BowlingComponent } from './bowling/bowling.component';
import { LoginComponent } from './login/login.component';
import { EditStarComponent } from './edit-star/edit-star.component';
import { AuthGuard } from './auth/auth-guard.service';
import { JwtHelperService, JwtModule, JwtInterceptor } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BingoComponent } from './bingo/bingo.component';
import { ConfigureSpeedrunComponent } from './configure-speedrun/configure-speedrun.component';
import { BingoGoalComponent } from './bingo-goal/bingo-goal.component';

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
  },
  {
    path: 'speedrun', component: SpeedrunComponent, canActivate: [AuthGuard]
  },
  {
    path: 'speedrun/configure', component: ConfigureSpeedrunComponent, canActivate: [AuthGuard]
  },
  {
    path: 'speedrun/bingo', component: BingoComponent
  },
  {
    path: 'bowling', component: BowlingComponent, canActivate: [AuthGuard]
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    AboutComponent,
    HomeComponent,
    EncounterComponent,
    TypingComponent,
    PortfolioComponent,
    SpeedrunComponent,
    BowlingComponent,
    LoginComponent,
    EditStarComponent,
    BingoComponent,
    ConfigureSpeedrunComponent,
    BingoGoalComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { useHash: false }),
    MaterialModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter
      }
    })
  ],
  exports: [
    MaterialModule
  ],
  entryComponents: [
    EditStarComponent
  ],
  providers: [
    AuthGuard,
    JwtHelperService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }

export function tokenGetter() {
  return localStorage.getItem("jwt");
}
