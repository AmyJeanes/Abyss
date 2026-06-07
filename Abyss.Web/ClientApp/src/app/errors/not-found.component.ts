import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: '<h2>Page not found</h2>',
})
export class PageNotFoundComponent { }
