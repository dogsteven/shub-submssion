type Query = {
    type: "1" | "2"
    range: number[]
}

type Dataset = {
    token: string
    data: number[]
    query: Query[]
}

interface Solver {
    load(data: number[]): void
    execute(query: Query): number
}

class BruteForceSolver implements Solver {
    private data: number[]
    
    constructor() {
        this.data = []
    }

    load(data: number[]) {
        this.data = data;
    }

    execute(query: Query): number {
        let [start, end] = query.range;

        switch (query.type) {
            case "1":
                return this.executeFirstType(start, end);

            case "2":
                return this.executeSecondType(start, end);
        }
    }

    private executeFirstType(start: number, end: number): number {
        let sum = 0;

        for (let i = start; i <= end; ++i) {
            sum += this.data[i];
        }

        return sum;
    }

    private executeSecondType(start: number, end: number): number {
        let sum = 0;
        let sign = 1;

        for (let i = start; i <= end; ++i) {
            sum += sign * this.data[i];
            sign *= -1;
        }

        return sum;
    }
}

class OptimizedSolver implements Solver {
    // sums[i] = data[0] + data[1] + ... + data[i - 1]
    private sums: number[];
    // evenSums[i] = data[0] + data[2] + ... + data[j] where j is the largest even natural number that is less than i.
    private evenSums: number[];

    constructor() {
        this.sums = [];
        this.evenSums = [];
    }

    load(data: number[]) {
        this.sums = [0];
        this.evenSums = [0];

        for (let i = 0; i < data.length; ++i) {
            this.sums.push(this.sums[this.sums.length - 1] + data[i]);
            this.evenSums.push(this.evenSums[this.evenSums.length - 1] + (i % 2 == 0 ? data[i] : 0));
        }
    }

    execute(query: Query): number {
        let [start, end] = query.range;

        switch (query.type) {
            case "1":
                return this.executeFirstType(start, end);

            case "2":
                return this.executeSecondType(start, end);
        }
    }

    private calculateSum(start: number, end: number): number {
        return this.sums[end + 1] - this.sums[start];
    }

    private calculateEvenSum(start: number, end: number): number {
        return this.evenSums[end + 1] - this.evenSums[start];
    }

    private executeFirstType(start: number, end: number): number {
        return this.calculateSum(start, end);
    }

    private executeSecondType(start: number, end: number): number {
        let result = 2 * this.calculateEvenSum(start, end) - this.calculateSum(start, end);
        
        if (start % 2 == 0) {
            return result;
        } else {
            return -result;
        }
    }
}

class Program {
    test(data: number[], queries: Query[]) {
        let bruteForceSolver = new BruteForceSolver();
        let optimizedSolver = new OptimizedSolver();

        bruteForceSolver.load(data);
        optimizedSolver.load(data);
    
        for (const query of queries) {
            let expectedResult = bruteForceSolver.execute(query);
            let actualResult = optimizedSolver.execute(query);

            console.log(`Query(type = "${query.type}", range = [${query.range[0]}, ${query.range[1]}]): ${expectedResult == actualResult ? "PASS" : "FAILED"}`);
    
            if (expectedResult != actualResult) {
                console.log("There's something wrong with this algorithm.");
                return;
            }
        }
    
        console.log("There's nothing wrong with this algorithm.");
    }

    async main() {
        let datasetUrl = "https://test-share.shub.edu.vn/api/intern-test/input";
        let submitUrl = "https://test-share.shub.edu.vn/api/intern-test/output";
    
        let dataset: Dataset = await (await fetch(datasetUrl)).json();
    
        let solver: Solver = new OptimizedSolver();
        solver.load(dataset.data);
    
        let result: number[] = [];
    
        for (const query of dataset.query) {
            result.push(solver.execute(query));
        }
    
        let headers = new Headers();
        headers.append("Authorization", `Bearer ${dataset.token}`);
        headers.append("Content-Type", "application/json");
    
        await fetch(submitUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(result)
        });
    }
}

let program = new Program();

program.main();