#[test_only]
module timecapsule::timecapsule_tests {
    use timecapsule::timecapsule;
    // use std::debug;

    #[test_only]
    use sui::test_scenario as ts;
    #[test_only]
    use sui::test_utils as sui_tests;

    use sui::sui::SUI;
    use sui::coin::{Self, Coin};

    const TEST_SENDER_ADDR: address = @0x1;

    public struct Fake has key, store {
        id: UID,
    }


    #[test]
    fun test_contract() {
        // Imagine we are running this on May 01 2024
        let start_timestamp_ms = 1714510800000; // Wed May 01 2024 16:23:14 GMT+0000


        let mut scenario = ts::begin(TEST_SENDER_ADDR);

        timecapsule::make_and_share_store_for_testing(ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, TEST_SENDER_ADDR);

        let mut store: timecapsule::TimecapsuleStore = ts::take_shared(&scenario);

        // 0x3cb271cceba9b6a6ac7a8d0b326ef789afe807b8cf4e8cbb92f1f19bc6a16034
        let encrypted = x"0000000000c6000000bc0100370000002900000020e1afbff2c8523861de70fb0bc85fa5fedcbb163e66f501c768cc59ce07201ebc380000002900000020fb2428f4c3c7c82621b00fe6cc370405016804fe9d4aecc2f99497f3c2f7fe7a360000006900000060939b1b6a662aa00a8145ad6817f839a3fd04933725545093613dd4774e0ca1f994de29e2fa781cd6cc2a6a127731997c1383f0da0beeea8529b72bb610bac734e8812f90808e1d04369a51f2a0114f1a55bf5f37af7c16d6a24b00f45e629357";
        let round = 7965511;


        timecapsule::mint(&mut store, encrypted, round, ts::ctx(&mut scenario));
        ts::next_tx(&mut scenario, TEST_SENDER_ADDR);

        let mut time_capsule: timecapsule::Timecapsule = ts::take_from_sender(&scenario);

        // let mut coin = coin::mint_for_testing<SUI>(10, ts::ctx(&mut scenario));

        // timecapsule::put_coin_to_bag(&mut time_capsule, coin, ts::ctx(&mut scenario) );

        // ts::next_tx(&mut scenario, TEST_SENDER_ADDR);


        let round_signature = x"8378a16d9355f6ab516bd76c3d8d547a30b044624c0832dfa62ae513393ad57cf81cc04dcb1e3200dfb99587734ff97f";
        timecapsule::decrypt(&mut time_capsule, round_signature, ts::ctx(&mut scenario));


        ts::next_tx(&mut scenario, TEST_SENDER_ADDR);
        
        // assert!(time_capsule.decrypted == true, 0)

        ts::return_to_sender(&scenario, time_capsule);
        ts::return_shared(store);
        ts::end(scenario);

    }

}