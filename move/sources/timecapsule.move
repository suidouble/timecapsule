#[allow(unused_variable, unused_use)]
module timecapsule::timecapsule {

    // use suidouble_metadata::metadata;
    use timecapsule::capsule;
    // use sui::package;
    // use std::string::{utf8};
    // use sui::display;
    // // use sui::transfer;    // provided by default
    // // use sui::tx_context;  // provided by default
    // use std::debug;

    // use sui::test_scenario as ts;
    // use sui::test_utils as sui_tests;
    use sui::balance::{Self, Balance};
    use std::string::{utf8};
    use sui::display;
    use sui::package;
    use sui::object_bag;
    // use sui::object;
    use std::type_name;
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::event;

    // Trting to mint time capsule with invalid dround signature
    const EInvalidRound: u64 = 3;

    // Trting to unwrap time capsule with invalid dround signature
    const EInvalidRoundSignature: u64 = 2;

    // To put coin into timecapsule, you have to use put_coin_to_bag method
    const EPutCoinWithItsMethod: u64 = 1;



    public struct TIMECAPSULE has drop {} /// One-Time-Witness for the module.

    public struct NewStoreEvent has copy, drop {
        id: ID,
    }
    public struct NewAdminCapEvent has copy, drop {
        id: ID,
    }
    public struct NewTimecapsuleEvent has copy, drop {
        id: ID,
        for_round: u64,
        sui: u64,
    }
    public struct NewDecryptedEvent has copy, drop {
        id: ID,
        sui: u64,
    }

    public struct TimecapsuleStore has key {
        id: UID,
        fee: Balance<SUI>,
        count_minted: u256,
        metadata: vector<u8>
    }

    public struct AdminCap has key {  // admin capability. Take care of this object. Issued to the creator on the package publishing
        id: UID,
    }

    public struct Timecapsule has key, store {
        id: UID,
        encrypted_prophecy: vector<u8>,
        prophecy: vector<u8>,
        for_round: u64,
        decrypted: bool,
        object_bag: object_bag::ObjectBag,
        sui: Balance<SUI>,
        metadata: vector<u8>
    }

    fun init(otw: TIMECAPSULE, ctx: &mut TxContext) {
        // Claim the `Publisher` for the package!
        let publisher = package::claim(otw, ctx);


        let keys = vector[
            utf8(b"name"),
            utf8(b"link"),
            utf8(b"image_url"),
            utf8(b"description"),
            utf8(b"project_url"),
            utf8(b"creator"),
        ];

        let values = vector[
            utf8(b"TimeCapsule"),
            utf8(b"https://github.com/suidouble/suidouble_metadata"),
            utf8(b"https://suidouble.github.io/hexcapsule/capsule.png"),
            utf8(b"{prophecy}"),
            // Project URL is usually static
            utf8(b"https://github.com/suidouble/suidouble_metadata"),
            // Creator field can be any
            utf8(b"HexCapsule")
        ];

        // Get a new `Display` object for the `Color` type.
        let mut display = display::new_with_fields<Timecapsule>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));

        make_and_share_store(ctx);
    }

    fun make_and_share_store(ctx: &mut TxContext) {
        let admin = AdminCap {
            id: object::new(ctx),
        };
        let timecapsule_store = TimecapsuleStore {
            id: object::new(ctx),
            fee: balance::zero(),
            count_minted: 0,
            metadata: vector::empty()
        };
        event::emit(NewStoreEvent {
            id: object::uid_to_inner(&timecapsule_store.id),
        });
        event::emit(NewAdminCapEvent {
            id: object::uid_to_inner(&admin.id),
        });

        transfer::transfer(admin, tx_context::sender(ctx));
        transfer::share_object(timecapsule_store);
    }

    #[test_only]
    public(package) fun make_and_share_store_for_testing(ctx: &mut TxContext) {
        make_and_share_store(ctx);
    }


    public entry fun mint(store: &mut TimecapsuleStore, encrypted_prophecy: vector<u8>, for_round: u64, ctx: &mut TxContext) {
        if (for_round < 1) {
            abort EInvalidRound
        };
        
        let timecapsule = Timecapsule{
            id: object::new(ctx),
            encrypted_prophecy: encrypted_prophecy,
            prophecy: vector::empty(),
            for_round: for_round,
            decrypted: false,
            sui: balance::zero(),
            object_bag: object_bag::new(ctx),
            metadata: vector::empty()
        };

        event::emit(NewTimecapsuleEvent {
            id: object::uid_to_inner(&timecapsule.id),
            sui: 0,
            for_round: for_round,
        });

        store.count_minted = store.count_minted + 1;

        transfer::transfer(timecapsule, tx_context::sender(ctx));
    }

    public entry fun mint_with_sui(store: &mut TimecapsuleStore, encrypted_prophecy: vector<u8>, for_round: u64, coin: Coin<SUI>, ctx: &mut TxContext) {
        if (for_round < 1) {
            abort EInvalidRound
        };
        
        let timecapsule = Timecapsule{
            id: object::new(ctx),
            encrypted_prophecy: encrypted_prophecy,
            prophecy: vector::empty(),
            for_round: for_round,
            decrypted: false,
            sui: coin::into_balance(coin),
            object_bag: object_bag::new(ctx),
            metadata: vector::empty()
        };

        event::emit(NewTimecapsuleEvent {
            id: object::uid_to_inner(&timecapsule.id),
            sui: balance::value(&timecapsule.sui),
            for_round: for_round,
        });

        store.count_minted = store.count_minted + 1;

        transfer::transfer(timecapsule, tx_context::sender(ctx));
    }

    public entry fun put_sui(timecapsule: &mut Timecapsule, coin: Coin<SUI>, _ctx: &mut TxContext) {
        // take a fee
        // let coin_value = coin::value(&coin);
        // let fee_value = ( coin_value / 10 );
        // let fee_coin = coin::split(&mut coin, fee_value, ctx);


        coin::put(&mut timecapsule.sui, coin);

        event::emit(NewTimecapsuleEvent {
            id: object::uid_to_inner(&timecapsule.id),
            sui: balance::value(&timecapsule.sui),
            for_round: timecapsule.for_round
        });
        // balance::join(&mut timecapsule.sui, coin);
    }

    // public entry fun put_to_bag<V: store + key>(timecapsule: &mut Timecapsule, v: V, _ctx: &mut TxContext) {
    //     let typen = type_name::get<V>();

    //     // do not accept coin here, for coin use put_coin_to_bag method
    //     if (type_name::get_module(&typen).as_bytes() == b"coin") {
    //         abort EPutCoinWithItsMethod
    //     };

    //     let item_to_bag_index = object_bag::length(&timecapsule.object_bag);
    //     timecapsule.object_bag.add(item_to_bag_index, v);
    // }

    // public entry fun put_coin_to_bag<T>(timecapsule: &mut Timecapsule, coin: Coin<T>, ctx: &mut TxContext) {
    //     // take a fee
    //     // let coin_value = coin::value(&coin);
    //     // let fee_value = ( coin_value / 10 );
    //     // let fee_coin = coin::split(&mut coin, fee_value, ctx);


    //     let id = object::id_bytes(&coin);

    //     let item_to_bag_index:u64 = object_bag::length(&timecapsule.object_bag);
    //     timecapsule.object_bag.add(item_to_bag_index, coin);
    // }

    public entry fun decrypt(timecapsule: &mut Timecapsule, round_signature: vector<u8>, ctx: &mut TxContext) {
        let mut drand = capsule::drand_quicknet();
        if (drand.verify_signature(timecapsule.for_round, &round_signature) == false) {
            abort EInvalidRoundSignature
        };

        // decrypt a prophecy
        timecapsule.prophecy = drand.decrypt(&timecapsule.encrypted_prophecy, round_signature);
        timecapsule.decrypted = true;

        // take out a sui
        let amount_sui = balance::value(&timecapsule.sui);
        if (amount_sui > 0) {
            let coin = coin::take(&mut timecapsule.sui, amount_sui, ctx);
            transfer::public_transfer(coin, tx_context::sender(ctx));
        };

        event::emit(NewDecryptedEvent {
            id: object::uid_to_inner(&timecapsule.id),
            sui: amount_sui,
        });
    }

    // public entry fun collect<V: key + store>(timecapsule: &mut Timecapsule, ctx: &mut TxContext) {
    //     if (timecapsule.decrypted) {
    //         let items_count = object_bag::length(&timecapsule.object_bag);
    //         let item = object_bag::remove<u64,V>(&mut timecapsule.object_bag, (items_count - 1));
    //         transfer::public_transfer(item, tx_context::sender(ctx));
    //     }
    // }

}