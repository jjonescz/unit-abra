import { differenceInMinutes } from 'date-fns';
import fetch from 'node-fetch';

const endpoint = 'https://rezervace.flexibee.eu/c/rezervace8';

export async function getReservations(userName, authentication) {
    const userEncoded = encodeURIComponent(userName);
    const query = new URLSearchParams({
        data: 'custom:zahajeni,dokonceni,zakazka(kod)'
    });
    const response = await fetch(`${endpoint}/udalost/(zodpPrac = "code:${userEncoded}").json?${query}`, {
        headers: {
            'Authorization': authentication
        }
    });
    const data = await response.json();
    return data.winstorm.udalost.map(u => {
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
