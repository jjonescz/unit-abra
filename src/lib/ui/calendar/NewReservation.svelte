<script>
	import { parkingslots } from '$lib/db.js';
	import { Modal, NumberInput, TimePicker, Form } from 'carbon-components-svelte';
	import { createEventDispatcher } from 'svelte';

	export let open; // Toggles modal visibility.
	export let slot; // Selected parking slot.
	export let start;
	$: end = Math.min(start + 1, 24);

	const dispatchReservation = createEventDispatcher();
	function createReservation() {
		// TODO: request insert via API.
		dispatchReservation('addReservation', {
			r: { slot: slot, start: start, duration: end - start }
		});
		open = false;
	}
</script>

<Modal
	bind:open
	modalHeading="New reservation {start} - {end}"
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:open
	on:close
	on:submit={createReservation}
>
	<Form on:submit={createReservation}>
		<NumberInput bind:value={slot} mobile min={1} max={parkingslots} label="Parking slot" />
		<TimePicker bind:value={start} labelText="Start" placeholder="hh:mm" />
		<TimePicker bind:value={end} labelText="End" placeholder="hh:mm" />
	</Form>
</Modal>

<style lang="scss">
	button {
		height: 100%;
		width: 100%;
		background-color: transparent;
		border: 0;
		display: inline-block;
		text-decoration: none;
	}
</style>
