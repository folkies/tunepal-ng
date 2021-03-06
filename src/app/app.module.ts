import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './components/about/about.component';
import { NotesSearchComponent } from './components/notes-search/NotesSearchComponent';
import { RecorderComponent } from './components/recorder/RecorderComponent';
import { DecodeComponent } from './components/test/DecodeComponent';
import { TuneViewComponent } from './components/tune-view/tune-view.component';
import { TuneComponent } from './components/tune/TuneComponent';
import { Recorder } from './pages/record/recorder';
import { AudioContextProvider } from './service/audio-context-provider';
import { CustomReuseStrategy } from './service/custom-reuse-strategy';
import { TranscriberProvider } from './transcription/transcriber-provider';
import { TuneMatcherProvider } from './service/tune-matcher-provider';

@NgModule({
    declarations: [
        AboutComponent,
        AppComponent,
        DecodeComponent,
        NotesSearchComponent,
        RecorderComponent,
        TuneComponent,
        TuneViewComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        LayoutModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule
    ],
    providers: [
        AudioContextProvider,
        Recorder,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        TranscriberProvider,
        TuneMatcherProvider
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
