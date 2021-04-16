<script>
	import { session } from '$app/stores';
	import Employee from '$lib/ui/Employee.svelte';
	import Calendar from '$lib/ui/calendar/Calendar.svelte';
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

	let user = $session.user;

	function logout() {
		user = null;
		document.cookie = 'user=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
	}
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
					<HeaderPanelLink on:click={logout}>Log out</HeaderPanelLink>
				</HeaderPanelLinks>
			</HeaderAction>
		</HeaderUtilities>
	</Header>

	<Content>
		{#if user.role === 'RECEPCNI'}
			<Calendar {user} />
		{:else}
			<Employee {user} />
		{/if}
	</Content>
{/if}
