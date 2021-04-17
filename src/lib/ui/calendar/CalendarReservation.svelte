<script>
	import { createEventDispatcher } from 'svelte';
	import {
		getHours,
		addMinutes,
		getMinutes,
		getDay,
		startOfDay,
		endOfDay,
		differenceInMinutes,
		isBefore
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
			dispatchReservation('userEmptySlotClicked', {
				r: r
			});
		}
	}
	const slotColors = ['var(--cds-interactive-01)', 'var(--cds-interactive-02)'];

	$: end = addMinutes(r.start, r.duration);
	$: left = isBefore(r.start, date) ? 0 : (getMinutes(r.start) * 100) / 60;
	$: width =
		getDay(r.start) === getDay(end)
			? r.duration
			: isBefore(r.start, date)
			? -differenceInMinutes(startOfDay(date), end)
			: -differenceInMinutes(r.start, endOfDay(date));
	$: spreadBorders =
		getDay(r.start) === getDay(end)
			? getHours(end) - getHours(r.start)
			: isBefore(r.start, date)
			? getHours(end)
			: 23 - getHours(r.start);
</script>

<button
	style="width: calc({(width * 100) / 60}% + {spreadBorders}px); background-color: {r.isManager
		? 'white'
		: slotColors[r.slot % 2]}; left: {left}%; opacity: {r.isManager ? 1 : 0.5}; height: {r.isManager
		? '100%'
		: 'calc(100% + 1px)'};"
	on:click={clickReservation}
/>

<style lang="scss">
	button {
		position: absolute;
		top: 0;
		display: inline-block;
		text-decoration: none;
		border: 0;
		z-index: 1; // Bring above `td` cells.

		&:hover,
		&:focus,
		&:active {
			opacity: 100% !important;
			text-decoration: none;
		}
	}
</style>
