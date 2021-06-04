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
import {
  CategoryService,
  FetchCategoriesQueryParams,
} from './category.service';
import { CategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CategoryDto) {
    return this.categoryService.create(createCategoryDto);
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
  update(@Param('id') id: string, @Body() updateCategoryDto: CategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
