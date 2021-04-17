import fetch from 'node-fetch';

const endpoint = 'https://rezervace.flexibee.eu/v2/c/rezervace8';

export async function getSlots(authorization) {
    const query = new URLSearchParams({
        detail: 'custom:kod,typZakazky',
        limit: 0
    });
    const response = await fetch(`${endpoint}/zakazka.json?${query}`, {
        headers: {
            'Authorization': authorization
        }
    });

    if (response.ok) {
        const data = await response.json();
        return data.winstrom.zakazka.map(z => {
            const typ = /code:(.*)/.exec(z.typZakazky)[1];
            return {
                id: z.id,
                kod: parseInt(z.kod),
                typ: typ
            };
        });
    }
    return [];
}
