import { getSlots } from '$lib/server/slots';
import * as cookie from 'cookie/index.js';

/** @type {import('@sveltejs/kit').GetContext} */
export async function getContext({ headers }) {
    const cookies = cookie.parse(headers.cookie || '');

    return {
        user: cookies.user && JSON.parse(cookies.user)
    };
}

/** @type {import('@sveltejs/kit').GetSession} */
export async function getSession({ context }) {
    // Obtain all parking slots.
    let slots = [];
    if (context.user) {
        slots = await getSlots(context.user.authorization);
    }

    return {
        user: context.user && {
            username: context.user.username,
            authorization: context.user.authorization,
            role: context.user.role
        },
        slots: slots
    };
}
