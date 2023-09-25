# Notes On Domain Connection and Account Login for Vircadia Web

[Vircadia Web] has two connections to manage: the connection to the domain-server
and the connection to the metaverse-server.
The domain-server connection has to do with the display and interaction with
the virtual world scene while the connection to the metaverse-server has to do
with the account, access tokens, and grid management.

This note discusses the states for these two connections and how they interact.

# domain-server Connection

The connection to the domain-server is implemented by the [Vircadia Web SDK] library.
The connection is a little complex in that a connection to a [Vircadia Server]
includes connections to multiple assignment-clients. The connections to the
assignment-clients are optional (like connecting to the message assignment-client
for text chat but not connecting to the audio assignment-client).

So the connection to the domain-service can be considered as a main connection
and then several associated sub-service connections.

The persisted domain-server state will be saved as the connection URL to the domain-server,
which sub-services are connected, and optionally an "explore" connection description
which would give name and thumbnail information.

The domain-server states will be:

* disconnected
* connecting
* connected
* disconnecting
* error
* unavailable (sub-service is not available)

The same states will be used for the sub-services with the sub-services
could potentially be "unavailable". Additionally, if the domain-server
connection goes into the states "disconnected", "disconnecting", or "error", all of
the associated sub-services will also be disconnected.

# metaverse-server Connection

The metaverse-server URL is fetched from the domain-server (to make sure
vircadia-web and the domain-server are in sync) therefore, the metaverse-server
connection cannot be initialized until the domain-server is connected.

The metaverse-server states will be:

* uninitialized (until domain-server is connected and URL has been fetched)
* connecting (requesting metaverse-server info from metaverse-server)
* connected
* error

The other metaverse-server related information is the account access token.
If the user had previously logged in, the account name and account access token
is saved in persistent storage and is re-used in the new session.

# Session Persistance

A design goal is to have sessions persist between invocations of [Vircadia Web].
That is, if a user is connected to a domain-server and logged into the
metaverse-server, the user can close the browser and later open a new
[Vircadia Web] browser session on that same computer and be restored
to that domain-server and metaverse-server connection state.

Other session persistance information is also kept so things like visibility
and location of dialogs and viewer decorations (light/dark stylings, for instance)
are restored when a browser session is restored.

This will be implemented by keeping connection state information in the
browser's [Window.localStorage]. Note that this has the disadvantage
that moving to a different browser or different device (like going from
desktop to mobile) will not restore the exited session.
**TODO**: think about some cloud service (by the metaverse-server?)
that would allow session portability (like Discord, for instance).

Since access to [Window.localStorage] is unique to the document's origin, if
a user has multiple [Vircadia Web] sessions open in different browser tabs,
there will be some confusion as to the session state to recover.
**TODO**: how to solve this? Is there a way to ask the browser how many
sessions are open to the same URL?

# Session Startup

When a [Vircadia Web] session is started, [Window.localStorage] is checked to
see if state persistance information is available. The following steps are performed:

* if a domain-server URL is available, a connection to that domain-server is made
* what the user sees is a display of the domain URL (or domain-server name info
  if "Explore" information is available) and the domain state going to "connecting"
* if the domain-server connection is successful and there are stored services
  listed in the persistent storage, those services are connected
* what the user sees is the domain-server state going to "connected"
* once the domain-server is connected, [Vircadia Web] will request the metaverse-server
  URL
* the metaverse-server info will be fetched and the connection verified
* the user will see the metaverse-server name and URL displayed
* if there is a login access token and account name saved in persistent-storage,
  the user will be considered "logged in"
* the user will see the account name and "logged in" displayed
* if other view parameters are in persistent storage, the view will be setup
  with those parameters (dialog locations, color scheme, etc)
* **TODO**: complete session startup restoration

[Window.localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[Vircadia]: https://vircadia.com
[Vircadia Web]: https://github.com/vircadia/vircadia-web
[Vircadia Web SDK]: https://github.com/vircadia/vircadia-web-sdk
[Vircadia Server]: https://github.com/vircadia/vircadia
[Vircadia Metaverse Server]: https://github.com/vircadia/Iamus
