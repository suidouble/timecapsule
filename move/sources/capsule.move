// fork of suidouble_metadata

module timecapsule::capsule {

    // #[test_only]
    // use sui::clock;
    // #[test_only]
    // use sui::test_scenario;
    // #[test_only]
    // use sui::random;

    use sui::bcs;
    use timecapsule::metadata;
    use std::hash;
    use sui::bls12381;
    // use std::debug;
    use sui::hash::blake2b256;
    use sui::group_ops;
    

    const EInvalidLength: u64 = 0;
    const BLS12381_ORDER: vector<u8> = x"73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001";

    public struct DrandChain has drop {
        genesis_time: u64,  // note it's seconds here, not ms,  while we use ms in methods
        period: u64,
        public_key: vector<u8>,
        randomness: vector<u8>, // adds randomness to the encrypted process, you'd better use it
    }

    /// An encryption of 32 bytes message following https://eprint.iacr.org/2023/189.pdf.
    public struct IbeEncryption has store, drop, copy {
        u: group_ops::Element<bls12381::G2>,
        v: vector<u8>,
        w: vector<u8>,
    }

    public fun drand_quicknet_with_randomness(randomness_bytes: vector<u8>): DrandChain {
        let mut drand = drand_quicknet();
        drand.add_randomness(randomness_bytes);

        drand
    }

    public fun drand_quicknet(): DrandChain {
        DrandChain {
            randomness: vector::empty(),
            genesis_time: 1692803367, // note it's seconds here, not ms,  while we use ms in methods
            period: 3,
            public_key: x"83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a"
        }
    }

    public fun drand_with_params(genesis_time_seconds: u64, period: u64, public_key: vector<u8>, randomness: vector<u8>): DrandChain {
        DrandChain {
            randomness: randomness,
            genesis_time: genesis_time_seconds, // note it's seconds here, not ms,  while we use ms in methods
            period: period,
            public_key: public_key
        }
    }

    public fun add_randomness(self: &mut DrandChain, randomness: vector<u8>) {
        self.randomness = hash::sha2_256(randomness);
    }

    public fun public_key(self: &DrandChain): &vector<u8> {
        return &self.public_key
    }

    public fun use_randomness(self: &mut DrandChain): &vector<u8> {
        self.randomness = hash::sha2_256(self.randomness);

        &self.randomness
    }

    public fun round_at(self: &DrandChain, timestamp_ms: u64): u64 {
        let timestamp = timestamp_ms / 1000; // to seconds
        if (self.genesis_time > timestamp) {
            return 0
        };
        return ((timestamp - self.genesis_time) / self.period)
    }

    public fun latest_round(self: &DrandChain, timestamp_ms: u64): u64 {
        return self.round_at(timestamp_ms)
    }


    public fun verify_signature(self: &mut DrandChain, round: u64, signature_ref: &vector<u8>): bool {
        verify_round_signature(&self.public_key, round, signature_ref)
    }

    public fun decrypt(_self: &DrandChain, encrypted_msg_ref: &vector<u8>, round_signature: vector<u8>): vector<u8> {
        decrypt_with_round_signature(encrypted_msg_ref, round_signature)
    }

    /// Convert IbeEncryption to binary format. Note that it's differenf to what Sui team uses in their code samples
    public fun ibe_encryption_to_bytes(enc: IbeEncryption): vector<u8> {
        let mut ret = vector::empty();
        metadata::set(&mut ret, metadata::key(&b"v"), &enc.v);
        metadata::set(&mut ret, metadata::key(&b"w"), &enc.w);
        metadata::set(&mut ret, metadata::key(&b"u"), group_ops::bytes(&enc.u));

        ret
    }

    // Restore IbeEncryption from binary representation
    public fun bytes_to_ibe_encryption(bytes_ref: &vector<u8>): IbeEncryption {
        IbeEncryption {
            u: bls12381::g2_from_bytes(&metadata::get_vec_u8(bytes_ref, metadata::key(&b"u"))),
            v: metadata::get_vec_u8(bytes_ref, metadata::key(&b"v")),
            w: metadata::get_vec_u8(bytes_ref, metadata::key(&b"w"))
        }
    }

    // Hash a round value to use for encryption
    public fun round_key(round: u64): vector<u8> {
        let mut as_bytes = bcs::to_bytes(&round);
        vector::reverse(&mut as_bytes);

        hash::sha2_256(as_bytes)
    }


    public fun verify_round_signature(public_key_ref: &vector<u8>, round: u64, round_signature_ref: &vector<u8>): bool {
        let round_hash = round_key(round);
        bls12381::bls12381_min_sig_verify(round_signature_ref, public_key_ref, &round_hash)
    }

    public fun decrypt_with_round_signature(encrypted_msg_ref: &vector<u8>, round_signature: vector<u8>): vector<u8> {
        let target_key = bls12381::g1_from_bytes(&round_signature);
        let mut ret: vector<u8> = vector::empty();
        
        // encrypted message is vector<u8> oranized as metadata with structure of:
        //    0 -  first chunk of encrypted 32 bytes, when decrypted, first 4 bytes is original message length and 28 bytes of data
        //    1 -  second chunk of encrypted 32 bytes, decrypted to 32 bytes of message
        //    ....
        //    N -  last chunk of encrypted 32 bytes, 
        //         last chunk when decrypted may be padded by random bytes, so take a msg length from chunk #0 to trim it
        //    where 0..N - u32 indexes for metadata library, and chunk is to be get as metadata::get_vec_u8 with it

        // first step - get chunks count as from metadata vector<u8>
        let chunks_count = metadata::get_chunks_count(encrypted_msg_ref); // 

        let mut i = 0;
        let mut msg_length: u32 = 0;

        while (i < chunks_count) {
            // read and decrypt chunk one by one
            let chunk = metadata::get_vec_u8(encrypted_msg_ref, ( (i) as u32) );

            let enc = bytes_to_ibe_encryption(&chunk);
            let dec = ibe_decrypt(enc, &target_key);
            let dec_binary = option::destroy_with_default(dec, vector::empty());

            if (i == 0) {
                // very first chunk has first 4 bytes of msg_length
                msg_length = (*dec_binary.borrow(0) as u32) << 24 |
                (*dec_binary.borrow(1) as u32) << 16 |
                (*dec_binary.borrow(2) as u32) << 8 |
                (*dec_binary.borrow(3) as u32);

                let mut j = 4;
                while (j < 32) {
                    vector::push_back(&mut ret, *vector::borrow(&dec_binary, j));
                    j = j + 1;
                };
            } else {
                vector::append(&mut ret, dec_binary);
            };

            i = i + 1;
        };

        // get rid of not needed extra bytes we used for padding
        while (vector::length(&ret) > (msg_length as u64)) {
            ret.pop_back();
        };

        ret
    }


    // Decrypt an IBE encryption using a 'target_key'.
    public fun ibe_decrypt(enc: IbeEncryption, target_key: &group_ops::Element<bls12381::G1>): Option<vector<u8>> {
        // sigma_prime = V xor H2(e(target_key, u))
        let e = bls12381::pairing(target_key, &enc.u);
        let mut to_hash = b"HASH2 - ";
        vector::append(&mut to_hash, *group_ops::bytes(&e));
        let hash = blake2b256(&to_hash);
        let mut sigma_prime = vector::empty();
        let mut i = 0;
        while (i < vector::length(&enc.v)) {
            vector::push_back(&mut sigma_prime, *vector::borrow(&hash, i) ^ *vector::borrow(&enc.v, i));
            i = i + 1;
        };

        // m_prime = W xor H4(sigma_prime)
        let mut to_hash = b"HASH4 - ";
        vector::append(&mut to_hash, sigma_prime);
        let hash = blake2b256(&to_hash);
        let mut m_prime = vector::empty();
        let mut i = 0;
        while (i < vector::length(&enc.w)) {
            vector::push_back(&mut m_prime, *vector::borrow(&hash, i) ^ *vector::borrow(&enc.w, i));
            i = i + 1;
        };

        // r = H3(sigma_prime | m_prime) as a scalar (the paper has a typo)
        let mut to_hash = b"HASH3 - ";
        vector::append(&mut to_hash, sigma_prime);
        vector::append(&mut to_hash, m_prime);
        // If the encryption is generated correctly, this should always be a valid scalar (before the modulo).
        // However since in the tests we create it insecurely, we make sure it is in the right range.
        let r = modulo_order(&blake2b256(&to_hash));
        let r = bls12381::scalar_from_bytes(&r);

        // U ?= r*g2
        let g2r = bls12381::g2_mul(&r, &bls12381::g2_generator());
        if (group_ops::equal(&enc.u, &g2r)) {
            option::some(m_prime)
        } else {
            option::none()
        }
    }


    fun modulo_order(x: &vector<u8>): vector<u8> {
        let mut res = *x;
        // Since 2^256 < 3*ORDER, this loop won't run many times.
        while (true) {
            let minus_order = try_substract(&res);
            if (option::is_none(&minus_order)) {
                return res
            };
            res = *option::borrow(&minus_order);
        };
        res
    }
        

    // Returns x-ORDER if x >= ORDER, otherwise none.
    fun try_substract(x: &vector<u8>): Option<vector<u8>> {
        assert!(vector::length(x) == 32, EInvalidLength);
        let order = BLS12381_ORDER;
        let mut c = vector::empty();
        let mut i = 0;
        let mut carry: u8 = 0;
        while (i < 32) {
            let curr = 31 - i;
            let b1 = *vector::borrow(x, curr);
            let b2 = *vector::borrow(&order, curr);
            let sum: u16 = (b2 as u16) + (carry as u16);
            if (sum > (b1 as u16)) {
                carry = 1;
                let res = 0x100 + (b1 as u16) - sum;
                vector::push_back(&mut c, (res as u8));
            } else {
                carry = 0;
                let res = (b1 as u16) - sum;
                vector::push_back(&mut c, (res as u8));
            };
            i = i + 1;
        };
        if (carry != 0) {
            option::none()
        } else {
            vector::reverse(&mut c);
            option::some(c)
        }
    }



}