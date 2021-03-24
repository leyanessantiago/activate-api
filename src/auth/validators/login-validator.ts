import { AbstractValidator } from 'src/core/validators/abstract-validator';
import { LoginDto } from '../dto/login.dto';
import * as util from '../../core/utils/utilities';

export class LoginValidator extends AbstractValidator<LoginDto> {
    async validate(value: LoginDto): Promise<void> {
        if (!util.validEmail(value.email))
            this.setValidationError('email', 'This is not a valid email');
    }    
}