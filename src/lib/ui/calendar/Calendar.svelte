<script>
	import { parkingSpots } from '$lib/db.js';
	import { Button } from 'carbon-components-svelte';
	import { ChevronLeftGlyph, ChevronRightGlyph } from 'carbon-icons-svelte';
	import { onMount } from 'svelte';
	import CalendarReservation from '$lib/ui/calendar/CalendarReservation.svelte';
	import DeleteReservation from '$lib/ui/calendar/DeleteReservation.svelte';
	import NewReservation from '$lib/ui/calendar/NewReservation.svelte';

	let dayReservations = [
		{ spot: 1, start: 9, duration: 8 },
		{ spot: 3, start: 9, duration: 3 },
		{ spot: 3, start: 1, duration: 3 },
		{ spot: 4, start: 1, duration: 3 },
		{ spot: 5, start: 10, duration: 3 },
		{ spot: 6, start: 15, duration: 3 },
		{ spot: 7, start: 1, duration: 3 },
		{ spot: 8, start: 12, duration: 3 },
		{ spot: 9, start: 1, duration: 3 },
		{ spot: 13, start: 1, duration: 3 },
		{ spot: 15, start: 1, duration: 3 },
		{ spot: 20, start: 15, duration: 3 },
		{ spot: 16, start: 18, duration: 3 },
		{ spot: 5, start: 19, duration: 3 }
	];

	// Display reservations.
	onMount(async () => {
		dayReservations.forEach((r) => {
			displayReservation(r);
		});
	});

	function displayReservation(r) {
		new CalendarReservation({
			target: document.querySelector(`[data-id="${r.spot}-${r.start}"`),
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
	let newSpot = false;
	let newStart = false;

	function createReservation(spot, start) {
		newOpen = true && !delOpen; // We don't want to open both modals.
		newSpot = spot;
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
	{#each [...Array(parkingSpots)] as _, spot}
		<tr>
			<th scope="row">{spot + 1}</th>
			{#each [...Array(24)] as _, hour}
				<!-- Mark table cells for positioning of reservations. -->
				<td
					data-id="{spot + 1}-{hour + 1}"
					on:click={() => createReservation(spot + 1, hour + 1)}
				/>
			{/each}
		</tr>
	{/each}
</table>
<NewReservation
	on:addReservation={addReservation}
	bind:open={newOpen}
	spot={newSpot}
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
