import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { IWhoSaid } from '../app.data';

@Injectable()
export class WhoSaidService {
    private httpClient = inject(HttpClient);

    public whoSaid(message: string): Promise<IWhoSaid> {
        return firstValueFrom(this.httpClient.post<IWhoSaid>('/api/whosaid', message));
    }
}
