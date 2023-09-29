import { monthMap } from "./dateLabels";
import { timezones } from "./timezones";

export const config: {
  defaultTimezoneAbbr: string | 'UTC'
} = {
  defaultTimezoneAbbr: 'UTC'
}

class DateExt extends Date {
  //
  fromUTCtoTz(timezoneAbbr: 'default' | string = 'default'): DateExt {
    let d = new DateExt(this.valueOf());
    if (timezoneAbbr === 'default') timezoneAbbr = config.defaultTimezoneAbbr
    if (timezoneAbbr !== 'UTC') {
      const timezone = timezones.find((tz) => tz.abbr === timezoneAbbr) ?? timezones.find((tz) => tz.abbr === 'UTC');
      d = d.subtractHours(timezone?.offset ?? 0)
    }
    return d
  }
  fromTztoUTC(timezoneAbbr: 'default' | string = 'default'): DateExt {
    let d = new DateExt(this.valueOf());
    if (timezoneAbbr === 'default') timezoneAbbr = config.defaultTimezoneAbbr
    if (timezoneAbbr !== 'UTC') {
      const timezone = timezones.find((tz) => tz.abbr === timezoneAbbr) ?? timezones.find((tz) => tz.abbr === 'UTC');
      d = d.addHours(timezone?.offset ?? 0)
    }
    return d
  }
  getTzDate(timezoneAbbr: 'default' | string = 'default'): number {
    return this.fromTztoUTC(timezoneAbbr).getUTCDate()
  }
  getTzDay(timezoneAbbr: 'default' | string = 'default'): number {
    return this.fromTztoUTC(timezoneAbbr).getUTCDay()
  }
  getTzFullYear(timezoneAbbr: 'default' | string = 'default'): number {
    return this.fromTztoUTC(timezoneAbbr).getUTCFullYear()
  }
  getTzHours(timezoneAbbr: 'default' | string = 'default'): number {
    return this.fromTztoUTC(timezoneAbbr).getUTCHours()
  }
  getTzMilliseconds(timezoneAbbr: 'default' | string = 'default'): number {
    return this.fromTztoUTC(timezoneAbbr).getUTCMilliseconds()
  }
  getTzMinutes(timezoneAbbr: 'default' | string = 'default'): number {
    return this.fromTztoUTC(timezoneAbbr).getUTCMinutes()
  }
  getTzMonth(timezoneAbbr: 'default' | string = 'default'): number {
    return this.fromTztoUTC(timezoneAbbr).getUTCMonth()
  }
  getTzSeconds(timezoneAbbr: 'default' | string = 'default'): number {
    return this.fromTztoUTC(timezoneAbbr).getUTCSeconds()
  }
  getTzMonthEn(timezoneAbbr: 'default' | string = 'default'): string {
    return this.fromTztoUTC(timezoneAbbr).getUTCMonthEn()
  }
  toTzString(timezoneAbbr: 'default' | string = 'default'): string {
    return this.fromTztoUTC(timezoneAbbr).toUTCString()
  }

  /** 0 - 365 */
  getUTCYearDay(): number {
    const oneJan = this.toFirstOfYear();
    return Math.floor(this.difference(oneJan) / (24 * 60 * 60 * 1000));
  }
  getTzYearDay(timezoneAbbr: 'default' | string = 'default'): number {
    return this.fromTztoUTC(timezoneAbbr).getUTCYearDay()
  }
  /** 0 - 53 */
  getUTCWeek(): number {
    const oneJan = new Date(this.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    return Math.floor(this.getUTCYearDay() / 7);
  }
  getTzWeek(): number {
    const oneJan = new Date(this.getTzFullYear(), 0, 1, 0, 0, 0, 0);
    return Math.floor(this.getTzYearDay() / 7);
  }

  /** 28 - 31 */
  getUTCDaysInCurrentMonth(): number {
    return new DateExt(this.getUTCFullYear(), this.getUTCMonth() + 1, 0).getUTCDate() + 1;
  }
  getTzDaysInCurrentMonth(): number {
    return new DateExt(this.getTzFullYear(), this.getTzMonth() + 1, 0).getTzDate() + 1;
  }

  // Time setters
  static msInADay: number = 86400000;
  static msInAnHour: number = 3600000;
  static msInAMinute: number = 60000;
  static msInASecond: number = 1000;

  toTzNearestTime(timeOfDay: 'beforeMidnight' | 'noon' | string = 'beforeMidnight', timezoneAbbr: 'default' | string = 'default'): DateExt {
    const thisMillisSinceMidnightTz = this.getTzMillisSinceMidnight(timezoneAbbr)
    const applyTimeOfDay = (date: DateExt, tod: 'beforeMidnight' | 'noon' | string = 'beforeMidnight', tz: 'default' | string = 'default') => {
      if (tod === 'beforeMidnight')
        return date.toTzBeforeMidnight(tz);
      else if (tod === 'noon')
        return date.toTzSpecificTime(tz, 12, 0, 0, 0);
      else {
        const [h, m] = tod.split(':')
        return date.toTzSpecificTime(tz, parseInt(h), parseInt(m), 0, 0);
      }
    }
    const that = applyTimeOfDay(this, timeOfDay, timezoneAbbr)
    const thatMillisSinceMidnightTz = that.getTzMillisSinceMidnight(timezoneAbbr)
    const yesterdayDistance = DateExt.msInADay - thatMillisSinceMidnightTz + thisMillisSinceMidnightTz
    const todayDistance = Math.abs(thisMillisSinceMidnightTz - thatMillisSinceMidnightTz)
    const tomorrowDistance = DateExt.msInADay - thisMillisSinceMidnightTz + thatMillisSinceMidnightTz
    if (yesterdayDistance < todayDistance && yesterdayDistance < tomorrowDistance) {
      // yesterday wins
      return applyTimeOfDay(that.subtractDays(1), timeOfDay, timezoneAbbr)
    } else if (todayDistance <= tomorrowDistance) { // preffer today (hence <=)
      // today wins
      return applyTimeOfDay(that, timeOfDay, timezoneAbbr)
    } else {
      // tomorrow wins
      return applyTimeOfDay(that.addDays(1), timeOfDay, timezoneAbbr)
    }
  }
  getTzMillisSinceMidnight(timezoneAbbr: 'default' | string = 'default') {
    return this.getTzHours(timezoneAbbr) * DateExt.msInAnHour +
      this.getTzMinutes(timezoneAbbr) * DateExt.msInAMinute +
      this.getTzSeconds(timezoneAbbr) * DateExt.msInASecond +
      this.getTzMilliseconds(timezoneAbbr)
  }

  toTzBeforeMidnight(timezoneAbbr: 'default' | string = 'default'): DateExt {
    return this.toTzSpecificTime(timezoneAbbr, 23, 59, 59, 999);
  }

  toTzAfterMidnight(timezoneAbbr: 'default' | string = 'default'): DateExt {
    return this.toTzSpecificTime(timezoneAbbr, 0, 0, 0, 0);
  }

  toUTCBeforeMidnight(): DateExt {
    return this.toUTCSpecificTime(23, 59, 59, 999);
  }

  toUTCAfterMidnight(): DateExt {
    return this.toUTCSpecificTime(0, 0, 0, 0);
  }

  toBeforeMidnight(): DateExt {
    return this.toSpecificTime(23, 59, 59, 999);
  }

  toAfterMidnight(): DateExt {
    return this.toSpecificTime(0, 0, 0, 0);
  }

  toSpecificTime(hour = 0, minute = 0, second = 0, millisecond = 0): DateExt {
    // redosled poziva mora biti strogo ispostovan
    const d = new DateExt(this.valueOf());
    d.setMilliseconds(millisecond);
    d.setSeconds(second);
    d.setMinutes(minute);
    d.setHours(hour);
    return d;
  }

  toUTCSpecificTime(hour = 0, minute = 0, second = 0, millisecond = 0): DateExt {
    // redosled poziva mora biti strogo ispostovan
    const d = new DateExt(this.valueOf());
    d.setUTCMilliseconds(millisecond);
    d.setUTCSeconds(second);
    d.setUTCMinutes(minute);
    d.setUTCHours(hour);
    return d;
  }

  toTzSpecificTime(timezoneAbbr: 'default' | string = 'default', hour = 0, minute = 0, second = 0, millisecond = 0): DateExt {
    // redosled poziva mora biti strogo ispostovan
    let d = new DateExt(this.valueOf());
    d = d.fromTztoUTC(timezoneAbbr)
    d = d.toUTCSpecificTime(hour, minute, second, millisecond)
    d = d.fromUTCtoTz(timezoneAbbr)
    return d;
  }

  // Date setters

  toFirstOfWeek(): DateExt {
    let d = new DateExt(this.valueOf());
    d = d.toUTCBeforeMidnight();
    d = d.subtractDays(d.getUTCDay());
    return d;
  }
  toTzFirstOfWeek(): DateExt {
    let d = new DateExt(this.valueOf());
    d = d.toTzBeforeMidnight();
    d = d.subtractDays(d.getTzDay());
    return d;
  }

  toLastOfWeek(): DateExt {
    let d = new DateExt(this.valueOf());
    d = d.addDays(7 - d.getUTCDay());
    return d;
  }
  toTzLastOfWeek(): DateExt {
    let d = new DateExt(this.valueOf());
    d = d.addDays(7 - d.getTzDay());
    return d;
  }

  toFirstOfMonth(): DateExt {
    let d = new DateExt(this.valueOf());
    d = d.toUTCAfterMidnight();
    d.setUTCDate(1);
    return d;
  }
  toTzFirstOfMonth(timezoneAbbr: 'default' | string = 'default'): DateExt {
    let d = new DateExt(this.valueOf());
    d = d.fromTztoUTC(timezoneAbbr)
    d = d.toFirstOfMonth();
    d = d.fromUTCtoTz(timezoneAbbr)
    return d;
  }

  toLastOfMonth(): DateExt {
    let d = new DateExt(this.valueOf());
    d = d.toUTCBeforeMidnight();
    d.setUTCDate(DateExt.daysInMonth(this.getUTCFullYear(), this.getUTCMonth()));
    return d;
  }
  toTzLastOfMonth(timezoneAbbr: 'default' | string = 'default'): DateExt {
    let d = new DateExt(this.valueOf());
    d = d.fromTztoUTC(timezoneAbbr)
    d = d.toLastOfMonth();
    d = d.fromUTCtoTz(timezoneAbbr)
    return d;
  }

  toFirstOfYear(): DateExt {
    return new DateExt(this.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
  }
  toTzFirstOfYear(): DateExt {
    return new DateExt(this.getTzFullYear(), 0, 1, 0, 0, 0, 0);
  }

  toLastOfYear(): DateExt {
    return new DateExt(this.getUTCFullYear(), 11, 31, 23, 59, 59, 999);
  }
  toTzLastOfYear(): DateExt {
    return new DateExt(this.getTzFullYear(), 11, 31, 23, 59, 59, 999);
  }

  toTzSpecificDate(timezoneAbbr: 'default' | string = 'default', date: number): DateExt {
    // 1 <= date <= 31
    let d = new DateExt(this.valueOf());
    d = d.fromTztoUTC(timezoneAbbr)
    d.setUTCDate(date);
    d = d.fromUTCtoTz(timezoneAbbr)
    return d;
  }

  // Adders

  addMillis(millis: number): DateExt {
    return new DateExt(this.valueOf() + millis);
  }
  subtractMillis(millis: number): DateExt {
    return new DateExt(this.valueOf() - millis);
  }

  addSeconds(seconds: number): DateExt {
    return this.addMillis(1000 * seconds);
  }
  subtractSeconds(seconds: number): DateExt {
    return this.subtractMillis(1000 * seconds);
  }

  addMinutes(minutes: number): DateExt {
    return this.addSeconds(60 * minutes);
  }
  subtractMinutes(minutes: number): DateExt {
    return this.subtractSeconds(60 * minutes);
  }

  addHours(hours: number): DateExt {
    return this.addMinutes(60 * hours);
  }
  subtractHours(hours: number): DateExt {
    return this.subtractMinutes(60 * hours);
  }

  addDays(days: number): DateExt {
    return this.addHours(24 * days);
  }
  subtractDays(days: number): DateExt {
    return this.subtractHours(24 * days);
  }

  addYears(years: number): DateExt {
    const d = new DateExt(this.valueOf());
    d.setUTCFullYear(d.getUTCFullYear() + years);
    return d;
  }
  addYearsCapped(years: number): DateExt {
    const d = new DateExt(this.valueOf());
    const initialDate = d.getUTCDate();
    d.setUTCFullYear(d.getUTCFullYear() + years);
    // date se promenio (31 -> 1, 30 -> 1) sam mesec ne moze - svaka gidina ima isto meseci
    if (initialDate !== d.getUTCDate()) {
      d.setUTCMonth(d.getUTCMonth() - years);
      return d.toLastOfMonth();
    }
    return d;
  }
  addTzYearsCapped(timezoneAbbr: 'default' | string = 'default', years: number): DateExt {
    // dodaj 2h
    let d = this.fromTztoUTC(timezoneAbbr)
    d = d.addYearsCapped(years)
    d = d.fromUTCtoTz(timezoneAbbr)
    return d;
  }
  subtractYears(years: number): DateExt {
    const d = new DateExt(this.valueOf());
    d.setUTCFullYear(d.getUTCFullYear() - years);
    return d;
  }

  addMonths(months: number): DateExt {
    const d = new DateExt(this.valueOf());
    d.setUTCMonth(d.getUTCMonth() + months);
    return d;
  }
  addMonthsCapped(months: number): DateExt {
    const d = new DateExt(this.valueOf());
    const initialDate = d.getUTCDate();
    d.setUTCMonth(d.getUTCMonth() + months);
    // date se promenio (31 -> 1, 30 -> 1)
    if (initialDate !== d.getUTCDate()) {
      d.setUTCMonth(d.getUTCMonth() - months);
      return d.toLastOfMonth();
    }
    return d;
  }
  addTzMonthsCapped(timezoneAbbr: 'default' | string = 'default', months: number): DateExt {
    // dodaj 2h
    let d = this.fromTztoUTC(timezoneAbbr)
    d = d.addMonthsCapped(months)
    d = d.fromUTCtoTz(timezoneAbbr)
    return d;
  }
  subtractMonths(months: number): DateExt {
    const d = new DateExt(this.valueOf());
    d.setUTCMonth(d.getUTCMonth() - months);
    return d;
  }

  // Difference

  difference(d: Date) {
    return Math.abs(this.valueOf() - d.valueOf());
  }

  // Helper months

  getUTCMonthEn(): string {
    return monthMap[this.getUTCMonth()];
  }
  getMonthEn(): string {
    return monthMap[this.getMonth()];
  }
  static daysInMonth(year: number, month: number): number {
    // plus jedan zato sto idemo jedan mesec unapred a 0 zato sto idemo jedan dan unazad
    return new Date(year, month + 1, 0).getUTCDate() + 1;
  }

  // Nice printout

  simpleDateTime(): string {
    return `${this.simpleUTCDate()} ${this.simpleTime()}`;
  }
  simpleUTCDateTime(): string {
    return `${this.simpleUTCDate()} ${this.simpleUTCTime()}`;
  }
  simpleTzDateTime(timezoneAbbr: 'default' | string = 'default'): string {
    return `${this.simpleTzDate(timezoneAbbr)} ${this.simpleTzTime(timezoneAbbr)}`;
  }

  getDateInputFormat(): string {
    return `${this.getUTCFullYear().toString().padStart(4, "0")}-${(this.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}-${this.getUTCDate().toString().padStart(2, "0")}`;
  }
  getTzDateInputFormat(): string {
    return `${this.getTzFullYear().toString().padStart(4, "0")}-${(this.getTzMonth() + 1)
      .toString()
      .padStart(2, "0")}-${this.getTzDate().toString().padStart(2, "0")}`;
  }
  getTimeInputFormat(): string {
    return `${this.getHours().toString().padStart(2, "0")}:${this.getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  getTzTimeInputFormat(): string {
    return `${this.getTzHours().toString().padStart(2, "0")}:${this.getTzMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  simpleDate(): string {
    return `${this.getDate()}. ${this.getMonthEn()} ${this.getFullYear()}.`;
  }
  simpleUTCDate(): string {
    return `${this.getUTCDate()}. ${this.getUTCMonthEn()} ${this.getUTCFullYear()}.`;
  }
  simpleTzDate(timezoneAbbr: 'default' | string = 'default'): string {
    let dateTz = this.clone()
    if (timezoneAbbr === 'default') timezoneAbbr = config.defaultTimezoneAbbr
    if (timezoneAbbr !== 'UTC') {
      const timezone = timezones.find((tz) => tz.abbr === timezoneAbbr) ?? timezones.find((tz) => tz.abbr === 'UTC');
      dateTz = dateTz.addHours(timezone?.offset ?? 0)
    }
    return `${dateTz.getUTCDate()}. ${dateTz.getUTCMonthEn()} ${dateTz.getUTCFullYear()}.`;
  }

  simpleTime(): string {
    return `${this.getHours().toString().padStart(2, "0")}:${this.getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  simpleUTCTime(): string {
    return `${this.getUTCHours().toString().padStart(2, "0")}:${this.getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  simpleTzTime(timezoneAbbr: 'default' | string = 'default'): string {
    let dateTz = this.clone()
    if (timezoneAbbr === 'default') timezoneAbbr = config.defaultTimezoneAbbr
    if (timezoneAbbr !== 'UTC') {
      const timezone = timezones.find((tz) => tz.abbr === timezoneAbbr) ?? timezones.find((tz) => tz.abbr === 'UTC');
      dateTz = dateTz.addHours(timezone?.offset ?? 0)
    }
    return `${dateTz.getUTCHours().toString().padStart(2, "0")}:${dateTz.getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  // very sus
  getPhpDateTime(): string {
    return `${this.getPhpDate()} ${this.simpleUTCTime()}`;
  }

  // very sus
  getPhpDate(): string {
    return `${this.getUTCFullYear()}-${(this.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}-${this.getUTCDate().toString().padStart(2, "0")}`;
  }

  getTzPhpDateTime(): string {
    return `${this.getTzPhpDate()} ${this.simpleTzTime()}`;
  }

  getTzPhpDate(): string {
    return `${this.getTzFullYear()}-${(this.getTzMonth() + 1)
      .toString()
      .padStart(2, "0")}-${this.getTzDate().toString().padStart(2, "0")}`;
  }

  fullTime(): string {
    return `${this.getUTCHours().toString().padStart(2, "0")}:${this.getUTCMinutes()
      .toString()
      .padStart(2, "0")}:${this.getUTCSeconds()
        .toString()
        .padStart(2, "0")}:${this.getUTCMilliseconds().toString().padStart(3, "0")}`;
  }

  // Date Comparisons

  dateEquals(d: Date): boolean {
    return this.getUTCDate() === d.getUTCDate() && this.monthEquals(d);
  }
  dateTzEquals(timezoneAbbr: 'default' | string = 'default', d: DateExt): boolean {
    return this.getTzDate(timezoneAbbr) === d.getTzDate(timezoneAbbr) && this.monthTzEquals(timezoneAbbr, d);
  }

  dateIsBefore(d: Date): boolean {
    return (
      (this.getUTCDate() < d.getUTCDate() &&
        this.getUTCMonth() === d.getUTCMonth() &&
        this.getUTCFullYear() === d.getUTCFullYear()) ||
      this.monthIsBefore(d)
    );
  }

  dateIsAfter(d: Date): boolean {
    return (
      (this.getUTCDate() > d.getUTCDate() &&
        this.getUTCMonth() === d.getUTCMonth() &&
        this.getUTCFullYear() === d.getUTCFullYear()) ||
      this.monthIsAfter(d)
    );
  }

  // Month Comparisons

  monthEquals(d: Date): boolean {
    return this.getUTCMonth() === d.getUTCMonth() && this.getUTCFullYear() === d.getUTCFullYear();
  }
  monthTzEquals(timezoneAbbr: 'default' | string = 'default', d: DateExt): boolean {
    return this.getTzMonth() === d.getTzMonth() && this.getTzFullYear() === d.getTzFullYear();
  }

  monthIsBefore(d: Date): boolean {
    return (
      (this.getUTCMonth() < d.getUTCMonth() && this.getUTCFullYear() === d.getUTCFullYear()) ||
      this.getUTCFullYear() < d.getUTCFullYear()
    );
  }

  monthIsAfter(d: Date): boolean {
    return (
      (this.getUTCMonth() > d.getUTCMonth() && this.getUTCFullYear() === d.getUTCFullYear()) ||
      this.getUTCFullYear() > d.getUTCFullYear()
    );
  }

  // Timestamp Comparisons

  equals(d: Date): boolean {
    return this.valueOf() === d.valueOf();
  }

  isBefore(d: Date): boolean {
    return this.valueOf() < d.valueOf();
  }

  isBeforeEquals(d: Date): boolean {
    return this.valueOf() <= d.valueOf();
  }

  isAfter(d: Date): boolean {
    return this.valueOf() > d.valueOf();
  }

  isAfterEquals(d: Date): boolean {
    return this.valueOf() >= d.valueOf();
  }

  // Binary operators

  static min(d1: Date, d2: Date): Date {
    return new Date(Math.min(d1.valueOf(), d2.valueOf()));
  }

  static max(d1: Date, d2: Date): Date {
    return new Date(Math.max(d1.valueOf(), d2.valueOf()));
  }

  clone(): DateExt {
    return new DateExt(this.getTime());
  }

  static tryParseDateForm(str: string, timeOfDay: 'beforeMidnight' | 'noon' | string = 'beforeMidnight', timezoneAbbr: 'default' | string = 'default'): DateExt | null {
    try {
      // date part
      if (isNaN(Date.parse(str))) return null;
      let d = new DateExt(str);
      // time part
      if (timeOfDay === 'beforeMidnight')
        d = d.toUTCBeforeMidnight();
      else if (timeOfDay === 'noon')
        d = d.toUTCSpecificTime(12, 0, 0, 0);
      else {
        const [h, m] = timeOfDay.split(':')
        d = d.toUTCSpecificTime(parseInt(h), parseInt(m), 0, 0);
      }
      // timezone part - GENERAL SETTINGS NEEDS TO BE INITIALIZED
      if (timezoneAbbr === 'default') timezoneAbbr = config.defaultTimezoneAbbr
      if (timezoneAbbr !== 'UTC') {
        const timezone = timezones.find((tz) => tz.abbr === timezoneAbbr) ?? timezones.find((tz) => tz.abbr === 'UTC');
        d = d.subtractHours(timezone?.offset ?? 0) // should never fall back to 0
      }
      return d;
    } catch (error) {
      return null;
    }
  }
  // static asUTC(d: Date): DateExt {
  //   return new DateExt(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()));
  // }
}

export default DateExt;
