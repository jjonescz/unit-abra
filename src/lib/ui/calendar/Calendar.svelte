<script>
	import { getReservations } from '$lib/calendar';
	import CalendarReservation from '$lib/ui/calendar/CalendarReservation.svelte';
	import DeleteReservation from '$lib/ui/calendar/DeleteReservation.svelte';
	import NewReservation from '$lib/ui/calendar/NewReservation.svelte';
	import { Button, InlineNotification } from 'carbon-components-svelte';
	import { ChevronLeftGlyph, ChevronRightGlyph } from 'carbon-icons-svelte';
	import {
		format,
		getHours,
		parseISO,
		setHours,
		setMinutes,
		addDays,
		subDays,
		differenceInCalendarDays
	} from 'date-fns';
	import { browser } from '$app/env';
	import { session } from '$app/stores';

	let date = new Date();
	export let user;

	let reservations = {};
	let slots = $session.slots;

	// Display reservations.
	async function dayReservations(date) {
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
		const hour = differenceInCalendarDays(r.start, date) === 1 ? 0 : getHours(r.start);

		const component = new CalendarReservation({
			target: document.querySelector(`[data-id="${r.slot}-${hour}"`),
			hydrate: true,
			props: { r, date }
		});
		component.$on('userFullSlotClicked', function (e) {
			console.log('delte');
			clickedReservation = e.detail.r;
			newOpen = false; // Close if opened.
			delOpen = true;
			toDelete = this;
		});
		component.$on('managerEmptySlotClicked', function (e) {
			clickedReservation = e.detail.r;
			clickedReservation.isManager = false;
			clickedReservation.typ = 'ZAMESTNANEC';
			newOpen = true;
			console.log(clickedReservation);
		});
		reservations[r.id] = component;
	}

	// Create new reservations.
	let newOpen = false;
	let newTyp, newSlot, newStart;

	function createReservation(slot, start, typ) {
		newTyp = typ;
		newSlot = slot;
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
	let clickedReservation = {};
	let toDelete = {};
	function deleteReservation(e) {
		if (e.detail.delete.success) {
			cannotDeleteFullSlot = false;
			toDelete.$destroy();
			delete reservations[clickedReservation.id];
		} else if (e.detail.delete.slotFull) {
			cannotDeleteFullSlot = true;
		}
		toDelete = {};
	}

	// Errors.
	let cannotDeleteFullSlot = false;
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
	<div>Management slots are automatically taken when grey.</div>
</div>

{#if cannotDeleteFullSlot}
	<InlineNotification
		lowContrast
		title="Cannot delete:"
		subtitle="Cannot manipulate with occupied parking slot."
	/>
{/if}

<!-- Calendar. -->
<table>
	<tr>
		<td />
		{#each [...Array(24)] as _, hour}
			<th scope="col">{hour}</th>
		{/each}
	</tr>
	{#each slots as s}
		<tr>
			<th scope="row">{s.kod}</th>
			{#each [...Array(24)] as _, hour}
				<!-- Mark table cells for positioning of reservations. -->
				{#if s.typ === 'MANAGEMENT'}
					<td
						style="background-color: var(--cds-ui-03);"
						data-id="{s.kod}-{hour}"
						data-typ="{s.typ}"
						on:click={() => createReservation(s.kod, hour, s.typ)}
					/>
				{:else}
					<td
						data-id="{s.kod}-{hour}"
						data-typ="{s.typ}"
						on:click={() => createReservation(s.kod, hour, s.typ)}
					/>
				{/if}
			{/each}
		</tr>
	{/each}
</table>
<NewReservation
	on:addReservation={addReservation}
	bind:open={newOpen}
	{slots}
	slot={newSlot}
	typ={newTyp}
	startInput={setMinutes(setHours(date, newStart), 0)}
	authorization={user.authorization}
/>
<DeleteReservation
	bind:r={clickedReservation}
	bind:open={delOpen}
	on:deleteReservation={deleteReservation}
	authorization={user.authorization}
/>

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
