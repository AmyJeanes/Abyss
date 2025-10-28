import { Component, OnInit, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { IAuthScheme, IClientUserAuthentication, IClientUser } from '../app.data';
import { AuthService, UserService, DialogService } from '../services';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
    templateUrl: './account-dialog.component.html',
    styleUrls: ['./account-dialog.component.scss'],
    imports: [
        CommonModule,
        MatDialogModule,
        MatTooltipModule,
        MatListModule,
        MatButtonModule,
    ],
    providers: [
        AuthService,
        UserService,
        DialogService,
    ]
})
export class AccountDialogComponent implements OnInit {
    dialogRef = inject<MatDialogRef<AccountDialogComponent>>(MatDialogRef);
    authService = inject(AuthService);
    userService = inject(UserService);
    private dialogService = inject(DialogService);

    public schemes?: IAuthScheme[];
    public selected?: IAuthScheme;
    public loading = false;
    public get user(): IClientUser | undefined {
        return this.authService.getUser();
    }
    public get userSchemes(): IClientUserAuthentication {
        return this.user ? this.user.Authentication : {};
    }
    public get onlyScheme(): boolean {
        return Object.keys(this.userSchemes).length <= 1;
    }

    public async ngOnInit(): Promise<void> {
        try {
            this.loading = true;
            this.schemes = await this.authService.getAuthSchemes();
        } catch (e: any) {
            this.dialogService.alert({
                title: 'Failed to load auth schemes',
                message: e.toString(),
            });
        } finally {
            this.loading = false;
        }
    }

    public openProfile(scheme: IAuthScheme): void {
        if (this.userSchemes[scheme.Id] && scheme.ProfileUrl) {
            window.open(`${scheme.ProfileUrl}${this.userSchemes[scheme.Id]}`, '_blank');
        }
    }

    public login(schemeId: string): void {
        window.location.replace(`/api/auth/login/${schemeId}`);
    }

    public async logout(): Promise<void> {
        try {
            this.loading = true;
            const allDevices = await this.dialogService.confirm({
                confirmButtonText: 'All devices',
                cancelButtonText: 'Just this one',
                message: 'Do you want to log out of all devices or just this one?',
                title: 'Logout',
            });
            this.dialogRef.close();
            await this.authService.logout(allDevices);
            this.dialogService.alert({
                title: 'Logout',
                message: allDevices ? 'Logout successful, note that other devices may take up to 15 minutes to log out.' : 'Logout successful.',
            });
        } catch (e: any) {
            this.dialogService.alert({
                title: 'Failed to logout',
                message: e.toString(),
            });
        } finally {
            this.loading = false;
        }
    }

    public async deleteAuthScheme(scheme: number): Promise<void> {
        try {
            this.loading = true;
            await this.userService.deleteAuthScheme(scheme);
        } catch (e: any) {
            this.dialogService.alert({
                title: `Failed to delete auth scheme ${scheme}`,
                message: e.toString(),
            });
        } finally {
            this.loading = false;
        }
    }
}
