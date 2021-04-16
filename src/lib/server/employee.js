import { add, differenceInMinutes, formatISO } from 'date-fns';
import fetch from 'node-fetch';

const endpoint = 'https://rezervace.flexibee.eu/v2/c/rezervace8';

export async function getReservations(userName, authorization) {
    const userEncoded = encodeURIComponent(userName);
    const query = new URLSearchParams({
        detail: 'custom:zahajeni,dokonceni,zakazka'
    });
    const response = await fetch(`${endpoint}/udalost/(zodpPrac = "code:${userEncoded}").json?${query}`, {
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
            start: start,
            duration: differenceInMinutes(end, start),
            slot: slot
        };
    });
}

export async function createReservation(userName, authorization, start, duration) {
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
                    zakazka: 'code:101', // TODO: Select parking slot.
                    volno: false
                }
            }
        })
    });
    const data = await response.json();
    if (data.winstrom.success) {
        return {
            id: data.winstrom.results[0].id,
            slot: 101 // TODO: Update when changing dynamically.
        };
    }
    return null;
}
