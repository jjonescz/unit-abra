<script>
	import { Modal } from 'carbon-components-svelte';
	let open = false; // Toggles modal visibility.
	let valid = true; // Only valid reservations are displayed.

	export let r = { spot: 0, start: 0, duration: 0 };

	const spotColors = [
		'tomato',
		'aquamarine',
		'orchid',
		'navy',
		'palegoldenrod',
		'forestgreen',
		'mediumslateblue'
	];

	function deleteReservation(e) {
		// TODO: request delete via API.
		e.stopPropagation();
		valid = false;
	}
</script>

{#if valid}
	<button
		style="width: calc({r.duration * 100}% + {r.duration - 1}px); background-color: {spotColors[
			r.spot % spotColors.length
		]};"
		on:click={() => (open = true)}
	/>
	<Modal
		bind:open
		danger
		modalHeading="Reservation {r.start} - {r.start + r.duration}"
		primaryButtonText="Delete"
		secondaryButtonText="Cancel"
		on:click:button--secondary={() => (open = false)}
		on:open
		on:close
		on:submit={deleteReservation}
	>
		<p />
	</Modal>
{/if}

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

		&:hover,
		&:focus,
		&:active {
			opacity: 100% !important;
			text-decoration: none;
		}
	}
</style>
