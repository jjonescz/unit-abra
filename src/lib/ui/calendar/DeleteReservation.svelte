<script>
	import { deleteReservation } from '$lib/calendar';
	import { Modal } from 'carbon-components-svelte';
	import { format, isAfter, addMinutes } from 'date-fns';
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let r = {};
	let startFormated = '';

	export let authorization = '';

	const dispatchReservation = createEventDispatcher();
	async function removeReservation() {
		let deleted = await deleteReservation(authorization, r.id);
		if (deleted) {
			dispatchReservation('deleteReservation', {
				delete: deleted
			});
		} else {
			alert('Could not delete the reservation, try again.');
		}
		open = false;
	}

	$: canBeDeleted = isAfter(new Date(), addMinutes(r.start, r.duration));
</script>

<Modal
	bind:open
	danger
	modalHeading="Delete reservation"
	primaryButtonDisabled={canBeDeleted}
	primaryButtonText="Delete"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:open={() => {
		startFormated = format(r.start, 'yyyy-MM-dd H:mm');
	}}
	on:close
	on:submit={removeReservation}
>
	<p>Reservation on parking slot {r.slot} on {startFormated} for {r.duration} minutes.</p>
</Modal>
