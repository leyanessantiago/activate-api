export function startOfDay(date: string) {
  if (date) {
    const parsedDate = new Date(date);
    parsedDate.setHours(0);
    parsedDate.setMinutes(0);
    parsedDate.setSeconds(0);
    parsedDate.setMilliseconds(0);
    return parsedDate;
  }

  return undefined;
}

export function endOfDay(date: string) {
  if (date) {
    const parsedDate = new Date(date);
    parsedDate.setHours(23);
    parsedDate.setMinutes(59);
    parsedDate.setSeconds(59);
    parsedDate.setMilliseconds(999);
    return parsedDate;
  }

  return undefined;
}
