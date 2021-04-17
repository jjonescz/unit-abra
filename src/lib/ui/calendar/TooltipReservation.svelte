<script>
	import { Tooltip } from 'carbon-components-svelte';
	import { format } from 'date-fns';

	export let r = {};
	export let open = false;
</script>

<Tooltip direction="top" align="center" triggerText="&nbsp;" bind:open hideIcon>
	<p>
		Reservation on parking slot {r.slot} on {format(r.start, 'yyyy-MM-dd H:mm')} for {r.duration} minutes
		by {r.userName}.
	</p></Tooltip
>
