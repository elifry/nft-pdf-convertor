<script>
import { onMount } from 'svelte';

export let codeValue;
export let squareSize;
export let color;

let qrcode;

onMount(() => {
    let script = document.createElement('script');
    script.src = "https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"
    document.head.append(script);

    script.onload = function() {
        qrcode = new QRCode("qrcode", {
            text: codeValue,
            width: squareSize,
            height: squareSize,
            colorDark : color,
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    };

});
</script>

<style>
#qrcode {
    width:20px;
    height:200x;
}
</style>

<div id="qrcode"></div>
