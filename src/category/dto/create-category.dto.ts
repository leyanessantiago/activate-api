import { IsString, IsOptional } from 'class-validator';

export class CategoryDto {
  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
