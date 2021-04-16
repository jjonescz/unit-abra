<script>
	import { browser } from '$app/env';
	import { createReservation } from '$lib/calendar';
	import { parkingsMin, parkingsTotal } from '$lib/db.js';
	import {
		DatePicker,
		DatePickerInput,
		DatePickerSkeleton,
		Form,
		Modal,
		NumberInput,
		TimePicker
	} from 'carbon-components-svelte';
	import { differenceInMinutes, format, parse, startOfDay, toDate } from 'date-fns';
	import { createEventDispatcher } from 'svelte';

	export let open; // Toggles modal visibility.
	export let slot; // Selected parking slot.
	export let startInput;

	let authorization = 'Basic dGVhbTgudXppdmF0ZWwxOnRlYW04LUpXdGFr';

	const dispatchReservation = createEventDispatcher();
	function addReservation() {
		if (createReservation(authorization, start, minutes, slot)) {
			console.log(start);

			dispatchReservation('addReservation', {
				// TODO: Return ID!
				r: { slot: slot, start: start, duration: minutes }
			});
			alert(`Reservation for........`);
			open = false;
		} else {
			alert('Your reservation could not be created, please try again.');
		}
	}

	const now = new Date();
	const minDate = format(now, 'yyyy-MM-dd');

	// User inputs
	let dateInput;
	let timeInput;
	let durationInput = '1:00';

	// Parsing
	$: date = parse(dateInput, 'yyyy-MM-dd', now);
	$: start = parse(timeInput, 'H:mm', date);
	$: minutes = totalMinutes(parse(durationInput, 'H:mm', now));

	// Validation.
	$: durationTooLong = minutes > 8 * 60;

	function totalMinutes(date) {
		return differenceInMinutes(date, startOfDay(date));
	}
</script>

<Modal
	bind:open
	modalHeading="New reservation"
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:open={() => {
		dateInput = format(startInput, 'yyyy-MM-dd');
		timeInput = format(startInput, 'H:mm');
	}}
	on:close
	on:submit={addReservation}
>
	<Form on:submit={addReservation}>
		{#if browser}
			<DatePicker datePickerType="single" dateFormat="Y-m-d" {minDate} bind:value={dateInput}>
				<DatePickerInput labelText="Date" placeholder="yyyy-mm-dd" pattern=".*" />
			</DatePicker>
		{:else}
			<DatePickerSkeleton />
		{/if}
		<TimePicker labelText="Time" bind:value={timeInput} pattern=".*" />
		<TimePicker
			labelText="Duration"
			bind:value={durationInput}
			pattern=".*"
			invalid={durationTooLong}
			invalidText={durationTooLong ? 'You can reserve at most 8 hours.' : null}
		/>
		<NumberInput
			bind:value={slot}
			min={parkingsMin}
			max={parkingsMin + parkingsTotal}
			label="Parking slot"
			invalidText={`Only ${parkingsMin} to ${parkingsMin + parkingsTotal}.`}
		/>
	</Form>
</Modal>
