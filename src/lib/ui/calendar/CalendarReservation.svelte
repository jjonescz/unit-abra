<script>
	import { createEventDispatcher } from 'svelte';
	import TooltipReservation from '$lib/ui/calendar/TooltipReservation.svelte';
	import {
		getHours,
		addMinutes,
		getMinutes,
		getDay,
		startOfDay,
		endOfDay,
		differenceInMinutes,
		differenceInCalendarDays
	} from 'date-fns';

	export let r = {};
	export let date;

	const dispatchReservation = createEventDispatcher();
	function clickReservation() {
		if (r.isManager) {
			dispatchReservation('managerEmptySlotClicked', {
				r: r
			});
		} else {
			dispatchReservation('userFullSlotClicked', {
				r: r
			});
		}
	}
	const slotColors = ['var(--cds-interactive-01)', 'var(--cds-interactive-02)'];

	$: end = addMinutes(r.start, r.duration);
	$: left = differenceInCalendarDays(r.start, date) === 1 ? 0 : (getMinutes(r.start) * 100) / 60;
	$: width =
		getDay(r.start) === getDay(end)
			? r.duration
			: differenceInCalendarDays(r.start, date) === 1
			? -differenceInMinutes(startOfDay(date), end)
			: -differenceInMinutes(r.start, endOfDay(date));
	$: spreadBorders =
		getDay(r.start) === getDay(end)
			? getHours(end) - getHours(r.start)
			: differenceInCalendarDays(r.start, date) === 1
			? getHours(end)
			: 23 - getHours(r.start);

	let openTooltip = false;
</script>

{#if r.isManager}
	<button
		style="width: calc({(width * 100) /
			60}% + {spreadBorders}px); background-color: white; left: {left}%; opacity: 1; height: 100%; z-index: 1;"
		on:click|stopPropagation={clickReservation}
		on:mouseenter={() => {
			openTooltip = true;
		}}
		on:mouseleave={() => {
			openTooltip = false;
		}}><TooltipReservation {r} open={openTooltip} /></button
	>
{:else}
	<!-- Notice the z-index puts these above "freeing manager reservations". -->
	<button
		style="width: calc({(width * 100) / 60}% + {spreadBorders}px); background-color: {slotColors[
			r.slot % 2
		]}; left: {left}%; opacity: 0.5; height: calc(100% + 1px); z-index: 2;"
		on:click|stopPropagation={clickReservation}
		on:mouseenter={() => {
			openTooltip = true;
		}}
		on:mouseleave={() => {
			openTooltip = false;
		}}><TooltipReservation {r} open={openTooltip} /></button
	>
{/if}

<style lang="scss">
	button {
		position: absolute;
		top: 0;
		display: inline-block;
		text-decoration: none;
		border: 0;

		&:hover,
		&:focus,
		&:active {
			opacity: 100% !important;
			text-decoration: none;
		}
	}
</style>
