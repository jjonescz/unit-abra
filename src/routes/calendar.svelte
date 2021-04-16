<script>
	import Calendar from '$lib/ui/calendar/Calendar.svelte';
    import { roles } from '$lib/db.js';

	let role = roles.receptionist;
</script>

{#if role === roles.receptionist}
	<Calendar />
{/if}
