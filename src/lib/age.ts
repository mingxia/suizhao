function utcParts(date: Date) { return { y: date.getUTCFullYear(), m: date.getUTCMonth(), d: date.getUTCDate() }; }
function birthdayDayInYear(birthday: Date, year: number) { const { m, d } = utcParts(birthday); if (m === 1 && d === 29) { const leap = new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1; return { m: leap ? 1 : 2, d: leap ? 29 : 1 }; } return { m, d }; }
export function getCurrentAge(birthday: Date, now: Date = new Date()): number { const b = utcParts(birthday); const n = utcParts(now); let age = n.y - b.y; const bd = birthdayDayInYear(birthday, n.y); if (n.m < bd.m || (n.m === bd.m && n.d < bd.d)) age -= 1; return Math.max(0, age); }
export function getYearForAge(birthday: Date, age: number): number { return birthday.getUTCFullYear() + age; }
export function getAvailableAges(birthday: Date, now: Date = new Date()): number[] { return Array.from({ length: getCurrentAge(birthday, now) }, (_, i) => i + 1); }
