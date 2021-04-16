<script>
	import { reservations } from '$lib/server/employee';
	import { Button, ButtonSet, Tile, Grid, Row, Column } from 'carbon-components-svelte';
	import { TrashCan16 } from 'carbon-icons-svelte';

	function removeReservation(reservations, index) {
		reservations;
	}
</script>

<h2>Your reservations</h2>

{#each $reservations as r, i}
	<Tile>
		<div>
			{r.start} for {r.duration} minutes
		</div>
		<div>
			<Button
				kind="danger-tertiary"
				iconDescription="Delete"
				icon={TrashCan16}
				on:click={() =>
					reservations.update((r) => {
						r.splice(i, 1);
						return r;
					})}
			/>
		</div>
	</Tile>
{:else}
	<em>No reservations yet.</em>
{/each}
