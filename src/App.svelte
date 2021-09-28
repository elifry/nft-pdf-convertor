<script>
import { onMount } from "svelte";
import { apiData, drinkNames } from './store.js';

	let imgSrc = "https://galaxy-eggs-images.s3.amazonaws.com/2k/jpg/3621.jpg";
	let description = "collection description";
	let name = "Galaxy Eggs"; // hardcoded because name=GalaxyEggs
	let eggNumber = 6201;
	let series = "series";

onMount(async () => {
  fetch("https://api.opensea.io/api/v1/assets?token_ids=6201&order_direction=desc&offset=0&limit=1&collection=galaxyeggs9999")
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
	<!-- <div class="displaybox">
		<h1>Galaxy Eggs PDF Generator</h1>
		<div class="imgbox">
		    <img class="center-fit" src={imgSrc} alt="qr code"/>
		</div>
		<p>{name}</p>
		<p>{series}</p>
		<p>{description}</p>
	</div> -->
	<div class="wrapper aligned">
	    <div class="box item1">
			<img class="center-fit" src={imgSrc} alt="qr code"/>
		</div>
	    <div class="box item2">{name} {series}</div>
	    <div class="box item3">#{eggNumber}</div>
	    <div class="box item4">(Art)ificial is an art studio that explores the boundaries of technology and art. Our first project is Galaxy Eggs - a generative collection of 9,999 Eggs of the metaverse that live on the Ethereum Blockchain. Our Art Director, Gal Barkan, has been creating futuristic and sci-fi art for the past 20 years - this collection is the culmination of a lifetime of work on one hand, and the beginning of a new chapter in taking part in the creation of the metaverse.</div>
	    <div class="box item5">table</div>
	</div>
</main>

<style>
	* {
	    margin: 0;
	    padding: 0;
	}
	.displaybox {
	    display: grid;
	    height: 100%;
	}
	.imgbox {
	    display: grid;
	    height: 30%;
	}
	.center-fit {
	    max-width: 100%;
	    max-height: 100vh;
	    margin: auto;
	}
	html {
	  box-sizing: border-box;
	}
	*, *:before, *:after {
	  box-sizing: inherit;
	}

	body {
	  margin: 40px;
	}

	.wrapper {
	  margin: auto;
	  width: 500px;
	  height: 100vh;
	  display: grid;
	  grid-gap: 4px;
	  grid-template-columns: 2fr 2fr 1fr 1fr;
	  grid-template-rows: 2fr 1fr 1fr;
	  align-content: space-around;
	  justify-content: space-between;
	}
	.box {
	  padding: 20px;
	  font-size: 150%;
	}
	.item1 {
	  grid-column: 1 / 5;
	}
	.item2 {
	  grid-column: 1 / 3;
	}
	.item3 {
	  grid-column: 3 / 5;
	}
	.item4 {
	  grid-column: 1 / 3;
	  font-size: 0.875em;
	}
	.item5 {
	  grid-column: 3 / 5;
	}
</style>
