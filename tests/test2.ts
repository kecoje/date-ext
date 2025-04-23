import { DateExt, config as dateExtConfig, timezones } from "../src";

function main() {
    const tzAbbr = "CEDT";

    const d = new DateExt(`2025-04-06 08:00:00Z`).fromUTCtoTz(tzAbbr);

    console.log(d.toISOString());
    console.log(d.simpleTzDateTime(tzAbbr));
}

main();
