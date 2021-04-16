<script>
	import { browser } from '$app/env';
	import {
		Button,
		DatePicker,
		DatePickerInput,
		DatePickerSkeleton,
		Form,
		SkeletonPlaceholder,
		Tile,
		TimePicker
	} from 'carbon-components-svelte';
	import { TrashCan16, WatsonHealthRotate_36016 } from 'carbon-icons-svelte';
	import { differenceInMinutes, format, isValid, parse, startOfDay } from 'date-fns';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const reservations = writable(null);

	export let user;

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

	async function loadReservations() {
		// Load reservations from server.
		const query = new URLSearchParams({
			user: user.username
		});
		const response = await fetch(`/employee/reservations.json?${query}`, {
			headers: {
				authorization: user.authorization
			}
		});

		// Update UI.
		if (response.ok) {
			const data = await response.json();
			reservations.set(data);
		}
	}
	onMount(() => loadReservations());

	async function createReservation() {
		// Create new reservation on server.
		const query = new URLSearchParams({
			user: user.username
		});
		const reservation = {
			start: dateTime,
			duration: minutes
		};
		const response = await fetch(`/employee/reservations.json?${query}`, {
			method: 'PUT',
			headers: {
				authorization: user.authorization
			},
			body: JSON.stringify(reservation)
		});

		// Update UI.
		if (response.ok) {
			const data = await response.json();
			reservations.update((r) => {
				r.push({
					...reservation,
					...data
				});

				// Sort by start date ascending.
				r.sort((a, b) => differenceInMinutes(new Date(a.start), new Date(b.start)));

				return r;
			});
		}
	}

	async function deleteReservation(id) {
		// Delete reservation on server.
		const query = new URLSearchParams({
			id: id,
			user: user.username
		});
		const response = await fetch(`/employee/reservations.json?${query}`, {
			method: 'DELETE',
			headers: {
				authorization: user.authorization
			}
		});

		// Update UI.
		if (response.ok) {
			reservations.update((r) => {
				r.splice(
					r.findIndex((x) => x.id === id),
					1
				);
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
		<TimePicker
			labelText="Time"
			bind:value={timeInput}
			pattern=".*"
			invalid={!isValid(dateTime)}
			invalidText="Invalid time."
		/>
		<TimePicker
			labelText="Duration"
			bind:value={durationInput}
			pattern=".*"
			invalid={durationTooLong || isNaN(minutes)}
			invalidText={durationTooLong ? 'You can reserve at most 8 hours.' : 'Invalid duration.'}
		/>
	{:else}
		<DatePickerSkeleton />
		<DatePickerSkeleton />
		<DatePickerSkeleton />
	{/if}
	<Button type="submit" on:click={createReservation}>Reserve</Button>
</Form>

<h2>Your reservations</h2>
<Button
	kind="tertiary"
	iconDescription="Refresh"
	icon={WatsonHealthRotate_36016}
	on:click={() => loadReservations()}
/>

{#if $reservations == null}
	<SkeletonPlaceholder style="width: 100%; height: 2rem;" />
{:else}
	{#each $reservations as r (r.id)}
		<Tile>
			<div>
				{r.slot}: {format(new Date(r.start), 'yyyy-MM-dd HH:mm')} for {r.duration} minutes
			</div>
			<div>
				<Button
					kind="danger-tertiary"
					iconDescription="Delete"
					icon={TrashCan16}
					on:click={() => deleteReservation(r.id)}
				/>
			</div>
		</Tile>
	{:else}
		<em>No reservations yet.</em>
	{/each}
{/if}
