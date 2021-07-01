import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CategoryDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
