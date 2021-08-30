export const passwordValidation = {
  regex: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}()?\-“!@#%&\/,><’:;|_~`])\S/,
  message:
    'The password must have an upper case and a lower case letter, a number and a special character.',
};
