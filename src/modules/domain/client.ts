//
//  client.ts
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// The web SDK doesn't export its AssignmentClientState member, so it is redefined here.
/**
 * The connection state of an Assignment Client.
 */
export enum AssignmentClientState {
    UNAVAILABLE,
    DISCONNECTED,
    CONNECTED
}

/**
 * Parent class for all AssignmentClients.
 */
export abstract class Client {
    /**
     * Get the string name of an AssignmentClientState.
     * This is needed since the SDK does not export AssignmentClient. // TODO: Review this claim.
     */
    static stateToString(state: AssignmentClientState): string {
        switch (state) {
            case AssignmentClientState.DISCONNECTED:
                return "DISCONNECTED";
            case AssignmentClientState.CONNECTED:
                return "CONNECTED";
            case AssignmentClientState.UNAVAILABLE:
                return "UNAVAILABLE";
            default:
                return "DISCONNECTED";
        }
    }

    /**
     * The state of the underlying client.
     * Must be implemented by each descendant of this class.
     */
    public abstract clientState: AssignmentClientState;

    /**
     * Return a Promise that is resolved in a given number of milliseconds.
     */
    public static async waitABit(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Return a Promise that is resolved when the underlying client is CONNECTED.
     *
     * This is a kludge that does polling while waiting for the connected state.
     * A better implementation would be to save the (resolve,reject) in a list and
     * call them when the onStateChanged event happens.
     *
     * @param timeoutMS `(Optional)` The number of milliseconds to wait. Default is `300,000` (5 minutes).
     * @returns A reference to the Client being waited on.
     * @throws An exception if the timeout interval has passed and the client is still not CONNECTED.
     */
    public async waitUntilConnected(timeoutMS?: number): Promise<Client> {
        const waitTimeMS = 100;
        return new Promise<Client>((resolve, reject) => {
            (async () => {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                let maxTime = timeoutMS ?? 5 * 60 * 1000; // 5 minutes.
                while (this.clientState !== AssignmentClientState.CONNECTED) {
                    // eslint-disable-next-line no-await-in-loop
                    await Client.waitABit(waitTimeMS);
                    maxTime -= waitTimeMS;
                    if (maxTime < 0) {
                        reject(new Error("timeout"));
                    }
                }
                resolve(this);
            })();
        });
    }
}
