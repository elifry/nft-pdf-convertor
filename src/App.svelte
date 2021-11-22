<script context="module">
import { onMount } from "svelte";
import { Router, Route, Link } from "svelte-navigator";
import InputForm from "./InputForm.svelte";
import Output from "./Output.svelte";
import BackButton from "./BackButton.svelte";
import ForwardButton from "./ForwardButton.svelte";

import "./styles/globals.css";
import "./styles/components.css";
// Default styles (macOS)
let mainWidth = '718px';
let eggNumSize = '4.35em';

// Import global variables
// import { eggNumber } from './stores.js';

document.title = 'Print your egg!';

</script>

<Router>
	<header>
		<h1>History</h1>

		<nav>
			<BackButton />
			<ForwardButton />
			<Link to="/">Base</Link>
			<Link to="inputForm">InputForm</Link>
			<Link to="output">Output</Link>
		</nav>
	</header>
	<main>
		<Route>
			<p>This is where the tiles for each collection will be shown</p>
		</Route>

		<Route path="inputForm" component={InputForm}/>

		<Route path="output" component={Output}/>
	</main>
</Router>
