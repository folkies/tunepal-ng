import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RecorderComponent } from './components/recorder/RecorderComponent';
import { DecodeComponent } from './components/test/DecodeComponent';
import { Recorder } from './pages/record/Recorder';
import { TranscriberProvider } from './transcription/TranscriberProvider';
import { AudioContextProvider } from './service/AudioContextProvider';
import { NotesSearchComponent } from './components/notes-search/NotesSearchComponent';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TuneComponent } from './components/tune/TuneComponent';
import { TuneViewComponent } from './components/tune-view/tune-view.component';

@NgModule({
    declarations: [
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
        MatListModule
    ],
    providers: [
        AudioContextProvider,
        Recorder,
        TranscriberProvider
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
