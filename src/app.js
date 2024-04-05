// Core modules
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// NPM modules
const express = require("express");
const querystring = require("querystring");
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
app.use(express.static(publicDirectoryPath));

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
    const token = await _getToken();
    const genres = await _getGenres(token);
    console.log(genres);
});

module.exports = app;

/**============================================
 *                  API CALL
 *=============================================**/
// referenced this video by Avery Wicks on how to use Spotify's API https://www.youtube.com/watch?v=SbelQW2JaDQ

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri =
    process.env.NODE_ENV == "dev"
        ? "http://localhost:8000/callback"
        : "https://api-2324.vercel.app//callback";

const generateRandomString = (length) => {
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

app.get("/login", function (req, res) {
    var state = generateRandomString(16);
    var scope = "user-read-email user-top-read";

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

// private methods
const _getToken = async () => {
    const result = await fetch(`https://accounts.spotify.com/api/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(client_id + ":" + client_secret)}`,
        },
        body: "grant_type=client_credentials",
    });

    const data = await result.json();
    console.log(data);
    return data.access_token;
};

const _getGenres = async (token) => {
    const result = await fetch(
        "https://api.spotify.com/v1/browse/categories?locale=US",
        {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    const data = await result.json();
    return data.categories.items;
};

return {
    _getToken,
    _getGenres,
};
