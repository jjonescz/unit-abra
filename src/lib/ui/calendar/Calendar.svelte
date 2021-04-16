<script>
	import { getReservations } from '$lib/calendar';
	import { parkingsMin, parkingsTotal } from '$lib/db.js';
	import CalendarReservation from '$lib/ui/calendar/CalendarReservation.svelte';
	import DeleteReservation from '$lib/ui/calendar/DeleteReservation.svelte';
	import NewReservation from '$lib/ui/calendar/NewReservation.svelte';
	import { Button } from 'carbon-components-svelte';
	import { ChevronLeftGlyph, ChevronRightGlyph } from 'carbon-icons-svelte';
	import {
		format,
		getHours,
		parseISO,
		setHours,
		setMinutes,
		addDays,
		subDays,
		isBefore
	} from 'date-fns';
	import { browser } from '$app/env';

	let date = new Date();
	export let user = {};

	let reservations = {};

	// Display reservations.
	async function dayReservations(date) {
		console.log(reservations);
		for (const [_, r] of Object.entries(reservations)) {
			r.$destroy();
		}
		const data = await getReservations(user.authorization, date);
		console.log(data);
		data.forEach((r) => {
			r.start = parseISO(r.start);
			displayReservation(r);
		});
	}
	$: if (browser) {
		dayReservations(date);
	}

	function displayReservation(r) {
		const hour = isBefore(r.start, date) ? 0 : getHours(r.start);
		console.log(hour);

		const component = new CalendarReservation({
			target: document.querySelector(`[data-id="${r.slot}-${hour}"`),
			hydrate: true,
			props: { r, date }
		});
		component.$on('clicked', function (e) {
			delR = e.detail.r;
			newOpen = false; // Close if opened.
			delOpen = true;
			toDelete = this;
		});
		reservations[r.id] = component;
	}

	// Create new reservations.
	let newOpen = false;
	let newslot;
	let newStart = 0;

	function createReservation(slot, start) {
		newslot = slot;
		newStart = start;
		newOpen = true && !delOpen; // We don't want to open both modals.
	}

	// Add new reservation.
	function addReservation(e) {
		const r = e.detail.r;
		displayReservation(r);
	}

	// Delete existing reservations.
	let delOpen = false;
	let delR = {};
	let toDelete = {};
	function deleteReservation(e) {
		if (e.detail.delete) {
			toDelete.$destroy();
			delete reservations[delR.id];
		}
		toDelete = {};
	}
</script>

<!-- Date selection. -->
<div class="date-navigation">
	<Button
		kind="ghost"
		iconDescription="Prev"
		icon={ChevronLeftGlyph}
		on:click={() => {
			date = subDays(date, 1);
		}}
	/>
	<h6>{format(date, 'yyyy-MM-dd')}</h6>
	<Button
		kind="ghost"
		iconDescription="Next"
		icon={ChevronRightGlyph}
		on:click={() => {
			date = addDays(date, 1);
		}}
	/>
</div>

<div style="margin-bottom: 1rem; margin-left: 1rem;">
	<div>Click inside the calendar to create new reservation.</div>
	<div>Click on reservation to delete it.</div>
</div>

<!-- Calendar. -->
<table>
	<tr>
		<td />
		{#each [...Array(24)] as _, hour}
			<th scope="col">{hour}</th>
		{/each}
	</tr>
	{#each [...Array(parkingsTotal)] as _, slot}
		<tr>
			<th scope="row">{parkingsMin + slot}</th>
			{#each [...Array(24)] as _, hour}
				<!-- Mark table cells for positioning of reservations. -->
				<td
					data-id="{parkingsMin + slot}-{hour}"
					on:click={() => createReservation(parkingsMin + slot, hour)}
				/>
			{/each}
		</tr>
	{/each}
</table>
<NewReservation
	on:addReservation={addReservation}
	bind:open={newOpen}
	slot={newslot}
	startInput={setMinutes(setHours(date, newStart), 0)}
/>
<DeleteReservation bind:r={delR} bind:open={delOpen} on:deleteReservation={deleteReservation} />

<style lang="scss">
	table {
		width: 100vh;
		border-collapse: separate;
		border-spacing: 0;
	}

	th[scope='row'] {
		padding: 0.25rem;
	}

	td[data-id],
	th[scope='col'] {
		border-left: 1px solid grey;
		border-bottom: 1px solid grey;
		position: relative;
		width: 100 / 24 * 1%;
		min-width: 2rem;
	}

	.date-navigation {
		display: inline-flex;
		align-items: center;
	}
</style>
