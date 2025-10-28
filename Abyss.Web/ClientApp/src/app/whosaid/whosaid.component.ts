import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IWhoSaid } from '../app.data';
import { WhoSaidService } from './whosaid.service';

import { DialogService } from '../services';


@Component({
    templateUrl: './whosaid.component.html',
    styleUrls: ['./whosaid.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    providers: [
        WhoSaidService,
    ],
})
export class WhoSaidComponent {
    private whoSaidService = inject(WhoSaidService);
    private dialogService = inject(DialogService);

    public name = 'Someone';
    public log: IWhoSaid[] = [];
    public loading = false;
    public message = '';

    public async whoSaid(): Promise<void> {
        try {
            if ((!this.message) || this.loading) { return; }
            this.loading = true;
            const whoSaid = await this.whoSaidService.whoSaid(this.message);
            this.log = [...this.log, whoSaid];
            this.name = whoSaid.Name;
        } catch (e: any) {
            this.dialogService.alert({
                title: 'Failed to get who said it',
                message: e.toString(),
            });
        } finally {
            this.loading = false;
        }
    }

    public clear(): void {
        this.log = [];
    }

    public undo(): void {
        this.log.pop();
    }
}
