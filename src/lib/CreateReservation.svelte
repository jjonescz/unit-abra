<script>
	import NewReservation from '$lib/NewReservation.svelte';
	export let r = { spot: 0, start: 0, duration: 0 };

	export let start;
	export let spot;
	let open = false;

	const spotColors = [
		'tomato',
		'aquamarine',
		'orchid',
		'navy',
		'palegoldenrod',
		'forestgreen',
		'mediumslateblue'
	];
</script>

<NewReservation {open} {spot} {start} /> -->
