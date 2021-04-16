<script>
	import { Button } from 'carbon-components-svelte';

	let count = 0;
</script>

<svelte:head>
	<title />
</svelte:head>

<Button on:click={() => count++}>Test {count}</Button>
