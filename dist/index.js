"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer_1 = __importDefault(require("inquirer"));
var kleur_1 = require("kleur");
// import ClientOAuth2 from 'client-oauth2';
var selfsigned_1 = __importDefault(require("selfsigned"));
var express_1 = __importDefault(require("express"));
var https_1 = __importDefault(require("https"));
//https://local.landr.com:666/lilc-oath-callback
//auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=Z4ZWsJvBPY0mc5fgjXlpYg7P1lT6xQoq&scope=read%3Ajira-user&redirect_uri=https%3A%2F%2Flocal.landr.com%3A666%2Flilc-oath-callback&state=${YOUR_USER_BOUND_VALUE}&response_type=code&prompt=consent
var server = express_1.default();
//GET home route
server.get('/', function (res) {
    res.send('Hello World');
});
var attrs = [{ name: 'lilc', value: 'local.landr.com' }];
var _a = selfsigned_1.default.generate(attrs, { days: 365 }), key = _a.private, cert = _a.cert;
//GET home route
// we will pass our 'app' to 'https' server
https_1.default
    .createServer({
    key: key,
    cert: cert
}, server)
    .listen(666);
// const jiraAuth = new ClientOAuth2({
//   clientId: 'abc',
//   clientSecret: '123',
//   accessTokenUri: 'https://github.com/login/oauth/access_token',
//   authorizationUri: 'https://github.com/login/oauth/authorize',
//   redirectUri: 'http://example.com/auth/github/callback',
//   scopes: ['notifications', 'gist']
// });
inquirer_1.default
    .prompt([{ type: 'input', name: 'sup', message: 'sup' }])
    .then(function (answers) {
    console.log(kleur_1.bold().red("I guess " + answers.sup + " is up"));
});
