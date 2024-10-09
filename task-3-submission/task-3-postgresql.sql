create schema shub;

create table shub.gas_station (
    id int,
    address varchar(128) not null,

    primary key (id)
);

create table shub.commodity (
    id int,
    name varchar(32) not null,
    price_per_liter numeric not null,

    primary key (id)
);

create table shub.gas_pump (
    id int,
    belong_to_gas_station_id int not null,
    distribute_commodity_id int not null,

    primary key (id),
    constraint fk_belong_to_gas_station_id foreign key (belong_to_gas_station_id) references shub.gas_station (id),
    constraint fk_distribute_commidity_id foreign key (distribute_commodity_id) references shub.commodity (id)
);

create table shub."transaction" (
    id int,
    date_time timestamp not null,
    total_value numeric not null,
    sold_commodity_id int not null,
    was_made_at_gas_pump_id int not null,

    primary key (id),
    constraint fk_sold_commodity_id foreign key (sold_commodity_id) references shub.commodity (id),
    constraint fk_was_made_at_gas_pump_id foreign key (was_made_at_gas_pump_id) references shub.gas_pump (id)
);

--- for faster looking up on the relationship (1 gas_station) => (N gas_pump) ---
create index shub_gas_pump_belong_to_gas_station_id_index on shub.gas_pump (belong_to_gas_station_id);
--- for faster looking up on the relationship (1 gas_pump) => (N transaction) ---
create index shub_transaction_was_made_at_gas_pump_id_index on shub."transaction" (was_made_at_gas_pump_id);