import { FlexiApi } from '$lib/server/flexiApi';
import { ReceptionistApi } from '$lib/server/receptionist';

/** Gets reservations on given day.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function get({ query, headers }) {
    const api = new FlexiApi();
    api.setAuth(headers.authorization);
    const r = await api.getReservations(new Date(query.get('date')));
    return { body: r };
}

/** Creates new reservation.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function put({ headers, body }) {
    const api = new ReceptionistApi();
    api.api.setAuth(headers.authorization);
    const data = JSON.parse(body);
    const r = await api.createReservation(data.user,
        new Date(data.start), data.duration, data.slot);
    return { body: r };
}

/** Deletes specified reservation.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function del({ query, headers }) {
    const api = new FlexiApi();
    api.setAuth(headers.authorization);
    const r = await api.deleteReservation(query.get('id'));
    return { body: r };
}
