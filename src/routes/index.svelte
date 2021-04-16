<script>
	import Employee from '$lib/ui/Employee.svelte';
	import {
		Header,
		HeaderAction,
		HeaderPanelLink,
		HeaderPanelLinks,
		HeaderUtilities,
		SkipToContent,
		Content,
		HeaderPanelDivider
	} from 'carbon-components-svelte';
	import LoginScreen from './LoginScreen.svelte';

	let user;
</script>

{#if !user}
	<LoginScreen bind:user />
{:else}
	<Header company="ABRA" platformName="Parking" href="/">
		<div slot="skip-to-content">
			<SkipToContent />
		</div>

		<HeaderUtilities>
			<HeaderAction>
				<HeaderPanelLinks>
					<HeaderPanelDivider>{user.username}</HeaderPanelDivider>
					<HeaderPanelLink on:click={() => (user = null)}>Log out</HeaderPanelLink>
				</HeaderPanelLinks>
			</HeaderAction>
		</HeaderUtilities>
	</Header>

	<Content>
		<Employee bind:user />
	</Content>
{/if}
