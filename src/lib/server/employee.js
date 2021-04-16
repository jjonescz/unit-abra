import { writable } from "svelte/store";

export const reservations = writable([
    { start: new Date(2021, 4, 16, 15, 0), duration: 60, slot: 101 },
    { start: new Date(2021, 4, 16, 20, 0), duration: 120, slot: 101 }
]);
