module.exports = {
    /**
     * Creates a string of pg variable placeholders (e.g.
     * return ($1, $2, $3), ($4,$5,$6))
     * Code from https://github.com/brianc/node-postgres/issues/957 by
     * bloodorca. 
     * @param {*} rowCount 
     * @param {*} columnCount 
     * @param {*} startAt 
     */
    expand: (rowCount, columnCount, startAt = 1) => {
        let index = startAt;
        return Array(rowCount).fill(0).map(v =>
            `(${Array(columnCount).fill(0).map(v => `$${index++}`).join(", ")})`
        ).join(", ");
    }
}