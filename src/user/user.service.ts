import * as bcryptjs from "bcryptjs"
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { User } from './user.model';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly mailService: MailService
    ) {
    }

    async findByEmail(email) {
        try {
            const user = await this.users.findOne({ email: email })
            if (!user) throw new NotFoundException()
            return user
        } catch (error) {
            return null
        }
    }

    async emailForChangePassword(email): Promise<any> {
        try {
            const user = await this.users.findOne({ email: email })
                .catch((err) => {
                    console.log(err);
                    throw new InternalServerErrorException()
                })
            if (!user) throw new NotFoundException()
            const result = await this.mailService.sendMailForPassword(user)
            if (result['status'] !== 200) throw new InternalServerErrorException("Sending Mail Failed")
            return {
                ok: true,
                statusCode: 200
            }
        } catch (error) {
            console.log(error);
            return {
                ok: false,
                statusCode: error.response.statusCode,
                error: error.error,
                message: error.response.message
            }
        }
    }

    async changePassword(email, code, newPassword): Promise<any> {
        try {
            const user = await this.users.findOne({ email })
            if (!user) throw new NotFoundException()
            if (user.verificationCode !== code) throw new UnauthorizedException("Code is Not Matched")
            user.isVerified = true
            user.password = await bcryptjs.hash(newPassword, 10)
            await bcryptjs.hash(newPassword, 10)
            this.users.save(user)
            return {
                ok: true,
                statusCode: 200
            }
        } catch (error) {
            return {
                ok: false,
                statusCode: error.response.statusCode,
                error: error.error,
                message: error.response.message
            }
        }
    }
}

