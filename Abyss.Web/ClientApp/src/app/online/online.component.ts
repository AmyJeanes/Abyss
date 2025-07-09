import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HttpTransportType, HubConnectionBuilder } from '@microsoft/signalr';
import { MomentModule } from 'ngx-moment';

import { ITeamSpeakChannel, ITeamSpeakClient } from '../app.data';
import { OnlineService } from './online.service';

import { DialogService } from '../services';


@Component({
    templateUrl: './online.component.html',
    styleUrls: ['./online.component.scss'],
    imports: [
        CommonModule,
        MomentModule,
        MatButtonModule,
        MatTableModule,
        MatCardModule,
        MatTooltipModule,
    ],
    providers: [
        OnlineService,
    ],
})
export class OnlineComponent implements OnInit, OnDestroy {
    public clients: ITeamSpeakClient[] = [];
    public displayedColumns = ['name', 'channelName', 'connectedTime', 'idleTime'];
    public channels: ITeamSpeakChannel[] = [];
    public loading = false;
    private hub = new HubConnectionBuilder()
        .withUrl('hub/online', { transport: HttpTransportType.WebSockets })
        .withAutomaticReconnect()
        .build();
    private hubReady = false;
    constructor(public onlineService: OnlineService, public dialogService: DialogService, private ngZone: NgZone) {
        this.hub.on('update', (clients: ITeamSpeakClient[], channels: ITeamSpeakChannel[]) => {
            // Because this is a call from the server, Angular change detection won't detect it so we must force ngZone to run
            this.ngZone.run(() => {
                this.channels = channels;
                this.clients = clients;
            });
        });
        this.hub.onclose(() => {
            this.ngZone.run(() => {
                this.hubReady = false;
            });
        });
        this.hub.onreconnecting((err) => {
            this.ngZone.run(() => {
                this.hubReady = false;
            });
        });
        this.hub.onreconnected(() => {
            this.ngZone.run(() => {
                this.hubReady = true;
            });
        });
    }

    public async ngOnInit(): Promise<void> {
        try {
            this.loading = true;
            await this.refresh();
            await this.hub.start();
            this.hubReady = true;
        } catch (e: any) {
            this.dialogService.alert({
                title: 'Failed to load online',
                message: e.toString(),
            });
        } finally {
            this.loading = false;
        }
    }

    public ngOnDestroy(): void {
        if (this.hubReady) {
            this.hub.stop();
        }
    }

    public async refresh(): Promise<void> {
        const isLoading = this.loading;
        if (!isLoading) {
            this.loading = true;
        }
        try {
            this.channels = await this.onlineService.getChannels();
            this.clients = await this.onlineService.getClients();
        } catch (e: any) {
            this.dialogService.alert({
                title: 'Failed to refresh',
                message: e.toString(),
            });
        } finally {
            if (!isLoading) {
                this.loading = false;
            }
        }
    }

    public getChannelName(id: number): string {
        try {
            const channel = this.channels.find(x => x.Id === id);
            if (!channel) { return 'Unknown'; }
            let channelName = channel.Name;
            if (channel.ParentId) {
                channelName = `${this.getChannelName(channel.ParentId)} / ${channelName}`;
            }
            return channelName;
        } catch (e: any) {
            console.error(e);
            return 'Error';
        }
    }

    public getConnectedTimeTooltip(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        const hourLabel = hours === 1 ? 'hour' : 'hours';
        const minuteLabel = minutes === 1 ? 'minute' : 'minutes';

        return `${hours} ${hourLabel} and ${minutes} ${minuteLabel} ago`;
    }

    public getIdleTimeTooltip(seconds: number): string {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const hStr = hrs > 0 ? `${hrs} ${hrs === 1 ? 'hour' : 'hours'}` : '';
        const mStr = mins > 0 ? `${mins} ${mins === 1 ? 'minute' : 'minutes'}` : '';
        const sStr = secs > 0 || (hrs === 0 && mins === 0) ? `${secs} ${secs === 1 ? 'second' : 'seconds'}` : '';

        const parts = [hStr, mStr, sStr].filter(part => part !== '');

        return parts.join(' and ') + ' ago';
    }
}
