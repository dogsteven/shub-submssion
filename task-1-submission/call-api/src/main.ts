import * as fs from "fs/promises";

async function prepareReport(reportFilePath: string) {
    const reportFileBuffer = await fs.readFile(reportFilePath);
    const reportFileBlob = new Blob([reportFileBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const form = new FormData();
    form.append("file", reportFileBlob);

    await fetch("http://localhost:3000/prepareReport", {
        method: "POST",
        body: form
    });
}

async function calculateTotalValueBetween(startTime: string | undefined, endTime: string | undefined): Promise<string> {
    let url = "http://localhost:3000/calculateTotalValueBetween?";

    if (startTime) {
        url += `start_time=${startTime}&`;
    }

    if (endTime) {
        url += `end_time=${endTime}`;
    }

    const response = await (await fetch(url)).json();

    if ("result" in response) {
        return `[${startTime} - ${endTime}] ${response.result}`;
    } else if ("message" in response) {
        return `[${startTime} - ${endTime}] ${response.message}`;
    }
}

async function main() {
    if (process.argv.length < 3) {
        console.log("Please enter report file path as an argument.");
        return;
    }

    const reportFilePath = process.argv[2];

    await prepareReport(reportFilePath);

    const queries: { startTime?: string, endTime?: string }[] = [
        {
            startTime: "06:14:32",
            endTime: "07:09:54"
        },
        {
            startTime: "07:09:54",
            endTime: "06:14:32"
        },
        {
            startTime: "06:14:aa",
            endTime: "07:09:54"
        },
        {
            startTime: "06:67:46",
            endTime: "07:09:54"
        },
        {
            endTime: "07:09:54"
        },
        {
            startTime: "06:14:32"
        }
    ];

    const responses = await Promise.all(queries.map(({ startTime, endTime }) => {
        return calculateTotalValueBetween(startTime, endTime);
    }));

    for (const response of responses) {
        console.log(response);
    }
}

main();