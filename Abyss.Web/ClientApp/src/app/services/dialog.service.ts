import { Component, Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialogClose } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';


import { IDialogAlert, IDialogConfirm, IDialogPrompt } from '../app.data';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

const DIALOG_DEFAULT_WIDTH = '400px';
const DIALOG_DEFAULT_CLOSE_TEXT = 'Close';
const DIALOG_DEFAULT_ACCEPT_TEXT = 'Accept';
const DIALOG_DEFAULT_CONFIRM_TEXT = 'Confirm';
const DIALOG_DEFAULT_CANCEL_TEXT = 'Cancel';

@Injectable()
export class DialogService {
    private dialog = inject(MatDialog);


    public async alert(alert: IDialogAlert): Promise<void> {
        return new Promise<void>((resolve) => {
            const dialogRef = this.dialog.open(DialogAlertComponent, {
                width: alert.width || DIALOG_DEFAULT_WIDTH,
                data: {
                    title: alert.title,
                    message: alert.message,
                    closeButtonText: alert.closeButtonText || DIALOG_DEFAULT_CLOSE_TEXT,
                }
            });
            dialogRef.afterClosed().subscribe(_ => {
                resolve();
            });
        });
    }

    public confirm(confirm: IDialogConfirm): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const dialogRef = this.dialog.open(DialogConfirmComponent, {
                width: confirm.width || DIALOG_DEFAULT_WIDTH,
                data: {
                    title: confirm.title,
                    message: confirm.message,
                    confirmButtonText: confirm.confirmButtonText || DIALOG_DEFAULT_CONFIRM_TEXT,
                    cancelButtonText: confirm.cancelButtonText || DIALOG_DEFAULT_CANCEL_TEXT,
                }
            });
            dialogRef.afterClosed().subscribe((result: boolean) => {
                resolve(result);
            });
        });
    }

    public prompt(prompt: IDialogPrompt): Promise<string> {
        return new Promise<string>((resolve) => {
            const dialogRef = this.dialog.open(DialogPromptComponent, {
                width: prompt.width || DIALOG_DEFAULT_WIDTH,
                data: {
                    title: prompt.title,
                    message: prompt.message,
                    value: prompt.value,
                    acceptButtonText: prompt.acceptButtonText || DIALOG_DEFAULT_ACCEPT_TEXT,
                    cancelButtonText: prompt.cancelButtonText || DIALOG_DEFAULT_CANCEL_TEXT,
                }
            });
            dialogRef.afterClosed().subscribe((result: string) => {
                resolve(result);
            });
        });
    }
}

@Component({
    selector: 'app-dialog-alert',
    template: `
    @if (data.title) {
      <h1 mat-dialog-title>{{data.title}}</h1>
    }
    <div mat-dialog-content>
      <span class="dialog-message">{{data.message}}</span>
    </div>
    <div mat-dialog-actions class="dialog-actions">
      <button mat-button color="accent" [mat-dialog-close]="true" cdkFocusInitial>{{data.closeButtonText}}</button>
    </div>
    `,
    imports: [
    MatDialogModule,
    MatButtonModule
]
})
export class DialogAlertComponent {
    dialogRef = inject<MatDialogRef<DialogAlertComponent>>(MatDialogRef);
    data = inject<IDialogAlert>(MAT_DIALOG_DATA);


    onNoClick(): void {
        this.dialogRef.close();
    }
}

@Component({
    selector: 'app-dialog-confirm',
    template: `
    @if (data.title) {
      <h1 mat-dialog-title>{{data.title}}</h1>
    }
    <div mat-dialog-content>
      <span class="dialog-message">{{data.message}}</span>
    </div>
    <div mat-dialog-actions class="dialog-actions">
      <button mat-button [mat-dialog-close]="false">{{data.cancelButtonText}}</button>
      <button mat-button color="accent" [mat-dialog-close]="true" cdkFocusInitial>{{data.confirmButtonText}}</button>
    </div>
    `,
    imports: [
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
]
})
export class DialogConfirmComponent {
    dialogRef = inject<MatDialogRef<DialogConfirmComponent>>(MatDialogRef);
    data = inject<IDialogConfirm>(MAT_DIALOG_DATA);


    onNoClick(): void {
        this.dialogRef.close();
    }
}

@Component({
    selector: 'app-dialog-prompt',
    template: `
    @if (data.title) {
      <h1 mat-dialog-title>{{data.title}}</h1>
    }
    <div mat-dialog-content>
      <span class="dialog-message">{{data.message}}</span>
      <mat-form-field class="dialog-input">
        <input matInput [(ngModel)]="data.value" cdkFocusInitial>
      </mat-form-field>
    </div>
    <div mat-dialog-actions class="dialog-actions">
      <button mat-button (click)="onNoClick()">{{data.cancelButtonText}}</button>
      <button mat-button color="accent" [mat-dialog-close]="data.value">{{data.acceptButtonText}}</button>
    </div>
    `,
    imports: [
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatButtonModule
]
})
export class DialogPromptComponent {
    dialogRef = inject<MatDialogRef<DialogPromptComponent>>(MatDialogRef);
    data = inject<IDialogPrompt>(MAT_DIALOG_DATA);


    onNoClick(): void {
        this.dialogRef.close();
    }
}