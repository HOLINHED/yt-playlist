import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { parse } from 'iso8601-duration';
import generateID from './makeid.js';

const OAuth2 = google.auth.OAuth2;
    
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/youtube'];
const TOKEN_DIR = __dirname + '/';
const TOKEN_PATH = TOKEN_DIR + 'token.json';

// STORES TIME OF PLAYLIST IN MINUTES
let totalTime = 0;
let videoIds = [];
const MAX_SEARCH = 10;
const QUERY = "study music | zen music -livestream -live";
    
// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
if (err) {
   console.log('Error loading client secret file: ' + err);
   return;
}
   // find videos
   authorize(JSON.parse(content), findVideos);

});
    
/**
* Create an OAuth2 client with the given credentials, and then execute the
* given callback function.
*
* @param {Object} credentials The authorization client credentials.
* @param {function} callback The callback to call with the authorized client.
*/
function authorize(credentials, callback) {
   const clientSecret = credentials.installed.client_secret;
   const clientId = credentials.installed.client_id;
   const redirectUrl = credentials.installed.redirect_uris[0];
   const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
    
   // Check if we have previously stored a token.
   fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
         getNewToken(oauth2Client, callback);
      } else {
         oauth2Client.credentials = JSON.parse(token);
         callback(oauth2Client);
      }
   });
}
    
/**
* Get and store new token after prompting for user authorization, and then
* execute the given callback with the authorized OAuth2 client.
*
* @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
* @param {getEventsCallback} callback The callback to call with the authorized
*                                     client.
*/
function getNewToken(oauth2Client, callback) {

   const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
   });

   console.log('Authorize this app by visiting this url: ', authUrl);

   const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
   });

   rl.question('Enter the code from that page here: ', code => {
      rl.close();
      oauth2Client.getToken(code, (err, token) => {
         if (err) throw err;
         oauth2Client.credentials = token;
         storeToken(token);
         callback(oauth2Client);
      });
   });
}
    
/**
* Store token to disk be used in later program executions.
*
* @param {Object} token The token to store to disk.
*/
function storeToken(token) {
   try {
      fs.mkdirSync(TOKEN_DIR);
   } catch (err) {
      if (err.code != 'EEXIST') throw err;
   }

   fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
      if (err) throw err;
      console.log('Token stored to ' + TOKEN_PATH);
   });

   console.log('Token stored to ' + TOKEN_PATH);
}
    
/**
* Finds a video matching the query and adds it to the ids. 
*
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/
function findVideos(auth) {

   const Youtube = google.youtube({
      version:'v3',
      auth
   });

   // Search query for videos. "|" = OR   "-" = NOT
   const query = QUERY;

   // Initial search for videos
   Youtube.search.list({
      part: 'snippet',
      q: query,
      safeSearch: 'strict',
      maxResults: MAX_SEARCH,
      type: 'video'
   }, function (err, data) {
      
      if (err) throw err;
      
      if (data) {
      //console.log(data.data.items)
      let IDS = "";
      // Stores video ids
      data.data.items.forEach(element => IDS += `${element.id.videoId},`);

         Youtube.videos.list({
            id: IDS,
            part: 'contentDetails',
         }, (err, data) => {
            
            if (err) throw err;
            
            if (data) {
               
               for (let video of data.data.items) {

                  const dur = parse(video.contentDetails.duration);

                  const mins = (dur.hours * 60) + dur.minutes;

                  totalTime += mins;
                  videoIds.push(video.id);

                  if (totalTime >= 60 * 7) break;
                  
               }

               makePlaylist(auth);
            }
         });
      }
   });
}

/**
* Makes a playlist out of video ids.
*
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/
function makePlaylist(auth) {
   
   console.log('total time:', totalTime);
   console.log('video ids:', videoIds);

   //videoIds

   const PTITLE = 'playlist-' + generateID(6);

   const Youtube = google.youtube({
      version:'v3',
      auth
   });

   Youtube.playlists.insert({
      part: 'snippet',
      resource: {
         snippet: {
            title: `${PTITLE}`
         }
      }
   }, (err,data) => {

      if (err) throw err;

      if (data) {

         const PLAYLIST_ID = data.data.id;
      
         for (let this_video_id of videoIds) {
            Youtube.playlistItems.insert({
               part: "snippet",
               resource: {
                  snippet: {
                     playlistId: PLAYLIST_ID,
                     position: 0,
                     resourceId: {
                        kind: "youtube#video",
                        videoId: this_video_id,
                     }
                  }
               }
            }, (e,dat) => {
               if (e) throw e;
               if (dat) {
                  console.log("-------ADDED VIDEO TO PLAYLIST!-------");
                  console.log(dat);
                  setTimeout(function() {},1000 * 1);
               }
            });
         }
      }
   });

}