<script>
	import { Modal } from 'carbon-components-svelte';
	import { createEventDispatcher } from 'svelte';
	import { deleteReservation } from '$lib/calendar';

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
	modalHeading="Reservation {r.start} - {r.start + r.duration}"
	primaryButtonText="Delete"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:open
	on:close
	on:submit={removeReservation}
>
	<p>Reservation on parking slot {r.slot}</p>
</Modal>
