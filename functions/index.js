const functions = require('firebase-functions');

const admin = require('firebase-admin');
const {OAuth2Client} = require('google-auth-library');
const {google} = require('googleapis');
admin.initializeApp();


// get the config cliend id and secret used by oAuth by generating it from the google cloud console
const CONFIG_CLIENT_ID = "xxxxxxxxxxxxxxxx.apps.googleusercontent.com";
const CONFIG_CLIENT_SECRET = "xxxxxxxx";
const CONFIG_SHEET_ID = "{your google sheet id}";


// TODO: Use firebase functions:config:set to configure your watchedpaths object:
// watchedpaths.data_path = Firebase path for data to be synced to Google Sheet
const CONFIG_DATA_PATH = "https://{project-name}.firebaseio.com/";

// The OAuth Callback Redirect.
const FUNCTIONS_REDIRECT = `https://{project-name}.cloudfunctions.net/oauthcallback`;

// setup for authGoogleAPI
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const functionsOauthClient = new OAuth2Client(CONFIG_CLIENT_ID, CONFIG_CLIENT_SECRET,
  FUNCTIONS_REDIRECT);

// OAuth token cached locally.
let oauthTokens = null;

// visit the URL for this Function to request tokens
exports.authgoogleapi = functions.https.onRequest((req, res) => {
  res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
  res.redirect(functionsOauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  }));
});

// setup for OauthCallback
const DB_TOKEN_PATH = '/api_tokens';

// after you grant access, you will be redirected to the URL for this Function
// this Function stores the tokens to your Firebase database
exports.oauthcallback = functions.https.onRequest(async (req, res) => {
  res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
  const code = req.query.code;
  try {
    const {tokens} = await functionsOauthClient.getToken(code);
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    await admin.database().ref(DB_TOKEN_PATH).set(tokens);
    return res.status(200).send('App successfully configured with new Credentials. '
        + 'You can now close this page.');
  } catch (error) {
    return res.status(400).send(error);
  }
});

var db = admin.database();
var ref = db.ref("/eazypg-35985");
ref.once("value", function(snapshot) {
    console.log(snapshot.val());
  });

exports.updateSheet = functions.database.ref('/{data_path}/{ITEM}')
.onWrite((change, context) => {

  const newRecord = change.after.val();
  const eventId = context.eventId;
  const pushKey = context.params.ITEM;
  return appendPromise({
    spreadsheetId: CONFIG_SHEET_ID,
    range: 'A:F',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
        values: [[pushKey, newRecord.Name, newRecord.Address, newRecord.Location,
                  newRecord.Phone, newRecord.Price]],
                },
              });
            });

// accepts an append request, returns a Promise to append it, enriching it with auth
function appendPromise(requestWithoutAuth) {
  return new Promise((resolve, reject) => {
    return getAuthorizedClient().then((client) => {
      const sheets = google.sheets('v4');
      const request = requestWithoutAuth;
      request.auth = client;
      return sheets.spreadsheets.values.append(request, (err, response) => {
        if (err) {
          console.log(`The API returned an error: ${err}`);
          return reject(err);
        }
        return resolve(response.data);
      });
    });
  });
}

// checks if oauthTokens have been loaded into memory, and if not, retrieves them
async function getAuthorizedClient() {
    if (oauthTokens) {
      return functionsOauthClient;
    }
    const snapshot = await admin.database().ref(DB_TOKEN_PATH).once('value');
    oauthTokens = snapshot.val();
    functionsOauthClient.setCredentials(oauthTokens);
    return functionsOauthClient;
  }


  exports.testsheetwrite = functions.https.onRequest(async (req, res) => {
    const random2 = Math.floor(Math.random() * 10000000);
    const random3 = Math.floor(Math.random() * 10000000);
    await admin.database().ref('/{path}').push({
      Name: "etstNamsdfe",
      Address: "etsetsdfsd",
      Location: "etstest",
      Phone: random3,
      Price : random2
    }) .then(()=>{
      return res.status(201).json({message:'data saved'})
  })
  .catch((err)=>{
      return res.status(500).json({error:err})
  });
    // res.send(`Wrote to DB, trigger should now update Sheet.`);
   
  });

  exports.testsheetwriteNew = functions.https.onRequest(async (req, res) => {
    const random2 = Math.floor(Math.random() * 10000000);
    const random3 = Math.floor(Math.random() * 10000000);
    await admin.database().ref('/1fQqF1NlajcJ6xxxxxxxxxxxxxxx8Jw/Sheet1').push({
      Name: "etstNamsdfe",
      Address: "etsetsdfsd",
      Location: "etstest",
      Phone: random3,
      Price : random2
    }) .then(()=>{
      return res.status(201).json({message:'data saved'})
  })
  .catch((err)=>{
      return res.status(500).json({error:err})
  });
    // res.send(`Wrote to DB, trigger should now update Sheet.`);
   
  });

 exports.updateSheetNew = functions.database.ref('/1fQqF1NlajcJxxxxxxxxxxxxxx_efp8Jw/Sheet1/{ITEM}')
.onWrite((change, context) => {

  const newRecord = change.after.val();
  const eventId = context.eventId;
  const pushKey = context.params.ITEM;
  return appendPromise({
    spreadsheetId: CONFIG_SHEET_ID,
    range: 'A:F',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
        values: [[pushKey, newRecord.Name, newRecord.Address, newRecord.Location,
                  newRecord.Phone, newRecord.Price]],
                },
              });
});