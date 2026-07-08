import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data.db");

// Initialize table
db.exec(`
    CREATE TABLE IF NOT EXISTS jobs(
        rowid INTEGER PRIMARY KEY AUTOINCREMENT,
        author_id TEXT,
        server_id TEXT,
        channel_id TEXT,
        post_content TEXT,
        url TEXT,
        accounted BOOLEAN,
        reply_made BOOLEAN,
        reply_message TEXT
    )
`);

// Prepared Statements for better performance
const insertStmt = db.prepare(`
    INSERT INTO jobs(author_id, server_id, channel_id, post_content, url, accounted, reply_made, reply_message)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
`);

const unaccountedStmt = db.prepare(`
    SELECT * FROM jobs WHERE accounted = 0
`);

const accountedStmt = db.prepare(`
    SELECT * FROM jobs WHERE accounted = 1
`);

const allStmt = db.prepare(`
    SELECT * FROM jobs
`);

const getByIdStmt = db.prepare(`
    SELECT * FROM jobs WHERE rowid = ?
`);

function addJob(author_id, server_id, channel_id, post_content, url, accounted, reply_made, reply_message) {
    try {
        const result = insertStmt.run(
            author_id || null,
            server_id || null,
            channel_id || null,
            post_content || null,
            url || null,
            accounted ? 1 : 0,
            reply_made ? 1 : 0,
            reply_message || null
        );
        console.log(`Job added successfully with row id `);
        console.log(JSON.stringify(result, null, 2));
        return result;
    } catch (err) {
        console.error("Failed to add job:", err);
    }
}
function updateJob(rowid, column_name, column_value) {
    try {
        const result = db.exec(`
            UPDATE jobs SET ${column_name} = ${column_value} WHERE rowid = ${rowid}
        `);
        console.log(`Job updated successfully with row id ${rowid}`);
    } catch (err) {
        console.error("Failed to update job:", err);
    }
}
function getUnaccountedJobs() {
    try {
        const rows = unaccountedStmt.all();
        console.log(rows);
        return rows;
    } catch (err) {
        console.error("Failed to get unaccounted jobs:", err);
        return [];
    }
}

function getAccountedJobs() {
    try {
        const rows = accountedStmt.all();
        console.log(rows);
        return rows;
    } catch (err) {
        console.error("Failed to get accounted jobs:", err);
        return [];
    }
}

function getJobs() {
    try {
        const rows = allStmt.all();
        console.log(rows);
        return rows;
    } catch (err) {
        console.error("Failed to get jobs:", err);
        return [];
    }
}

function getJobsByRowId(rowid) {
    try {
        const row = getByIdStmt.get(rowid);
        console.log(row);
        return row;
    } catch (err) {
        console.error("Failed to get job by row ID:", err);
        return null;
    }
}

export default {
    addJob,
    updateJob,
    getUnaccountedJobs,
    getAccountedJobs,
    getJobs,
    getJobsByRowId,
    db
};