const { Client } = require("pg");

const client = new Client({
    connectionString: 'postgresql://mojeedkusimo:root@localhost/api-exercise-users'
})

client.connect();

module.exports = client;