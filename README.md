# timecapsule

UI to encrypt messages for drand rounds on user side (and mint some nice looking NFT).

Encryption, javascript: bls12_381 + blake2b [shared/classes/TimeCapsuleEncryptor.js](shared/classes/TimeCapsuleEncryptor.js)

Decryption, move: sui::bls12381, sui::hash::blake2b256, suidouble::metadata  [move/sources/capsule.move](move/sources/capsule.move)

Take a look in action at [hexcapsule.com](https://www.hexcapsule.com)

Frontend: Vue, interaction with Sui package: [shared/classes](shared/classes)

Run on your local:

```bash
npm run dev
```

