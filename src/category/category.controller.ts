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
import { CategoryDto } from './dto/category.dto';
import { PagedResponse } from '../core/responses/paged-response';
import { Public } from '../core/jwt/public.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Public()
  @Get()
  findAll(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('name') name: string,
  ): Promise<PagedResponse<CategoryDto>> {
    const queryParams: FetchCategoriesQueryParams = {
      page: page || undefined,
      limit: limit || undefined,
      name,
    };
    return this.categoryService.findAll(queryParams);
  }

  @Public()
  @Get('/tree')
  getTree(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('parentId') parentId: string,
  ): Promise<PagedResponse<CategoryDto>> {
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
