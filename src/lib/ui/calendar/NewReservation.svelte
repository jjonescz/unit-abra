<script>
	import { parkingsTotal, parkingsMin } from '$lib/db.js';
	import { Modal, NumberInput, TimePicker, Form } from 'carbon-components-svelte';
	import { createEventDispatcher } from 'svelte';
	import { createReservation } from '$lib/calendar';
	import { toDate, differenceInMinutes, getHours } from 'date-fns';

	export let open; // Toggles modal visibility.
	export let slot; // Selected parking slot.
	export let start;
	$: end = Math.min(start + 1, 24);

	let authorization = 'Basic dGVhbTgudXppdmF0ZWwxOnRlYW04LUpXdGFr';

	const dispatchReservation = createEventDispatcher();
	function addReservation() {
		console.log(toDate(start));
		console.log(differenceInMinutes(start, end));

		if (createReservation(authorization, toDate(start), differenceInMinutes(start, end), slot)) {
			dispatchReservation('addReservation', {
				r: { slot: slot, start: start, duration: end - start }
				//r: { slot: slot, start: start, duration: end - start }
			});
			alert(`Reservation for........`);
			open = false;
		} else {
			alert('Your reservation could not be created, please try again.');
		}
	}
</script>

<Modal
	bind:open
	modalHeading="New reservation {getHours(start)} - {end}"
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:open
	on:close
	on:submit={addReservation}
>
	<Form on:submit={addReservation}>
		<NumberInput
			bind:value={slot}
			mobile
			min={parkingsMin}
			max={parkingsMin + parkingsTotal}
			label="Parking slot"
		/>
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
