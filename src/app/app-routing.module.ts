import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecorderComponent } from './components/recorder/RecorderComponent';


const routes: Routes = [
  { path: 'record', component: RecorderComponent },
  { path: 'notesSearch/:notes', component: RecorderComponent },
  {
      path: '',
      redirectTo: '/record',
      pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
