const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync');
const e = require('express');
const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({users:[], topics:[]}).write();
module.exports = db;