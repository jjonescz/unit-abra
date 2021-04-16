<script>
	import { createEventDispatcher } from 'svelte';

	export let r = { spot: 0, start: 0, duration: 0 };

	const dispatchReservation = createEventDispatcher();
	function clickReservation() {
		dispatchReservation('clicked', {
			r: r
		});
	}
	const spotColors = [
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
	style="width: calc({r.duration * 100}% + {r.duration - 1}px); background-color: {spotColors[
		r.spot % spotColors.length
	]};"
	on:click={clickReservation}
/>

<style lang="scss">
	button {
		height: calc(100% + 1px);
		opacity: 50%;
		position: absolute;
		left: 0;
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
