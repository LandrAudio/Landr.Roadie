import inquirer from 'inquirer';
import {bold} from 'kleur';
import ClientOAuth2 from 'client-oauth2';
import selfsigned from 'selfsigned';
import Express from 'express';
import https from 'https';

//https://local.landr.com:666/lilc-oath-callback
//auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=Z4ZWsJvBPY0mc5fgjXlpYg7P1lT6xQoq&scope=read%3Ajira-user&redirect_uri=https%3A%2F%2Flocal.landr.com%3A666%2Flilc-oath-callback&state=${YOUR_USER_BOUND_VALUE}&response_type=code&prompt=consent

const setupAuthServer = () =>  {

const server = Express();

//GET home route
server.get('/lilc-oath-callback', (_, res: {send: (arg0: string) => void}) => {
  console.log(res);
  res.send('Hello World');
});

const attrs = [{name: 'commonName', value: 'local.landr.com'}];
const {private: key, cert} = selfsigned.generate(attrs, {days: 365});

// we will pass our 'app' to 'https' server
https
  .createServer(
    {
      key,
      cert
    },
    server
  )
  .listen(666);
};

const jiraAuth = new ClientOAuth2({
  clientId: 'abc',
  clientSecret: '123',
  accessTokenUri: 'https://github.com/login/oauth/access_token',
  authorizationUri: 'https://github.com/login/oauth/authorize',
  redirectUri: 'http://example.com/auth/github/callback',
  scopes: ['notifications', 'gist']
});

jiraAuth;

// inquirer
//   .prompt([{type: 'input', name: 'sup', message: 'sup'}])
//   .then(answers => {
//     console.log(bold().red(`I guess ${answers.sup} is up`));
//   });
