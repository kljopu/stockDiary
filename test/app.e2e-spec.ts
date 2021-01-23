import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository, getConnection } from 'typeorm';
import { User } from 'src/user/user.model';
import { Record, Asset } from 'src/record/record.model';
import { Stock } from 'src/record/stock.model';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'stock@stock.com',
  password: 'stock123!',
};

const stock1 = {
  ticker: "INTC",
  name: "Intel"
}

const stock2 = {
  ticker: "AAPL",
  name: "Apple"
}
const record = {
  title: "오늘은 오르길 기대하며",
  contents: "1/21투자 자산"
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let recordRepository: Repository<Record>;
  let stockRepository: Repository<Stock>;
  let assetRepository: Repository<Asset>;
  let refreshToken: string;
  let accessToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest()
      .set('authorization', `Bearer ${accessToken}`)
      .send({ query });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase()
    app.close();
  });

  describe('유저 SERVICE CASE', () => {
    it('유저 생성 성공 CASE', () => {
      return publicTest(`
        mutation {
          createUser(
            input: {
              email: "${testUser.email}",
              password: "${testUser.password}"
            }
          ) {
            ok,
            statusCode,
            error,
          }
        }
      `)
        .expect(200)
        .expect(res => {
          expect(res.body.data.createUser.ok).toBe(true);
          expect(res.body.data.createUser.error).toBe(null);
        })
    })

    it('유저 생성 실패 - 이메일 중복', () => {
      return publicTest(`
        mutation {
          createUser(
            input: {
              email: "${testUser.email}",
              password: "${testUser.password}"
            }
          ) {
            ok,
            statusCode,
            message,
            error,
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.createUser.ok).toBe(false)
          expect(res.body.data.createUser.message).toBe('User already exists')
        })
    })


  });
  describe('유저 로그인 CASE', () => {
    it('로그인 성공 CASE', () => {
      return publicTest(`
        mutation{
          login(
            input: {
              email: "${testUser.email}",
              password: "${testUser.password}"
            }
          ) {
            ok,
            access_token,
            refresh_token,
            message,
            error
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.login.ok).toBe(true)
          accessToken = res.body.data.login.access_token
          refreshToken = res.body.data.login.refresh_token
          expect(res.body.data.login.access_token).toBe(accessToken)
          expect(res.body.data.login.refresh_token).toEqual(expect.any(String))
        })
    })

    it('로그인 실패 CASE - 잘못된 비밀번호', () => {
      return publicTest(`
        mutation{
          login(
            input: {
              email: "${testUser.email}",
              password: "wrongpassword"
            }
          ) {
            ok,
            access_token,
            refresh_token,
            message,
            error
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.login.ok).toBe(false)
          expect(res.body.data.login.message).toBe("Invalid Password")
        })
    })

    it('로그인 실패 CASE - 존재하지 않는 유저', () => {
      return publicTest(`
      mutation{
        login(
          input: {
            email: "wrongemail",
            password: "wrongpassword"
          }
        ) {
          ok,
          access_token,
          refresh_token,
          message,
          error
        }
      }
    `)
        .expect(res => {
          expect(res.body.data.login.ok).toBe(false)
          expect(res.body.data.login.message).toBe("User Not Found")
        })
    })
  })

  describe('주식 SERVICE CASE', () => {
    it('주식 정보 생성 CASE -1', () => {
      return privateTest(`
        mutation{
          createShare(
            input: {
              ticker: "${stock1.ticker}",
              name: "${stock1.name}"
            }
          ) {
            ok,
            error,
            stock {
              name,
              ticker
            }
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.createShare.ok).toBe(true)
          expect(res.body.data.createShare.stock.ticker).toBe(stock1.ticker)
          expect(res.body.data.createShare.stock.name).toBe(stock1.name)
        })
    })

    it('주식 정보 생성 CASE -2', () => {
      return privateTest(`
        mutation{
          createShare(
            input: {
              ticker: "${stock2.ticker}",
              name: "${stock2.name}"
            }
          ) {
            ok,
            error,
            stock {
              name,
              ticker
            }
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.createShare.ok).toBe(true)
          expect(res.body.data.createShare.stock.ticker).toBe(stock2.ticker)
          expect(res.body.data.createShare.stock.name).toBe(stock2.name)
        })
    })

    it('투자 가능 종목 조회', () => {
      return privateTest(`
        mutation{
          getStocks{
            ok,
            stocks{
              id,
              ticker,
              name,
              price,
              createdAt,
              updatedAt
            }
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.getStocks.ok).toBe(true)
          expect(res.body.data.getStocks.stocks).toEqual(expect.any(Array))
        })
    })
  })

  describe('유저 투자 기록 SERVICE CASE', () => {
    it('유저 투자 기록 생성 CASE', () => {
      return privateTest(`
        mutation{
          createRecord(input: {
            title: "${record.title}",
            contents: "${record.contents}",
            assetDetail: [
              {
                stock_id: 1,
                quantity: 10,
                bidPrice: 56.8
              },
              {
                stock_id: 2,
                quantity: 10,
                bidPrice: 100.36
              }
            ]
          }) {
            ok,
            error,
            statusCode,
            record {
              id,
              userId,
              title
              contents,
              assets{
                id,
                stock{
                  id,
                  name,
                  ticker
                },
                bidPrice,
                quantity,
                currentPrice,
                yield
              }
            }
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.createRecord.ok).toBe(true)
          expect(res.body.data.createRecord.record.title).toBe(record.title)
          expect(res.body.data.createRecord.record.contents).toBe(record.contents)
          expect(res.body.data.createRecord.record.assets).toEqual(expect.any(Array))
        })
    })

    it('투자 기록 리스트 조회 CASE', () => {
      return privateTest(`
        query{
          getMyRecords{
            ok,
            error,
            statusCode,
            record{
              id,
              title,
              contents,
              createAt
            }
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.getMyRecords.ok).toBe(true)
          expect(res.body.data.getMyRecords.record).toEqual(expect.any(Array))
        })
    })

    it('단일 투자 기록 조회 CASE', () => {
      return privateTest(`
        query{
          getMyRecord(id:1){
            ok,
            error,
            message,
            statusCode,
            record{
              id,
              title,
              contents,
              createAt,
              userId,
              assets{
                id,
                stock{
                  id,
                  name,
                  ticker
                },
                bidPrice,
                currentPrice,
                yield,
              }
            }
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.getMyRecord.record[0].title).toBe(record.title)
          expect(res.body.data.getMyRecord.record[0].contents).toBe(record.contents)
        })
    })

    it('단일 투자 기록 조회 CASE - 존재하지 않음', () => {
      return privateTest(`
        query{
          getMyRecord(id:2){
            ok,
            error,
            message,
            statusCode,
            record{
              id,
              title,
              contents,
              createAt,
              userId,
              assets{
                id,
                stock{
                  id,
                  name,
                  ticker
                },
                bidPrice,
                currentPrice,
                yield,
              }
            }
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.getMyRecord.ok).toBe(false)
          expect(res.body.data.getMyRecord.statusCode).toBe(404)
          expect(res.body.data.getMyRecord.message).toBe('Record Not Found')
        })
    })

    it('투자 기록에 투자 자산 추가', () => {
      return privateTest(`
        mutation {
          editMyRecord(input: {
              record_id: 1,
              assetDetail: {
                stock_id: 1,
                quantity: 30,
                bidPrice: 1867.07
              }
            }
          ){
            ok,
            error,
            message,
            statusCode,
            record{
              id,
              title,
              contents,
              assets{
                id,
                stock{
                  id,
                  name,
                  ticker
                },
                quantity,
                currentPrice
                yield
              },
              createAt,
              updateAt
            }
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.editMyRecord.ok).toBe(true)
          expect(res.body.data.editMyRecord.statusCode).toBe(200)
          expect(res.body.data.editMyRecord.record[0].assets[2].quantity).toBe(30)
        })
    })

    it('투자 기록에 투자 자산 삭제', () => {
      return privateTest(`
        mutation{
          deleteInvestDetail(id: 3){
            ok,
            statusCode,
            error,
            message
          }
        }
      `)
        .expect(res => {
          expect(res.body.data.deleteInvestDetail.ok).toBe(true)
          expect(res.body.data.deleteInvestDetail.statusCode).toBe(200)
        })
    })

    it('투자 기록에 투자 자산 삭제 - 존재하지 않음', () => {
      return privateTest(`
        mutation{
          deleteInvestDetail(id: 3){
            ok,
            statusCode,
            error,
            message
          }
        }
      `)
        .expect(res => {
          console.log("asdasdasd", res.body.data);
          expect(res.body.data.deleteInvestDetail.ok).toBe(false)
          expect(res.body.data.deleteInvestDetail.statusCode).toBe(404)
          expect(res.body.data.deleteInvestDetail.message).toBe('Not Found')
        })
    })

    it('투자 기록 삭제', () => {
      return privateTest(`
        mutation{
          deleteMyRecord(id: 1){
            ok,
            statusCode,
            error,
            message
          }
        }
      `)
        .expect(res => {
          console.log(res.body.data);
          expect(res.body.data.deleteMyRecord.ok).toBe(true)
          expect(res.body.data.deleteMyRecord.statusCode).toBe(200)
        })
    })

  })
})

// it('', () => {
//   return
// })