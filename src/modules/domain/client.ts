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
export class Client {

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
}
