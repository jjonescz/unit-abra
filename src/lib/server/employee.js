import { FlexiApi } from './flexiApi.js';
import { getFreeSlot, getManagerReleaseSlot } from './parkSlotSelection.js';

/** Extensions of FLEXI API specific for employees. */
export class EmployeeApi {
    constructor() {
        this.api = new FlexiApi();
    }

    async createReservation(start, duration) {
        // Get all reservations.
        const list = await this.api.getReservations();
        if (!list.success) return list;

        // Get user role.
        const role = await this.api.getRole();
        if (!role.success) return role;
        const isManager = role.success.role === 'MANAGER';

        if (isManager) {
            const employeeSlots = await this.api.getSlots();
            if (!employeeSlots.success) return employeeSlots;
            const loggedManagerCode = await this.api.getEmployeeCode();
            if (!loggedManagerCode.success) return loggedManagerCode;

            var managerSlot = 0
            employeeSlots.success.map((x) => { if (x.zodpPrac === loggedManagerCode.success.kod) managerSlot = x.kod })

            var slot = await getManagerReleaseSlot(list.success, managerSlot, start, duration);
            if (slot === -1)
                return { slotAlreadyFree: true };
        } else {
            // Find free slot in them.
            var slot = await getFreeSlot(list.success, start, duration);
            if (slot === -1)
                return { noFreeSlot: true };
        }

        const r = await this.api.createReservation(
            this.api.username, start, duration, slot, isManager);
        if (!r.success) return r;
        return {
            success: {
                ...r.success,
                slot: slot
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
