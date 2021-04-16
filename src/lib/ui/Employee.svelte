<script>
	import { browser } from '$app/env';
	import {
		Button,
		DatePicker,
		DatePickerInput,
		DatePickerSkeleton,
		Form,
		Tile,
		TimePicker
	} from 'carbon-components-svelte';
	import { TrashCan16 } from 'carbon-icons-svelte';
	import { differenceInMinutes, format, parse, startOfDay } from 'date-fns';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const reservations = writable([]);

	const now = new Date();
	const minDate = format(now, 'yyyy-MM-dd');

	// User inputs
	let dateInput = format(now, 'yyyy-MM-dd');
	let timeInput = format(now, 'H:mm');
	let durationInput = '1:00';

	// Parsing
	$: date = parse(dateInput, 'yyyy-MM-dd', now);
	$: dateTime = parse(timeInput, 'H:mm', date);
	$: minutes = totalMinutes(parse(durationInput, 'H:mm', now));

	// Validation
	$: durationTooLong = minutes > 8 * 60;

	function totalMinutes(date) {
		return differenceInMinutes(date, startOfDay(date));
	}

	// Load reservations from server.
	onMount(async () => {
		const query = new URLSearchParams({
			user: 'team8.uzivatel1'
		});
		const response = await fetch(`/employee/reservations.json?${query}`, {
			headers: {
				authorization: 'Basic dGVhbTgudXppdmF0ZWwxOnRlYW04LUpXdGFr'
			}
		});
		if (response.ok) {
			const data = await response.json();
			reservations.set(data);
		}
	});

	async function createReservation() {
		// Create new reservation on server.
		const query = new URLSearchParams({
			user: 'team8.uzivatel1'
		});
		const reservation = {
			start: dateTime,
			duration: minutes
		};
		const response = await fetch(`/employee/reservations.json?${query}`, {
			method: 'PUT',
			headers: {
				authorization: 'Basic dGVhbTgudXppdmF0ZWwxOnRlYW04LUpXdGFr'
			},
			body: JSON.stringify(reservation)
		});

		// Update UI.
		if (response.ok) {
			const data = await response.json();
			reservations.update((r) => {
				r.unshift({
					...reservation,
					...data
				});
				return r;
			});
		}
	}
</script>

<h2>New reservation</h2>

<Form>
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
	<p>
		Selected time {dateInput} => {dateTime} for {minutes} minutes.
	</p>
	<Button type="submit" on:click={createReservation}>Reserve</Button>
</Form>

<h2>Your reservations</h2>

{#each $reservations as r, i}
	<Tile>
		<div>
			{r.slot}: {format(new Date(r.start), 'yyyy-MM-dd HH:mm')} for {r.duration} minutes
		</div>
		<div>
			<Button
				kind="danger-tertiary"
				iconDescription="Delete"
				icon={TrashCan16}
				on:click={() =>
					reservations.update((r) => {
						r.splice(i, 1);
						return r;
					})}
			/>
		</div>
	</Tile>
{:else}
	<em>No reservations yet.</em>
{/each}
