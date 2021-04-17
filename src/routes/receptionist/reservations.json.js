import { createReservation, getReservations } from '$lib/server/receptionist';
import { deleteReservation } from '$lib/server/employee';

/** Gets reservations on given day.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function get({ query, headers }) {
    const list = await getReservations(headers.authorization, new Date(query.get('date')));
    if (list)
        return {
            body: list
        };
}

/** Creates new reservation.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function put({ query, headers, body }) {
    const data = JSON.parse(body);
    const response = await createReservation(query.get('user'),
        headers.authorization, new Date(data.start), data.duration, data.slot);
    if (response)
        return {
            body: response
        };
}

/** Deletes specified reservation.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function del({ query, headers }) {
    const response = await deleteReservation(headers.authorization,
        query.get('id'), query.get('manager') === 'true');
    if (response)
        return { body: response };
}
