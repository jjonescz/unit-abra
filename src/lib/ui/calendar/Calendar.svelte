<script>
	import { getReservations } from '$lib/calendar';

	import CalendarReservation from '$lib/ui/calendar/CalendarReservation.svelte';
	import DeleteReservation from '$lib/ui/calendar/DeleteReservation.svelte';
	import NewReservation from '$lib/ui/calendar/NewReservation.svelte';
	import ManagerReservation from '$lib/ui/calendar/ManagerReservation.svelte';

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

	function error(r) {
		alert(`Unexpected error: ${JSON.stringify(r)}`);
	}

	// Display reservations.
	async function dayReservations(date) {
		for (const [_, r] of Object.entries(reservations)) {
			try {
				r.$destroy();
			} catch(err)
			{
				console.log(err)
			}
		}
		const r = await getReservations(user.authorization, date);
		if (!r.ok) {
			error(r);
			return;
		}
		const data = await r.json();
		console.log(data);

		if (!data.success) {
			error(data);
			return;
		}
		data.success.forEach((r) => {
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
			clickedReservation = e.detail.r;
			newOpen = false; // Close if opened.
			delOpen = true;
			toDelete = this;
		});
		component.$on('managerEmptySlotClicked', function (e) {
			clickedReservation = e.detail.r;
			manOpen = true;
			toDelete = this;
		});
		reservations[r.id] = component;
	}

	// Create new reservations.
	let newOpen = false;
	let newR;

	function createReservation(slot, start, typ) {
		newR = { typ: typ, slot: slot, start: setMinutes(setHours(date, start), 0)};
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

	// Manager utils.
	let manOpen = false;
	function managerReservation(e) {
		const action = e.detail.action;
		console.log(action);
		// Delete free space.
		if (action == 0) {
			delOpen = true;
		}
		// Register within allowed space.
		else {
			newR = clickedReservation;
			newR.typ = 'ZAMESTNANEC';
			newOpen = true && !delOpen;
		}
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
	<div>Management slots are red.</div>
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
			<th scope="row" style="color: {s.typ === 'MANAGEMENT' ? 'var(--cds-danger-01)' : 'black'};">{s.kod}</th>
			{#each [...Array(24)] as _, hour}
				<!-- Mark table cells for positioning of reservations. -->
				<td
						data-id="{s.kod}-{hour}"
						data-typ={s.typ}
						on:click={() => createReservation(s.kod, hour, s.typ)}
					/>
			{/each}
		</tr>
	{/each}
</table>
<NewReservation
	on:addReservation={addReservation}
	bind:open={newOpen}
	{slots}
	r={newR}
	authorization={user.authorization}
/>
<DeleteReservation
	bind:r={clickedReservation}
	bind:open={delOpen}
	on:deleteReservation={deleteReservation}
	authorization={user.authorization}
/>
<ManagerReservation
	on:managerReservation={managerReservation}
	bind:open={manOpen}
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
