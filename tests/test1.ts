import { DateExt } from "../src";

function main() {
    const now = new DateExt();
    const inAMonth = now.addMonths(1);
    const inAMonthC = now.addMonthsCapped(1);

    console.log(now, inAMonth, inAMonthC);
}

main();
