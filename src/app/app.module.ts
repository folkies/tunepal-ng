import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AudioContextModule } from 'angular-audio-context';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecodeComponent } from './components/test/DecodeComponent';
import { TranscriberProvider } from './transcription/TranscriberProvider';

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
    TranscriberProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
