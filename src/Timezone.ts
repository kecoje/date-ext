type Timezone = {
    value: string
    abbr: string,
    offset: number // hours
    isdst: boolean,
    text: string,
    utc: string[],
}

export default Timezone