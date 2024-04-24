// Ensure #1 is as big as other words
document.addEventListener("DOMContentLoaded", function () {
    var rightContainerHeight =
        document.getElementById("toptrack__data").clientHeight;

    document.getElementById("number").style.fontSize =
        rightContainerHeight + 5 + "px";
});

// GSAP

const topTracksImg = document.querySelector(".topTrackImg");

if (topTracksImg) {
    gsap.from(topTracksImg, {
        x: -100,
        scale: 3,
        duration: 0.5,
    });
}

// Progress bar
// Credit to: https://codepen.io/GreenSock/pen/GRovmpJ
gsap.registerPlugin(ScrollTrigger);
gsap.to("progress", {
    value: 100,
    ease: "none",
    scrollTrigger: {
        scrub: 0.3,
    },
});

const arrow = document.querySelector("#arrow");
console.log(arrow);

// Gallery
// Credit: https://codepen.io/roza-m/pen/JjVmpBm
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

const tl = gsap
    .timeline({
        scrollTrigger: {
            trigger: ".img",
            scrub: true,
        },
    })
    .to(".img", {
        stagger: 0.2,
        y: -400,
        scrub: true,
    });

// Select all recommendation elements
const recommendations__display = document.querySelectorAll(
    ".recommendations__display"
);

const recommendations = document.querySelectorAll(".recommendation");

recommendations.forEach((recommendation, index) => {
    ScrollTrigger.create({
        trigger: recommendation,
        start: "top bottom",
        end: "bottom top",
        scrub: "true",
        onEnter: () => {
            gsap.from(recommendation, {
                duration: 1,
                opacity: 0,
                y: -50 * index,
                ease: "power2.out",
                delay: 0.2,
            });
        },
    });
});

console.log(`test, <%-recommendedTrackImgs%>`);
