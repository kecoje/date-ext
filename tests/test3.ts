import { DateExt, config as dateExtConfig, timezones } from "../src";
import { isDST } from "../src/Timezone";

function main() {
    console.log(isDST(new DateExt(`2025-04-06 08:00:00Z`)));
    console.log(isDST(new DateExt(`2025-03-30 08:00:00Z`)));
    console.log(isDST(new DateExt(`2025-03-29 08:00:00Z`)));
}

main();
