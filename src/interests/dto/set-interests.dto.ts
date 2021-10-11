import { ArrayNotEmpty, IsArray } from 'class-validator';

export class SetInterestsDto {
  @ArrayNotEmpty()
  @IsArray()
  categoryIds: string[];
}
