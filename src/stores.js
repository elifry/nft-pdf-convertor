import { writable } from 'svelte/store';

// Default styles (macOS)
export let mainWidth = '718px';
export let eggNumSize = '4.35em';


// determine the OS, fine tune the css to match
let os = "MacOS"; // default to MacOS
let appV = "";
if (navigator.appVersion.indexOf("Win") != -1) {
	os = "Windows";
	eggNumSize = '4.65em';
}
if (navigator.appVersion.indexOf("iPhone") != -1) {
	os = "iPhone";
	eggNumSize = '4.6em';
}
//if (navigator.appVersion.indexOf("X11") != -1) os = "UNIX";
//if (navigator.appVersion.indexOf("Linux") != -1) os = "Linux";

export let imgSrc = 'https://galaxy-eggs-images.s3.amazonaws.com/2k/jpg/3621.jpg';
let description = "collection description";
export let longDescription = '(Art)ificial is an art studio that explores the boundaries of technology and art. Our first project is Galaxy Eggs - a generative collection of 9,999 Eggs of the metaverse that live on the Ethereum Blockchain. Our Art Director, Gal Barkan, has been creating futuristic and sci-fi art for the past 20 years - this collection is the culmination of a lifetime of work on one hand, and the beginning of a new chapter in taking part in the creation of the metaverse.';
export let collectionName = 'Galaxy Egg'; // hardcoded because name=GalaxyEggs
export let collectionNamePlural = 'Galaxy Eggs'; // hardcoded because name=GalaxyEggs
export const eggNumber = writable(0);
export let series = 'series';
export let qrSrc = 'https://opensea.io/assets/0xa08126f5e1ed91a635987071e6ff5eb2aeb67c48/';
let generate = false;
let nftIdentifierLength = 4;
document.title = 'Print your egg!';

export const web3Address = 'elifry.eth';
export const ethAddress = '0x51f01329d318ED23b78E47eFa336C943BFC7Bf22';

// When generate button clicked, call the opensea API for details on the egg
export const generateEgg = (async () => {
	fetch(`https://api.opensea.io/api/v1/assets?token_ids=${eggNumber}&order_direction=desc&offset=0&limit=1&collection=galaxyeggs9999`)
	.then(response => response.json())
	.then(data => {
		document.title = pad(eggNumber);
		qrSrc += eggNumber;
		imgSrc = data.assets[0].image_original_url;
		description = data.assets[0].collection.description;
		series = data.assets[0].traits[0].value;
		generate = true;
	}).catch(error => {
		console.log(error);
		return [];
	});
});

// Pad the number to 4 digits, puting zeroes in front as needed
export function pad(num) {
    let s = '0'.repeat(nftIdentifierLength-1) + num;
    return s.substr(s.length-nftIdentifierLength);
}
