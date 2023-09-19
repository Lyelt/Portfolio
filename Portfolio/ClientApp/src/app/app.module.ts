import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/components/login/login.component';
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
import { BackgroundIconComponent } from './shared/components/background-icon/background-icon.component';
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
import { InitiativeComponent } from './blog/components/articles/initiative/initiative.component';
import { RecipesComponent } from './cooking/components/recipes/recipes.component';
import { YugiohComponent } from './yugioh/components/yugioh/yugioh.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { CollectionsComponent } from './yugioh/components/collections/collections.component';
import { YugiohSelectUserComponent } from './yugioh/components/yugioh-select-user/yugioh-select-user.component';
import { CardSearchComponent } from './yugioh/components/card-search/card-search.component';
import { HashComponent } from './auth/components/hash/hash.component';
import { YugiohArticleComponent } from './blog/components/articles/yugioh-article/yugioh-article.component';
import { ViewCollectionComponent } from './yugioh/components/view-collection/view-collection.component';
import { AddCardComponent } from './yugioh/components/add-card/add-card.component';
import { AlertComponent } from './error-handling/components/alert/alert.component';
import { HttpErrorInterceptor } from './error-handling/http-error-interceptor';
import { SpeedrunUpdateArticleComponent } from './blog/components/articles/speedrun-update-article/speedrun-update-article.component';
import { SelectedCardComponent } from './yugioh/components/selected-card/selected-card.component';
import { SearchResultsComponent } from './yugioh/components/search-results/search-results.component';
import { Recap2020Component } from './blog/components/articles/recap2020/recap2020.component';
import { ProjectComponent } from './home/components/project/project.component';
import { DemoComponent } from './home/components/demo/demo.component';
import { SectionComponent } from './home/components/section/section.component';
import { SkillsComponent } from './home/components/skills/skills.component';
import { SectionTitleComponent } from './home/components/section-title/section-title.component';
import { SkillsSectionComponent } from './home/components/skills-section/skills-section.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
import { BlogPComponent } from './blog/components/blog-template/blog-p/blog-p.component';
import { BlogH3Component } from './blog/components/blog-template/blog-h3/blog-h3.component';
import { StatsComponent } from './bowling/components/stats/stats.component';
import { FiltersComponent } from './bowling/components/filters/filters.component';
import { RadioButtonComponent } from './shared/components/radio-button/radio-button.component';
import { FramesPipe } from './speedrun/services/frames.pipe';
import { BowlingViewGamesComponent } from './bowling/components/bowling-view-games/bowling-view-games.component';
import { ArchiveComponent } from './speedrun/components/archive/archive.component';
import { CourseComponent } from './speedrun/components/course/course.component';
import { ProgressComponent } from './shared/components/progress/progress.component';
import { StarDetailsComponent } from './speedrun/components/star-details/star-details.component';
import { SafeYtPipe } from './shared/pipes/safeYt.pipe';
import { ConvertMillisecondsPipe } from './shared/pipes/convert-milliseconds.pipe';
import { SafePipe } from './shared/pipes/safe.pipe';
import { April2021Component } from './blog/components/articles/april2021/april2021.component';
import { GameComponent } from './one-night/components/game/game.component';
import { MonkeyComponent } from './one-night/components/monkey/monkey.component';
import { SmallWorldComponent } from './yugioh/components/small-world/small-world.component';
import { DogComponent } from './dog/dog.component';
import { DogIndicatorComponent } from './dog/components/dog-indicator/dog-indicator.component';
import { MaterialModule } from './material/material.module';
import { September2023Component } from './blog/components/articles/september2023/september2023.component';
import { BlogCodeComponent } from './blog/components/blog-template/blog-code/blog-code.component';
import { GameNightComponent } from './game-night/components/game-night/game-night.component';

const routes: Routes = [
    {
        path: '', component: HomeComponent
    },
    {
        path: 'hash', component: HashComponent
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
        path: 'blog/speedrun/update', component: SpeedrunUpdateArticleComponent
    },
    {
        path: 'blog/initiative', component: InitiativeComponent
    },
    {
        path: 'blog/yugioh', component: YugiohArticleComponent
    },
    {
        path: 'blog/recap', component: Recap2020Component
    },
    {
        path: 'blog/public', component: April2021Component
    },
    {
        path: 'blog/upgrade', component: September2023Component
    },
    {
        path: 'speedrun', component: SpeedrunComponent, canActivate: [AuthGuard]
    },
    {
        path: 'speedrun/star/:starId', component: SpeedrunComponent, canActivate: [AuthGuard]
    },
    {
        path: 'speedrun/configure', component: ConfigureSpeedrunComponent, canActivate: [AuthGuard]
    },
    {
        path: 'speedrun/bingo', component: BingoComponent
    },
    {
        path: 'speedrun/archive', component: ArchiveComponent, canActivate: [AuthGuard]
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
        path: 'recipes', component: RecipesComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'yugioh', component: YugiohComponent
    },
    {
        path: 'yugioh/card/:cardId', component: YugiohComponent
    },
    {
        path: 'yugioh/search', component: YugiohComponent
    },
    {
        path: 'yugioh/collections', component: CollectionsComponent, canActivate: [AuthGuard]
    },
    {
        path: 'one-night', component: GameComponent, canActivate: [AuthGuard]
    },
    {
        path: 'dog', component: DogComponent, canActivate: [AuthGuard], data: { toolbar: false }
    },
    {
        path: 'game-night', component: GameNightComponent, canActivate: [AuthGuard]
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
        TierListComponent,
        InitiativeComponent,
        RecipesComponent,
        YugiohComponent,
        CollectionsComponent,
        YugiohSelectUserComponent,
        CardSearchComponent,
        HashComponent,
        YugiohArticleComponent,
        ViewCollectionComponent,
        AddCardComponent,
        AlertComponent,
        SpeedrunUpdateArticleComponent,
        SelectedCardComponent,
        SearchResultsComponent,
        Recap2020Component,
        ProjectComponent,
        DemoComponent,
        SectionComponent,
        SkillsComponent,
        SectionTitleComponent,
        SkillsSectionComponent,
        ThemeToggleComponent,
        BlogPComponent,
        BlogH3Component,
        StatsComponent,
        FiltersComponent,
        RadioButtonComponent,
        FramesPipe,
        BowlingViewGamesComponent,
        ArchiveComponent,
        CourseComponent,
        ProgressComponent,
        StarDetailsComponent,
        SafeYtPipe,
        ConvertMillisecondsPipe,
        SafePipe,
        April2021Component,
        GameComponent,
        MonkeyComponent,
        SmallWorldComponent,
        DogComponent,
        DogIndicatorComponent,
        September2023Component,
        BlogCodeComponent,
        GameNightComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        MaterialModule,
        RouterModule.forRoot(routes, { useHash: false, scrollPositionRestoration: 'enabled' }),
        NgxChartsModule,
        AutocompleteLibModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter
            }
        })
    ],
    exports: [
        MaterialModule
    ],
    providers: [
        AuthGuard,
        JwtHelperService,
        FramesPipe,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }

export function tokenGetter() {
  return localStorage.getItem("jwt");
}
