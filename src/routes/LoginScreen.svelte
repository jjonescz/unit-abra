<script>
	import {
		Button,
		ButtonSet,
		Tile,
		FluidForm,
		InlineNotification,
		TextInput,
		PasswordInput
	} from 'carbon-components-svelte';

	let username, password;
	let invalid_login = false;

	export let user;

	async function login() {
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
		} else {
			invalid_login = true;
		}
	}
</script>

<div style="padding: 2rem;">
	<Tile>
		<FluidForm>
			{#if invalid_login}
				<InlineNotification
					lowContrast
					subtitle="Invalid login or password."
					on:close={() => (invalid_login = false)}
				/>
			{/if}
			<TextInput
				bind:value={username}
				required
				labelText="User name"
				placeholder="Enter user name..."
			/>
			<PasswordInput
				bind:value={password}
				required
				type="password"
				labelText="Password"
				placeholder="Enter password..."
			/>
		</FluidForm>

		<ButtonSet>
			<Button kind="primary" on:click={login}>Log In</Button>
		</ButtonSet>
	</Tile>
</div>
