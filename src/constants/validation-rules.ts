import { passwordRegex } from './regex-collection';

export const passwordValidation = {
  regex: passwordRegex,
  message:
    'The password must have an upper case and a lower case letter, a number and be from 8 to 16 characters.',
};
