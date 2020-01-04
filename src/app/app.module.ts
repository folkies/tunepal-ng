import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RecorderComponent } from './components/recorder/RecorderComponent';
import { DecodeComponent } from './components/test/DecodeComponent';
import { Recorder } from './pages/record/Recorder';
import { TranscriberProvider } from './transcription/TranscriberProvider';

@NgModule({
    declarations: [
        AppComponent,
        DecodeComponent,
        RecorderComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpClientModule,
    ],
    providers: [
        Recorder,
        TranscriberProvider
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
