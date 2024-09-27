import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './guards';
import { AccountModule } from './internal-modules/account/account.module';
import { EzmanageSubscriberAPIModule } from './api/ezmanage-subscriber/ezmanage-subscriber.module';
import { UserApiModule } from './api/user/user.module';
import { ExternalDatabaseModule } from './external-modules/database/database.module';
import { AuthModule } from './internal-modules/auth/auth.module';
import { AdminAPIModule } from './api/admin/admin.module';
import { OrderAPIModule } from './api/order/order.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    ConfigModule.forRoot({}),
    ExternalDatabaseModule,
    EzmanageSubscriberAPIModule,
    AuthModule,
    /**
     * @TODO these shouldn't be imported at the app level because there are no controllers
     * they're just here to make sure the dependencies are clear
     */
    AccountModule,
    OrderAPIModule,
    UserApiModule,
    AdminAPIModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
