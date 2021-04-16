import { getReservations } from '$lib/server/employee'

/** Gets reservations of user.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function get({ query, headers }) {
    const list = await getReservations(query.get('user'), headers.authorization);
    console.log('Returning', list);
    if (list)
        return {
            body: list
        };
}
