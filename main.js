const { Client } = require("pg");
const mysql = require("mysql");
// process.stdin.resume()


// PostgreSQL Database Configuration
// You need to insert the credentials of postgres db which contains the data
const pgConfig = {
  user: "dbusername",
  host: "host/ip",
  database: "databsename",
  password: "databasepassword",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
};

// MySQL Database Configuration
// Insert the credentials of the mysql database which you are using for wordpress
const mysqlConfig = {
  host: "host/ip/urll",
  user: "username",
  password: "password",
  database: "dbname",
  ssl: {
    // only if you have ssl enabled
    // ca: './global-bundle.pem',
    // same goes for here 
    // rejectUnauthorized: false
  }
};

// Mapping of PostgreSQL fields to MySQL fields
// this is the mapping for the data 
//pg_field: "mysql_field"
/*
pg_field is the field which is in postgres 
and we need to map it to the you want that pg data to go
suppose if you wnat the username fields data in postgres to go in 
user_login field in mysql you can map it like
username:"user_login"

*/
const fieldMapping = {
  first_name: "user_login",
  password: "user_pass",
  middle_name: "user_nicename",
  email: "user_email",
  created_at: "user_registered",
  // Add more mappings as needed
};

// Name of your custom PostgreSQL table
const pgTableName = "users";

// Name of your custom MySQL table
const mysqlTableName = "wprt_users";

// Create a PostgreSQL client
const pgClient = new Client(pgConfig);
const mysqlConnection = mysql.createConnection(mysqlConfig);


// Create a MySQL connection

async function main() {
  try {
    await pgClient.connect();

    // Fetch data from PostgreSQL
    const pgQuery = `SELECT * FROM ${pgTableName}`;
    const { rows } = await pgClient.query(pgQuery);
    // console.log(rows)
    // Connect to MySQL
    mysqlConnection.connect();

    // Insert data into MySQL
    for (const pgUser of rows) {
      const mysqlUser = {};
      
      for (const pgField in fieldMapping) {
        const mysqlField = fieldMapping[pgField];
        mysqlUser[mysqlField] = pgUser[pgField];
      }
      console.log(mysqlUser)
      const mysqlQuery = `INSERT INTO ${mysqlTableName} (${Object.keys(
        mysqlUser
      ).join(", ")}) VALUES (${Object.values(mysqlUser)
        .map(() => "?")
        .join(", ")})`;
      mysqlConnection.query(mysqlQuery, Object.values(mysqlUser), (error) => {
        if (error) {
          console.error("Error inserting into MySQL:", error);
        }
      });
    }

    console.log("Data transfer completed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close PostgreSQL client
    await pgClient.end();

    // Close MySQL connection
    mysqlConnection.end();
  }
}

main();
