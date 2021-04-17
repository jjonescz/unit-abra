<script context="module">
	import { startChecking, lastCheck, lastError } from '$lib/server/sensors';

	export const hydrate = false;

	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ session }) {
		// Only allow admins access to this page.
		if (session.user && session.user.role === 'ADMIN') {
			return {};
		}
	}
</script>

<script>
	import { prerendering } from '$app/env';

	if (!prerendering) {
		startChecking();
	}
</script>

<h1>Sensor checking</h1>

<p>Last checked: {lastCheck}</p>

<p>Last error: {lastError}</p>
