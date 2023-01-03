import { Location } from "@Modules/domain/location";

test("Test full location", () => {
    // Arrange
    const protocol = "wss:";
    const hostname = "localhost";
    const port = "40102";
    const host = hostname + ":" + port;
    const position = "100,5,1";
    const orientation = "0,0,1,1";
    const pathname = "/" + position + "/" + orientation;
    const url = protocol + "//" + host + pathname;

    // Act
    const location = new Location(url);

    // Assert
    expect(location.href).toBe(url);
    expect(location.protocol).toBe(protocol);
    expect(location.host).toBe(host);
    expect(location.port).toBe(port);
    expect(location.pathname).toBe(pathname);
    expect(location.position).toBe(position);
    expect(location.orientation).toBe(orientation);
});

test("Test incomplete location", () => {
    // Arrange
    const protocol = "";
    const hostname = "localhost";
    const port = "";
    const host = hostname;
    const position = "100,5,1";
    const orientation = "";
    const pathname = "/" + position;
    const url = host + pathname;

    // Act
    const location = new Location(url);

    // Assert
    expect(location.href).toBe(url);
    expect(location.protocol).toBe(protocol);
    expect(location.host).toBe(host);
    expect(location.port).toBe(port);
    expect(location.pathname).toBe(pathname);
    expect(location.position).toBe(position);
    expect(location.orientation).toBe(orientation);
});

test("Test pure path location", () => {
    // Arrange
    const protocol = "";
    const port = "";
    const host = "";
    const position = "100,5,1";
    const orientation = "0,0,1,1";
    const pathname = "/" + position + "/" + orientation;
    const url = pathname;

    // Act
    const location = new Location(url);

    // Assert
    expect(location.href).toBe(url);
    expect(location.protocol).toBe(protocol);
    expect(location.host).toBe(host);
    expect(location.port).toBe(port);
    expect(location.pathname).toBe(pathname);
    expect(location.position).toBe(position);
    expect(location.orientation).toBe(orientation);
});

test("Test location trim extra path", () => {
    // Arrange
    const protocol = "wss:";
    const hostname = "localhost";
    const port = "";
    const host = hostname;
    const position = "100,5,1";
    const orientation = "0,0,1,1";
    const pathname = "/" + position + "/" + orientation;
    const url = protocol + "//" + host + pathname;

    // Act
    const location = new Location(url + "/abcd");

    // Assert
    expect(location.href).toBe(url);
    expect(location.protocol).toBe(protocol);
    expect(location.host).toBe(host);
    expect(location.port).toBe(port);
    expect(location.pathname).toBe(pathname);
    expect(location.position).toBe(position);
    expect(location.orientation).toBe(orientation);
});

test("Test update location", () => {
    // Arrange
    let protocol = "";
    const hostname = "localhost";
    let port = "";
    let host = hostname;
    const position = "100,5,1";
    const orientation = "";
    const pathname = "/" + position;
    let url = host + pathname;

    // Act
    const location = new Location(url);
    protocol = "wss:";
    port = "12345";
    host = hostname + ":" + port;
    url = protocol + "//" + host + pathname;

    location.protocol = protocol;
    location.port = port;

    // Assert
    location.protocol = protocol;
    expect(location.href).toBe(url);
    expect(location.protocol).toBe(protocol);
    expect(location.host).toBe(host);
    expect(location.port).toBe(port);
    expect(location.pathname).toBe(pathname);
    expect(location.position).toBe(position);
    expect(location.orientation).toBe(orientation);
});
