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
import { EncounterComponent } from './blog/components/articles/encounter/encounter.component';
import { TypingComponent } from './blog/components/articles/typing/typing.component';
import { PortfolioComponent } from './blog/components/articles/portfolio/portfolio.component';
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
import { BlogComponent } from './blog/components/blog/blog.component';
import { BackgroundIconComponent } from './background-icon/background-icon.component';
import { BlogArticleComponent } from './blog/components/blog-template/blog-article/blog-article.component';
import { BlogHeaderComponent } from './blog/components/blog-template/blog-header/blog-header.component';
import { BlogTitleComponent } from './blog/components/blog-template/blog-title/blog-title.component';
import { BlogDateComponent } from './blog/components/blog-template/blog-date/blog-date.component';
import { BlogSubtitleComponent } from './blog/components/blog-template/blog-subtitle/blog-subtitle.component';
import { BlogSectionComponent } from './blog/components/blog-template/blog-section/blog-section.component';
import { BlogSectionTitleComponent } from './blog/components/blog-template/blog-section-title/blog-section-title.component';
import { BowlingArticleComponent } from './blog/components/articles/bowling-article/bowling-article.component';
import { SpeedrunArticleComponent } from './blog/components/articles/speedrun-article/speedrun-article.component';
import { TurnTrackerComponent } from './turn-tracker/components/turn-tracker/turn-tracker.component';
import { PlayerComponent } from './turn-tracker/components/player/player.component';
import { TierListComponent } from './tier-list/components/tier-list/tier-list.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent
  },
  {
    path: 'blog', component: BlogComponent
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
    path: 'blog/bowling', component: BowlingArticleComponent
  },
  {
    path: 'blog/speedrun', component: SpeedrunArticleComponent
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
    path: 'initiative', component: TurnTrackerComponent
  },
  {
    path: 'tier', component: TierListComponent
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
    BowlingSelectSeriesCategoryComponent,
    BlogComponent,
    BackgroundIconComponent,
    BlogArticleComponent,
    BlogHeaderComponent,
    BlogTitleComponent,
    BlogDateComponent,
    BlogSubtitleComponent,
    BlogSectionComponent,
    BlogSectionTitleComponent,
    BowlingArticleComponent,
    SpeedrunArticleComponent,
    TurnTrackerComponent,
    PlayerComponent,
    TierListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { useHash: false, scrollPositionRestoration: 'enabled' }),
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
