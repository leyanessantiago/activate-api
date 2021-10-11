export function stringUndefinedOrNullOrEmpty(value: string): boolean {
  return value === '' || value === null || value === undefined;
}

export function validEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/g;

  return regex.test(email);
}
