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
	$: left = differenceInCalendarDays(r.start, date) !== 0 ? 0 : (getMinutes(r.start) * 100) / 60;
	$: width =
		getDay(r.start) === getDay(end)
			? r.duration
			: differenceInCalendarDays(r.start, date) !== 0
			? -differenceInMinutes(startOfDay(date), end)
			: -differenceInMinutes(r.start, endOfDay(date));
	$: spreadBorders =
		getDay(r.start) === getDay(end)
			? getHours(end) - getHours(r.start)
			: differenceInCalendarDays(r.start, date) !== 0
			? getHours(end)
			: 23 - getHours(r.start);

	let openTooltip = false;
</script>

<button
	style="width: calc({(width * 100) / 60}% + {spreadBorders}px); background-color: {r.isManager
		? 'red'
		: slotColors[r.slot % 2]}; left: {left}%; height: 100%; z-index: {r.isManager ? 1 : 2};"
	on:click|stopPropagation={clickReservation}
	on:mouseenter={() => {
		openTooltip = true;
	}}
	on:mouseleave={() => {
		openTooltip = false;
	}}><TooltipReservation {r} open={openTooltip} /></button
>

<style lang="scss">
	button {
		height: calc(100% + 1px);
		position: absolute;
		top: 0;
		display: inline-block;
		text-decoration: none;
		border: 0;
		opacity: 0.5;

		&:hover,
		&:focus,
		&:active {
			opacity: 100% !important;
			text-decoration: none;
		}
	}
</style>
