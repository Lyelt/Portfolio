import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MaterialModule } from './material/material.module';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth-guard.service';
import { JwtHelperService, JwtModule, JwtInterceptor } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { EncounterComponent } from './blog/components/encounter/encounter.component';
import { TypingComponent } from './blog/components/typing/typing.component';
import { PortfolioComponent } from './blog/components/portfolio/portfolio.component';
import { SpeedrunComponent } from './speedrun/components/speedrun/speedrun.component';
import { BowlingComponent } from './bowling/components/bowling/bowling.component';
import { EditStarComponent } from './speedrun/components/edit-star/edit-star.component';
import { BingoComponent } from './speedrun/components/bingo/bingo.component';
import { ConfigureSpeedrunComponent } from './speedrun/components/configure-speedrun/configure-speedrun.component';
import { BingoGoalComponent } from './speedrun/components/bingo-goal/bingo-goal.component';
import { BowlingChartComponent } from './bowling/components/bowling-chart/bowling-chart.component';
import { BowlingStartSessionComponent } from './bowling/components/bowling-start-session/bowling-start-session.component';
import { BowlingAddGameComponent } from './bowling/components/bowling-add-game/bowling-add-game.component';
import { BowlingSelectUserComponent } from './bowling/components/bowling-select-user/bowling-select-user.component';
import { BowlingGameComponent } from './bowling/components/bowling-game/bowling-game.component';
import { BowlingStatComponent } from './bowling/components/bowling-stat/bowling-stat.component';
import { BowlingSelectSeriesCategoryComponent } from './bowling/components/bowling-select-series-category/bowling-select-series-category.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent
  },
  {
    path: 'blog/encounter', component: EncounterComponent
  },
  {
    path: 'blog/typing', component: TypingComponent
  },
  {
    path: 'blog/portfolio', component: PortfolioComponent
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
    BingoGoalComponent,
    BowlingChartComponent,
    BowlingStartSessionComponent,
    BowlingAddGameComponent,
    BowlingSelectUserComponent,
    BowlingGameComponent,
    BowlingStatComponent,
    BowlingSelectSeriesCategoryComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { useHash: false }),
    MaterialModule,
    NgxChartsModule,
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
    EditStarComponent,
    BowlingStartSessionComponent
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
