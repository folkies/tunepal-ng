import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecorderComponent } from './components/recorder/RecorderComponent';
import { NotesSearchComponent } from './components/notes-search/NotesSearchComponent';


const routes: Routes = [
  { path: 'record', component: RecorderComponent },
  { path: 'notesSearch/:notes', component: NotesSearchComponent },
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
