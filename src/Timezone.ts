import { config } from "./DateExt";

type Timezone = {
  value: string;
  abbr: string;
  offset: number; // hours
  isdst: boolean;
  text: string;
  utc: string[];
};

function isDST(d?: Date) {
  d ??= new Date();
  let jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
  let jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== d.getTimezoneOffset();
}

function offsetFromTz(tz?: Timezone, d?: Date): number {
  if (!tz) return 0
  d ??= new Date()
  let dstOffset = 0
  if(tz.isdst && isDST(d) && config.dstExperimantalEnabled) {
    dstOffset--;
  }
  return tz.offset + dstOffset;
}

export default Timezone;
export { offsetFromTz };
