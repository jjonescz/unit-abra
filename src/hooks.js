import { FlexiApi } from '$lib/server/flexiApi';
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
        const api = new FlexiApi();
        api.setAuth(context.user.authorization);
        const r = await api.getSlots();
        if (r.success) slots = r.success;
        else console.log('Could not obtain slots', r);
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
