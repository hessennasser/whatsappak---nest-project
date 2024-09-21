import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }

  @Post('connect')
  async connectDevice(@Body() body: { userId: string; deviceName: string }) {
    return this.deviceService.connectDevice(body.userId, body.deviceName);
  }

  @Post('disconnect/:deviceId')
  async disconnectDevice(@Param('deviceId') deviceId: string) {
    return this.deviceService.disconnectDevice(deviceId);
  }

  @Post('connect/:deviceId/:userId')
  async checkDeviceConnection(@Param('deviceId') deviceId: string, @Param('userId') userId: string) {
    return this.deviceService.checkDeviceConnection(deviceId, userId);
  }

  @Post('connect/test')
  async testSendMessage() {
    return this.deviceService.testSendMessage();
  }
}
