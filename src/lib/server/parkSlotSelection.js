import { FolderDetailsReference20 } from 'carbon-icons-svelte';
import { add } from 'date-fns';
import fetch from 'node-fetch';


const endpoint = 'https://rezervace.flexibee.eu/v2/c/rezervace8/udalost.json';
const query = '?limit=0&detail=custom:typAkt,zodpPrac(kod,jmeno,prijmeni,email),zahajeni,dokonceni,predmet,zakazka(kod,nazev,zodpPrac,typZakazky),volno&includes=/udalost/zakazka,/udalost/zodpPrac';
const auth = 'Basic dGVhbTg6dGVhbTgtSld0YWs='; // user: team8


// start: Date, duration: int(minutes)
export async function getFreeSlot(start, duration) {
    const end = add(start, { minutes: duration })
    const reservations = await getReservations()

    var parkingSlots = {};
    for (var i = 101; i <= 120; i++) {
        parkingSlots[i] = {
            free: true,
            // max Date value - 1
            nextReservation: new Date(8640000000000000 - 1),
            // min Date value + 1
            prevReservation: new Date(-8640000000000000 + 1)
        }
    }

    reservations.map(r => {
        var parkingSlot = parkingSlots[r.slot]
        // does reservation collide with given start and duration
        if (r.start < end && r.end > start)
            parkingSlot.free = false
        // find earliest next reservation for parking slot
        if (r.start >= end && r.start < parkingSlot.nextReservation)
            parkingSlot.nextReservation = new Date(r.start.getTime())
        // find latest prev reservation for parking slot
        if (r.end <= start && r.end > parkingSlot.prevReservation) {
            parkingSlot.prevReservation = new Date(r.end.getTime())
        }
    });

    var slotCandidate = -1
    var maxPrevReservation = new Date(-8640000000000000)

    for (var i = 101; i <= 120; i++) {
        if (!parkingSlots[i].free)
            continue

        // current reservations can immediately follow/precide one already scheduled
        // select this slot to keep minimize gaps in time schedule
        if (start.getTime() === parkingSlots[i].prevReservation.getTime() ||
            end.getTime() === parkingSlots[i].nextReservation.getTime()) {
            return i;
        }

        if (maxPrevReservation < parkingSlots[i].prevReservation) {
            slotCandidate = i
            maxPrevReservation = parkingSlots[i].prevReservation
        }
    }
    // returns -1 if there is no empty parking slot
    return slotCandidate
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
