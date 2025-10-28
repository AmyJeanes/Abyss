import { Injectable, inject } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable()
export class ErrorService {
    private authService = inject(AuthService);

    public async openErrors(): Promise<void> {
        const res = await this.authService.getNewToken();
        window.open(`/errors?token=${res.Token}`, '_blank');
    }
}
