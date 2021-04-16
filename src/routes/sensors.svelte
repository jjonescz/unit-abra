<script context="module">
	import { startChecking, lastCheck, lastError } from '$lib/server/sensors';

	export const hydrate = false;

	startChecking();
</script>

<h1>Sensor checking</h1>

<p>Last checked: {lastCheck}</p>

<p>Last error: {lastError}</p>
