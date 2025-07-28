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
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../entities';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options = {
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
      isActive: isActive ? isActive === 'true' : undefined,
      isFeatured: isFeatured ? isFeatured === 'true' : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    return this.productsService.findAll(options);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  findLowStock(@Query('threshold') threshold?: string) {
    const thresholdValue = threshold ? parseInt(threshold) : 10;
    return this.productsService.findLowStock(thresholdValue);
  }

  @Get('best-sellers')
  findBestSellers(@Query('limit') limit?: string) {
    const limitValue = limit ? parseInt(limit) : 10;
    return this.productsService.findBestSellers(limitValue);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
