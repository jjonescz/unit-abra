<script>
	import { reservations } from '$lib/server/employee';
	import { browser } from '$app/env';
	import {
		Button,
		DatePicker,
		DatePickerInput,
		Form,
		FluidForm,
		Tile,
		TimePicker
	} from 'carbon-components-svelte';
	import { TrashCan16 } from 'carbon-icons-svelte';

	let now = new Date();
	let date = now.toISOString();
	let time = `${now.getHours()}:${now.getMinutes()}`;
	let duration = '1:00';
</script>

<h2>New reservation</h2>

<Form>
	{#if browser}
		<DatePicker datePickerType="single" dateFormat="Y-m-d" minDate={now} bind:value={date}>
			<DatePickerInput labelText="Date" placeholder="yyyy-mm-dd" pattern=".*" />
		</DatePicker>
	{/if}
	<TimePicker labelText="Time" bind:value={time} />
	<TimePicker labelText="Duration" bind:value={duration} />
	<Button
		type="submit"
		on:click={() =>
			reservations.update((r) => {
				const s = `${new Date(date).toDateString()} ${time}`;
				r.unshift({
					start: new Date(s),
					duration: 60,
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
			{r.slot}: {r.start} for {r.duration} minutes
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
