<script>
	import { createEventDispatcher } from 'svelte';
	import { parkingsMin } from '$lib/db.js';
	import { getHours, addMinutes, getMinutes, getDay } from 'date-fns';

	export let r = {};

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

	$: left = (getMinutes(r.start) * 100) / 60;
	$: spreadBorders =
		getDay(r.start) === getDay(addMinutes(r.start, r.duration))
			? getHours(addMinutes(r.start, r.duration)) - getHours(r.start)
			: 23 - getHours(r.start);
</script>

<button
	style="width: calc({(r.duration * 100) / 60}% + {spreadBorders}px); background-color: {slotColors[
		(r.slot - parkingsMin) % slotColors.length
	]}; left: {left}%; max-width: calc({(24 - getHours(r.start)) * 100 - left}% + {spreadBorders}px)"
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
