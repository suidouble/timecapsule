#[test_only]
module timecapsule::timecapsule_tests {
    use timecapsule::timecapsule;
    use std::debug;

    #[test_only]
    use sui::test_scenario as ts;
    // #[test_only]
    // use sui::test_utils as sui_tests;

    use sui::sui::SUI;
    use sui::coin;
    use std::string;
    // use sui::coin::{Self, Coin};

    const TEST_SENDER_ADDR: address = @0x1;

    public struct Fake has key, store {
        id: UID,
    }


    #[test]
    fun test_contract() {
        // Imagine we are running this on May 01 2024
        // let start_timestamp_ms = 1714510800000; // Wed May 01 2024 16:23:14 GMT+0000


        let mut scenario = ts::begin(TEST_SENDER_ADDR);

        timecapsule::make_and_share_store_for_testing(ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, TEST_SENDER_ADDR);

        let mut store: timecapsule::TimecapsuleStore = ts::take_shared(&scenario);

        // message of "test" encrypted for a drand round of 7965511
        let encrypted = x"0000000000c6000000bc0100370000002900000020e1afbff2c8523861de70fb0bc85fa5fedcbb163e66f501c768cc59ce07201ebc380000002900000020fb2428f4c3c7c82621b00fe6cc370405016804fe9d4aecc2f99497f3c2f7fe7a360000006900000060939b1b6a662aa00a8145ad6817f839a3fd04933725545093613dd4774e0ca1f994de29e2fa781cd6cc2a6a127731997c1383f0da0beeea8529b72bb610bac734e8812f90808e1d04369a51f2a0114f1a55bf5f37af7c16d6a24b00f45e629357";
        let round = 7965511;

        assert!(user_sui_balance(ts::sender(&scenario), &mut scenario) == 0, 0); // holds nothing

        let coin = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario)); // 1 SUI

        timecapsule::mint_with_sui(&mut store, encrypted, round, coin, ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, TEST_SENDER_ADDR);

        let mut time_capsule: timecapsule::Timecapsule = ts::take_from_sender(&scenario);

        // decryption signature for drand round of 7965511
        let round_signature = x"8378a16d9355f6ab516bd76c3d8d547a30b044624c0832dfa62ae513393ad57cf81cc04dcb1e3200dfb99587734ff97f";

        // try to decrypt:
        timecapsule::decrypt(&store, &mut time_capsule, round_signature, ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, TEST_SENDER_ADDR);

        // expected to get 0.895 SUI back ( 1.00 - 0.1 - (0.5%) )
        let user_sui_balance_now = user_sui_balance(ts::sender(&scenario), &mut scenario);
        assert!(user_sui_balance_now == 895_000_000, 0);

        // check that capsule is decrypted:
        assert!(string::bytes(&timecapsule::prophecy(&time_capsule)) == b"test", 0);
        // and everything is ok

        ts::return_to_sender(&scenario, time_capsule);
        ts::return_shared(store);
        ts::end(scenario);
    }


    public fun user_sui_balance(addr: address, scenario: &mut ts::Scenario): u64 {
        ts::next_tx(scenario, addr);

        let mut sum = 0;
        let mut coin_ids = ts::ids_for_sender<coin::Coin<SUI>>(scenario);
        let mut i = 0;

        while ( vector::length(&coin_ids) > 0 ) {
            let coin_id = vector::pop_back(&mut coin_ids);
            let coin_item = ts::take_from_sender_by_id<coin::Coin<SUI>>(scenario, coin_id );
            sum = sum + coin::value(&coin_item);
            ts::return_to_sender(scenario, coin_item);
            // scenario.return_to_sender(coin);
            i = i + 1;
        };

        sum
    }


}