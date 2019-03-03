import { google } from 'googleapis';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const key = require('./credentials.json');

const scopes = "https://www.googleapis.com/auth/youtube";

const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes);

jwt.authorize((err, response) => {

   const yt = google.youtube({
      version: 'v3',
      auth: jwt,
   });

   yt.search.list({
      part: 'snippet',
      q: 'study music | zen music -livestream -live',
      maxResults: 1,
   }, (err, data) => {

      if (err) console.error(err);

      if (data) {
         
         console.log(data.data.items);
         // TODO: create playlist with these items

      }

   });

});

/*
const Youtube = google.youtube({
  version: 'v3',
  auth: config.KEY
});


// Search query for videos. "|" = OR   "-" = NOT
const query = "study music | zen music -livestream -live";

// Initial search for videos
Youtube.search.list({
   part: 'snippet',
   q: query,
   safeSearch: 'strict',
   maxResults: 5,
   type: 'video'
 }, function (err, data) {
   
   if (err) console.error('Error: ' + err);
   
   if (data) {
     //console.log(data.data.items)

     let IDS = "";

     // Stores video ids
     data.data.items.forEach(element => IDS += `${element.id.videoId},`);

      Youtube.videos.list({
         id: IDS,
         part: 'contentDetails',
      }, function(err, data) {

         if (err) console.error(err);

         if (data) {
            
            for (let video of data.data.items) {
               //console.log(video);
               console.log(`ID: ${video.id}\nDURATION: ${video.contentDetails.duration}\n`);
            }

         }

      });
      
   }
 });
*/