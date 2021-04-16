<script>
	import { createEventDispatcher } from 'svelte';
	import { parkingsMin } from '$lib/db.js';
	import { getHours, addMinutes, getMinutes } from 'date-fns';

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
</script>

<button
	style="width: calc({(r.duration * 100) / 60}% + {getHours(addMinutes(r.start, r.duration)) -
		getHours(r.start)}px); background-color: {slotColors[
		(r.slot - parkingsMin) % slotColors.length
	]}; left: {(getMinutes(r.start) * 100) / 60}%"
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
