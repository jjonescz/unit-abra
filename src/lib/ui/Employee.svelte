<script>
	import { reservations } from '$lib/server/employee';
	import { browser } from '$app/env';
	import {
		Button,
		DatePicker,
		DatePickerInput,
		Form,
		Tile,
		TimePicker,
		DatePickerSkeleton
	} from 'carbon-components-svelte';
	import { TrashCan16 } from 'carbon-icons-svelte';
	import dayjs from 'dayjs';
	import customParseFormatPlugin from 'dayjs/plugin/customParseFormat';
	import durationPlugin from 'dayjs/plugin/duration';
	import relativeTimePlugin from 'dayjs/plugin/relativeTime';

	dayjs.extend(customParseFormatPlugin);
	dayjs.extend(durationPlugin);
	dayjs.extend(relativeTimePlugin);

	let now = dayjs(new Date());

	// User inputs
	let dateInput = now.format('YYYY-MM-DD');
	let timeInput = now.format('H:mm');
	let durationInput = '1:00';

	// Validation
	$: date = dayjs(dateInput, 'YYYY-MM-DD', true);
	$: time = dayjs(timeInput, ['HH:mm', 'H:mm'], true);
	$: duration = dayjs(durationInput, ['HH:mm', 'H:mm'], true);

	$: timeDur = toDuration(time);
	$: durationDur = toDuration(duration);
	$: fullDate = date.startOf('day').add(timeDur);

	function toDuration(date) {
		return dayjs.duration(date.diff(date.startOf('day')));
	}
</script>

<h2>New reservation</h2>

<Form>
	{#if browser}
		<DatePicker datePickerType="single" dateFormat="Y-m-d" minDate={now} bind:value={dateInput}>
			<DatePickerInput labelText="Date" placeholder="yyyy-mm-dd" pattern=".*" />
		</DatePicker>
	{:else}
		<DatePickerSkeleton />
	{/if}
	<TimePicker labelText="Time" bind:value={timeInput} pattern=".*" />
	<TimePicker labelText="Duration" bind:value={durationInput} pattern=".*" />
	<p>
		Selected time {timeDur.humanize()}, duration {durationDur.humanize()}. Date: {fullDate.format(
			'YYYY-MM-DD HH:mm'
		)}.
	</p>
	<Button
		type="submit"
		on:click={() =>
			reservations.update((r) => {
				r.unshift({
					start: fullDate,
					duration: durationDur.asMinutes(),
					slot: 100 + Math.round(Math.random() * 20)
				});
				return r;
			})}
	>
		Reserve
	</Button>
</Form>

<h2>Your reservations</h2>

{#each $reservations as r, i}
	<Tile>
		<div>
			{r.slot}: {r.start.format('YYYY-MM-DD HH:mm')} for {r.duration} minutes
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
