--
-- PostgreSQL database dump
--

\restrict MiUiG7cROpzIvHAz6F73CPWBJxA1Hk6nRP7LTVG0hkg0U2dlqaXXSsPGiME44g6

-- Dumped from database version 17.8 (a284a84)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Products; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core."Products" (
    id integer NOT NULL,
    id_producto integer DEFAULT nextval('core.products_id_producto_seq'::regclass) NOT NULL,
    name character varying(160) NOT NULL,
    "brandId" integer NOT NULL,
    "categoryId" integer NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    status public."enum_Products_status" DEFAULT 'Activo'::public."enum_Products_status" NOT NULL,
    "imageUrl" character varying(500),
    "productType" public."enum_Products_productType" NOT NULL,
    description text,
    features text,
    "supplementFlavor" character varying(120),
    "supplementPresentation" character varying(120),
    "supplementServings" character varying(120),
    "apparelSize" character varying(50),
    "apparelColor" character varying(80),
    "apparelMaterial" character varying(120),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Products_id_seq; Type: SEQUENCE; Schema: core; Owner: -
--

CREATE SEQUENCE core."Products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Products_id_seq; Type: SEQUENCE OWNED BY; Schema: core; Owner: -
--

ALTER SEQUENCE core."Products_id_seq" OWNED BY core."Products".id;


--
-- Name: Products id; Type: DEFAULT; Schema: core; Owner: -
--

ALTER TABLE ONLY core."Products" ALTER COLUMN id SET DEFAULT nextval('core."Products_id_seq"'::regclass);


--
-- Data for Name: Products; Type: TABLE DATA; Schema: core; Owner: -
--

COPY core."Products" (id, id_producto, name, "brandId", "categoryId", price, stock, status, "imageUrl", "productType", description, features, "supplementFlavor", "supplementPresentation", "supplementServings", "apparelSize", "apparelColor", "apparelMaterial", "createdAt", "updatedAt") FROM stdin;
12	12	Tennis Adidas Boost Naranja	2	2	1400.00	4	Activo	https://res.cloudinary.com/dqf9pdcte/image/upload/v1773308490/titanium/products/opbjhb5pypz7d66fcr3v.jpg	Ropa	Tennis	[]	\N	\N	\N	EG	Naranja	Textil	2026-03-12 05:21:21.945547+00	2026-03-12 09:41:31.25+00
1	1	Tennis	2	2	1000.00	10	Activo	https://res.cloudinary.com/dqf9pdcte/image/upload/v1772602231/titanium/products/pe39pj4psnprwulhvqro.jpg	Ropa	Tennis	["Running"]	\N	\N	\N	M	Negro	Algodon	2026-03-04 05:30:31.715+00	2026-03-05 06:19:42.205+00
2	2	Whey Protein	1	1	2000.00	2	Activo	https://res.cloudinary.com/dqf9pdcte/image/upload/v1772692724/titanium/products/sbpylh7wtrujjfakhts7.jpg	Suplementación	Una proteina que te hace Holk	[]	Chocolate	1 kg	50	\N	\N	\N	2026-03-05 06:38:45.807+00	2026-03-05 06:38:45.807+00
3	3	Playera de compresion	4	3	1000.00	3	Activo	https://res.cloudinary.com/dqf9pdcte/image/upload/v1772720005/titanium/products/svcbtdo2kqoyhkdjv4yt.jpg	Ropa	Una playera para verte mas fuerte	[]	\N	\N	\N	M	Negro	Algodon	2026-03-05 14:13:26.618+00	2026-03-05 14:13:26.618+00
5	5	Tennis Adidas Runner Blanco	2	2	1150.00	8	Activo	\N	Ropa	Tennis	[]	\N	\N	\N	M	Blanco	Textil	2026-03-12 05:21:21.945547+00	2026-03-12 05:21:21.945547+00
6	6	Tennis Adidas Street Azul	2	2	1200.00	12	Activo	\N	Ropa	Tennis	[]	\N	\N	\N	G	Azul	Sintetico	2026-03-12 05:21:21.945547+00	2026-03-12 05:21:21.945547+00
7	7	Tennis Adidas Urban Gris	2	2	980.00	6	Activo	\N	Ropa	Tennis	[]	\N	\N	\N	CH	Gris	Algodon	2026-03-12 05:21:21.945547+00	2026-03-12 05:21:21.945547+00
8	8	Tennis Adidas Pro Rojo	2	2	1350.00	7	Activo	\N	Ropa	Tennis	[]	\N	\N	\N	M	Rojo	Sintetico	2026-03-12 05:21:21.945547+00	2026-03-12 05:21:21.945547+00
10	10	Tennis Adidas Max Verde	2	2	1250.00	5	Activo	\N	Ropa	Tennis	[]	\N	\N	\N	G	Verde	Sintetico	2026-03-12 05:21:21.945547+00	2026-03-12 05:21:21.945547+00
85	15	Cinturón de levantamiento Reebok	8	4	650.00	5	Activo	\N	Ropa	Cinturón de gimnasio diseñado para proteger la zona lumbar durante ejercicios de fuerza como peso muerto o sentadilla	["Soporte lumbar reforzado"]	\N	\N	\N	M / G	Negro / Rojo	Cuero sintético	2026-03-12 22:14:08.377+00	2026-03-12 22:14:08.377+00
86	16	Guantes de entrenamiento Nike	10	4	420.00	10	Activo	\N	Ropa	Guantes deportivos que mejoran el agarre y protegen las manos durante el levantamiento de pesas.	["Antideslizantes y transpirables"]	\N	\N	\N	CH / M / G	Negro	Poliéster / Spandex	2026-03-12 22:16:59.406+00	2026-03-12 22:16:59.406+00
87	17	Tennis Prueba	11	5	1500.00	100	Activo	\N	Ropa	Prueba	[]	\N	\N	\N	M	Azul	Algodon	2026-03-16 23:33:59.63+00	2026-03-16 23:33:59.63+00
4	4	Tennis Adidas Clásico Negro	2	2	1000.00	10	Activo	https://res.cloudinary.com/dqf9pdcte/image/upload/v1773308505/titanium/products/gijycqnyokjl4almgx0f.jpg	Ropa	Tennis	[]	\N	\N	\N	M	Negro	Algodon	2026-03-12 05:21:21.945547+00	2026-03-12 09:41:45.813+00
11	11	Tennis Adidas Comfort Beige	2	2	1080.00	11	Activo	https://res.cloudinary.com/dqf9pdcte/image/upload/v1773310154/titanium/products/anb6jws0dpedg7lsjdee.jpg	Ropa	Tennis	[]	\N	\N	\N	M	Beige	Algodon	2026-03-12 05:21:21.945547+00	2026-03-12 10:09:15.026+00
46	14	Sudadera Alo	7	3	1110.00	10	Activo	https://res.cloudinary.com/dqf9pdcte/image/upload/v1773337807/titanium/products/yr00hgjzp2bslrcnaid3.jpg	Ropa	Sudadera comoda	["Comodo","Fresco"]	\N	\N	\N	M	Negro	Poliester	2026-03-12 17:50:08.201+00	2026-03-12 17:50:08.201+00
13	13	Tennis Adidas Elite Morado	2	2	1500.00	3	Activo	https://res.cloudinary.com/dqf9pdcte/image/upload/v1773351955/titanium/products/zt0vkaawatodqdlwh0jr.jpg	Ropa	Tennis	[]	\N	\N	\N	G	Morado	Sintetico	2026-03-12 05:21:21.945547+00	2026-03-12 21:45:57.134+00
9	9	Tennis Adidas Light Rosa	2	2	1100.00	9	Activo	https://res.cloudinary.com/dqf9pdcte/image/upload/v1773351971/titanium/products/rhqu3nqb2oxbjjjxjs7d.jpg	Ropa	Tennis	[]	\N	\N	\N	CH	Rosa	Textil	2026-03-12 05:21:21.945547+00	2026-03-12 21:46:11.862+00
\.


--
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: core; Owner: -
--

SELECT pg_catalog.setval('core."Products_id_seq"', 89, true);


--
-- Name: Products Products_id_producto_key; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core."Products"
    ADD CONSTRAINT "Products_id_producto_key" UNIQUE (id_producto);


--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- Name: uq_products_name_brand_category; Type: INDEX; Schema: core; Owner: -
--

CREATE UNIQUE INDEX uq_products_name_brand_category ON core."Products" USING btree (lower(btrim((name)::text)), "brandId", "categoryId");


--
-- Name: Products Products_brandId_fkey; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core."Products"
    ADD CONSTRAINT "Products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES core."Brands"(id_marca) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Products Products_categoryId_fkey; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core."Products"
    ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES core."Categories"(id_categoria) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict MiUiG7cROpzIvHAz6F73CPWBJxA1Hk6nRP7LTVG0hkg0U2dlqaXXSsPGiME44g6

