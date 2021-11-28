/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// Duplicated here because of problems with importing the type from the SDK
export enum AssignmentClientState {
    UNAVAILABLE = 0,
    DISCONNECTED,
    CONNECTED
}
/** Parant class for all AssignmentClients  */
export abstract class Client {

    /** Return string name of AssignmentClientState.
     * This is needed since the SDK does not export AssignmentClient
     */
    static stateToString(pState: AssignmentClientState): string {
        let ret = "UNKNOWN";
        switch (pState) {
            case AssignmentClientState.DISCONNECTED:
                ret = "DISCONNECTED";
                break;
            case AssignmentClientState.CONNECTED:
                ret = "CONNECTED";
                break;
            case AssignmentClientState.UNAVAILABLE:
                ret = "UNAVAILABLE";
                break;
            default:
                ret = "DISCONNECTED";
                break;
        }
        return ret;
    }

    // Returns the state of the underlying client
    // Must be implemented by each decendent of this parent class.
    public abstract clientState: AssignmentClientState;

    /** Return a Promise that is resolved in a certain number of milliseconds
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
     * A better implmentation would be to save the (resolve,reject) in a list and
     * call them when the onStateChanged event happens.
     *
     * @param pTimeoutMS optional number of MS to wait. Default is to 5 minutes.
     * @returns the Client being waited on
     * @throws exception if waited more than the timeout interval
     */
    public async waitUntilConnected(pTimeoutMS?: number): Promise<Client> {
        const waitTimeMS = 100;
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        return new Promise<Client>((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (async () => {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                let maxTime = pTimeoutMS ?? 5 * 60 * 1000; // 5 minutes
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
