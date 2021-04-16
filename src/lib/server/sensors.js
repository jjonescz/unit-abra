import fetch from "node-fetch";

let checking = false;
export let lastCheck;
export let lastError;

let states = {};

/** Starts a background task that periodically checks sensors.
 * 
 * @remarks If a car leaves, shortens the reservation.
 */
export function startChecking() {
    if (!checking) {
        checking = true;
        doChecking();
    }
}

async function doChecking() {
    console.log('Sensor checking started.');

    while (checking) {
        try {
            // Get states of sensors.
            const response = await fetch('https://rezervace.s3.eu-central-1.amazonaws.com/parking8.json');
            const data = await response.json();

            // Find changes.
            for (const [sensor, value] of Object.entries(data)) {
                if (value !== states[sensor]) {
                    console.log('Found change of sensor', sensor);
                }
            }

            states = data;

            lastError = null;
        } catch (error) {
            console.log('Sensor checking failed', error);

            lastError = error;
        }

        // Remember when we last checked.
        lastCheck = new Date();

        // Sleep 1 minute.
        await new Promise(resolve => setTimeout(resolve, 1 * 1000));
    }
}
