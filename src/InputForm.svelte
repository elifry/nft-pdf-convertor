<script>
	import { Route, Link } from "svelte-navigator";
	import { eggNumber, generateEgg, web3Address, ethAddress } from './stores.js';
</script>

<div class="InputForm">
    <div class="container">
    	<div class="topSection">
    		<div class="intro">
    			Turn your Galaxy Eggs into a nice printable PDF!
    		</div>
    		<form on:submit|preventDefault={generateEgg}>
    			<input id="textboxid" bind:value={$eggNumber} type=number placeholder='#' autoComplete="off"/>
    			<button id="buttonid" type="submit" disabled={!$eggNumber} class="btn btn__primary btn__lg">Generate</button>
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
    			<div class="shillline">{web3Address}</div>
    			<div class="shillline">{ethAddress}</div>
    			<a href="https://twitter.com/acuriousother?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @acuriousother</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    		</div>
    	</div>
    </div>
</div>

<style>
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
.shill {
	margin-top: 7em;
}
.shilllinefirst {
	padding-bottom: 8px;
	font-weight: 400;
}
.shillline {
	padding-bottom: 8px;
	font-weight: 600;
}
</style>
