import { add, differenceInMinutes, formatISO } from 'date-fns';
import fetch from 'node-fetch';
import { getFreeSlot } from './parkSlotSelection.js';

const endpoint = 'https://rezervace.flexibee.eu/v2/c/rezervace8';

async function getSlotNumber(authorization, reservationId) {
    const encodedId = encodeURIComponent(reservationId);
    const query = new URLSearchParams({
        detail: 'custom:zakazka'
    });
    const response = await fetch(`${endpoint}/udalost/${encodedId}.json?${query}`, {
        headers: {
            'Authorization': authorization
        }
    });
    const data = await response.json();
    const z = data.winstrom.udalost[0].zakazka;
    return /code:(.*)/.exec(z)[1];
}

async function isSlotFull(slot) {
    const response = await fetch('https://rezervace.s3.eu-central-1.amazonaws.com/parking8.json');
    const data = await response.json();
    return !!data[slot];
}

export async function getReservations(userName, authorization) {
    const userEncoded = encodeURIComponent(userName);
    const query = new URLSearchParams({
        detail: 'custom:zahajeni,dokonceni,zakazka',
        order: 'zahajeni@A'
    });
    const response = await fetch(`${endpoint}/udalost/(zodpPrac = "code:${userEncoded}" and dokonceni >= now()).json?${query}`, {
        headers: {
            'Authorization': authorization
        }
    });
    const data = await response.json();
    return data.winstrom.udalost.map(u => {
        const start = new Date(u.zahajeni);
        const end = new Date(u.dokonceni);
        const slot = /code:(.*)/.exec(u.zakazka)[1];
        return {
            id: u.id,
            start: start,
            duration: differenceInMinutes(end, start),
            slot: slot
        };
    });
}

export async function createReservation(userName, authorization, start, duration) {
    var freeSlot = await getFreeSlot(start, duration);
    // There is no free slot available
    if (freeSlot === -1)
        return null;
    const response = await fetch(`${endpoint}/udalost.json`, {
        method: 'PUT',
        headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            winstrom: {
                udalost: {
                    typAkt: 'code:UDÁLOST',
                    zodpPrac: `code:${userName}`,
                    zahajeni: formatISO(start),
                    dokonceni: formatISO(add(start, { minutes: duration })),
                    zakazka: 'code:' + freeSlot,
                    volno: false
                }
            }
        })
    });
    const data = await response.json();
    if (data.winstrom.success) {
        return {
            id: data.winstrom.results[0].id,
            slot: freeSlot
        };
    }
    return null;
}

export async function deleteReservation(authorization, id) {
    if (await isSlotFull(await getSlotNumber(authorization, id))) {
        return { slotFull: true };
    }

    const encodedId = encodeURIComponent(id);
    const response = await fetch(`${endpoint}/udalost/${encodedId}.json`, {
        method: 'DELETE',
        headers: {
            'Authorization': authorization
        }
    });
    return { success: response.ok };
}
