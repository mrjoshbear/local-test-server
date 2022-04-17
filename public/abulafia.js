class Abulafia {
    constructor() {
        this.data = new Map();
        this.used = new Map();
        this.nonEmptyRegex = /\S/;
        this.entryRegex = /^\d+,/;
        this.referenceRegex = /\[(\w|:)*\]/;
        this.auditRegex = /\[(\w|:)*\]/g;
    }
    // private resetUsed(): void {
    //   this.used = new Map();
    // }
    randIntInRange(min, max) {
        // Stryker disable next-line ArithmeticOperator
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    choose(list) {
        return list[this.randIntInRange(0, list.length - 1)];
    }
    lookup(key) {
        const list = this.data.get(key);
        if (!list) {
            throw new Error(`Abulafia Error: No table for key "${key}"`);
        }
        return list;
    }
    replacer(match) {
        const key = match.substring(1, match.length - 1);
        // const parts = key.split(':');
        // if (parts.length > 1) {
        //   switch (parts[0]) { //xc vs xcFirst
        //       case '#uc': return this.choose(this.lookup(parts[1])).toUpperCase();
        //       case '#lc': return this.choose(this.lookup(parts[1])).toLowerCase();
        //       // case '#tc': return toTitleCase(this.choose(this.lookup(parts[1])));
        //       // case '#two': return this.choose2(this.lookup(parts[1]), parts[2]);
        //       // case '#unique': return this.chooseUnique(parts[1]);
        //       // case '#reverse': return toTitleCase(this.choose(this.lookup(parts[1])));
        //       // case '#rot13': return rot13(this.choose(this.lookup(parts[1])));
        //       default:
        //         throw new Error(`Abulafia Error: unknown function '${parts[0]}'`);
        //   }
        // }
        return this.choose(this.lookup(key));
    }
    process(item) {
        const matches = item.match(this.referenceRegex);
        if (matches && matches[0]) {
            return this.process(item.replace(this.referenceRegex, this.replacer(matches[0])));
        }
        else {
            return item;
        }
    }
    hasTable(tableName) {
        // Stryker disable next-line LogicalOperator
        return this.data.has(tableName) && this.data.get(tableName);
    }
    get(key) {
        // this.resetUsed();
        return this.process(this.choose(this.lookup(key)));
    }
    getList(key) {
        const list = this.data.get(key);
        if (!list) {
            throw new Error(`Abulafia Error: No table for key "${key}"`);
        }
        return list;
    }
    getTableNames() {
        return [...this.data.keys()];
    }
    load(fileContents) {
        const tables = fileContents.split(';'); /* split on ';' to separate into individual tables */
        for (const table of tables) { /* iterate over tables */
            if (this.nonEmptyRegex.test(table)) { /* skip any tables/line that consist only of whitespace */
                const lines = table.split('\n'); /* split table into lines */
                const tableName = lines[0].trim(); /* ';' was removed by first split, so first line is the table name */
                const entries = lines.slice(1); /* slice off the table name line */
                const list = [];
                for (const entry of entries) { /* iterate over remaining lines */
                    if (this.entryRegex.test(entry)) { /* make sure we don't have a bad line */
                        const weight = parseInt(entry); /* entry must begin with a number, which parseInt will handle */
                        const text = entry.substring(entry.indexOf(',') + 1); /* split off everything up to the first comma, take the remainder */
                        for (let i = 0; i < weight; i++) { /* add the line weight times */
                            list.push(text); /* put the lines into the list */
                        }
                    }
                    else {
                        if (this.nonEmptyRegex.test(entry)) { /* warn about any non-empty lines that we failed to parse */
                            console.warn(`Abulafia Warning: could not parse line "${entry}"`);
                        }
                    }
                }
                if (list.length > 0) {
                    if (this.hasTable(tableName)) {
                        console.warn(`Abulafia Warning: overwrote entries for table "${tableName}"`);
                    }
                    this.data.set(tableName, list); /* add the table to our data set, overwriting if needed */
                }
                else { /* warn if we skipped a table because it has no entries */
                    console.warn(`Abulafia Warning: table "${tableName}" has no entries and was skipped`);
                }
            }
        }
    }
    auditForMissingTables() {
        const out = [];
        this.data.forEach((value) => {
            value.forEach((str) => {
                var _a;
                (_a = str.match(this.auditRegex)) === null || _a === void 0 ? void 0 : _a.forEach((match) => {
                    if (!this.hasTable(match.substring(1, match.length - 1))) {
                        out.push(match.substring(1, match.length - 1));
                    }
                });
            });
        });
        return out;
    }
}
export default Abulafia;
