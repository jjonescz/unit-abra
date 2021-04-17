import { EmployeeApi } from '$lib/server/employee';

/** Gets upcoming reservations of user.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function get({ headers }) {
    const api = new EmployeeApi();
    api.api.setAuth(headers.authorization);
    const r = await api.api.getUserReservations();
    return { body: r };
}

/** Creates new reservation for user.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function put({ headers, body }) {
    const api = new EmployeeApi();
    api.api.setAuth(headers.authorization);
    const data = JSON.parse(body);
    const r = await api.createReservation(new Date(data.start), data.duration);
    return { body: r };
}

/** Deletes specified reservation of user.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function del({ query, headers }) {
    const api = new EmployeeApi();
    api.api.setAuth(headers.authorization);
    const r = await api.deleteReservation(query.get('id'));
    return { body: r };
}
