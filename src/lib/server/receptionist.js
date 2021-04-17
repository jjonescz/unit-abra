import { FlexiApi } from "./flexiApi";

/** Extensions of FLEXI API specific for receptionist. */
export class ReceptionistApi {
    constructor() {
        this.api = new FlexiApi();
    }

    async createReservation(userName, start, duration, slot) {
        // Get user role.
        const role = await this.api.getRole();
        if (!role.success) return role;
        const isManager = role.success.role === 'MANAGER';

        return await this.api.createReservation(
            userName, start, duration, slot, isManager);
    }
}
