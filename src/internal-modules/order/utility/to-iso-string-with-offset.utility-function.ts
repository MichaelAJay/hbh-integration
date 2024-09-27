export function toISOStringWithOffset(date: Date) {
  const pad = function (num) {
    const norm = Math.floor(Math.abs(num));
    return (norm < 10 ? '0' : '') + norm;
  };

  const timezoneOffset = -date.getTimezoneOffset();
  const offsetSign = timezoneOffset >= 0 ? '+' : '-';
  const offsetHours = pad(timezoneOffset / 60);
  const offsetMinutes = pad(timezoneOffset % 60);

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    offsetSign +
    offsetHours +
    ':' +
    offsetMinutes
  );
}
