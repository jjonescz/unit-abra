<script>
	import { Modal } from 'carbon-components-svelte';
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let r = {};

	const dispatchReservation = createEventDispatcher();
	function deleteReservation() {
		// TODO: request delete via API.
		dispatchReservation('deleteReservation', {
			delete: true
		});
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
	on:submit={deleteReservation}
>
	<p>Reservation on parking spot {r.spot}</p>
</Modal>
