import * as cookie from 'cookie/index.js';

/** @type {import('@sveltejs/kit').GetContext} */
export async function getContext({ headers }) {
    const cookies = cookie.parse(headers.cookie || '');

    return {
        user: cookies.user && JSON.parse(cookies.user)
    };
}

/** @type {import('@sveltejs/kit').GetSession} */
export function getSession({ context }) {
    return {
        user: context.user && {
            username: context.user.username,
            authorization: context.user.authorization
        }
    };
}
