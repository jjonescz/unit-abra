import { add, differenceInMinutes, endOfDay, formatISO, startOfDay } from "date-fns";
import fetch from 'node-fetch';

/** Wrapper around FLEXI API for users, reservations, sensors and slots. */
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
        const decoded = Buffer.from(code, 'base64').toString();
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
            slot: slot,
            volno: data.volno
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
            detail: 'custom:zahajeni,dokonceni,zakazka,volno',
            order: 'zahajeni@A',
            limit: 0
        });
        const filter = `zodpPrac = "code:${userEncoded}" and dokonceni >= now()`;
        const response = await fetch(`${this.endpoint}/udalost/(${filter}).json?${query}`, {
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (data.winstrom.success === "false")
            return { error: data };
        const list = data.winstrom.udalost.map(u => this.parseReservation(u));
        return { success: list };
    }


    /** Obtains details of reservations with the specified `id`. */
    async getReservation(id) {
        const encodedId = encodeURIComponent(id);
        const query = new URLSearchParams({
            detail: 'custom:zahajeni,dokonceni,zakazka,volno'
        });
        const response = await fetch(`${this.endpoint}/udalost/${encodedId}.json?${query}`, {
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (data.winstrom.success === "false")
            return { error: data };
        const r = this.parseReservation(data.winstrom.udalost[0]);
        return { success: r };
    }

    /** Obtains all reservations occurring on the specified `date` if specified. */
    async getReservations(date) {
        const query = new URLSearchParams({
            detail: 'custom:zahajeni,dokonceni,zakazka,zodpPrac,volno',
            limit: 0
        });
        let path;
        if (date) {
            const start = encodeURIComponent(formatISO(startOfDay(date)));
            const end = encodeURIComponent(formatISO(endOfDay(date)));
            const filter = `dokonceni >= "${start}" and zahajeni <= "${end}"`;
            path = `udalost/(${filter}).json`;
        } else {
            path = 'udalost.json';
        }
        const response = await fetch(`${this.endpoint}/${path}?${query}`, {
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (data.winstrom.success === "false")
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
    async createReservation(userName, start, duration, slot, isManager) {
        const response = await fetch(`${this.endpoint}/udalost.json`, {
            method: 'PUT',
            headers: {
                ...this.authHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                winstrom: {
                    udalost: {
                        typAkt: 'code:UD??LOST',
                        zodpPrac: `code:${userName}`,
                        zahajeni: formatISO(start),
                        dokonceni: formatISO(add(start, { minutes: duration })),
                        zakazka: `code:${slot}`,
                        volno: isManager
                    }
                }
            })
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (data.winstrom.success === "false")
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
        if (data.winstrom.success === "false")
            return { error: data };
        const role = this.parseCode(data.winstrom.uzivatel[0].role);
        return { success: { role: role } };
    }

    /** Gets code of logged in user. */
    async getEmployeeCode() {
        const query = new URLSearchParams({
            detail: 'custom:kod'
        });
        const response = await fetch(`${this.endpoint}/uzivatel/(id=me()).json?${query}`, {
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (data.winstrom.success === "false")
            return { error: data };
        return { success: { kod: data.winstrom.uzivatel[0].kod } };
    }

    /** Obtains all parking slots and their type. */
    async getSlots() {
        const query = new URLSearchParams({
            detail: 'custom:kod,typZakazky,zodpPrac',
            limit: 0
        });
        const response = await fetch(`${this.endpoint}/zakazka.json?${query}`, {
            headers: this.authHeaders
        });
        if (!response.ok)
            return { error: response };
        const data = await response.json();
        if (data.winstrom.success === "false")
            return { error: data };
        const list = data.winstrom.zakazka.map(z => ({
            id: z.id,
            kod: z.kod,
            typ: this.parseCode(z.typZakazky),
            zodpPrac: z.zodpPrac ? this.parseCode(z.zodpPrac) : ""
        }));
        return { success: list };
    }
}
