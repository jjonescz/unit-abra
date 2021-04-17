import { getSlots } from '$lib/server/slots';

/** Gets all available slots.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function get({ headers }) {
    const list = await getSlots(headers.authorization);
    if (list)
        return {
            body: list
        };
}
