type Timezone = {
    value: string
    abbr: string,
    offset: number // hours
    isdst: boolean,
    text: string,
    utc: string[],
}

function offsetFromTz(tz?: Timezone): number {
    if(!tz) return 0
    // maybe add dst support
    return tz.offset
  }

export default Timezone
export { offsetFromTz }