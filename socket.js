'use strict';

var mongo;

// Accesing Bluemix variable to get MongoDB info
if (process.env.VCAP_SERVICES) {
  
  var dbLabel = 'mongodb-2.4';
  var env = JSON.parse(process.env.VCAP_SERVICES);
  
  
  if (env[dbLabel]) {
    mongo = env[dbLabel][0].credentials;
  }
} else {
  mongo = {
    // setting the connection string will only give access to that database
    // to see more databases you need to set mongodb.admin to true or add databases to the mongodb.auth list
    connectionString: process.env.ME_CONFIG_MONGODB_SERVER ? '' : process.env.ME_CONFIG_MONGODB_URL,
  };
}

var meConfigMongodbServer = process.env.ME_CONFIG_MONGODB_SERVER ? process.env.ME_CONFIG_MONGODB_SERVER.split(',') : false;

module.exports = {
  
  
  mongodb: {
    // if a connection string options such as server/port/etc are ignored
    connectionString: mongo.connectionString || '',

    //server: mongodb hostname or IP address
    //for replica set, use array of string instead
    server: (meConfigMongodbServer.length > 1 ? meConfigMongodbServer : meConfigMongodbServer[0]) || mongo.host,
    port:   process.env.ME_CONFIG_MONGODB_PORT || mongo.port,

    //ssl: connect to the server using secure SSL
    ssl: process.env.ME_CONFIG_MONGODB_SSL || mongo.ssl,

    //sslValidate: validate mongod server certificate against CA
    sslValidate: process.env.ME_CONFIG_MONGODB_SSLVALIDATE || true,

    //sslCA: array of valid CA certificates
    sslCA:  [],

//autoReconnect: automatically reconnect if connection is lost
    autoReconnect: true,
