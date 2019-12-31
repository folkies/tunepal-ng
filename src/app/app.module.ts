import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AudioContextModule } from 'angular-audio-context';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecodeComponent } from './components/test/DecodeComponent';
import { HttpClientModule } from '@angular/common/http';


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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
