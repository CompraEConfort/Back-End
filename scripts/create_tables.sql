CREATE TABLE users (
	id int(11) NOT NULL AUTO_INCREMENT,
	name varchar(100) NOT NULL,
    email varchar(100) DEFAULT NULL,
	password varchar(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY email (email)
);

CREATE TABLE products (
  id_product int(11) NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  value float NOT NULL,
  bar_code varchar(100) DEFAULT NULL,
  weight float NOT NULL,
  product_type varchar(100) DEFAULT NULL,
  expiration_date datetime DEFAULT NULL,
  manufacturing_date datetime DEFAULT NULL,
  PRIMARY KEY (id_product)
);

CREATE TABLE orders (
  id_order int(11) NOT NULL AUTO_INCREMENT,
  id_product int(11) NOT NULL,
  quantity smallint(6) NOT NULL, 
  date_order datetime default CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id_order),
  FOREIGN KEY (id_product) references products (id_product)
);

create table supermarkets (
	id_supermarket int(11) NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    street varchar(255) not null,
    number varchar(255) not null,
    complement varchar(255) not null,
    neighborhood varchar(255) not null,
    city varchar(255) not null,
    state varchar(255) not null,
    image_link varchar(255),
    PRIMARY KEY (id_supermarket)
);


/*Tabela da associação N:N de produtos e supermercados*/
CREATE TABLE products_supermarkets(
	  id_supermarket int(11) NOT NULL,
    id_product int(11) NOT NULL,
    FOREIGN KEY (`id_supermarket`) REFERENCES `supermarkets` (`id_supermarket`),
    FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`)
)



