<script>
	import Employee from '$lib/ui/Employee.svelte';
	import LoginScreen from './LoginScreen.svelte';

	let user;
</script>

<svelte:head>
	<title />
</svelte:head>

{#if !user}
	<LoginScreen bind:user />
{:else}
	<Employee bind:user />
{/if}
