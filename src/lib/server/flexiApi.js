import { add, differenceInMinutes, endOfDay, formatISO, startOfDay } from "date-fns";

/** Wrapper around FLEXI API for users, reservations and endpoints. */
export class FlexiApi {
    constructor() {
        this.endpoint = 'https://rezervace.flexibee.eu/v2/c/rezervace8';
        this.sensorEndpoint = 'https://rezervace.s3.eu-central-1.amazonaws.com';
    }

    /** Sets and decodes authorization header. */
    setAuth(authorization) {
        this.auth = authorization;
        this.authHeaders = {
            'Authorization': authorization
        };

        // Extract username.
        const code = /Basic (.*)/i.exec(authorization)[1];
        const decoded = atob(code);
        this.username = decoded.split(':')[0];
    }

    parseCode(code) {
        return /code:(.*)/.exec(code)[1];
    }

    parseReservation(data) {
        const start = new Date(data.zahajeni);
        const end = new Date(data.dokonceni);
        const slot = this.parseCode(data.zakazka);
        return {
            id: data.id,
            start: start,
            duration: differenceInMinutes(end, start),
            slot: slot
        };
    }

    parseReservationWithUsername(data) {
        const user = this.parseCode(data.zodpPrac);
        return {
            ...this.parseReservation(data),
            username: user
        };
    }

    /** Returns all upcoming reservations of logged in user. */
    async getUserReservations() {
        const userEncoded = encodeURIComponent(this.username);
        const query = new URLSearchParams({
            detail: 'custom:zahajeni,dokonceni,zakazka',
            order: 'zahajeni@A'
        });
        const filter = `zodpPrac = "code:${userEncoded}" and dokonceni >= now()`;
        const response = await fetch(`${this.endpoint}/udalost/(${filter}).json?${query}`, {
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (!data.winstrom.success)
            return { error: data };
        const list = data.winstrom.udalost.map(u => this.parseReservation(u));
        return { success: list };
    }


    /** Obtains details of reservations with the specified `id`. */
    async getReservation(id) {
        const encodedId = encodeURIComponent(id);
        const query = new URLSearchParams({
            detail: 'custom:zahajeni,dokonceni,zakazka'
        });
        const response = await fetch(`${this.endpoint}/udalost/${encodedId}.json?${query}`, {
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (!data.winstrom.success)
            return { error: data };
        const r = this.parseReservation(data.winstrom.udalost[0]);
        return { success: r };
    }

    /** Obtains all reservations occurring on the specified `date`. */
    async getReservations(date) {
        const query = new URLSearchParams({
            detail: 'custom:zahajeni,dokonceni,zakazka,zodpPrac'
        });
        const start = encodeURIComponent(formatISO(startOfDay(date)));
        const end = encodeURIComponent(formatISO(endOfDay(date)));
        const filter = `dokonceni >= "${start}" and zahajeni <= "${end}"`;
        const response = await fetch(`${this.endpoint}/udalost/(${filter}).json?${query}`, {
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (!data.winstrom.success)
            return { error: data };
        const list = data.winstrom.udalost.map(u => this.parseReservationWithUsername(u));
        return { success: list };
    }

    /** Obtains sensor data. */
    async getSensors() {
        const response = await fetch(`${this.sensorEndpoint}/parking8.json`);
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        return { success: data };
    }

    /** Creates reservation for user at the specified slot. */
    async createReservation(userName, start, duration, slot) {
        const response = await fetch(`${this.endpoint}/udalost.json`, {
            method: 'PUT',
            headers: {
                ...this.authHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                winstrom: {
                    udalost: {
                        typAkt: 'code:UDÁLOST',
                        zodpPrac: `code:${userName}`,
                        zahajeni: formatISO(start),
                        dokonceni: formatISO(add(start, { minutes: duration })),
                        zakazka: `code:${slot}`
                    }
                }
            })
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (!data.winstrom.success)
            return { error: data };
        return {
            success: { id: data.winstrom.results[0].id }
        };
    }

    /** Deletes the specified reservation. */
    async deleteReservation(id) {
        const encodedId = encodeURIComponent(id);
        const response = await fetch(`${this.endpoint}/udalost/${encodedId}.json`, {
            method: 'DELETE',
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        return { success: true };
    }

    /** Gets role of logged in user. */
    async getRole() {
        const query = new URLSearchParams({
            detail: 'custom:role'
        });
        const response = await fetch(`${this.endpoint}/uzivatel/(id=me()).json?${query}`, {
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (!data.winstrom.success)
            return { error: data };
        const role = this.parseCode(data.winstrom.uzivatel[0].role);
        return { success: { role: role } };
    }
}
