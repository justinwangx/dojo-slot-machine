## Ape Slots

Ape Slots is an onchain slot machine. It uses the Dojo Engine, which uses Cairo to ensure provability on the StarkNet Blockchain.

### Initial Setup

**Prerequisites:** First and foremost, ensure that Dojo is installed on your system. If it isn't, you can easily get it set up with:

```console
curl -L https://install.dojoengine.org | bash
```

Followed by:

```console
dojoup
```

For an in-depth setup guide, consult the [Dojo book](https://book.dojoengine.org/getting-started/quick-start.html).

### Launch the Game

After cloning the project, execute the following:

1. **Terminal 1 - Katana**:

```console
cd dojo-starter && katana --disable-fee
```

2. **Terminal 2 - Contracts**:

```console
cd dojo-starter && sozo build && sozo migrate
scripts/default_auth.sh
```

3. **Terminal 3 - Client**:

```console
cd client && yarn && yarn dev
```

4. **Terminal 4 - Torii**:

Uncomment the 'world_address' parameter in `dojo-starter/Scarb.toml` then:

```console
cd dojo-starter && torii
```

Upon completion, launch your browser and navigate to http://localhost:5173/. You'll be greeted by the running example!
