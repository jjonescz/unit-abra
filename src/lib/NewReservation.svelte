<script>
	import { parkingSpots } from '$lib/db.js';
	import { Modal, NumberInput, TimePicker, Form } from 'carbon-components-svelte';

	export let open; // Toggles modal visibility.
	export let spot; // Selected parking spot.
	export let start;
	export let duration = 1;

	export let r = { spot: 0, start: 0, duration: 0 };

	function createReservation() {
		// TODO: request delete via API.
		alert(spot);
	}
</script>

<Modal
	bind:open
	modalHeading="New reservation {r.start} - {r.start + r.duration}"
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:open
	on:close
	on:submit={createReservation}
>
	<Form on:submit={createReservation}>
		<NumberInput mobile min={1} max={parkingSpots} value={spot} label="Parking spot" />
		<TimePicker value={start} labelText="Start" placeholder="hh:mm" />
		<TimePicker value={start + duration} labelText="End" placeholder="hh:mm" />
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
