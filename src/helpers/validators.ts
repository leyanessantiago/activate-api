/* eslint-disable max-len */
export function isValidEmail(email: string): boolean {
  if (email === '') {
    return true;
  }

  const regexp = new RegExp(
    /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/,
  );
  return regexp.test(email);
}

export function isValidWebSite(url: string): boolean {
  if (url === '') {
    return true;
  }

  const regexp = new RegExp(
    /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|(?:[\da-z\u00A1-\uFFFF]-*)*[\da-z\u00A1-\uFFFF]+(?:\.(?:[\da-z\u00A1-\uFFFF]-*)*[\da-z\u00A1-\uFFFF]+)*\.[a-z\u00A1-\uFFFF]{2,})(?::\d{2,5})?(?:\/\S*)?$/,
  );
  return regexp.test(url);
}

export function isValidPassword(password: string) {
  if (!password) {
    return false;
  }

  const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}()?\-“!@#%&\/,><’:;|_~`])\S/;

  return regex.test(password);
}
