/**============================================
 *               MOUSE TRAIL
 *=============================================**/
// This code was sourced from a CodePen I found on a YouTube tutorial that you can find here.
//  https://youtu.be/wG_5453Vq98
// Link to CodePen: https://codepen.io/gusevdigital/pen/MWxyXRa

// Select the circle element
const circleElement = document.querySelector(".circle");

// Create objects to track mouse position and custom cursor position
const mouse = { x: 0, y: 0 }; // Track current mouse position
const previousMouse = { x: 0, y: 0 }; // Store the previous mouse position
const circle = { x: 0, y: 0 }; // Track the circle position

// Initialize variables to track scaling and rotation
let currentScale = 0; // Track current scale value
let currentAngle = 0; // Track current angle value

// Update mouse position on the 'mousemove' event
window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Smoothing factor for cursor movement speed (0 = smoother, 1 = instant)
const speed = 0.17;

// Start animation
const tick = () => {
    // MOVE
    // Calculate circle movement based on mouse position and smoothing
    circle.x += (mouse.x - circle.x) * speed;
    circle.y += (mouse.y - circle.y) * speed;
    // Create a transformation string for cursor translation
    const translateTransform = `translate(${circle.x}px, ${circle.y}px)`;

    // SQUEEZE
    // 1. Calculate the change in mouse position (deltaMouse)
    const deltaMouseX = mouse.x - previousMouse.x;
    const deltaMouseY = mouse.y - previousMouse.y;
    // Update previous mouse position for the next frame
    previousMouse.x = mouse.x;
    previousMouse.y = mouse.y;
    // 2. Calculate mouse velocity using Pythagorean theorem and adjust speed
    const mouseVelocity = Math.min(
        Math.sqrt(deltaMouseX ** 2 + deltaMouseY ** 2) * 4,
        150
    );
    // 3. Convert mouse velocity to a value in the range [0, 0.5]
    const scaleValue = (mouseVelocity / 150) * 0.5;
    // 4. Smoothly update the current scale
    currentScale += (scaleValue - currentScale) * speed;
    // 5. Create a transformation string for scaling
    const scaleTransform = `scale(${1 + currentScale}, ${1 - currentScale})`;

    // ROTATE
    // 1. Calculate the angle using the atan2 function
    const angle = (Math.atan2(deltaMouseY, deltaMouseX) * 180) / Math.PI;
    // 2. Check for a threshold to reduce shakiness at low mouse velocity
    if (mouseVelocity > 20) {
        currentAngle = angle;
    }
    // 3. Create a transformation string for rotation
    const rotateTransform = `rotate(${currentAngle}deg)`;

    // Apply all transformations to the circle element in a specific order: translate -> rotate -> scale
    circleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;

    // Request the next frame to continue the animation
    window.requestAnimationFrame(tick);
};

// Start the animation loop
tick();

// Ensure #1 is as big as other words
document.addEventListener("DOMContentLoaded", function () {
    // Get the height of the right side container
    var rightContainerHeight =
        document.getElementById("toptrack__data").clientHeight;

    // Set the font size of the #1 element to match the height of the right side container
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

// progress bar
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

// gallery
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
