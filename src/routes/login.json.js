import fetch from 'node-fetch';

const endpoint = 'https://rezervace.flexibee.eu/v2/c/rezervace8';

/** Logs in a user. Returns her role.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function get({ headers }) {
    const query = new URLSearchParams({
        detail: 'custom:role'
    });
    const response = await fetch(`${endpoint}/uzivatel/(id=me()).json?${query}`, {
        headers: {
            'Authorization': headers.authorization
        }
    });
    if (response.ok) {
        const data = await response.json();
        const role = /code:(.*)/.exec(data.winstrom.uzivatel[0].role)[1];
        return {
            body: { role: role }
        };
    }
}
