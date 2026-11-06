import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserStatus } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
  ) {
    const skip = page ? (parseInt(page) - 1) * (parseInt(pageSize || '20')) : 0;
    const take = pageSize ? parseInt(pageSize) : 20;

    return this.usersService.findAll({ skip, take, search, status });
  }

  @Get('me')
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.userId);
  }

  @Patch('me/profile')
  updateMyProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Get('me/addresses')
  getMyAddresses(@Request() req: any) {
    return this.usersService.getAddresses(req.user.userId);
  }

  @Post('me/addresses')
  createMyAddress(@Request() req: any, @Body() createAddressDto: CreateAddressDto) {
    return this.usersService.createAddress(req.user.userId, createAddressDto);
  }

  @Patch('me/addresses/:addressId')
  updateMyAddress(
    @Request() req: any,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(req.user.userId, addressId, updateAddressDto);
  }

  @Delete('me/addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMyAddress(@Request() req: any, @Param('addressId') addressId: string) {
    return this.usersService.removeAddress(req.user.userId, addressId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/block')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  block(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.usersService.block(id, body.reason);
  }

  @Post(':id/unblock')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  unblock(@Param('id') id: string) {
    return this.usersService.unblock(id);
  }
}
