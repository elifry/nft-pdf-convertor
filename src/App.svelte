<script>
import { onMount } from "svelte";
import QrCode from "svelte-qrcode";
import { apiData, drinkNames } from './store.js';

	let imgSrc = "https://galaxy-eggs-images.s3.amazonaws.com/2k/jpg/3621.jpg";
	let description = "collection description";
	let collectionName = "Galaxy Egg"; // hardcoded because name=GalaxyEggs
	let collectionNamePlural = "Galaxy Eggs"; // hardcoded because name=GalaxyEggs
	let eggNumber = "";
	let series = "series";
	let qrSrc = `https://opensea.io/assets/0xa08126f5e1ed91a635987071e6ff5eb2aeb67c48/`
	let generate = false;
	document.title = 'Print your egg!';


const generateEgg = (async () => {
  fetch(`https://api.opensea.io/api/v1/assets?token_ids=${eggNumber}&order_direction=desc&offset=0&limit=1&collection=galaxyeggs9999`)
  .then(response => response.json())
  .then(data => {
		// console.log(data);
		document.title = eggNumber;
		qrSrc += eggNumber;
		imgSrc = data.assets[0].image_original_url;
		description = data.assets[0].collection.description;
		series = data.assets[0].traits[0].value;
		apiData.set(data);
		generate = true;
		// console.log(htmlOutput);
  }).catch(error => {
    console.log(error);
    return [];
  });
});
</script>

<main>
	{#if !generate}
	<div class="container">
		<div class="topSection">
			<div class="intro">
				Turn your Galaxy Eggs into a nice printable PDF!
			</div>
			<form on:submit|preventDefault={generateEgg}>
				<input id="textboxid" bind:value={eggNumber} type=number placeholder='#' autoComplete="off"/>
				<button id="buttonid" type="submit" disabled={!eggNumber} class="btn btn__primary btn__lg">Generate</button>
			</form>
			<div class="howto">
				How it works:
				<br><br>
				Put in your egg number and hit "Generate".
				<br>
				Once it is generated, right-click to print, and save as PDF.
				<br><br>
				NOTE: Make sure you have Headers and Footers turned off
				<br>
				(Chrome: More Settings > Options > Headers and footers)
			</div>
			<div class="shill">
				<div class="shilllinefirst">Like this tool? Here's my eth address:</div>
				<div class="shillline">elifry.eth</div>
				<div class="shillline">0x51f01329d318ED23b78E47eFa336C943BFC7Bf22</div>
				<a href="https://twitter.com/acuriousother?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @acuriousother</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
			</div>
		</div>
	</div>
	{/if}
	{#if generate}
	<div class="displaybox">
		<div><img class="eggImage" src={imgSrc} alt="galaxy egg"/></div>
		<div class="descriptionSection">
			<div class="row1">
				<div class="collectionSeries">
					<div class="collectionName">{series}</div>
					<div class="series">{collectionName}</div>
				</div>
				<div class="qrCode">
					<QrCode value={qrSrc} size="75" />
				</div>
				<div class="eggNum">
					#{eggNumber}
				</div>
			</div>
			<div class="row2">
				<div class="description">
					<p>
						(Art)ificial is an art studio that explores the boundaries of technology and art. Our first project is Galaxy Eggs - a generative collection of 9,999 Eggs of the metaverse that live on the Ethereum Blockchain. Our Art Director, Gal Barkan, has been creating futuristic and sci-fi art for the past 20 years - this collection is the culmination of a lifetime of work on one hand, and the beginning of a new chapter in taking part in the creation of the metaverse.
					</p>
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
							<td>{eggNumber}</td>
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
	{/if}
</main>

<style>
	@media print {
	    @page {
			size: auto;
	        margin-top: 160;
	        margin-bottom: 0;
	    }
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
	    height:100px;
		width: 240px;
	    font-size:2em;
	}
	#buttonid {
	    height:100px;
		width: 160px;
	    font-size:2em;
	}
	.shill {
		margin-top: 8em;
	}
	.shilllinefirst {
		padding-bottom: 8px;
		font-weight: 400;
	}
	.shillline {
		padding-bottom: 8px;
		font-weight: 600;
	}
	.displaybox {
		height: 842px;
		width: 719px;
	}
	.eggImage {
		max-width:100%;
		max-height:100%;
	}
	.descriptionSection {
		height: 247px;
		width: 719px;
	}
	.row1 {
		display: flex;
	}
	.row2 {
		display: flex;
		padding-top: 4px;
	}
	.collectionSeries {
		border-left: 4px solid #AFAFAF;
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
	.qrCode {
		flex: 0.4;
		margin-top: 25px;
	}
	.eggNum {
		margin-top: 12px;
		flex: 0.4;
		font-weight: 550;
		font-size: 4.35em;
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
