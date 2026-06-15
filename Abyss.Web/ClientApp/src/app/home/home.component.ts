import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    templateUrl: './home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent { }
