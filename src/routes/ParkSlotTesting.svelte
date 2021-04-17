<script>
	import { Button, TextArea, Tile } from 'carbon-components-svelte';
	import { add, differenceInMinutes, formatISO } from 'date-fns';	
	//import { getFreeSlot } from '$lib/server/parkSlotSelection.js';
	//uncomment this for testing in login screen
    
    let textAreaText = "Initial text";

    async function setText(text) {
		if (text === "")
			text = await getFreeSlot(new Date('2021-04-17T13:00:00'), 60);
		textAreaText = text;
	}

</script>

<div style="padding: 2rem;">
	<Tile>
		<Button kind="primary" on:click={() => setText('Basic dGVhbTgudXppdmF0ZWwxOnRlYW04LUpXdGFr')}>Don't Click Me ;)</Button>
		<Button kind="primary" on:click={() => setText("")}>Click Me ;)</Button>
        <TextArea labelText="Text area" placeholder="Enter a description..." value={textAreaText}/>
	</Tile>
</div>

