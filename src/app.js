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
        mainStyle: "res",
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
const redirect_uri = "http://localhost:8000/callback";

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
    const scope =
        "user-read-email user-top-read playlist-modify-public playlist-modify-private";

    // console.log("login");
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
    // console.log("callback");
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

app.get("/success", async function (req, res) {});

app.get("/yourplaylist", async (req, res) => {
    // RELEVANT FUNCTIONS
    // Get top 10 tracks
    async function getTopTracks() {
        try {
            const response = await axios.get(
                "https://api.spotify.com/v1/me/top/tracks",
                {
                    params: {
                        time_range: "long_term",
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

    // Fetch user data so I can get user ID
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
            // console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(
                "Error occurred while fetching data from Spotify API."
            );
        });

    let tracksUri;
    // Get recommended songs
    async function getRecommendedTracks(track_id) {
        const response = await fetchWebApi(
            `v1/recommendations?limit=9&seed_tracks=${track_id}`,
            "GET"
        );
        return response;
    }

    async function createPlaylist(urisParam) {
        const { id: user_id } = await fetchWebApi("v1/me", "GET");

        const playlist = await fetchWebApi(
            `v1/users/${user_id}/playlists`,
            "POST",
            {
                name: "Success",
                description: "My own playlist :D",
                public: false,
            }
        );

        await fetchWebApi(
            `v1/playlists/${playlist.id}/tracks?uris=${urisParam.join(",")}`,
            "POST"
        );

        return playlist;
    }

    try {
        const topTracks = await getTopTracks();

        const trackInfo = await Promise.all(
            topTracks.map(async (topTrack) => {
                const track_id = topTrack.id;
                const topTrackUri = topTrack.uri;
                const topTrackArtists = topTrack.artists[0].name;
                const topTrackName = topTrack.name;
                const topTrackImg = topTrack.album.images[0].url;

                const recommendedTrack = await getRecommendedTracks(track_id);
                const tracksUri = recommendedTrack.tracks.map(
                    (track) => track.uri
                );

                const urisParam = [topTrackUri, ...tracksUri];

                return Promise.all([
                    recommendedTrack,
                    createPlaylist(urisParam),
                ]).then(async ([recommendedTrack, playlist]) => {
                    const recommendedTrackArtists = recommendedTrack.tracks.map(
                        (track) => {
                            const firstArtistName = track.album.artists[0].name;
                            return firstArtistName;
                        }
                    );

                    const recommendedTrackTitles = recommendedTrack.tracks.map(
                        (track) => {
                            return track.name;
                        }
                    );

                    const recommendedTrackImgs = recommendedTrack.tracks.map(
                        (track) => {
                            return track.album.images[0].url;
                        }
                    );

                    const createdPlaylist = await createPlaylist(urisParam);
                    console.log(createdPlaylist.external_urls);

                    return {
                        topTrack: {
                            topTrackArtists: topTrackArtists,
                            topTrackName: topTrackName,
                            topTrackImg: topTrackImg,
                        },
                        recommendedTracks: {
                            recommendedTrackArtists: recommendedTrackArtists,
                            recommendedTrackTitles: recommendedTrackTitles,
                            recommendedTrackImgs: recommendedTrackImgs,
                            tracksUri: tracksUri,
                        },
                    };
                });
            })
        );

        res.render("result", {
            topTrackImg: trackInfo[0].topTrack.topTrackImg,
            topTrackName: trackInfo[0].topTrack.topTrackName,
            topTrackArtists: trackInfo[0].topTrack.topTrackArtists,
            recommendedTrackImgs:
                trackInfo[0].recommendedTracks.recommendedTrackImgs,
            recommendedArtistsNames:
                trackInfo[0].recommendedTracks.recommendedTrackArtists,
            recommendedTrackTitles:
                trackInfo[0].recommendedTracks.recommendedTrackTitles,

            mainStyle: "res",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Could not fetch data");
    }
});
