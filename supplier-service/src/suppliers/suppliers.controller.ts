import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductQuantityDto } from './dto/update-product-quantity.dto';
import { JwtAuthGaurd } from 'src/common/gaurds/jwt-auth.guard';
import { RolesGaurd } from 'src/common/gaurds/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post('/create')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('SUPPLIER')
  @UsePipes(new ValidationPipe())
  async createProfile(@Body() createSupplierDto: CreateSupplierDto, @Req() req) {
    return this.suppliersService.createSupplierProfile(req.user.id, createSupplierDto);
  }

  @Get('/get')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('SUPPLIER')
  async getProfile(@Req() req) {
    return this.suppliersService.getSupplierProfile(req.user.id);
  }

  @Post('/products')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('SUPPLIER')
  @UsePipes(new ValidationPipe())
  async createProduct(@Body() createProductDto: CreateProductDto, @Req() req) {
    return this.suppliersService.createProduct(req.user.id, createProductDto);
  }

  @Get('/products')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('SUPPLIER')
  async listProducts(@Req() req) {
    return this.suppliersService.listProducts(req.user.id);
  }

  @Put('/products/:productId/quantity')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('SUPPLIER')
  @UsePipes(new ValidationPipe())
  async updateProductQuantity(
    @Param('productId') productId: string,
    @Body() updateProductQuantityDto: UpdateProductQuantityDto,
    @Req() req,
  ) {
    return this.suppliersService.updateProductQuantity(
      req.user.id,
      productId,
      updateProductQuantityDto.quantity,
    );
  }
}
