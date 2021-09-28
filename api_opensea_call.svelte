<script>
import { onMount } from "svelte";
import { apiData, drinkNames } from './store.js';

onMount(async () => {
  fetch("https://api.opensea.io/api/v1/assets?token_ids=3621&order_direction=desc&offset=0&limit=1&collection=galaxyeggs9999")
  .then(response => response.json())
  .then(data => {
		console.log(data);
    apiData.set(data);
  }).catch(error => {
    console.log(error);
    return [];
  });
});
</script>

<main>
	<h1>Whiskey Drinks Menu</h1>
	<ul>
	{#each $drinkNames as drinkName}
		<li>{drinkName}</li>
	{/each}
	</ul>
</main>

<style>

</style>
