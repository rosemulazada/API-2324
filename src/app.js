// Core modules
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

// NPM modules
const express = require("express");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8000;

const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// Other variables
let access_token;

// Setup EJS engine and views location
app.set("view engine", "ejs");
app.set("views", viewsPath);

// Setup static directory to serve
app.use(express.static(publicDirectoryPath)).use(cookieParser());

module.exports = app;
/**========================================================================
 *                           CODE START
 *========================================================================**/

/**============================================
 *                   ROUTING
 *=============================================**/

app.get("", (req, res) => {
    res.render("index", {
        href: `/login`,
        btn_text: `Get started`,
    });
});

app.get("/connect", (req, res) => {
    res.render("connect", {
        href: "/login",
        btn_text: `Connect to Spotify`,
    });
});

app.listen(port, async () => {
    console.log(`Server running on port ${port}.`);
});

/**============================================
 *                 oAuth2
 *=============================================**/
// Spotify docs reference in README & Wiki

// .ENV
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const stateKey = "spotify_auth_state";
const redirect_uri =
    process.env.NODE_ENV == "dev"
        ? "http://localhost:8000/callback"
        : "https://api-2324.vercel.app/callback";

const generateRandomString = (length) => {
    return crypto.randomBytes(60).toString("hex").slice(0, length);
};

// Function to assess the endpoint
async function fetchWebApi(endpoint, method, body) {
    const response = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        method,
        body: JSON.stringify(body),
    });
    return await response.json();
}

app.get("/login", function (req, res) {
    const state = generateRandomString(16);
    const scope = "user-read-email user-top-read";
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
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect(
            "/#" +
                querystring.stringify({
                    error: "state_mismatch",
                })
        );
    } else {
        res.clearCookie(stateKey);

        const authOptions = {
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
                    Buffer.from(client_id + ":" + client_secret).toString(
                        "base64"
                    ),
            },
        };

        axios
            .post(authOptions.url, authOptions.data, {
                headers: authOptions.headers,
            })
            .then((response) => {
                if (response.status === 200) {
                    access_token = response.data.access_token;
                    const refresh_token = response.data.refresh_token;

                    res.cookie("access_token", access_token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                    });
                    res.cookie("refresh_token", refresh_token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                    });

                    res.redirect("/test");
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

app.get("/success", async function (req, res) {
    if (!access_token) {
        return res.status(401).send("Access token not found");
    }

    const options = {
        url: "https://api.spotify.com/v1/me",
        headers: {
            Authorization: "Bearer " + access_token,
        },
    };

    axios
        .get(options.url, {
            headers: options.headers,
        })
        .then((response) => {
            res.send(
                `<img style="border-radius:9999px;" src="${response.data.images[1].url}"/>
                <br>
                <a href="${response.data.external_urls.spotify}">${response.data.display_name}</a>`
            );
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(
                "Error occurred while fetching data from Spotify API."
            );
        });
});

app.get("/test", async (req, res) => {
    // RELEVANT FUNCTIONS
    // Get top 10 tracks
    async function getTopTracks() {
        const response = await fetchWebApi(
            "v1/me/top/tracks?time_range=long_term&limit=10",
            "GET"
        );
        return response.items;
    }

    // Get track features by track ID
    async function getTrackFeatures(track_ids) {
        const response = await fetchWebApi(
            `v1/audio-features/${track_ids}`,
            "GET"
        );
        return response;
    }

    try {
        // Get the individual IDs
        const topTracks = await getTopTracks();
        const track_ids = topTracks.map(({ id }) => id);

        let trackFeatures = [];

        // Call getTrackFeatures for each individual top track ID
        for (const track_index in track_ids) {
            const track_id = track_ids[track_index];
            const trackFeature = await getTrackFeatures(track_id);

            // Save all the track features in an array
            trackFeatures.push({ track_id, trackFeature });
            console.log(trackFeature);
        }

        const tracks = topTracks
            .map(
                ({ name, artists, id }) =>
                    `${name} by ${artists
                        .map((artist) => artist.name)
                        .join(
                            ". "
                        )}<em style="margin-left: 10px; font-size: .75em; font-family:system-ui;">ID: ${id}</em>`
            )
            .join("<br>");

        res.send(trackFeatures);
    } catch (error) {
        console.error(error);
        res.status(500).send("Could not fetch data");
    }
});
