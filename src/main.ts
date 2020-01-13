import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { configure, LogLevel } from '@log4js2/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

configure({
  level: LogLevel.INFO,
  virtualConsole: false
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
