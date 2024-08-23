/* global BigInt */
import { bls12_381 } from '@noble/curves/bls12-381';
import { sha256 } from '@noble/hashes/sha256';
import { blake2b } from 'blakejs';
import getRandomValues from 'get-random-values';
import { Metadata } from 'suidouble_metadata';

console.log(Metadata);

const PointG1 = bls12_381.G1;
const PointG2 = bls12_381.G2;

export default class TimeCapsuleEncryptor {
    constructor() {
        this._publicKey = this.hexStringToUint8Array("83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a", "hex");
        this._order = BigInt('0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001');
        this._period = 3;
        this._genesis_time = 1692803367;
    }

    roundAt(time_ms) {
        return Math.floor((time_ms - (this._genesis_time * 1000)) / (this._period * 1000)) + 1;
    }

    roundTime(round) {
        round = round < 0 ? 0 : round;
        return (this._genesis_time + (round - 1) * this._period) * 1000;
    }

    concatUint8Arrays(a1, a2) {
        const mergedArray = new Uint8Array(a1.length + a2.length);
        mergedArray.set(a1);
        mergedArray.set(a2, a1.length);

        return mergedArray;
    }

    sha256(a) {
        return sha256
            .create()
            .update(a)
            .digest();
    }

    roundKey(round) { 
        let value = BigInt(round);

        const byteArray = [];
        while (value > 0n) {
            byteArray.push(Number(value & 0xFFn));
            value >>= 8n;
        }
        while (byteArray.length < 8) { // Ensure the result is always 8 bytes long
            byteArray.push(0);
        }
        const a = new Uint8Array(byteArray.reverse());

        return this.sha256(a);
    }

    randomUint8ArrayOf32() {
        const ret = new Uint8Array(32);
        getRandomValues(ret);

        return ret;
    }

    hexStringToUint8Array(hexString) {
        if (hexString.length % 2 !== 0) {
            throw new Error('Hex string must have an even number of characters');
        }
        
        let array = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
            array[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
        return array;
        // return Uint8Array.from(Buffer.from(str, 'hex'));
    }

    stringToUint8Array(str) {
        return new TextEncoder().encode(str);
    }

    uint8ArrayToHexString(uint8Array) {
        return Array.from(uint8Array)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
        // return Buffer.from(uint8Array).toString('hex');
    }
    
    bytesToNumberBE(uint8Array) {
        return BigInt('0x' + this.uint8ArrayToHexString(Uint8Array.from(uint8Array)));
    }

    xor(a, b) {
        if (a.length != b.length) {
            throw new Error("Error: incompatible sizes");
        }
        const ret = new Uint8Array(a.length);
        for (let i = 0; i < a.length; i++) {
            ret[i] = a[i] ^ b[i];
        }
        return ret;
    }

    rToBytes(r) {
        let ret = new Uint8Array();
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c0.c0.c0.toString(16).padStart(96, "0")));
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c0.c0.c1.toString(16).padStart(96, "0")));
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c1.c0.c0.toString(16).padStart(96, "0")));
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c1.c0.c1.toString(16).padStart(96, "0")));


        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c0.c1.c0.toString(16).padStart(96, "0")));
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c0.c1.c1.toString(16).padStart(96, "0")));
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c1.c1.c0.toString(16).padStart(96, "0")));
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c1.c1.c1.toString(16).padStart(96, "0")));

        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c0.c2.c0.toString(16).padStart(96, "0")));
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c0.c2.c1.toString(16).padStart(96, "0")));
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c1.c2.c0.toString(16).padStart(96, "0")));
        ret = this.concatUint8Arrays(ret, this.hexStringToUint8Array(r.c1.c2.c1.toString(16).padStart(96, "0")));

        return ret;
    }
    
    intToULEB128(value) {
        let result = [];
        let v = value;

        do {
            let byte = v & 0x7F; // Get 7 least significant bits
            v >>>= 7;            // Logical right shift by 7 bits
            if (v !== 0) {
                byte |= 0x80;        // Set MSB to 1 if more bytes follow
            }
            result.push(byte);
        } while (v !== 0);
    
        return new Uint8Array(result);
    }

    encryptMessageForRound(message, round) {
        const roundKey = this.roundKey(round);
        if (!(message.buffer instanceof ArrayBuffer) || (message.BYTES_PER_ELEMENT === undefined)) {
            message = this.stringToUint8Array(message);
        }

        const messageLength = message.length;
        const messageLengthAsUint8Array = new Uint8Array([
            ((messageLength >> 24) % 256),
            ((messageLength >> 16) % 256),
            ((messageLength >> 8) % 256),
            (messageLength % 256),
        ]);
        
        // first 4 bytes is message length, as we are going to add padding
        message = this.concatUint8Arrays(messageLengthAsUint8Array, message);

        // split message into 32bytes chunks
        const messageChunks = [];
        const chunkSize = 32;
        for (let i = 0; i < message.length; i += chunkSize) {
            let chunk = message.slice(i, i + chunkSize);
            messageChunks.push(chunk);
        }

        if (messageChunks[messageChunks.length - 1].length < 32) {
            // add padding, so all chunks are 32 bytes
            const withPadding = this.randomUint8ArrayOf32();        /// padded with random bytes
            withPadding.set(messageChunks[messageChunks.length - 1]);
            messageChunks[messageChunks.length - 1] = withPadding;
        }

        const meta = new Metadata();
        let i = 0;

        for (const messageChunk of messageChunks) {
            // encrypt chunks one by one
            const enc = this.encryptChunk(messageChunk, roundKey);
            const encMetadataUint8Array = this.encToMetadata(enc);
            meta.set(i, encMetadataUint8Array, 'vector<u8>');
            i = i + 1;
        }

        return meta.toBytes();
    }

    encToMetadata(obj) {
        const meta = new Metadata();
        meta.set('v', obj.v);
        meta.set('w', obj.w);
        meta.set('u', obj.u);
        return meta.toBytes();
    }

    encryptChunk(message, roundKey) {
        // 1. Compute Gid = e(master,Q_id)
        const Qid = PointG1.hashToCurve(roundKey, { DST: 'BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_' });
        const m = PointG2.ProjectivePoint.fromHex(this._publicKey);
        const Gid = bls12_381.pairing(Qid, m);

        let sigma = this.randomUint8ArrayOf32(); // randomness!!! important!!!
        let r = BigInt('0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000002'); // > order, so we'd loop
        do {
            let to_hash = new Uint8Array();
            to_hash = this.concatUint8Arrays(to_hash, this.stringToUint8Array('HASH3 - '));
            to_hash = this.concatUint8Arrays(to_hash, sigma);
            to_hash = this.concatUint8Arrays(to_hash, message);
            let r_bytes = blake2b(to_hash, null, 32); // compared with Move ok
            r = this.bytesToNumberBE(r_bytes);
            if (r >= this._order) {
                sigma = blake2b(sigma, null, 32);
            }
            // console.log(this.uint8ArrayToHexString(to_hash) ); // compared with Move ok
        } while (r >= this._order);

        const U = PointG2.ProjectivePoint.BASE.multiply(r);
        const u_raw_bytes = U.toRawBytes();

        // console.log(this.uint8ArrayToHexString(u_raw_bytes)); //  compared with Move ok
        const rGid = bls12_381.fields.Fp12.pow(Gid, r); // same as let pk_rho_r = bls12381::gt_mul(&r, &pk_rho);

        let to_hash2 = new Uint8Array();
        to_hash2 = this.concatUint8Arrays(to_hash2, this.stringToUint8Array('HASH2 - '));
        to_hash2 = this.concatUint8Arrays(to_hash2, this.rToBytes(rGid) );

        let hash_pk_rho_r = blake2b(to_hash2, null, 32); 

        // console.log(hash_pk_rho_r);
        // console.log(this.uint8ArrayToHexString(hash_pk_rho_r)); //compared with Move ok

        let v = this.xor(sigma, hash_pk_rho_r);
        // console.log(this.uint8ArrayToHexString(v)); // same as v  //compared with Move ok

        let to_hash3 = new Uint8Array();
        to_hash3 = this.concatUint8Arrays(to_hash3, this.stringToUint8Array('HASH4 - '));
        to_hash3 = this.concatUint8Arrays(to_hash3, sigma );
        let hash3 = blake2b(to_hash3, null, 32);

        let w = this.xor(message, hash3);

        const enc = {
            u: u_raw_bytes,
            v: v,
            w: w,
        };

        return enc;
    }
}
