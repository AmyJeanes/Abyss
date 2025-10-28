import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService, DialogService } from './services';

@Component({
    template: 'Please wait, logging in..',
})
export class LoginComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private dialogService = inject(DialogService);


    public async ngOnInit(): Promise<void> {
        try {
            const params = await firstValueFrom(this.activatedRoute.params);
            await this.authService.getNewToken(params.scheme);
            this.router.navigate(['/']);
        } catch (e: any) {
            this.dialogService.alert({
                title: 'Failed to login',
                message: e.toString(),
            });
        }
    }
}
