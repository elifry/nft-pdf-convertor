<script>
	import { Route, Link } from "svelte-navigator";
    import QrCode from "svelte-qrcode";
	import { eggNumber, mainWidth, pad, imgSrc, qrSrc, series, collectionName, collectionNamePlural, longDescription, eggNumSize } from './stores.js';
</script>

<div class="Output">
    <div class="displaybox" style="--main-width: {mainWidth}">
    	<div><img class="eggImage" src={imgSrc} alt="galaxy egg"/></div>
    	<div class="descriptionSection" style="--main-width: {mainWidth}">
    		<div class="row1">
    			<div class="collectionSeries">
    				<div class="collectionName">{series}</div>
    				<div class="series">{collectionName}</div>
    			</div>
    			<div class="qrCode">
    				<QrCode value={qrSrc} size="75" />
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
.displaybox {
	height: 842px;
	width: var(--main-width);
}
.eggImage {
	max-width:100%;
	max-height:100%;
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
