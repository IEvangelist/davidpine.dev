---
title: Angular - The Color Guessing Game
published: '2019-03-14'
description: 'Hashtag... #Winning'
author: David Pine
tags:
  - Angular
  - RxJS
  - TypeScript
coverImage:
  src: ./colors.jpg
  alt: Angular - The Color Guessing Game
---
# The Story Behind The Game

I have three sons. Lyric who is six and a half, Londyn who is four and half, and Lennyx who is two and half. As you might imagine, they seldom agree on things. For example when it's family move night, "which movie we'll watch?", or "who gets to go first?" when playing a game. These _important life decisions_ are often decided by playing the _color guessing game_. My wife or I will choose a color at random and have the boys guess a color until someone guesses the correct color. Whoever guesses correctly is the __winner__ and they get to choose the movie or go first, etc. You get the point!

In this post we'll discuss how to create an __Angular__ application using the CLI, Material Design and Animations. As a spoiler alert, that application is [hosted here](https://bit.ly/kids-color-game) and the source code is up on  [GitHub here](https://github.com/IEvangelist/color-game).

## Angular CLI

I've been an __Angular__ developer for a long time now, and I'll admit it took me a bit to get used to the __[Angular CLI](https://cli.angular.io/)__. But once I got over my need to hand-code all the boilerplate, I'm never looking back! The command line interface simplifies so many aspects of __Angular__ development by allowing the developer to focus on the application logic. The CLI handles everything from creating a new project to generating modules, components, pipes, services, classes, interfaces, enums, directives, guards, etc... it also tests, lints and serves up your app for local debugging! Let's get started, shall we?!

```javascript
npm install -g @angular/cli
```

This installs the CLI globally, and we're ready to begin. Executing the following command will generate a new project named `color-game` and navigate into the newly created project directory. It also specifies a few preferences:

- __SCSS__ for styling
- Skips `.spec.ts` test files
- Doesn't include routing, we won't need it
- Minimal scaffolding, etc

```javascript
ng n color-game --minimal=true --S=true --routing=false --style=scss
cd color-game
```

Let's add some components that will help us structure the app in a meaningful way.

```javascript
ng g c color-block
ng g c game-board
ng g c instructions
ng g c players
```

We've successfully added a `color-block`, `game-board`, `instructions` and `players` components. There are a few relationships to call attention to. A `game-board` handles the layout of the `color-block`, `instructions` and `players`. We'll need to communicate between various components, as such we'll add some services to handle this.

```javascript
ng g s services\data-storage
ng g s services\game-engine
```

If you did this correctly you're directory should look similar to the following:

```bash
├── app
│   ├── color-block
│   │   └── **/*.scss|**/*.ts|**/*.html
│   ├── game-board
│   │   └── **/*.scss|**/*.ts|**/*.html
|   |── instructions
│   │   └── **/*.scss|**/*.ts|**/*.html
│   ├── players
│   │   └── **/*.scss|**/*.ts|**/*.html
│   └── services
│       ├── data-store.service.ts
|       └── game-engine.service.ts
| .. etc ..
```

## Material

I am a fan of the material design principles and the ease of use. Let's add angular material to the party as well. From the same command line window, let's execute the following which will install angular material as a dependency.

```js
npm install @angular/material
```

> <cite>__ProTip__</cite>
> If you get an notifications about vulnerabilities address them immediately!<br/>
> Simply, execute `npm audit fix`

<br/><br/>

Now, open up the `style.scss` file and let's add an `import` statement at the top and a bit of simple CSS.

```css
@import "~@angular/material/prebuilt-themes/pink-bluegrey.css";

html, body {
    height: 100%;
}

body {
    margin: 0;
}
```

This will effectively set the material theme to the "pink bluegrey" variation, which is personally my favorite. For more details on material - check out their [site here](https://material.io/develop/web/docs/getting-started/). Let's set the background color using the newly added theme classes. Copy this HTML in the the `index.html`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>The Color Game</title>
    <base href="/">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  </head>
  <body class='mat-app-background'> <!-- Apply this class to the body -->
    <app-root></app-root>
  </body>
</html>
```

Later, you'll notice elements and classes prefixed with `mat-` this indicates that they are from angular material. Finally, we'll need to import the material modules - it's cleaner to separate this out into it's own module and import it into the `app.module.ts`. Let's generate a new module named `material-all` and keep it at the same level as our existing `app.module`.

```javascript
ng g module material-all --flat
```

Now, copy this into the newly created  `material-all.module.ts`.

```javascript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material';
import { MatButtonModule } from '@angular/material';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatRippleModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ],
  exports: [
    MatCheckboxModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatRippleModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ]
})
export class MaterialAllModule { }
```

😁 That is a lot of code, thankfully we only have to do that once. Now, in the `app.module.ts` we'll import this module empowering our app with all things material!

You will want to copy the following into the the `app.module.ts`.

```javascript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialAllModule } from './material-all.module';
import { GameBoardComponent } from './game-board/game-board.component';
import { ColorBlockComponent } from './color-block/color-block.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { PlayersComponent } from './players/players.component';

@NgModule({
  declarations: [
    AppComponent,
    GameBoardComponent,
    ColorBlockComponent,
    InstructionsComponent,
    PlayersComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterialAllModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Animations

I love making subtle animations, they can enrich the user's experience...but they can also ruin it just as easily. You must approach the use of animations as you do other UX related considerations, such as accessability. Furthermore animations can be challenging to implement, luckily angular has a story for that too - check out [angular animations](https://angular.io/guide/animations).

In the `color-block.component.ts` we're going to add some animations.

```javascript
import { Component, Input } from '@angular/core';
import { GameEngineService, GameState } from '../services/game-engine.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'color-block',
  templateUrl: './color-block.component.html',
  styleUrls: ['./color-block.component.scss'],
  animations: [
    trigger('wasClicked', [
      state('idle', style({
        transform: 'scale(1)'
      })),
      state('clicked', style({
        transform: 'scale(1.2)'
      })),
      transition('idle => clicked', [
        animate('0.4s')
      ]),
      transition('clicked => idle', [
        animate('0.1s')
      ]),
    ]),
  ],
})
export class ColorBlockComponent {
  @Input() classes: string[];
  @Input() color: string;

  get allClasses() {
    return this.isSelected
      ? this.isWinningColor
        ? [...this.classes, 'winner']
        : [...this.classes, 'selected' ]
      : this.classes;
  }

  isClicked = false;
  isSelected: boolean = false;

  private currentState: GameState;
  private isWinningColor = false;

  constructor(private readonly gameEngine: GameEngineService) {
    this.gameEngine
        .$gameStateChanged
        .subscribe((state: GameState) => {
          this.currentState = state;
          if (state === 'selectWinningColor') {
            this.isWinningColor = false;
            this.isSelected = false;
          }
        });
  }

  onClick() {
    this.isClicked = true;
    setTimeout(() => this.isClicked = false, 100);

    if (this.currentState === 'selectWinningColor') {
      this.gameEngine.setWinningColor(this.color);
      this.gameEngine.changeState('playingGame');
    } else if (this.currentState === 'playingGame') {
      this.isSelected = true;
      if (this.gameEngine.isWinningColor(this.color)) {
        this.isWinningColor = true;
        this.gameEngine.changeState('gameEnded');
      } else {
        this.gameEngine.changeState('playingGame');
      }
    }
  }
}
```

We import several symbols from `@angular/animations` and now we're ready to decorate our component. As part of the `@Script` decorations, we'll add the desired animations. We `trigger` animation on various changes of `state`. Then we apply `style` and `transition` from one `state` to another. The syntax is actually rather straightforward to read. Here is the corresponding markup.

```html
<div [ngClass]='allClasses' (click)=onClick() [@wasClicked]="isClicked ? 'clicked' : 'idle'">
  <mat-card class='color-card'>
    <mat-card-header>
      <mat-card-title>{{ color | titlecase }}</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div *ngIf='isSelected'>
        <mat-icon color='accent' [inline]='true'>check_box</mat-icon>
      </div>
      <div *ngIf='!isSelected'>
        <mat-icon color='accent' [inline]='true'>check_box_outline_blank</mat-icon>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```

## Putting It All Together

The `game-board.component` serves as the glue holding all the other sub components together. It relies on the various services for managing the state of the game through the `game-engine.service`.

```javascript
import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';

export type GameState
  = 'usersRequired' | 'selectWinningColor' | 'playingGame' | 'gameEnded';

export interface StateDetails {
  state: GameState;
  title: string;
  message: () => string;
}

@Injectable({
  providedIn: 'root'
})
export class GameEngineService {
  $gameStateChanged: Observable<GameState>;
  stateDetails = new Map<GameState, StateDetails>();

  private activePlayer: string;
  private stateBroadcast = new ReplaySubject<GameState>();
  private winningColor: string;

  constructor() {
    this.stateDetails['usersRequired'] = {
      state: 'usersRequired',
      title: 'Users Required',
      message: () => 'Add at least two players to begin...'
    };    
    this.stateDetails['selectWinningColor'] = {
      state: 'selectWinningColor',
      title: 'Select Winning Color',
      message: () => 'Have players cover their eyes, and ' + 
                     'then the "referee" select the winning color.'
    };
    this.stateDetails['playingGame'] = {
      state: 'playingGame',
      title: 'Game Active',
      message: () => `"${this.activePlayer}" please choose your color.`
    };
    this.stateDetails['gameEnded'] = {
      state: 'gameEnded',
      title: 'Game Over',
      message: () => `Congratulations... "${this.activePlayer}" has won the game!`
    };

    this.$gameStateChanged =
      this.stateBroadcast.asObservable();
  }

  isWinningColor(color: string) {
    return this.winningColor === color;
  }

  setWinningColor(color: string) {
    this.winningColor = color;
  }

  changeState(state: GameState) {
    this.stateBroadcast.next(state);
  }

  setActivePlayer(player: string) {
    this.activePlayer = player;
  }

  reset() {
    this.changeState('selectWinningColor');
  }
}
```

The `game-engine.service` has the possible states that the app can exhibit and each state represents a different way in the application. For example, when there are less than two players we enter the `'usersRequired'` state. This updates the `instructions.component` appropriately, and disables certain controls, etc. Likewise, when we have enough players - the instructions change to "instruct" the players on what to do next.

For more details, I encourage you to dig into the source code that is publicly available up on  [GitHub here](https://github.com/IEvangelist/color-game). Also, the application is [hosted here](https://bit.ly/kids-color-game). This game isn't styled for mobile devices, because ... well that would have taken more time than I had over the weekend to do. I hope you enjoy it and that it helps solves some of the simple little decision-making quarrels parents experience!
