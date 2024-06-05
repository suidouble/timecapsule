# timecapsule

Live dApp - [hexcapsule.com](https://www.hexcapsule.com)

[presentation video](https://www.youtube.com/watch?v=1TmmzaJGp0s)

[presentation notes](https://docs.google.com/presentation/d/1ZLKuOMCPxKWad9NO3nhaF-WNs9mF2zw2trBzeJkgPrE/edit?usp=sharing)


UI to encrypt messages for drand rounds on user side (and mint some nice looking NFT).

Encryption, javascript: bls12_381 + blake2b [shared/classes/TimeCapsuleEncryptor.js](shared/classes/TimeCapsuleEncryptor.js)

Decryption, move: sui::bls12381, sui::hash::blake2b256, suidouble::metadata  [move/sources/capsule.move](move/sources/capsule.move)

Frontend: Vue, interaction with Sui package  [shared/classes](shared/classes) :

    - DrandRounds.js - drand API wrapper to get round signatures
    - SampleProphecies.js - some sample messages as inspiration for users
    - TimeCapsule.js - entity of TimeCapsule object on the blockchain
    - TimeCapsuleContract.js - methods to interact with Move package
    - TimeCapsuleEncryptor.js - encrypting messages


### packages on the blockchain

testnet - [0x5642b6ead93e220b692fbae8be0e865c36ec0d06287d6319889757dc58c25448](https://testnet.suivision.xyz/package/0x5642b6ead93e220b692fbae8be0e865c36ec0d06287d6319889757dc58c25448)

mainnet - [0x020abcd433df2c68f62b794d0751d3a839945dcb6776ecf9fac76d3f0324a274](https://suivision.xyz/package/0x020abcd433df2c68f62b794d0751d3a839945dcb6776ecf9fac76d3f0324a274)

### dev

Run on your local:

```bash
npm run dev
```

