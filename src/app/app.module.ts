import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AudioContextModule } from 'angular-audio-context';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecodeComponent } from './components/test/DecodeComponent';
import { HttpClientModule } from '@angular/common/http';
import { TranscriberAsync } from './transcription/TranscriberAsync';


@NgModule({
  declarations: [
    AppComponent,
    DecodeComponent
  ],
  imports: [
    AppRoutingModule,
    AudioContextModule.forRoot('balanced'),
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    TranscriberAsync
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
