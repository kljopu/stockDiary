import * as nodemailer from "nodemailer"
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/user.model";
import { Repository } from "typeorm";

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly configService: ConfigService
  ) { }

  async sendMailForPassword(user): Promise<any> {
    try {
      console.log("email: ", this.configService.get('HOST_MAIL'), "password: ", this.configService.get("HOST_PASSWORD"));

      const code = Math.floor(Math.random() * 100000) * 1
      console.log("server code: ", code)
      user.verificationCode = code
      user.isVerified = false
      await this.users.save(user).catch((err) => {
        console.log(err);
        throw new InternalServerErrorException()
      })
      const transporter = nodemailer.createTransport({
        // 사용하고자 하는 서비스, gmail계정으로 전송할 예정이기에 'gmail'
        service: 'gmail',
        // host를 gmail로 설정
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          // Gmail 주소 입력, 'testmail@gmail.com'
          user: await this.configService.get('HOST_MAIL'),
          // Gmail 패스워드 입력
          pass: await this.configService.get('HOST_PASSWORD'),
        },
      });
      // action="http://localhost:3000/user/email/check/?token=${user.emailVerificationCode}"
      const message = {
        from: `"StockDiary " <${this.configService.get('HOST_MAIL')}>`,
        to: user.email,
        subject: 'Password Change Check',
        html: `<!DOCTYPE html>
                      <html lang="en">
                        <head>
                          <meta charset="UTF-8" />
                          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                          <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
                          <title>Document</title>
                        </head>
                        <body>
                          <form
                            style="display: table; margin: 4rem auto;"
                            method="POST"
                            
                          >
                            <img
                              src="http://byeol.dothome.co.kr/img/fixo_ko2.png"
                              alt="logo"
                              width="90"
                              style="margin-bottom: 1rem;"
                            />
                            <div style="border: 1px solid #b3b3b3; width: 30rem; padding: 4rem 5rem;">
                              <h4
                                style="
                                  font-size: 1.2rem;
                                  color: #7903d4;
                                  margin: 0;
                                  font-weight: 900;
                                "
                              >
                                Corrector Certification
                              </h4>
                              <h2 style="font-size: 2.2rem; margin: 0 0 1rem;">
                                이메일 인증
                              </h2>
                              <p style="font-size: 1rem; line-height: 1.5rem; margin: 2rem 0 2rem;">
                                <strong
                                  >안녕하세요.
                                  <strong style="color: #7903d4;">StockDiary</strong>입니다.</strong
                                ><br /><br />
                                확인해 주셔서 감사합니다.<br /><br />
                                전송된 인증 코드를 사이트에 입력 후<br />
                                다음 단계를 진행해주세요.
                                감사합니다.
                              </p>
                              <sapn
                                style="
                                  display: inline-block;
                                  text-decoration: none;
                                  padding: 20px 30px;
                                  border-radius: 14px;
                                  border: none;
                                  background: #7903d4;
                                  box-shadow: 4px 4px 6px #a2a2a2;
                                  color: #fff;
                                  font-size: 16px;
                                  cursor: pointer;
                                "
                                // rel="noreferrer noopener"
                                // target="_blank"
                                // href="http://localhost:3000/user/email/check/?token=${user.emailVerificationCode}"
                              >
                                ${user.verificationCode}
                              </sapn>
                              <p
                                style="
                                  font-size: 0.8rem;
                                  color: #8e8e8e;
                                  text-align: center;
                                  border-top: 1px solid #b3b3b3;
                                  padding-top: 2rem;
                                  margin-top: 4rem;
                                "
                              >
                                대표번호:010-xxxx-xxxx | EMAIL :
                                <a
                                  href="mailto:${process.env.NODEMAILER_USER}"
                                  style="
                                    color: #8e8e8e;
                                    text-decoration: none !important;
                                    font-size: 0.8rem;
                                  "
                                  >${process.env.NODEMAILER_USER}</a
                                >
                              </p>
                            </div>
                          </form>
                        </body>
                      </html>`
      }
      transporter.sendMail(message, (err) => {
        if (err) {
          console.log("nodemailer error:", err);
          throw new InternalServerErrorException()
        }
      })
      return {
        status: 200,
        message: 'Sent Auth Email',
      };
    } catch (error) {
      console.log("mail error:", error);
      return {
        status: 500,
      }
    }
  }
}
