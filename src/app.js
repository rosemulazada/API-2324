// Core modules
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// NPM modules
const express = require("express");
const ejs = require("ejs");

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

app.get("/genres", async (req, res) => {
    try {
        const token = await APIController._getToken();
        const genres = await APIController._getGenres(token);
        res.json(genres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});

module.exports = app;

/**============================================
 *                  API CALL
 *=============================================**/
// referenced this video by Avery Wicks on how to use Spotify's API https://www.youtube.com/watch?v=SbelQW2JaDQ
const APIController = (() => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    // private methods
    const _getToken = async () => {
        const result = await fetch(`https://accounts.spotify.com/api/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${btoa(clientId + ":" + clientSecret)}`,
            },
            body: "grant_type=client_credentials",
        });

        const data = await result.json();
        console.log(data);
        return data.access_token;
    };

    const _getGenres = async (token) => {
        const result = await fetch(
            "https://api.spotify.com/v1/browse/categories?locale=sv_US",
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const data = await result.json();
        return data.categories;
    };

    return {
        _getToken,
        _getGenres,
    };
})();
