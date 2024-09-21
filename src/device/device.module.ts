import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { Device } from 'src/device/entities/device.entity';
import { JwtService } from 'src/auth/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [DeviceController],
  providers: [DeviceService, JwtService],
  exports: [DeviceService],
})
export class DeviceModule { }
