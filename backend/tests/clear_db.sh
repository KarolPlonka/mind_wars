#!/bin/bash

# Hardcoded MongoDB connection details
DB_HOST="127.0.0.1"
DB_PORT="27017"
DB_NAME="mydb"

echo "Clearing ALL collections in database '$DB_NAME' on $DB_HOST:$DB_PORT..."

mongosh "mongodb://$DB_HOST:$DB_PORT/$DB_NAME" --eval '
db.getCollectionNames().forEach(function(c) {
  db[c].deleteMany({});
  print("Cleared collection: " + c);
});
'

echo "All collections cleared."

