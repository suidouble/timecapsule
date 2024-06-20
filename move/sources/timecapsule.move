#[allow(unused_variable, unused_use)]
module timecapsule::timecapsule {
    const VERSION: u64 = 2;

    // use std::string::{Self, utf8, String};

    // use suidouble_metadata::metadata;
    use timecapsule::capsule;
    use timecapsule::format;
    use timecapsule::metadata;
    use std::ascii;
    // use sui::package;
    // use std::string::{utf8};
    // use sui::display;
    // // use sui::transfer;    // provided by default
    // // use sui::tx_context;  // provided by default
    // use std::debug;

    // use sui::test_scenario as ts;
    // use sui::test_utils as sui_tests;
    use sui::balance::{Self, Balance};
    use std::string::{utf8, String};
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
    // const EPutCoinWithItsMethod: u64 = 1;

    // Trying to mint with too few sui to cover the fees
    const ENotEnoughSui: u64 = 4;

    const EWrongVersion: u64 = 5;

    // You can not take objects out of bag of encrypted capsule
    const ENotDecryptedYet: u64 = 6;

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
        version: u64,
        fee: Balance<SUI>,
        fee_permyriad: u256, // 0.01% * fee_permyriad to be taken as a fee on mint
        fee_static: u256,    // minimum sui amount to be taken as fee
        fee_bag: object_bag::ObjectBag,
        fee_token_permyriad: u256, // 0.01% * fee_permyriad to be taken as a fee on putting coins into bag
        count_minted: u256,
        meta: vector<u8>
    }

    public struct AdminCap has key {  // admin capability. Take care of this object. Issued to the creator on the package publishing
        id: UID,
    }

    public struct Timecapsule has key, store {
        id: UID,
        encrypted_prophecy: vector<u8>,
        prophecy: String,
        image: String,
        for_round: u64,
        decrypted: bool,
        object_bag: object_bag::ObjectBag,
        sui: Balance<SUI>,
        meta: vector<u8>,

        level: u64,
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
            utf8(b"https://hexcapsule.com/capsule/{id}"),
            utf8(b"{image}"),
            utf8(b"{prophecy}"),
            // Project URL is usually static
            utf8(b"https://hexcapsule.com/"),
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
            meta: vector::empty(),
            version: VERSION,

            fee_permyriad: 50,      // 0.5%
            fee_static: 100_000_000,  // + 0.1 SUI

            fee_bag: object_bag::new(ctx),
            fee_token_permyriad: 100, // 1%
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

    #[test_only]
    public(package) fun prophecy(time_capsule: &Timecapsule): String {
        time_capsule.prophecy
    }

    /**
    *  Function to migrate the contract to new version. Should be executed by admin only (see AdminCap)
    */
    entry fun migrate(store: &mut TimecapsuleStore, a: &AdminCap, _ctx: &mut TxContext) {
        assert!(store.version < VERSION, EWrongVersion);
        store.version = VERSION;
    }

    public entry fun mint_with_sui(store: &mut TimecapsuleStore, encrypted_prophecy: vector<u8>, for_round: u64, mut coin: Coin<SUI>, ctx: &mut TxContext) {
        assert!(store.version == VERSION, EWrongVersion);

        if (for_round < 1) {
            abort EInvalidRound
        };
        
        // take a fee
        let coin_value = coin::value(&coin);
        let fee_amount = ((store.fee_static + (((coin_value as u256) * store.fee_permyriad) / 10000u256)) as u64);
        if (coin_value < fee_amount) {
            abort ENotEnoughSui
        };

        let fee_coin = coin::split(&mut coin, fee_amount, ctx);
        coin::put(&mut store.fee, fee_coin);

        let timecapsule = Timecapsule{
            id: object::new(ctx),
            encrypted_prophecy: encrypted_prophecy,
            prophecy: utf8(b"secret"),
            image: utf8(b"https://suidouble.github.io/hexcapsule/capsule.png"),
            for_round: for_round,
            decrypted: false,
            sui: coin::into_balance(coin),
            object_bag: object_bag::new(ctx),
            meta: vector::empty(),

            level: 0,
        };

        event::emit(NewTimecapsuleEvent {
            id: object::uid_to_inner(&timecapsule.id),
            sui: balance::value(&timecapsule.sui),
            for_round: for_round,
        });

        store.count_minted = store.count_minted + 1;

        transfer::transfer(timecapsule, tx_context::sender(ctx));
    }


    public entry fun decrypt(store: &TimecapsuleStore, timecapsule: &mut Timecapsule, round_signature: vector<u8>, ctx: &mut TxContext) {
        assert!(store.version == VERSION, EWrongVersion);

        let mut drand = capsule::drand_quicknet();
        if (drand.verify_signature(timecapsule.for_round, &round_signature) == false) {
            abort EInvalidRoundSignature
        };

        // decrypt a prophecy
        timecapsule.prophecy = utf8(drand.decrypt(&timecapsule.encrypted_prophecy, round_signature));
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

    /**
    *  Function to collect fees, Executed by admin only.
    *
    *      AdminCap only!
    */
    public entry fun collect_fees(store: &mut TimecapsuleStore, _admin: &AdminCap, ctx: &mut TxContext) {
        assert!(store.version == VERSION, EWrongVersion);

        let amount_sui = balance::value(&store.fee);
        let to_pay_out_sui = coin::take(&mut store.fee, amount_sui, ctx);

        transfer::public_transfer(to_pay_out_sui, tx_context::sender(ctx));
    }
    public entry fun collect_coin_fees<T>(store: &mut TimecapsuleStore, _admin: &AdminCap, ctx: &mut TxContext) {
        assert!(store.version == VERSION, EWrongVersion);
        let typen = type_name::get<T>();
        let type_as_string = typen.into_string();

        if (store.fee_bag.contains(type_as_string)) {
            let coin:Coin<T> = store.fee_bag.remove(type_as_string);
            transfer::public_transfer(coin, tx_context::sender(ctx));
        }
    }

    public entry fun take_out_coin<T>(store: &mut TimecapsuleStore, timecapsule: &mut Timecapsule, ctx: &mut TxContext) {
        assert!(store.version == VERSION, EWrongVersion);

        if (!timecapsule.decrypted) {
            abort ENotDecryptedYet
        };

        let typen = type_name::get<T>();
        let type_as_string = typen.into_string();

        if (timecapsule.object_bag.contains(type_as_string)) {
            let coin:Coin<T> = timecapsule.object_bag.remove(type_as_string);
            transfer::public_transfer(coin, tx_context::sender(ctx));
        }
    }

    fun take_coin_fee<T>(store: &mut TimecapsuleStore, coin_mut: &mut Coin<T>, ctx: &mut TxContext) {
        let typen = type_name::get<T>();
        let coin_value = coin::value(coin_mut);

        let type_as_string = typen.into_string();
        let fee_amount = (( (((coin_value as u256) * store.fee_token_permyriad) / 10000u256)) as u64);

        let fee_coin = coin::split(coin_mut, fee_amount, ctx);

        if (store.fee_bag.contains(type_as_string)) {
            let already_coin:&mut Coin<T> = store.fee_bag.borrow_mut(type_as_string);
            already_coin.join(fee_coin);
        } else {
            store.fee_bag.add(type_as_string, fee_coin);
        };
    }

    public entry fun put_coin_to_bag<T>(store: &mut TimecapsuleStore, timecapsule: &mut Timecapsule, mut coin:  Coin<T>, ctx: &mut TxContext) {
        assert!(store.version == VERSION, EWrongVersion);

        // take a fee
        take_coin_fee(store, &mut coin, ctx);

        let typen = type_name::get<T>();
        let type_as_string = typen.into_string();

        if (timecapsule.object_bag.contains(type_as_string)) {
            let already_coin:&mut Coin<T> = timecapsule.object_bag.borrow_mut(type_as_string);
            already_coin.join(coin);
        } else {
            timecapsule.level = timecapsule.level + 1;
            if (timecapsule.level == 1) {
                timecapsule.image = utf8(b"https://suidouble.github.io/hexcapsule/capsule_gold.png");
            } else if (timecapsule.level == 2) {
                timecapsule.image = utf8(b"https://suidouble.github.io/hexcapsule/capsule_super.png");
            };
            timecapsule.object_bag.add(type_as_string, coin);
        }
    }

    public entry fun put_object_to_bag<T: key + store>(store: &mut TimecapsuleStore, timecapsule: &mut Timecapsule, obj: T, ctx: &mut TxContext) {
        assert!(store.version == VERSION, EWrongVersion);

        let typen = type_name::get<T>();
        let type_as_string = typen.into_string();

        if (timecapsule.object_bag.contains(type_as_string)) {
            // wrap with suffix
            let mut i = 1;
            let mut type_as_string_with_suffix = ascii::string(b"");
            let mut is_id_available = false;
            let try_format = b"{str:s}_{suffix:i}";
            let mut meta = b"";

            metadata::set(&mut meta, metadata::key(&b"str"), &type_as_string.into_bytes());
            while (!is_id_available) {
                metadata::set(&mut meta, metadata::key(&b"suffix"), &i);
                let formatted = format::format(&try_format, &meta);
                type_as_string_with_suffix = ascii::string(formatted);

                i = i + 1;

                if (!timecapsule.object_bag.contains(type_as_string_with_suffix)) {
                    is_id_available = true;
                }
            };

            timecapsule.object_bag.add(type_as_string_with_suffix, obj);
        } else {
            timecapsule.level = timecapsule.level + 1;
            if (timecapsule.level == 1) {
                timecapsule.image = utf8(b"https://suidouble.github.io/hexcapsule/capsule_gold.png");
            } else if (timecapsule.level == 2) {
                timecapsule.image = utf8(b"https://suidouble.github.io/hexcapsule/capsule_super.png");
            };
            timecapsule.object_bag.add(type_as_string, obj);
        }
    }

    public entry fun take_out_objects<T: key + store>(store: &mut TimecapsuleStore, timecapsule: &mut Timecapsule, ctx: &mut TxContext) {
        assert!(store.version == VERSION, EWrongVersion);

        if (!timecapsule.decrypted) {
            abort ENotDecryptedYet
        };

        let typen = type_name::get<T>();
        let type_as_string = typen.into_string();

        if (timecapsule.object_bag.contains(type_as_string)) {
            let obj: T = timecapsule.object_bag.remove(type_as_string);
            transfer::public_transfer(obj, tx_context::sender(ctx));

            // check if there're extra:
            // wrap with suffix
            let mut i = 1;
            let mut type_as_string_with_suffix;
            let mut is_id_available = true;
            let try_format = b"{str:s}_{suffix:i}";
            let mut meta = b"";
            metadata::set(&mut meta, metadata::key(&b"str"), &type_as_string.into_bytes());
            while (is_id_available) {
                metadata::set(&mut meta, metadata::key(&b"suffix"), &i);
                let formatted = format::format(&try_format, &meta);
                type_as_string_with_suffix = ascii::string(formatted);

                i = i + 1;

                if (timecapsule.object_bag.contains(type_as_string_with_suffix)) {
                    let additional_obj: T = timecapsule.object_bag.remove(type_as_string_with_suffix);
                    transfer::public_transfer(additional_obj, tx_context::sender(ctx));

                    is_id_available = true;
                } else {
                    is_id_available = false;
                };
            };

        }
    }
}