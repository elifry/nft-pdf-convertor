<script>
import { onMount } from "svelte";
import QrCode from "svelte-qrcode";
import { apiData, drinkNames } from './store.js';

	let imgSrc = "https://galaxy-eggs-images.s3.amazonaws.com/2k/jpg/3621.jpg";
	let description = "collection description";
	let collectionName = "Galaxy Egg"; // hardcoded because name=GalaxyEggs
	let collectionNamePlural = "Galaxy Eggs"; // hardcoded because name=GalaxyEggs
	//let eggNumber = 6201;
	let eggNumber = "";
	let series = "series";
	let qrSrc = `https://opensea.io/assets/0xa08126f5e1ed91a635987071e6ff5eb2aeb67c48/`
	let generate = false;

	let htmlOutput = `<main>
		<div class="displaybox">
			<div><img class="eggImage" src=${imgSrc} alt="egg image"/></div>
			<div class="descriptionSection">
				<div class="row1">
					<div class="collectionSeries">
						<div class="collectionName">${series}</div>
						<div class="series">${collectionName}</div>
					</div>
					<div class="qrCode">
						<QrCode value=${qrSrc} size="70" />
					</div>
					<div class="eggNum">
						#${eggNumber}
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
								<td>${collectionNamePlural}</td>
							</tr>
							<tr>
								<th>Series</th>
								<td>${series}</td>
							</tr>
							<tr>
								<th>Token ID</th>
								<td>${eggNumber}</td>
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
		</main>

		<style>
			.topSection {
				height: 5em;
			}
			.displaybox {
				height: 842px;
				width: 595px;
			}
			.eggImage {
				max-width:100%;
				max-height:100%;
			}
			.descriptionSection {
				height: 247px;
				width: 595px;
			}
			.row1 {
				display: flex;
			}
			.row2 {
				display: flex;
				padding-top: 0px;
			}
			.collectionSeries {
				border-left: 4px solid #AFAFAF;
				flex: 1.18;
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
				margin-top: 10px;
				flex: 0.4;
				font-weight: 550;
				font-size: 4.5em;
			}
			.longDescription {
				flex: 0.4;
				font-weight: 550;
				font-size: 4em;
			}
			.description {
				flex: 0.7
			}
			p {
				text-align: justify;
				text-justify: inter-word;
				font-size: 0.86em;
			}
			.tableData {
				flex: 0.4;
				margin-left: 27px;
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
				width: 110px;
				padding-top: 2px;
			}
			.mainRowBorder {

			}
		</style>
	`;

const generateEgg = (async () => {
  fetch(`https://api.opensea.io/api/v1/assets?token_ids=${eggNumber}&order_direction=desc&offset=0&limit=1&collection=galaxyeggs9999`)
  .then(response => response.json())
  .then(data => {
		console.log(data);
		qrSrc += eggNumber;
		imgSrc = data.assets[0].image_original_url;
		description = data.assets[0].collection.description;
		series = data.assets[0].traits[0].value;
		apiData.set(data);
		generate = true;
		console.log(htmlOutput);
  }).catch(error => {
    console.log(error);
    return [];
  });
});
</script>

<main>
	<div class="topSection">
		Turn your Galaxy Eggs into a nice printable PDF!
		{#if !generate}
		<form on:submit|preventDefault={generateEgg} on:keydown={e => e.key === 'Escape' && onCancel()}>
			<input bind:value={eggNumber} type="text" autoComplete="off"/>
			<button type="submit" disabled={!eggNumber} class="btn btn__primary btn__lg">Generate</button>
		</form>
		{/if}
	</div>
	{#if generate}
	<div class="displaybox">
		<div><img class="eggImage" src={imgSrc} alt="egg image"/></div>
		<div class="descriptionSection">
			<div class="row1">
				<div class="collectionSeries">
					<div class="collectionName">{series}</div>
					<div class="series">{collectionName}</div>
				</div>
				<div class="qrCode">
					<QrCode value={qrSrc} size="70" />
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
	.topSection {
		height: 5em;
	}
	.displaybox {
		height: 842px;
		width: 595px;
	}
	.eggImage {
		max-width:100%;
		max-height:100%;
	}
	.descriptionSection {
		height: 247px;
		width: 595px;
	}
	.row1 {
		display: flex;
	}
	.row2 {
		display: flex;
		padding-top: 0px;
	}
	.collectionSeries {
		border-left: 4px solid #AFAFAF;
		flex: 1.18;
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
		margin-top: 10px;
		flex: 0.4;
		font-weight: 550;
		font-size: 4.2em;
		font-family: Monaco, sans-serif;
	}
	.longDescription {
		flex: 0.4;
		font-weight: 550;
		font-size: 4em;
	}
	.description {
		flex: 0.7
	}
	p {
		text-align: justify;
		text-justify: inter-word;
		font-size: 0.86em;
	}
	.tableData {
		flex: 0.4;
		margin-left: 27px;
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
		width: 110px;
		padding-top: 2px;
	}
	.mainRowBorder {

	}
</style>
