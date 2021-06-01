import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CategoryService,
  FetchCategoriesQueryParams,
} from './category.service';
import { Public } from '../core/jwt/public.decorator';

@Controller('categories')
@Public()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryInput: Prisma.CategoryCreateInput) {
    return this.categoryService.create(createCategoryInput);
  }

  @Get()
  findAll(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('name') name: string,
  ) {
    const queryParams: FetchCategoriesQueryParams = {
      page: page || undefined,
      limit: limit || undefined,
      name,
    };
    return this.categoryService.findAll(queryParams);
  }

  @Get('/tree')
  getTree(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('parentId') parentId: string,
  ) {
    const queryParams: FetchCategoriesQueryParams = {
      page: page || undefined,
      limit: limit || undefined,
      parentId,
    };
    return this.categoryService.getTree(queryParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryInput: Prisma.CategoryCreateInput,
  ) {
    return this.categoryService.update(id, updateCategoryInput);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
