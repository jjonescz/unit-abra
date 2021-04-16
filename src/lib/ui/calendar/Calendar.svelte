<script>
	import { parkingsTotal, parkingsMin } from '$lib/db.js';
	import { Button } from 'carbon-components-svelte';
	import { ChevronLeftGlyph, ChevronRightGlyph } from 'carbon-icons-svelte';
	import { onMount } from 'svelte';
	import CalendarReservation from '$lib/ui/calendar/CalendarReservation.svelte';
	import DeleteReservation from '$lib/ui/calendar/DeleteReservation.svelte';
	import NewReservation from '$lib/ui/calendar/NewReservation.svelte';
	import { getReservations } from '$lib/calendar';
	import { getHours, getMinutes, parseISO } from 'date-fns';

	let date = new Date().toISOString();
	let authorization = 'Basic dGVhbTgudXppdmF0ZWwxOnRlYW04LUpXdGFr';

	// Display reservations.
	onMount(async () => {
		const data = await getReservations(authorization, date);
		console.log(data);
		data.forEach((r) => {
			displayReservation(r);
		});
	});

	function displayReservation(r) {
		new CalendarReservation({
			target: document.querySelector(`[data-id="${r.slot}-${getHours(parseISO(r.start))}"`),
			hydrate: true,
			props: { r }
		}).$on('clicked', function () {
			newOpen = false; // Close if opened.
			delOpen = true;
			toDelete = this;
		});
	}

	// Create new reservations.
	let newOpen = false;
	let newslot = false;
	let newStart = false;

	function createReservation(slot, start) {
		newOpen = true && !delOpen; // We don't want to open both modals.
		newslot = slot;
		newStart = start;
	}

	// Add new reservation.
	function addReservation(e) {
		const r = e.detail.r;
		displayReservation(r);
	}

	// Delete existing reservations.
	let delOpen = false;
	let toDelete = {};
	function deleteReservation(e) {
		if (e.detail.delete) {
			toDelete.$destroy();
		}
		toDelete = {};
	}
</script>

<!-- Date selection. -->
<div class="date-navigation">
	<Button kind="ghost" iconDescription="Prev" icon={ChevronLeftGlyph} />
	<h6>Today</h6>
	<Button kind="ghost" iconDescription="Next" icon={ChevronRightGlyph} />
</div>

<!-- Calendar. -->
<table>
	<tr>
		<td />
		{#each [...Array(24)] as _, hour}
			<th scope="col">{hour + 1}</th>
		{/each}
	</tr>
	{#each [...Array(parkingsTotal)] as _, slot}
		<tr>
			<th scope="row">{parkingsMin + slot}</th>
			{#each [...Array(24)] as _, hour}
				<!-- Mark table cells for positioning of reservations. -->
				<td
					data-id="{parkingsMin + slot}-{hour + 1}"
					on:click={() => createReservation(parkingsMin + slot, hour + 1)}
				/>
			{/each}
		</tr>
	{/each}
</table>
<NewReservation
	on:addReservation={addReservation}
	bind:open={newOpen}
	slot={newslot}
	start={newStart}
/>
<DeleteReservation bind:open={delOpen} on:deleteReservation={deleteReservation} />

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
