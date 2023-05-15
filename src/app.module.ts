import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './guards';
import { AccountModule } from './internal-modules/account/account.module';
import { CatererModule } from './internal-modules/caterer/caterer.module';
import { EzmanageSubscriberModule } from './api/ezmanage-subscriber/ezmanage-subscriber.module';
import { OrderModule } from './internal-modules/order/order.module';
import { UserModule } from './api/user/user.module';
import { ExternalDatabaseModule } from './external-modules/database/database.module';
import { AuthModule } from './internal-modules/auth/auth.module';
import { AdminModule } from './api/admin/admin.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    ConfigModule.forRoot({}),
    ExternalDatabaseModule,
    EzmanageSubscriberModule,
    AuthModule,
    /**
     * @TODO these shouldn't be imported at the app level because there are no controllers
     * they're just here to make sure the dependencies are clear
     */
    AccountModule,
    CatererModule,
    OrderModule,
    UserModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
