import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto } from './dto/create-category.dto';

export type FetchCategoriesQueryParams = {
  page: number;
  limit: number;
  parentId?: string;
  name?: string;
};

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  create(createCategoryDto: CategoryDto) {
    return this.prismaService.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(queryParams: FetchCategoriesQueryParams) {
    const { limit, page, name } = queryParams;
    const args: Prisma.CategoryFindManyArgs = {
      take: limit,
      skip: page ? limit * (page - 1) : 0,
      where: {
        name: { contains: name },
      },
    };

    const count = await this.prismaService.category.count({
      where: args.where,
    });

    const response = await this.prismaService.category.findMany(args);

    return {
      results: response,
      count,
      page,
    };
  }

  async getTree(queryParams: FetchCategoriesQueryParams) {
    const { limit, page, parentId } = queryParams;
    const args: Prisma.CategoryFindManyArgs = {
      take: limit,
      skip: page ? limit * (page - 1) : 0,
      where: {
        parentId: parentId || null,
      },
      include: {
        subcategories: true,
      },
    };

    const count = await this.prismaService.category.count({
      where: args.where,
    });

    const response = await this.prismaService.category.findMany(args);

    return {
      results: response,
      count,
      page,
    };
  }

  findOne(id: string) {
    return this.prismaService.category.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, createCategoryInput: CategoryDto) {
    return this.prismaService.category.update({
      data: createCategoryInput,
      where: { id },
    });
  }

  remove(id: string) {
    return this.prismaService.category.delete({ where: { id } });
  }
}
