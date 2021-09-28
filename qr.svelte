<script>
	import { onMount } from 'svelte';
	import jQuery from 'jquery';
	import editormd from 'editor.md/editormd';

	export let content = "# Edit!";

	onMount(() => {
		window.jQuery = jQuery;
		var factory = editormd();
		var editor = factory(jQuery("editor"), {
			width: "90%",
			height: 640
		});
		function htmlEncode(value) {
      return jQuery('<div/>').text(value)
        .html();
    }
		jQuery(function () {

      // Specify an onclick function
      // for the generate button
      jQuery('#generate').click(function () {

        // Generate the link that would be
        // used to generate the QR Code
        // with the given data
        let finalURL =
'https://chart.googleapis.com/chart?cht=qr&chl=' +
          htmlEncode(jQuery('#content').val()) +
          '&chs=160x160&chld=L|0'

        // Replace the src of the image with
        // the QR code image
        jQuery('.qr-code').attr('src', finalURL);
      });
    });
	});
</script>

<style>
	@import "https://unpkg.com/editor.md/css/editormd.css";
</style>

<p>
	check the console — it's failing to load some CodeMirror resources
</p>
<div id="editor">
	<textarea bind:value={content}></textarea>
</div>
  <div class="container-fluid">
    <div class="text-center">

      <!-- Get a Placeholder image initially,
       this will change according to the
       data entered later -->
      <img src=
"https://chart.googleapis.com/chart?cht=qr&chl=Hello+World&chs=160x160&chld=L|0"
        class="qr-code img-thumbnail img-responsive"
					 alt="qr code"/>
    </div>

    <div class="form-horizontal">
      <div class="form-group">
        <label class="control-label col-sm-2"
          for="content">
          Content:
        </label>
        <div class="col-sm-10">

          <!-- Input box to enter the
              required data -->
          <input type="text" size="60"
            maxlength="60" class="form-control"
            id="content" placeholder="Enter content" />
        </div>
      </div>
      <div class="form-group">
        <div class="col-sm-offset-2 col-sm-10">

          <!-- Button to generate QR Code for
           the entered data -->
          <button type="button" class=
            "btn btn-default" id="generate">
            Generate
          </button>
        </div>
      </div>
    </div>
  </div>
