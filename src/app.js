// Core modules
const path = require("path");
const fs = require("fs");
var crypto = require("crypto");
require("dotenv").config();

// NPM modules
const express = require("express");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const axios = require("axios");
// const ejs = require("ejs");

const app = express();
const port = process.env.PORT || 8000;

const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// Setup EJS engine and views location
app.set("view engine", "ejs");
app.set("views", viewsPath);

// Setup static directory to serve
app.use(express.static(publicDirectoryPath)).use(cookieParser());

/**========================================================================
 *                           CODE START
 *========================================================================**/

/**============================================
 *                   ROUTING
 *=============================================**/

app.get("", (req, res) => {
    res.render("index");
});

app.listen(port, async () => {
    console.log(`Server running on port ${port}.`);
});

module.exports = app;

/**============================================
 *                  API CALL
 *=============================================**/
// referenced this video by Avery Wicks on how to use Spotify's API https://www.youtube.com/watch?v=SbelQW2JaDQ

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
var stateKey = "spotify_auth_state";

const redirect_uri =
    process.env.NODE_ENV == "dev"
        ? "http://localhost:8000/callback"
        : "https://api-2324.vercel.app/callback";

const generateRandomString = (length) => {
    return crypto.randomBytes(60).toString("hex").slice(0, length);
};

app.get("/login", function (req, res) {
    var state = generateRandomString(16);
    var scope = "user-read-private user-top-read";
    res.cookie(stateKey, state);

    res.redirect(
        "https://accounts.spotify.com/authorize?" +
            querystring.stringify({
                response_type: "code",
                client_id: client_id,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state,
            })
    );
});

app.get("/callback", function (req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect(
            "/#" +
                querystring.stringify({
                    error: "state_mismatch",
                })
        );
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: "https://accounts.spotify.com/api/token",
            data: querystring.stringify({
                code: code,
                redirect_uri: redirect_uri,
                grant_type: "authorization_code",
            }),
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    new Buffer.from(client_id + ":" + client_secret).toString(
                        "base64"
                    ),
            },
        };

        axios
            .post(authOptions.url, authOptions.data, {
                headers: authOptions.headers,
            })
            .then(function (response) {
                if (response.status === 200) {
                    var access_token = response.data.access_token,
                        refresh_token = response.data.refresh_token;

                    var options = {
                        url: "https://api.spotify.com/v1/me",
                        headers: { Authorization: "Bearer " + access_token },
                    };

                    // use the access token to access the Spotify Web API
                    axios
                        .get(options.url, { headers: options.headers }) // Use axios.get
                        .then(function (response) {
                            console.log(response.data);
                        })
                        .catch(function (error) {
                            console.error(error);
                        });

                    // we can also pass the token to the browser to make requests from there
                    res.redirect(
                        "/#" +
                            querystring.stringify({
                                access_token: access_token,
                                refresh_token: refresh_token,
                            })
                    );
                } else {
                    res.redirect(
                        "/#" +
                            querystring.stringify({
                                error: "invalid_token",
                            })
                    );
                }
            })
            .catch((error) => {
                console.error(error);
                res.redirect(
                    "/#" +
                        querystring.stringify({
                            error: "invalid_token",
                        })
                );
                
            });
    }
});
