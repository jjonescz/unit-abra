import { createReservation, deleteReservation, getReservations } from '$lib/server/employee';

/** Gets reservations of user.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function get({ query, headers }) {
    const list = await getReservations(query.get('user'), headers.authorization);
    if (list)
        return {
            body: list
        };
}

/** Creates new reservation for user.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function put({ query, headers, body }) {
    const data = JSON.parse(body);
    const response = await createReservation(query.get('user'),
        headers.authorization, new Date(data.start), data.duration);
    if (response)
        return {
            body: response
        };
}

/** Deletes specified reservation of user.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function del({ query, headers }) {
    const response = await deleteReservation(headers.authorization, query.get('id'));
    if (response)
        return { body: {} };
}
