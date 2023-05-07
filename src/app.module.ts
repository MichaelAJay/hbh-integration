import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './guards';
import { AuthModule } from './modules/auth/auth.module';
import { EzmanageSubscriberModule } from './modules/ezmanage-subscriber/ezmanage-subscriber.module';
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
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
