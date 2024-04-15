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

                    res.redirect("/yourplaylist");
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

app.get("/yourplaylist", async (req, res) => {
    // RELEVANT FUNCTIONS
    // Get top 10 tracks
    const axios = require("axios");

    async function getTopTracks() {
        try {
            const response = await axios.get(
                "https://api.spotify.com/v1/me/top/tracks",
                {
                    params: {
                        time_range: "short_term",
                        limit: 1,
                    },
                    headers: {
                        Authorization: "Bearer " + access_token,
                    },
                }
            );

            return response.data.items;
        } catch (error) {
            console.error("Error fetching top tracks:", error);
            throw error; // Rethrow the error to handle it further if needed
        }
    }

    // async function getTopTracks() {
    //     const response = await fetchWebApi(
    //         "v1/me/top/tracks?time_range=long_term&limit=10",
    //         "GET"
    //     );
    //     return response.items;
    // }

    // Get recommended songs
    async function getRecommendedTracks(track_id) {
        const response = await fetchWebApi(
            `v1/recommendations?limit=5&seed_tracks=${track_id}`,
            "GET"
        );
        return response;
    }

    try {
        const topTracks = await getTopTracks();

        console.log(topTracks[0].album.images);
        // Call getRecommendedTracks for each individual top track ID
        const trackInfo = await Promise.all(
            topTracks.map(async (topTrack) => {
                const track_id = topTrack.id;
                const topTrackArtists = topTrack.artists[0].name;
                const topTrackName = topTrack.name;
                const topTrackImg = topTrack.album.images[0].url;

                return Promise.all([getRecommendedTracks(track_id)]).then(
                    ([recommendedTrack]) => {
                        const recommendedTrackArtists =
                            recommendedTrack.tracks.map((track) => {
                                return track.album.artists.map(
                                    (artist) => artist.name
                                );
                            });
                        const recommendedTrackTitles =
                            recommendedTrack.tracks.map((track) => { return track.name });
                        
                        const recommendedTrackImgs = recommendedTrack.tracks.map(track => { return track.album.images[0].url});

                        return {
                            topTrack: {
                                topTrackArtists: topTrackArtists,
                                topTrackName: topTrackName,
                                topTrackImg: topTrackImg,
                            },
                            recommendedTracks: {
                                recommendedTrackArtists:
                                    recommendedTrackArtists,
                                recommendedTrackTitles: recommendedTrackTitles,
                                recommendedTrackImgs: recommendedTrackImgs,
                            },
                        };
                    }
                );
            })
        );

        console.log(trackInfo);
        res.json(trackInfo);
        // res.json("test", { trackInfo: trackInfo });
    } catch (error) {
        console.error(error);
        res.status(500).send("Could not fetch data");
    }
});
