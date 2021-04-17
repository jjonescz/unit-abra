import { FlexiApi } from '$lib/server/flexiApi';

/** Logs in a user. Returns her role.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 * */
export async function get({ headers }) {
    const api = new FlexiApi();
    api.setAuth(headers.authorization);
    const r = await api.getRole();
    if (r.success) return { body: r.success };
    return { body: r };
}
