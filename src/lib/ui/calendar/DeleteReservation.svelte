<script>
	import { deleteReservation } from '$lib/calendar';
	import { Modal } from 'carbon-components-svelte';
	import { format } from 'date-fns';
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let r = {};

	let authorization = 'Basic dGVhbTgudXppdmF0ZWwxOnRlYW04LUpXdGFr';

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
</script>

<Modal
	bind:open
	danger
	modalHeading="Delete reservation"
	primaryButtonText="Delete"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:open={() => {
		r.start = format(r.start, 'yyyy-MM-dd H:mm');
	}}
	on:close
	on:submit={removeReservation}
>
	<p>Reservation on parking slot {r.slot} on {r.start} for {r.duration} minutes.</p>
</Modal>
