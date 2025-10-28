import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard {
    private authService = inject(AuthService);
    private router = inject(Router);


    public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        const permissions = route.data && route.data.permissions as string;
        if (permissions && this.authService.hasPermission(permissions)) {
            return true;
        }
        this.router.navigate(['/']);
        return false;
    }
}
