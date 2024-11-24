// ==UserScript==
// @name         Udemy Fix Video Controls
// @namespace    https://github.com/Equiel-1703
// @version      1.0
// @description  Fix stupid idiot video controls of Udemy not disappearing.
// @author       Henrique Rodrigues Barraz
// @match        https://www.udemy.com/course/*
// @icon         https://www.udemy.com/staticx/udemy/images/v7/apple-touch-icon.png
// ==/UserScript==

(function() {
    "use strict";

	// Function to add CSS code to the page
    const addCSS = function (cssText) {
		let newStyleSection = document.createElement("style");

		newStyleSection.textContent = cssText;

		document.querySelector("head").appendChild(newStyleSection);
	}

	const newCSS = `
	.animate-opacity {
		transition-duration: 0.7s;
		transition-property: opacity;
	}

	.animate-bottom {
		transition-duration: 0.5s;
		transition-property: bottom;
	}

	.no-cursor {
		opacity: 0%;
	}

	.cursor-hover {
		opacity: 100%;
	}

	.hide-mouse {
		cursor: none;
	}

	.no-bottom-space {
		bottom: 0rem;
	}
	`;
	
	// Add this new CSS to the <head> of the page
	addCSS(newCSS);

	// New CSS classes
	const animateOpacity = "animate-opacity";
	const animateBottom = "animate-bottom";
	const noCursor = "no-cursor";
	const cursorHover = "cursor-hover";
	const hideMouse = "hide-mouse";
	const noBottomSpace = "no-bottom-space";
	
	// Elements Classes
	const controlBarClass = "div.shaka-control-bar--control-bar-container--OfnMI";
	const videoUIElementsClass = "div.user-activity--hide-when-user-inactive--Oc6Cn";
	const videoContainerClass = "div.curriculum-item-view--content--aaJOw";
	const captionsClass = "div.captions-display--captions-container--PqdGQ";

	// Now, we need to wait until the video player div appears
	const observer = new MutationObserver((_mutationsList, observer) => {
		let containerDiv = document.querySelector(videoContainerClass);
		let controlBarDiv = document.querySelector(controlBarClass);

		if (containerDiv && controlBarDiv) {
			console.log("UdemyVideoFix> Video container found: ", containerDiv);
			console.log("UdemyVideoFix> Control bar found: ", controlBarDiv);

			observer.disconnect(); // Stop observing once the div is found
			fixUdemyVideoControls();
		}
	});
	
	// Start observing the body for child additions
	observer.observe(document.body, { childList: true, subtree: true });

	const fixUdemyVideoControls = () => {
		// Get all video ui (progress bar, title etc)
		const videoUIElements = document.querySelectorAll(videoUIElementsClass + ", " + controlBarClass)
	
		console.log("UdemyVideoFix> Found video UI elements: ", videoUIElements);
	
		// Flag to check if the mouse is over the UI elements
		let mouseOverUIElement = false;
	
		// Add animate opacity class and add listeners to check if the mouse is over the UI elements
		videoUIElements.forEach((el) => {
			el.classList.add(animateOpacity);
			
			el.addEventListener("mouseover", () => {
				mouseOverUIElement = true;
			});
	
			el.addEventListener("mouseleave", () => {
				mouseOverUIElement = false;
			});
		});
	
		// Get the captions div
		const captionsDiv = document.querySelector(captionsClass);
	
		// Check if returned null
		if (captionsDiv == null) {
			console.log("Fuck, no captions div found.");
		} else {
			captionsDiv.classList.add(animateBottom);
		}
	
		// Now, I need the video container div
		const videoContainerDiv = document.querySelector(videoContainerClass);
	
		// Check if returned null
		if (videoContainerDiv == null) {
			console.log("Fuck, something went really wrong.");
			return;
		}
		
		// Flag indicating if UI is visible
		let uiVisible = true;
	
		// Functions to hide UI elements
		const hideUI = () => {
			if (captionsDiv) {
				captionsDiv.classList.add(noBottomSpace);
			}
	
			videoUIElements.forEach((vUI) => {
				if (!vUI.classList.contains(noCursor)) {
					vUI.classList.add(noCursor);
				}
				vUI.classList.remove(cursorHover);
			});
	
			videoContainerDiv.classList.add(hideMouse);
	
			uiVisible = false;
		};
	
		// Timeout settings
		const timeoutDelayMS = 4_000; // 4 sec to controls hide after no mouse movement
		let timeoutID = null;

		// Function to show UI elements
		const showUI = () => {
			// Clear previous timeout (if any)
			clearTimeout(timeoutID);
			
			if (captionsDiv) {
				captionsDiv.classList.remove(noBottomSpace);
			}
	
			videoUIElements.forEach((vUI) => {
				if (!vUI.classList.contains(cursorHover)) {
					vUI.classList.add(cursorHover);
				}
				vUI.classList.remove(noCursor);
			});
	
			videoContainerDiv.classList.remove(hideMouse);
	
			uiVisible = true;
	
			if (!mouseOverUIElement) {
				timeoutID = setTimeout(hideUI, timeoutDelayMS);
			}
		};
	
		// I will add a listener to detect when the mouse hover these elements.
		videoContainerDiv.addEventListener("mouseover", showUI);
	
		// And a listener to detect when the mouse leaves the div
		videoContainerDiv.addEventListener("mouseleave", hideUI);
	
		// Add listener to show UI when mouse is moved (while hovering the video only)
		videoContainerDiv.addEventListener("mousemove", () => {
			if (!uiVisible) {
				showUI();
			}
		});
	};
})();