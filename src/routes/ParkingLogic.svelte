<script>
	import { Button, TextArea, Tile } from 'carbon-components-svelte';
	import { add, differenceInMinutes, formatISO } from 'date-fns';
    
    let textAreaText = "Initial text";

    function setText(text) {
        textAreaText = text;
	}

	async function getFreeSpot(start, duration) {
		const end = add(start, { minutes: duration })
		const reservations = await getReservations()

		var parkingSpots = {};
		// TODO: Change this hard coded value
		for(var i = 101; i <= 120; i++){
			parkingSpots[i] = {
				free : true,
				nextReservation : new Date(8640000000000000)
			}
		}

		reservations.map(r => {
			var parkingSpot = parkingSpots[r.slot]
			// does reservation collide with given start and duration
			if (r.start < end && r.end > start)
				parkingSpot.free = false
			// find earliest next reservation for parking slot
			if (r.start > start && r.start < parkingSpot.nextReservation)
				parkingSpot.nextReservation = r.start
		});
		
		// TODO: Change this hard coded value
		for(var i = 101; i <= 120; i++){
			if (parkingSpots[i].free) {
				return i
			}
		}
		return -1
	}
	
	async function getReservations() {
		const response = await fetch(`https://rezervace.flexibee.eu/v2/c/rezervace8/udalost.json?limit=0&detail=custom:typAkt,zodpPrac(kod,jmeno,prijmeni,email),zahajeni,dokonceni,predmet,zakazka(kod,nazev,zodpPrac,typZakazky),volno&includes=/udalost/zakazka,/udalost/zodpPrac`, {
			method: 'GET',
			headers: {
				authorization: 'Basic dGVhbTgudXppdmF0ZWwxOnRlYW04LUpXdGFr'
			}
		});

		if (response.ok) {
			const data = await response.json();
			return data.winstrom.udalost.map(u => {
				const start = new Date(u.zahajeni);
				const end = new Date(u.dokonceni);
				const slot = u.zakazka[0].kod;
				return {
					id: u.id,
					start: start,
					end: end,
					slot: slot
				}
    		});
		}
		return {};
	}

</script>

<div style="padding: 2rem;">
	<Tile>
		<Button kind="primary" on:click={() => setText('Basic dGVhbTgudXppdmF0ZWwxOnRlYW04LUpXdGFr')}>Don't Click Me ;)</Button>
		<Button kind="primary" on:click={() => getFreeSpot(new Date('2021-04-17T13:00:00'), 60)}>Click Me ;)</Button>
        <TextArea labelText="Text area" placeholder="Enter a description..." value={textAreaText}/>
	</Tile>
</div>

