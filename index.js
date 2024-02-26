const express = require('express');
const axios = require('axios');
const discordConfig = require('./config');
const { users, loggedUser } = require('./users');

const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/home', async (req, res) => {

  const discordUrl = 'https://discord.com/oauth2/authorize';
  const queryString = `client_id=${discordConfig.clientId}&response_type=code&redirect_uri=${discordConfig.callbackUrl}&scope=identify+guilds.join+&state=${loggedUser._id}`;
  const discordAuthorizeUrl = `${discordUrl}?${queryString}`;

  console.log('discordAuthorizeUrl', discordAuthorizeUrl)
  res.render('index', { discordAuthorizeUrl });
});

app.get('/api/discord/redirect', async (req, res) => {
  const { code, state } = req.query;

  //validate user
  if (!state) {
    res.render('error', { error: 'state not found' });
  }

  const userMatch = users.find(({_id}) => _id = state);
  if (!userMatch) {
    res.render('error', { error: 'user not found' });
  }

  if (!code) {
    res.render('error', { error: 'code not found' });
  }

  //get discord user token
  const formDataAccessToken = {
    grant_type: 'authorization_code',
    code: code.toString(),
    redirect_uri: discordConfig.callbackUrl,
  };

  const responseAccessToken = await axios.post('https://discord.com/api/v10/oauth2/token', formDataAccessToken, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${discordConfig.clientId}:${discordConfig.clientSecret}`).toString('base64')}`,
    },
  });

  const access_token = responseAccessToken.data.access_token;

  //use access_token to get user data
  const responseUser = await axios.get(`https://discord.com/api/v10/users/@me`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${access_token}`
    }
  });

  const userId = responseUser.data.id;

  //add user to channel
  const formData = {
    access_token,
    nick: userMatch.name,
    roles: [discordConfig.roleId],
  };

  await axios.put(`https://discord.com/api/v10/guilds/${discordConfig.guildId}/members/${userId}`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bot ${discordConfig.botToken}`,
      'Content-Type': 'application/json',
    }
  });

  res.render('success', {});
});

app.listen(port, () => {
  console.log(`Express server on port ${port}`);
});
