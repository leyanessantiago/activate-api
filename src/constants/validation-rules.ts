import { passwordRegex, userNameRegex } from './regex-collection';

export const passwordValidation = {
  regex: passwordRegex,
  message:
    'The password must have an upper case and a lower case letter, a number and be from 8 to 16 characters long.',
};

export const userNameValidation = {
  regex: userNameRegex,
  message:
    'the user name can only have lower case letters and numbers and be from 2 to 16 characters long.',
};
