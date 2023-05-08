import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './guards';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatererModule } from './modules/caterer/caterer.module';
import { EzmanageSubscriberModule } from './modules/ezmanage-subscriber/ezmanage-subscriber.module';
import { OrderModule } from './modules/order/order.module';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './support-modules/database/database.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    ConfigModule.forRoot({}),
    AuthModule,
    DatabaseModule,
    EzmanageSubscriberModule,
    /**
     * @TODO these shouldn't be imported at the app level because there are no controllers
     * they're just here to make sure the dependencies are clear
     */
    AccountModule,
    CatererModule,
    OrderModule,
    UserModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
