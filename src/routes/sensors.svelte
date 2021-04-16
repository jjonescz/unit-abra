<script context="module">
	import { browser } from '$app/env';

	export async function load() {
		if (!browser) {
			const { startChecking, lastCheck, lastError } = await import('$lib/server/sensors');

			startChecking();
			return {
				props: {
					time: lastCheck,
					error: lastError
				}
			};
		}
		return {};
	}
</script>

<script>
	export let time;
	export let error;
</script>

<h1>Sensor checking</h1>

<p>Last checked: {time}</p>

<p>Last error: {error}</p>
