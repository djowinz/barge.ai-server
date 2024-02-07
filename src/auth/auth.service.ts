import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as error_codes from 'src/utils/error_codes';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(username);
        if (user) {
            try {
                const match = await bcrypt.compare(password, user.password);
                if (match) { 
                    return user;
                } else {
                    return null;
                }
            } catch (e) {
                console.error(e);
                throw new InternalServerErrorException('Sign in failed: contact support error code: ' + error_codes.default.BCRYPT_FAILURE_INVESTIGATE_LOGS);
            }
        }
        return null;
    }

    async login(user: { username: string, password: string }) {
        const dbUser = await this.userService.findByEmail(user.username);
        const payload = { sub: dbUser.id, username: dbUser.username, lastSignIn: dbUser.lastSignIn || null };
        const token = {
            access_token: await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET })
        }
        await this.userService.update(dbUser.id, { lastSignIn: new Date().toISOString() });
        return token;
    }
}
