<script>
import {onMount} from "svelte";
import QRCode from "./QRJS.svelte"
import {HsvPicker} from 'svelte-color-picker';

// Default styles (macOS)
let mainWidth = '718px'; // preview only
let eggNumSize = '4.35em'; // preview only
let txtColor = '#0d0c0d';
let newTextColor = false;
let collSeriesBorder = '#AFAFAF';

let showReal = false;


// determine the OS, fine tune the css to match
let os = "MacOS"; // default to MacOS
let appV = "";
if (navigator.appVersion.indexOf("Win") != -1) {
	os = "Windows";
	eggNumSize = '4.65em'; // preview only
}
if (navigator.appVersion.indexOf("iPhone") != -1) {
	os = "iPhone";
	eggNumSize = '4.6em'; // preview only
}

let imgSrc = 'https://galaxy-eggs-images.s3.amazonaws.com/2k/jpg/3621.jpg';
let description = "collection description";
let longDescription = '(Art)ificial is an art studio that explores the boundaries of technology and art. Our first project is Galaxy Eggs - a generative collection of 9,999 Eggs of the metaverse that live on the Ethereum Blockchain. Our Art Director, Gal Barkan, has been creating futuristic and sci-fi art for the past 20 years - this collection is the culmination of a lifetime of work on one hand, and the beginning of a new chapter in taking part in the creation of the metaverse.';
let collectionName = 'Galaxy Egg'; // hardcoded because name=GalaxyEggs
let collectionNamePlural = 'Galaxy Eggs'; // hardcoded because name=GalaxyEggs
let eggNumber = '';
let series = 'series';
let qrSrc = 'https://opensea.io/assets/0xa08126f5e1ed91a635987071e6ff5eb2aeb67c48/';
let generate = false;
let nftIdentifierLength = 4;
document.title = 'Print your egg!';

let web3Address = 'elifry.eth';
let ethAddress = '0x51f01329d318ED23b78E47eFa336C943BFC7Bf22';

function txtColorCallback(rgba) {
	let [r, g, b, a] = [rgba.detail.r, rgba.detail.g, rgba.detail.b, rgba.detail.a];
	txtColor = `rgb(${r},${g},${b},${a})`;
	collSeriesBorder = `rgb(${r},${g},${b},${a * 0.5})`;
}

let addEgg = () => {
	console.log("add egg");
}

let items = [];
let numberOfEggsToPrint = 0;
let name = "";

const addItem = () => {
	numberOfEggsToPrint++;
	items = [
		...items,
		{
		id: Math.random(),
		name: pad(name),
		done: false
		}
	];
	name = "";
};

const remove = item => {
	numberOfEggsToPrint--;
	items = items.filter(i => i !== item);
};

// When generate button clicked, call the opensea API for details on the egg
const generateEgg = (async () => {
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
function pad(num) {
	let s = '0'.repeat(nftIdentifierLength-1) + num;
	return s.substr(s.length-nftIdentifierLength);
}
</script>

<main>
<div class='top-container'>
	<div id="left-side">
		<div class="wrapper">
			<h1>Customize your print</h1>
			<div class="wrap-1">
				<input class="invisible-input" type="radio" id="tab-1" name="tabs">
				<label for="tab-1">
					<div>eggs to print {#if numberOfEggsToPrint>0}({numberOfEggsToPrint}){/if}</div>
					<div class="cross"></div>
				</label>
				<div class="content">
					<form on:submit|preventDefault={addItem}>
						<input id="textboxid" bind:value={name} type=number placeholder='#' autoComplete="off"/>
						<button id="buttonid" type="submit" disabled={!name} class="btn btn__primary btn__lg">Add Egg</button>
					</form>
					<ul class="egg-list">
						{#each items as item}
						<li class:done={item.done}>
							<span>{item.name}</span>
							<button on:click={() => remove(item)}>&times;</button>
						</li>
						{/each}
					</ul>
				</div>
			</div>
			<div class="wrap-2">
				<input class="invisible-input" type="radio" id="tab-2" name="tabs">
				<label for="tab-2"><div>colors</div><div class="cross"></div></label>
				<div class="questions">
					<div class="question-wrap">
						<input class="invisible-input" type="radio" id="question-3" name="question">
						<label for="question-3"><div>text color</div> <div class="cross"></div></label>
						<div class="content">
							<HsvPicker on:colorChange={txtColorCallback} startColor={"#0d0c0d"}/>
						</div>
					</div>
					<div class="question-wrap">
						<input class="invisible-input" type="radio" id="question-4" name="question">
						<label for="question-4"><div>background color</div> <div class="cross"></div></label>
						<div class="content">
							Coming Soon!
						</div>
					</div>
				</div>
			</div>
			<div class="wrap-3">
				<input class="invisible-input" type="radio" id="tab-3" name="tabs">
				<label for="tab-3"><div>format</div><div class="cross"></div></label>
				<div class="questions">
					Coming Soon!
				</div>
			</div>
			<form on:submit|preventDefault={generateEgg}>
				<button id="buttonid" type="submit" disabled={!eggNumber} class="btn btn__primary btn__lg">Generate</button>
			</form>
			<div class="shill">
				<div class="shilllinefirst">Like this tool? Here's my eth address:</div>
				<div class="shillline">{web3Address}</div>
				<div class="shillline">{ethAddress}</div>
				<a href="https://twitter.com/acuriousother?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @acuriousother</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
			</div>
		</div>
	</div>
	<div id="right-side">
		<div id="preview-title">
			PREVIEW
		</div>
		<!-- <button id="buttonid" type="submit" disabled={!eggNumber} class="btn btn__primary btn__lg">download</button> -->
		<div id="display-box" class="shrink" style="--main-width: {mainWidth};--txt-color: {txtColor}">
			<div><img class="egg-image" src={imgSrc} alt="galaxy egg"/></div>
			<div class="descriptionSection" style="--main-width: {mainWidth}">
				<div class="row1">
					<div class="qr-code">
						<QRCode codeValue={qrSrc} squareSize="80" color={txtColor}/>
					</div>
					<div class="collectionSeries" style="--coll-seriesborder: {collSeriesBorder}">
						<div class="collectionName">{series}</div>
						<div class="series">{collectionName}</div>
					</div>
					<div class="eggNum" style="--egg-num-size: {eggNumSize}">
						#{pad(eggNumber)}
					</div>
				</div>
				<div class="row2">
					<div class="description">
						<p>{longDescription}</p>
					</div>
					<div class="tableData">
						<table border=1 frame=void rules=rows>
							<tr>
								<th>Collection</th>
								<td>{collectionNamePlural}</td>
							</tr>
							<tr>
								<th>Series</th>
								<td>{series}</td>
							</tr>
							<tr>
								<th>Token ID</th>
								<td>{pad(eggNumber)}</td>
							</tr>
							<tr>
								<th>Token Standard</th>
								<td>ERC-721</td>
							</tr>
							<tr>
								<th>Blockchain</th>
								<td>Ethereum</td>
							</tr>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</main>

<style>
* {
	color: var(--txt-color);
}
#left-side {
	padding: 0;
	margin: 0;
	box-sizing: border-box;
	font-family: 'Space Mono', monospace;
	color: #3E474F;
	flex: 3;
}

body {
  overflow: hidden;
}

.wrapper {
	margin-left: 5px;
	margin-right: 5px;
	width: 95%;
}

h1 {
	font-size: 2em;
	margin-bottom: 20px;
	text-align:center;
}

.invisible-input {
	display: none;
}

label {
	display: flex;
	width: 100%;
	height: 50px;
	cursor: pointer;
	border: 3px solid #3E474F;
	user-select: none;
}

label div:first-child {
	width: 100%;
	line-height: 45px;
	margin-left: 10px;
	font-size: 1.2em;
}

.cross{
	margin-right:15px;
	margin-top:3px;
}

.cross:before,.cross:after {
	content: '';
	border-top: 2px solid #3E474F;
	width: 15px;
	display: block;
	margin-top: 18px;
	transition: 0.3s;
}

.cross:after {
	transform: rotate(90deg);
	margin-top: -2px;
}

.content {
	box-sizing: border-box;
	font-size: 0.9em;
	margin: 10px 10px;
	max-height: 0;
	overflow: hidden;
	transition: max-height, .5s;
}

input:checked ~ .content {
	max-height: 400px;
	transition: max-height, 1s;
}

input:checked ~ label .cross:before {
	transform: rotate(180deg);
}

input:checked ~ label .cross:after {
	transform: rotate(0deg);
}

.questions {
	margin-top:20px;
	max-height: 0;
	overflow: hidden;
	transition: max-height, .5s;
}

.questions label {
	border:none;
	box-shadow: none;
	margin:0;
}

input:checked ~ .questions {
	max-height: 400px;
	border-bottom:2px solid #3E474F;
	transition: 1s;
}

/*----------tool-tip------------*/

.tip {
	color: #f03768;
	cursor: help;
	position: relative;
	overflow: visible;
	font-family: monospace;
	font-size: 1.3em;
}

.tip:before,
.tip:after {
	position: absolute;
	opacity: 0;
	z-index: -100;
	transform: translateY(-30%);
	transition: .4s;
}

.tip:before {
	content: '';
	border-style: solid;
	border-width: 0.8em 0.5em 0 0.5em;
	border-color: #3E474F transparent transparent transparent;
	transform: translateY(-200%);
	bottom:90%;
	left:50%;
}

.tip:after {
	content: attr(data-tip);
	background: #3E474F;
	color: white;
	width: 100px;
	padding: 10px;
	font-size: 0.8em;
	bottom: 150%;
	left: -50%;
}

.tip:hover:before,
.tip:hover:after {
	opacity: 1;
	z-index: 100;
	transform: scaleY(1);
}
#right-side {
	flex: 3;
	background-color: black;
}
#preview-title {
	margin-top: 10px;
	color: green;
	font-weight: 600;
	font-size: 3em;
	text-align: center;
	background-color: lightgray;
	opacity: 0.7;
}
.hidden {
	visibility: hidden !important;
}
.shrink {
	-webkit-transform:scale(0.95);
	-moz-transform:scale(0.95);
	-ms-transform:scale(0.95);
	transform:scale(0.95);
}
.top-container {
	width: 100%;
	display: flex;
	justify-content: center;
}
.container {
	display: flex;
	justify-content: center;
}
.topSection {
	height: 5em;
	margin-top: 5em;
}
.intro {
	font-weight: 400;
	font-size: 1.2em;
	border-bottom: 1px solid #AFAFAF;
	margin-bottom: 1em;
}
#textboxid {
	height: 70px;
	font-size: 2em;
	width: 50%;
}
#buttonid {
	width: 45%;
	height: 70px;
	font-size: 2em;
}
.egg-list li button {
	float: right;
	border: none;
	background: transparent;
	padding: 0;
	margin: 0;
	color: #dc4f21;
	font-size: 18px;
	cursor: pointer;
}
.egg-list li button:hover {
	transform: scale(2);
}
.egg-list li button:focus {
	outline: #dc4f21;
}
.egg-list li:last-child {
	border-bottom: none;
}
.egg-list li {
	list-style: none;
	padding: 6px 10px;
	border-bottom: 1px solid #ddd;
}
.egg-list ul {
	padding-left: 0;
}
.shill {
	margin-top: 3em;
}
.shilllinefirst {
	padding-bottom: 8px;
	font-weight: 400;
}
.shillline {
	padding-bottom: 8px;
	font-weight: 600;
}
#display-box {
	padding: 40px;
	width: var(--main-width);
	flex: 1.33;
	background-color: white;
}
.egg-image {
	max-width:100%;
	max-height:100%;
	cursor: crosshair;
}
.descriptionSection {
	height: 247px;
	width: var(--main-width);
}
.row1 {
	display: flex;
}
.row2 {
	display: flex;
	padding-top: 4px;
}
.collectionSeries {
	border-left: 4px solid var(--coll-seriesborder);
	flex: 1.33;
	margin-top: 25px;
}

.collectionSeries > .collectionName {
	padding-left: 12px;
	font-weight: 400;
	font-size: 1.2em;
}
.collectionSeries > .series {
	padding-left: 12px;
	font-weight: 600;
	font-size: 2.5em;
}
.qr-code {
	flex: 0.31;
	margin-top: 25px;
}
.eggNum {
	margin-top: 12px;
	flex: 0.4;
	font-weight: 550;
	font-size: var(--egg-num-size);
	font-family: Monaco, sans-serif;
}
.description {
	margin-top: 2px;
	flex: 1.32
}
p {
	text-align: justify;
	text-justify: inter-word;
	font-size: 0.86em;
}
.tableData {
	flex: 0.6;
	margin-left: 45px;
}
table {
	margin-top: 12px;
	font-size: 0.8em;
	border-color: var(--coll-seriesborder);
}
table td {
	padding: 5px 0;
}
th {
	text-align: left;
	width: 125px;
	padding-top: 2px;
}
</style>
