export class Reservation {
    /** @type {Date} */
    start;
    /** @type {Number} in minutes */
    duration;
    /** @type {Number} parking slot */
    slot;
}

/** @returns {Reservation[]} */
export function getReservations() {
    return [
        { start: new Date(2021, 4, 16, 15, 0), duration: 60, slot: 101 },
        { start: new Date(2021, 4, 16, 20, 0), duration: 120, slot: 101 }
    ];
}
