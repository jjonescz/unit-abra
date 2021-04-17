<script>
	import { browser } from '$app/env';
	import {
		Button,
		DatePicker,
		DatePickerInput,
		DatePickerSkeleton,
		InlineNotification,
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

	const isManager = user.role === 'MANAGER';

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

	// Errors
	let cannotDeleteFullSlot = false;

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
			const data = await response.json();
			if (data.success) {
				cannotDeleteFullSlot = false;
				reservations.update((r) => {
					r.splice(
						r.findIndex((x) => x.id === id),
						1
					);
					return r;
				});
			} else if (data.slotFull) {
				cannotDeleteFullSlot = true;
			}
		}
	}
</script>

<h2>
	{#if isManager}
		Release parking slot
	{:else}
		New reservation
	{/if}
</h2>

<div class="group">
	{#if browser}
		<DatePicker datePickerType="single" dateFormat="Y-m-d" {minDate} bind:value={dateInput}>
			<DatePickerInput labelText="Date" placeholder="yyyy-mm-dd" pattern=".*" />
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
		</DatePicker>
	{:else}
		<DatePickerSkeleton />
	{/if}
</div>
<div class="group">
	<Button type="submit" on:click={createReservation}>
		{#if isManager}
			Release
		{:else}
			Reserve
		{/if}
	</Button>
</div>

<h2 style="margin-top: 2rem; margin-bottom: 1rem;">
	<span style="margin-right: 0.5rem;">
		{#if isManager}
			Your releases
		{:else}
			Your reservations
		{/if}
	</span>
	<Button
		kind="tertiary"
		iconDescription="Refresh"
		icon={WatsonHealthRotate_36016}
		on:click={() => {
			reservations.set(null);
			loadReservations();
		}}
	/>
</h2>

{#if cannotDeleteFullSlot}
	<InlineNotification
		lowContrast
		title="Cannot delete:"
		subtitle="Cannot manipulate with occupied parking slot."
	/>
{/if}

{#if $reservations == null}
	<SkeletonPlaceholder style="width: 100%; height: 5rem;" />
{:else}
	{#each $reservations as r (r.id)}
		<Tile style="margin-bottom: 0.5rem;">
			<div class="reservation">
				<div class="slot">
					{r.slot}
				</div>
				<div class="time">
					{format(new Date(r.start), 'yyyy-MM-dd HH:mm')}
				</div>
				<div class="duration">
					{r.duration} minute{r.duration === 1 ? '' : 's'}
				</div>
				<div class="delete">
					<Button
						kind="danger-tertiary"
						iconDescription="Delete"
						icon={TrashCan16}
						on:click={() => deleteReservation(r.id)}
					/>
				</div>
			</div>
		</Tile>
	{:else}
		<em>
			{#if isManager}
				No upcoming releases.
			{:else}
				No upcoming reservations.
			{/if}
		</em>
	{/each}
{/if}

<style lang="scss">
	.group {
		margin-bottom: 1rem;
	}

	:global(.bx--date-picker) {
		flex-wrap: wrap;
	}

	:global(.bx--date-picker > div) {
		margin-top: 0.5rem;
		margin-right: 0.125rem;
	}

	.reservation {
		display: flex;
		align-items: center;

		@media (max-width: 640px) {
			flex-wrap: wrap;
		}

		> div {
			padding-right: 1rem;

			@media (max-width: 640px) {
				flex: 1 0 auto;
			}
		}

		> .slot,
		> .duration {
			@media (max-width: 640px) {
				width: 30%;
			}
		}

		> .time,
		> .delete {
			@media (max-width: 640px) {
				width: 70%;
			}
		}

		> .slot {
			font-size: 3rem;

			@media (max-width: 640px) {
				font-size: 2rem;
			}
		}

		> .time {
			font-size: 1.5rem;

			@media (max-width: 640px) {
				font-size: 1rem;
			}
		}

		> .delete {
			margin-left: auto;
			text-align: right;
		}
	}
</style>
