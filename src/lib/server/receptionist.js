import { add, differenceInMinutes, endOfDay, formatISO, startOfDay } from 'date-fns';
import fetch from 'node-fetch';

const endpoint = 'https://rezervace.flexibee.eu/v2/c/rezervace8';

export async function getReservations(authorization, date) {
    const query = new URLSearchParams({
        detail: 'custom:zahajeni,dokonceni,zakazka,zodpPrac'
    });
    const start = encodeURIComponent(formatISO(startOfDay(date)));
    const end = encodeURIComponent(formatISO(endOfDay(date)));
    const response = await fetch(`${endpoint}/udalost/(dokonceni >= "${start}" and zahajeni <= "${end}").json?${query}`, {
        headers: {
            'Authorization': authorization
        }
    });
    const data = await response.json();
    return data.winstrom.udalost.map(u => {
        const start = new Date(u.zahajeni);
        const end = new Date(u.dokonceni);
        const slot = /code:(.*)/.exec(u.zakazka)[1];
        const userName = /code:(.*)/.exec(u.zodpPrac)[1];
        return {
            id: u.id,
            start: start,
            duration: differenceInMinutes(end, start),
            slot: slot,
            userName: userName,
            isManager: userName.startsWith('team8.manager')
        };
    });
}

export async function createReservation(userName, authorization, start, duration, slot) {
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
                    zakazka: `code:${slot}`,
                    volno: false
                }
            }
        })
    });
    const data = await response.json();
    if (data.winstrom.success) {
        return {
            id: data.winstrom.results[0].id
        };
    }
    return null;
}

export async function deleteReservation(authorization, id) {
    const encodedId = encodeURIComponent(id);
    const response = await fetch(`${endpoint}/udalost/${encodedId}.json`, {
        method: 'DELETE',
        headers: {
            'Authorization': authorization
        }
    });
    return response.ok;
}
