import { add } from 'date-fns';
import fetch from 'node-fetch';


const endpoint = 'https://rezervace.flexibee.eu/v2/c/rezervace8/udalost.json';
const query = '?limit=0&detail=custom:typAkt,zodpPrac(kod,jmeno,prijmeni,email),zahajeni,dokonceni,predmet,zakazka(kod,nazev,zodpPrac,typZakazky),volno&includes=/udalost/zakazka,/udalost/zodpPrac';
const auth = 'Basic dGVhbTg6dGVhbTgtSld0YWs='; // user: team8


// start: Date, duration: int(minutes)
export async function getFreeSlot(start, duration) {
    const end = add(start, { minutes: duration })
    const reservations = await getReservations()

    var parkingSpots = {};
    for (var i = 101; i <= 120; i++) {
        parkingSpots[i] = {
            free: true,
            // max Date value
            nextReservation: new Date(8640000000000000)
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

    // TODO: Select free spot with earliest nextReservation
    for (var i = 101; i <= 120; i++) {
        if (parkingSpots[i].free) {
            return i
        }
    }
    return -1
}

async function getReservations() {
    const response = await fetch(endpoint + query, {
        method: 'GET',
        headers: {
            authorization: auth
        }
    });

    // TODO: Handle free and full manager slots
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
