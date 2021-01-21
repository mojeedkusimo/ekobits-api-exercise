const { Client } = require("pg");

const client = new Client({
    connectionString: process.env.DATABSE_URL || 'postgresql://mojeedkusimo:root@localhost/api-exercise-users'
})

client.connect();

module.exports = client;