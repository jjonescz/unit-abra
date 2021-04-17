<script>
	import { browser } from '$app/env';
	import { createReservation } from '$lib/calendar';
	import {
		DatePicker,
		DatePickerInput,
		DatePickerSkeleton,
		Form,
		Modal,
		NumberInput,
		Select,
		SelectItem,
		TimePicker
	} from 'carbon-components-svelte';
	import { differenceInMinutes, format, parse, startOfDay } from 'date-fns';
	import { createEventDispatcher } from 'svelte';

	export let slots = [];
	$: parkingsMin = slots[0].kod || 0;
	$: parkingsTotal = slots.length;

	export let open; // Toggles modal visibility.
	export let slot; // Selected parking slot.
	export let typ; // Whether we are freeing or booking the slot.
	export let startInput;

	export let authorization = '';

	const dispatchReservation = createEventDispatcher();
	async function addReservation() {
		// TODO: Exctract from API (zodpPrac).
		if (typ === 'MANAGER') {
			userInput = `manager${slot % 10}`;
		}
		const res = await createReservation(authorization, start, minutes, slot, userInput);
		if (res !== false) {
			dispatchReservation('addReservation', {
				r: { id: res.id, slot: slot, start: start, duration: minutes }
			});
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
	let userInput = 'navsteva';

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
	modalHeading="New reservation - {typ === 'ZAMESTNANEC' ? 'booking' : 'freeing'}"
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
		{#if typ === 'ZAMESTNANEC'}
			<Select labelText="User" bind:selected={userInput}>
				{#each [...Array(32)] as _, i}
					<SelectItem value={`uzivatel${i + 1}`} text={`uzivatel${i + 1}`} />
				{/each}
				<SelectItem value="navsteva" text="navsteva" />
				<SelectItem value="Recepcni" text="recepcni" />
			</Select>
		{/if}
	</Form>
</Modal>
