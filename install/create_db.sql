create user pizarra_user password 'pizarra_3323948812bdz';
create database pizarra_db owner pizarra_user;
\c pizarra_db

drop schema if exists piz cascade;
create schema piz authorization pizarra_user;
grant all on schema piz to pizarra_user;

create table piz.users(
  username text primary key,
  md5pass text,
  rol text
);
alter table piz."users" owner to pizarra_user;

insert into piz.users 
  select 'test'||n, md5('clave'||n||'test'||n), 'test'
    from generate_series(1,10) n;
