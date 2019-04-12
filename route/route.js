const express = require('express');
const session = require('express-session');
const axios = require('axios');
const uuid = require('uuid');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');


//Routing
module.exports = (app) => {
}