# API-2324

This is my repository for the subject API's for the minor Web Design and Development 23-24.

## Table of Contents

-   [Introduction](#introduction-to-the-assignment)
-   [Installation](#installation)
-   [Usage and Features](#usage-and-features)
-   [Process and feedback](#process-and-feedback)
-   [Reflection](#Reflection)
-   [External Sources](#external-sources)

## Introduction

For this class, we were practically given free reign on what we wanted to do. We had to use at least one content based API and one Web API that was on the list on the MDN page. We also had to work out a detail page.

That was kind of it.

I had always wanted to make an application that gives you a recommended playlist based off your favorite songs, so this was what I set out to do! This for me was very awesome considering I had wanted to do this originally during my previous minor Information Design Tech but was too intimidated by the Spotify API (especially considering we only had a week and a half or so to create the entire app and had to learn a new framework..), so I'm very happy that I've done this now!

I ended up using three API's (if you don't count the individual API's to get data that fall under Spotify): Spotify Data API (oAuth/regular), the iFrame Embed API (also by Spotify) and Web Share API.

## Installation

Here are the steps to install my project.

1. Under the `Code` tab at the top.
2. Download this repository as a `.zip` file and unpack it.
3. Locate the folder `API-2324`
    - If you have `VS Code`: From here, all you need to do is open the folder in your editor and use the `Live Server` extension to start a local host. This allows you to also view the code and work more hands-on, should you desire.
    - If not, you can find the document on your device, navigate to the `index.html` file (this should be visible just by opening up `API-2324`), right-click it and open in a browser of your choosing. I've used Arc to test this project, so I can recommend these two - plus Safari or another browser that supports Web Share if you want to get into that. (_I've ommitted the share button in browsers that don't._)

If you'd like to try this out for yourself, you can try it out by visiting the link in the sidebar on the right!

## Usage and Features

-   Authorize yourself using Spotify
-   Gets your top track of all time
-   Gets nine recommended songs based off this track
-   When you click on one of these recommended tracks, you will get a little detail page popup with some more information! Click again to undo this.
-   Gets track features API and track info for nine recommended tracks
-   Creates a playlist with your toptrack & the nine recommendations
-   Embeds the playlist into the browser using the iFrame Embed API
-   In case your browser supports it, uses the Web Share API to allow you to share your playlist and invite other to listen!
-   Uses GSAP and Lenis for smooth scrollbased animations, amongst which is a progress bar.

## Process and feedback

### Week 1

**First feedback session**
During the first feedback session, only in the first week of the project, I spoke Cyd about my app. I didn't have much more than an authorization screen that didn't lead anywhere because I had only configured the `/callback` and not the redirect that should follow. Nonetheless, this for me was a milestone. She made the suggestion to me to try using Three.js - maybe for something like a gradient like she has [in her portfolio,](https://cydstumpel.nl/) whicih is certainly worth checking out, by the way. She told me this because since I already nearly had the authorization functional, I would have little else to do as retrieving the data would likely not take long. At this time, my concept consisted of analysing the track for its features, such as danceability, energy, acousticness and the like. Her suggestion was to use Three.js to display a different gradient based off what the most recurring feature among a users top tracks is. I quickly became enthusiastic about this and began to look into it..!

The rest is history~

### Week 2

**My process this week**
As mentioned in the last week, Cyd was _mostly_ right - retrieving the data went relatively seamlessly, all things considered. So did displaying it in the browser. A problem that I ran into that I ended up getting pretty hooked on, however, was the rate limit.. It seemed that one of my functions was making too many requests for the API to handle..? What was unfortunate that no matter how much I refactored my code to make it smaller, the problem persisted, and Spotify documentation or lack thereof was not of much aid in my struggle to fix this. It never really stated anywhere in the docs - that Declan and I could find, anyway - how many requests at once is too much, or how to handle it. In fact, my application became entirely unusable because the client_id/client_secret seemed to refuse, leading me to have to create new ones. The only time it wouldn't do so was if I reduced my code down to one API call. And well, I wasn't going to get far doing that.

**Second feedback session**
During this week I had my feedback session with Declan Rek. I had come quite far in retrieving my data - not so much displaying it necessarily - and he noticed that I was getting quite caught up on getting around this rate limit. He told me to try to make smaller calls - like retrieving five or even one top tracks instead of the ten I originally was fetching with each request. Anything just to be able to still work, especially because it was a friday and I wanted to keep working in the weekend. Either that, or if all else fails, to change my concept.

Nonetheless, he told me that I was quite far and that I just needed to make sure I could keep going.

I did reduce the amount of requests as much as I humanly could. The issue persisted. But me being so enthusiastic about my idea, and also feeling like I was really too far to turn back that much, I did reduce it quite a lot but kept to the same _general_ idea. Initially, I retrieved ten top tracks, then ten recommended tracks, then ten audio features. This means about thirty requests. As it stood by the end of this week, I had one request for the top track, then nine requests for a recommended track. This still gave me the rate limit but _far less frequently,_ meaning I could keep working mostly comfortably. I'll get back to this in my third feedback session memo as well.

### Third and final feedback session

**My process this week**
This week I got a lot of things worked out regarding actually rendering the content and this is namely when I started with GSAP. By the end of the week I had the gallery functional! This seemed to impress a lot of people, and it was a bit of finnicking with GSAP but it came quite easily, yet it made for a really aweesome effect. A lot of effort was put into general styling; data I already had, as mentioned before, but it was really the time to get something on paper (or on screen). I changed the styling up a lot, but I ended up settling for a navy/magenta-ish theme, which ended up working really nicely. I also had the basics for a display of the list of songs. Not really worked out well but it was on the page, even if it was ugly.

**Third feedback session**
As mentioned before, this gallery got a lot of love, and I got to hear that I was quite far once again and that my styling looked neat. I was really glad to hear this because I feared the opposite lol. Now I could worry about this less!

I asked about the detail page because my concept relied on a single scrollable page. Cyd told me that this was okay, that I could for example allow the user to hover over an album and get back some information about it, which sounded pretty nice to me!

Like I said, for me now it was really a matter of visualizing. So there was that much to be said anymore.

### Fourth and final week

**My process this week**
This week I decided to switch things up.. Remember when I said I would get back to the rate limits? Well, for the detail 'page' I needed more data. So I dug 'get audio features' out of the closet and also made a new call to get track information. Miraculously, my code has held up thus far. That's not to say it hasn't hit the rate limit a few times but it really is not any more frequent than it was before I added these. I think that it was a change in my approach to calling the API that allowed it to work more smoothly.

I put a lot of effort into making sure the data was sorted and sent to the pages where it needed to be rendered. It took a lot of mapping over responses and being strategic about where I declared and called what but overall, if you ignore the minor headache I got, it went pretty nicely, and I really love the result. I added a GSAP animation to the list of songs as well, kind of like a waterfall effect, that nicely reveals the albums when they come into view.

As for the detail page, I ended up doing it on click instead of on hover because its a 3x3 grid and I really didn't need to try to prototype that to come to the conclusion that it probably wasn't a good idea; the user would definitely hover over it by mistake and it would just disorient them, especially considering I make something pop up on the screen.. just a bad time over all.

And that concluded my process!

## Reflection

### How did it go?

It went quite well, better than I had given myself credit for anyway - as mentioned above, this project was one I had wanted to flesh out long before now, but I didn't think I was quite at the oAuth level again. Granted I still have struggles with it but it works, and that's what I'm really happy about. I ran into a lot of complications surrounding rate limits set by Spotify (without clear documentation on how many requests is too many and what to do in such a case..) which meant I had to create new client_id's and client_secrets more times than I'd like to admit. Between deleting a million automatically generated and saved playlists and that, I'm still incredibly prideful of what I've achieved, not just the oAuth but I also managed to mostly flesh out how I imagined the two main animations to work!

### What did I struggle with most?

As mentioned above, I struggled with the rate limiting a lot, and understanding how my Promise.alls worked; since I wanted to have all my data ready and available to be displayed all on one long, scrollable page, I had to finnick a lot with the order of promise calls and time of retrieval. It means my `app.get('/yourplaylist)` looks a hot mess but I'm nonetheless happy that it works, even though I'm sure there is a more structured way of achieving it.

The oAuth flow is something I still don't _fully_ grasp. It's a lot. And honestly, I will certainly be going back to improve on among other things this aspect of my project, and see if I can further expand things the way I would have if I wasn't limited to about three-ish weeks for this project. That being said, I'm baffled at myself for achieving this in that time, considering I hadn't the faintest clue about oAuth when we started! I was just winging it.

### What did I learn?

I think this speaks for itself at this point. oAuth, GSAP. Those were the main things. And really, those are both things that I've been really enthusiastic to learn for a long time. I really wanted to do Three.js as well but did not quite get around to it.

### What am I proud of and what would I improve next time?

In the past I've not really dared to dream big in terms of my projects, but I did this time, and I'm happy to say I was able to make most of my dreams a reality. I finally worked with oAuth, I finally tried out GSAP which has made me a bit more comfortable with the idea of trying Three.js. There is room for improvement but when isn't there? And as mentioned before, I will definitely be finishing off and changing things I didn't quite get around to yet or wanted to do differently. I'm sure I can make this into something really awesome, and well, most importantly, portfolio-worthy..

I don't expect this to become something people will use frequently, but I think it could be cool to have something between friends that we can use when we're tired of our old music!

And well, maybe I'll be able to make it actually function how I had initially intended for it to, or something like it anyway.

In the future, I would edit the detail 'page' to be a bit more stylish but also for it to be limited to only one pop-up at a time. Also, clicking it away can be hard at times, and a 'x' in the corner would make more sense, or at least an indication that you can click off the card anywhere to get rid of it.

## External Sources

There were many, many many needed for this app..

1. [GSAP Docs](https://gsap.com/docs/v3/)
2. [Spotify Docs](https://developer.spotify.com/documentation/web-api)
3. [Spotify Get Top Track API](https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks)
4. [Spotify Get Recommendations API](https://developer.spotify.com/documentation/web-api/reference/get-recommendations)
5. [Spotify Get Track Audio Features API](https://developer.spotify.com/documentation/web-api/reference/get-audio-features)
6. [Spotify Get Track Info API](https://developer.spotify.com/documentation/web-api/reference/get-track)
7. [iFrame API](https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api)
8. [WebShare API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
9. [Lenis](https://lenis.darkroom.engineering/)
10. [Progress bar GSAP Codepen](https://codepen.io/GreenSock/pen/GRovmpJ)
11. [Gallery GSAP Codepen](https://codepen.io/roza-m/pen/JjVmpBm)
12. [Spotify oAuth p.1](https://www.youtube.com/watch?v=NPW4K3aMjI8)
13. [Spotify oAUth p.2](https://www.youtube.com/watch?v=SbelQW2JaDQ&t=524s)
