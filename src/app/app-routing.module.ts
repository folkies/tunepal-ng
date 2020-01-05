import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecorderComponent } from './components/recorder/RecorderComponent';
import { NotesSearchComponent } from './components/notes-search/NotesSearchComponent';
import { TuneComponent } from './components/tune/TuneComponent';
import { AboutComponent } from './components/about/about.component';


const routes: Routes = [
  { path: 'record', component: RecorderComponent },
  { path: 'notesSearch/:notes', component: NotesSearchComponent },
  { path: 'tune/:tunepalId', component: TuneComponent },
  { path: 'about', component: AboutComponent },
  {
      path: '',
      redirectTo: '/about',
      pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
