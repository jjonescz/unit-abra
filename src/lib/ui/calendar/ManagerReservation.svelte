<script>
	import { Form, Modal, RadioTile, TileGroup } from 'carbon-components-svelte';
	import { createEventDispatcher } from 'svelte';

	let action = 0;
	export let open = false;

	const dispatchReservation = createEventDispatcher();
	async function managerReservation() {
		open = false;
		dispatchReservation('managerReservation', {
			action: action
		});
	}
</script>

<Modal
	bind:open
	modalHeading="Select action"
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (open = false)}
	on:close
	on:submit={managerReservation}
>
	<Form on:submit={managerReservation}>
		<TileGroup bind:selected={action}>
			<RadioTile value="0" checked>Remove free allocation</RadioTile>
			<RadioTile value="1">Allocate manager's space</RadioTile>
		</TileGroup>
	</Form>
</Modal>
