<script>
	import { createEventDispatcher } from 'svelte';
	import { parkingsMin } from '$lib/db.js';
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
		dispatchReservation('clicked', {
			r: r
		});
	}
	const slotColors = [
		'tomato',
		'aquamarine',
		'orchid',
		'navy',
		'palegoldenrod',
		'forestgreen',
		'mediumslateblue'
	];

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
	style="width: calc({(width * 100) / 60}% + {spreadBorders}px); background-color: {slotColors[
		(r.slot - parkingsMin) % slotColors.length
	]}; left: {left}%;"
	on:click={clickReservation}
/>

<style lang="scss">
	button {
		height: calc(100% + 1px);
		opacity: 50%;
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
