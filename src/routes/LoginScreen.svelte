<script>
	import {
		Button,
		ButtonSet,
		Content,
		FluidForm,
		InlineNotification,
		TextInput,
		PasswordInput,
		InlineLoading
	} from 'carbon-components-svelte';

	let username, password;
	let invalid_login = false;
	let in_progress = false;

	export let user;

	async function login() {
		in_progress = true;
		const auth = `Basic ${btoa(`${username}:${password}`)}`;
		const response = await fetch(`/login.json`, {
			headers: {
				authorization: auth
			}
		});
		if (response.ok) {
			const data = await response.json();
			user = {
				username: username,
				authorization: auth,
				...data
			};
			invalid_login = false;

			// Save user as cookie.
			const userJson = JSON.stringify({
				username: username,
				authorization: auth,
				role: data.role
			});
			document.cookie = `user=${userJson};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
		} else {
			invalid_login = true;
		}
		in_progress = false;
	}
</script>

<Content>
	<h1 style="margin-bottom: 1rem;">Log In</h1>

	<FluidForm style="max-width: 720px;">
		{#if invalid_login}
			<InlineNotification
				lowContrast
				subtitle="Invalid login or password."
				on:close={() => (invalid_login = false)}
			/>
		{/if}
		<div style="margin-bottom: 1rem;">
			<TextInput
				bind:value={username}
				required
				labelText="User name"
				placeholder="Enter user name..."
			/>
		</div>
		<div style="margin-bottom: 1rem;">
			<PasswordInput
				bind:value={password}
				required
				type="password"
				labelText="Password"
				placeholder="Enter password..."
			/>
		</div>
	</FluidForm>

	<ButtonSet>
		<Button kind="primary" on:click={login} style="margin-right: 0.5rem;">Log In</Button>
		{#if in_progress}
			<InlineLoading description="Logging in..." />
		{/if}
	</ButtonSet>
</Content>
