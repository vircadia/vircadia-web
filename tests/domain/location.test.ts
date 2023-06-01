import test, { FailureLogSeverity } from "micro-test-runner";
import { Location } from "@Modules/domain/location";

const candidate = (candidateUrl: string) => new Location(candidateUrl);


// =============== FULL LOCATION =============== //

// Arrange
let protocol = "wss:";
let hostname = "localhost";
let port = "40102";
let host = hostname + ":" + port;
let position = "100,5,1";
let orientation = "0,0,1,1";
let pathname = "/" + position + "/" + orientation;
let url = protocol + "//" + host + pathname;
// Act
test(candidate)
    .logging("Full location", FailureLogSeverity.ERROR)
    .with([url])
// Assert
    .expect([
        (result: Location) => result.href === url
                && result.protocol === protocol
                && result.host === host
                && result.port === port
                && result.pathname === pathname
                && result.position === position
                && result.orientation === orientation
    ]);


// ============ INCOMPLETE LOCATION ============ //

// Arrange
protocol = "";
hostname = "localhost";
port = "";
host = hostname;
position = "100,5,1";
orientation = "";
pathname = "/" + position;
url = host + pathname;
// Act
test(candidate)
    .logging("Incomplete location", FailureLogSeverity.ERROR)
    .with([url])
// Assert
    .expect([
        (result: Location) => result.href === url
                && result.protocol === protocol
                && result.host === host
                && result.port === port
                && result.pathname === pathname
                && result.position === position
                && result.orientation === orientation
    ]);


// ============= PURE PATH LOCATION ============ //

// Arrange
protocol = "";
hostname = "";
port = "";
host = hostname;
position = "100,5,1";
orientation = "0,0,1,1";
pathname = "/" + position + "/" + orientation;
url = pathname;
// Act
test(candidate)
    .logging("Pure path location", FailureLogSeverity.ERROR)
    .with([url])
// Assert
    .expect([
        (result: Location) => result.href === url
                && result.protocol === protocol
                && result.host === host
                && result.port === port
                && result.pathname === pathname
                && result.position === position
                && result.orientation === orientation
    ]);


// ============== TRIM EXTRA PATH ============== //

// Arrange
protocol = "wss:";
hostname = "localhost";
port = "";
host = hostname;
position = "100,5,1";
orientation = "0,0,1,1";
pathname = "/" + position + "/" + orientation;
url = protocol + "//" + host + pathname;
// Act
test(candidate)
    .logging("Location trim extra path", FailureLogSeverity.ERROR)
    .with([url + "/abcd"])
// Assert
    .expect([
        (result: Location) => result.href === url
                && result.protocol === protocol
                && result.host === host
                && result.port === port
                && result.pathname === pathname
                && result.position === position
                && result.orientation === orientation
    ]);


// ============== UPDATE LOCATION ============== //

// Arrange
protocol = "";
hostname = "localhost";
port = "";
host = hostname;
position = "100,5,1";
orientation = "";
pathname = "/" + position;
url = host + pathname;
// Act
test((candidateUrl: string) => {
    const location = new Location(candidateUrl);

    protocol = "wss:";
    port = "12345";
    host = hostname + ":" + port;
    url = protocol + "//" + host + pathname;

    location.protocol = protocol;
    location.port = port;

    return location;
})
    .logging("Update location", FailureLogSeverity.ERROR)
    .with([url])
// Assert
    .expect([
        (result: Location) => result.href === url
                && result.protocol === protocol
                && result.host === host
                && result.port === port
                && result.pathname === pathname
                && result.position === position
                && result.orientation === orientation
    ]);
