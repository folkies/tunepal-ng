import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
    selector: 'tp-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    @ViewChild('snav', { static: false }) 
    public sidenav: MatSidenav;    
    
    title = 'tunepal-ng';

    isHandset = false;

    constructor(private breakpointObserver: BreakpointObserver) {
        this.breakpointObserver.observe([
            Breakpoints.Handset
        ]).subscribe(result => {
            this.isHandset = result.matches;
        });
    }

    sidenavMode(): string {
        return this.isHandset ? 'over' : 'side';
    }

    onClick(): void {
        if (this.isHandset) {
            this.sidenav.close();
        }
    }
}
