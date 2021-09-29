<script>
import { onMount } from "svelte";
//import { QRCode } from 'qrcode';
import QrCode from "svelte-qrcode"
import { apiData, drinkNames } from './store.js';

	let imgSrc = "https://galaxy-eggs-images.s3.amazonaws.com/2k/jpg/3621.jpg";
	let qrSrc = 'https://opensea.io/assets/0xa08126f5e1ed91a635987071e6ff5eb2aeb67c48/1136'
	let description = "collection description";
	let collectionName = "Galaxy Eggs"; // hardcoded because name=GalaxyEggs
	let eggNumber = 1136;
	let series = "series";

onMount(async () => {
  fetch(`https://api.opensea.io/api/v1/assets?token_ids=${eggNumber}&order_direction=desc&offset=0&limit=1&collection=galaxyeggs9999`)
  .then(response => response.json())
  .then(data => {
		console.log(data);
		imgSrc = data.assets[0].image_original_url;
		description = data.assets[0].collection.description;
		series = data.assets[0].traits[0].value;
    apiData.set(data);
  }).catch(error => {
    console.log(error);
    return [];
  });
});
</script>

<main>
	<div class="topSection">
		Top Section
	</div>
	<div class="displaybox">
		<div><img class="eggImage" src={imgSrc} alt="egg image"/></div>
		<div class="descriptionSection">
			<div class='row1'>
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
		</div>
		<!-- <div><img class="qrCode" src={qrSrc} alt="qr code"/></div> -->
	</div>
	<!-- <div class="wrapper aligned">
	    <div class="box item1">
			<img class="center-fit" src={imgSrc} alt="qr code"/>
		</div>
	    <div class="box item2">
			<div class="collection">{collection}</div>
			<div class="series">{series}</div>
		</div>
	    <div class="box item3">#{eggNumber}</div>
	    <div class="box item4">(Art)ificial is an art studio that explores the boundaries of technology and art. Our first project is Galaxy Eggs - a generative collection of 9,999 Eggs of the metaverse that live on the Ethereum Blockchain. Our Art Director, Gal Barkan, has been creating futuristic and sci-fi art for the past 20 years - this collection is the culmination of a lifetime of work on one hand, and the beginning of a new chapter in taking part in the creation of the metaverse.</div>
	    <div class="box item5">table</div>
	</div> -->
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
	}
	.collectionSeries {
		border-left: 4px solid #AFAFAF;
		flex: 1;
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
		font-size: 5em;
	}
	.longDescription {
		flex: 0.4;
		font-weight: 550;
		font-size: 4em;
	}
	.tableArea {
		flex: 0.4;
		font-weight: 550;
		font-size: 4em;
	}
</style>
