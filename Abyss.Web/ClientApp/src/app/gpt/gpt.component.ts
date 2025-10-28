import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { GPTService } from './gpt.service';
import { IGPTMessage, IGPTModel } from '../app.data';

import { DialogService } from '../services';


@Component({
    templateUrl: './gpt.component.html',
    styleUrls: ['./gpt.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule,
        MatSliderModule,
        MatTooltipModule,
    ],
    providers: [
        GPTService,
    ],
})
export class GPTComponent implements OnInit {
    private gptService = inject(GPTService);
    private dialogService = inject(DialogService);

    public name = 'Someone';
    public log: IGPTMessage[] = [];
    public loading = false;
    public get model(): string | undefined {
        const data = localStorage['GPT.Model'];
        return data ? JSON.parse(data) : undefined;
    }
    public set model(value: string | undefined) {
        localStorage['GPT.Model'] = JSON.stringify(value);
    }
    public get removeIncompleteLine(): boolean {
        const data = localStorage['GPT.RemoveIncompleteLine'];
        return data ? JSON.parse(data) : true;
    }
    public set removeIncompleteLine(value: boolean) {
        localStorage['GPT.RemoveIncompleteLine'] = JSON.stringify(value);
    }
    public get temperature(): number {
        const data = localStorage['GPT.Temperature'];
        return data ? JSON.parse(data) : 0.9;
    }
    public set temperature(value: number) {
        localStorage['GPT.Temperature'] = JSON.stringify(value);
    }
    public get top_p(): number {
        const data = localStorage['GPT.TopP'];
        return data ? JSON.parse(data) : 0.9;
    }
    public set top_p(value: number) {
        localStorage['GPT.TopP'] = JSON.stringify(value);
    }
    public message = '';
    public models: IGPTModel[] = [];

    public async ngOnInit(): Promise<void> {
        try {
            this.loading = true;
            this.models = await this.gptService.getModels()

        } catch (e: any) {
            this.dialogService.alert({
                title: 'Failed to load GPT models',
                message: e.toString(),
            });
        } finally {
            this.loading = false;
        }
    }

    public async generate(): Promise<void> {
        try {
            const currentText = this.log.map(x => x.Text).join();
            if ((!this.model) || this.loading) { return; }
            this.loading = true;
            const response = await this.gptService.generate({
                Text: currentText,
                ModelId: this.model,
                Temperature: this.temperature,
                TopP: this.top_p,
            });
            if (this.removeIncompleteLine) {
                response.Text = this.removeLastLine(response.Text).trimEnd();
            }
            this.log = [...this.log, response];
        } catch (e: any) {
            this.dialogService.alert({
                title: 'Failed to generate GPT text',
                message: e.toString(),
            });
        } finally {
            this.loading = false;
        }
    }

    public add(message: string): void {
        if (!message) { return; }
        this.log = [...this.log, { Text: message, Human: true }];
    }

    public clear(): void {
        this.log = [];
    }

    public undo(): void {
        this.log.pop();
    }

    private removeLastLine(input: string): string {
        if (input.lastIndexOf('\n') > 0) {
            return input.substring(0, input.lastIndexOf('\n'));
        } else {
            return input;
        }
    }
}
