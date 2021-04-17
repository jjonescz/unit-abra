import { FlexiApi } from './flexiApi.js';
import { getFreeSlot } from './parkSlotSelection.js';

/** Extensions of FLEXI API specific for employees. */
export class EmployeeApi {
    constructor() {
        this.api = new FlexiApi();
    }

    async createReservation(start, duration) {
        // Get all reservations.
        const list = await this.api.getReservations();
        if (!list.success) return list;

        // Find free slot in them.
        var freeSlot = await getFreeSlot(list.success, start, duration);
        if (freeSlot === -1)
            return { noFreeSlot: true };

        // Get user role.
        const role = await this.api.getRole();
        if (!role.success) return role;
        const isManager = role.success.role === 'MANAGER';

        const r = await this.api.createReservation(
            this.api.username, start, duration, freeSlot, isManager);
        if (!r.success) return r;
        return {
            success: {
                ...r.success,
                slot: freeSlot
            }
        };
    }

    async deleteReservation(id) {
        // Determine whether user is manager.
        const role = await this.api.getRole();
        if (!role.success) return role;
        const isManager = role.success.role === 'MANAGER';

        if (!isManager) {
            // Find reservation.
            const r = await this.api.getReservation(id);
            if (!r.success) return r;

            // Check if spot is currently being used.
            const s = await this.api.getSensors();
            if (!s.success) return s;

            if (s.success[r.success.slot]) {
                return { fullSlot: true };
            }
        }

        return await this.api.deleteReservation(id);
    }
}
