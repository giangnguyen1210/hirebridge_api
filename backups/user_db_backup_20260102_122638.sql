--
-- PostgreSQL database dump
--

\restrict AhqeluNN8N2v7e3NAmmaYU5PDrLUH0hgkZxCaVvQpX5hr2leRdW7pOIOrLnFgqA

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: giang
--

CREATE TYPE public.users_status_enum AS ENUM (
    'ACTIVE',
    'PENDING',
    'BANNED'
);


ALTER TYPE public.users_status_enum OWNER TO giang;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: refresh_token; Type: TABLE; Schema: public; Owner: giang
--

CREATE TABLE public.refresh_token (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "refreshToken" character varying NOT NULL,
    "deviceId" character varying NOT NULL,
    "deviceInfo" character varying,
    "userId" uuid
);


ALTER TABLE public.refresh_token OWNER TO giang;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: giang
--

CREATE TABLE public.roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.roles OWNER TO giang;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: giang
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid,
    "roleId" uuid
);


ALTER TABLE public.user_roles OWNER TO giang;

--
-- Name: users; Type: TABLE; Schema: public; Owner: giang
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    username character varying,
    firstname character varying NOT NULL,
    lastname character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    avatar character varying,
    password character varying NOT NULL,
    status public.users_status_enum DEFAULT 'PENDING'::public.users_status_enum NOT NULL,
    "activateToken" character varying,
    "tokenExpire" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "blockedAt" timestamp without time zone
);


ALTER TABLE public.users OWNER TO giang;

--
-- Data for Name: refresh_token; Type: TABLE DATA; Schema: public; Owner: giang
--

COPY public.refresh_token (id, "createdAt", "updatedAt", "refreshToken", "deviceId", "deviceInfo", "userId") FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: giang
--

COPY public.roles (id, "createdAt", "updatedAt", code, name) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: giang
--

COPY public.user_roles (id, "createdAt", "updatedAt", "userId", "roleId") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: giang
--

COPY public.users (id, "createdAt", "updatedAt", username, firstname, lastname, email, phone, avatar, password, status, "activateToken", "tokenExpire", "deletedAt", "blockedAt") FROM stdin;
\.


--
-- Name: user_roles PK_8acd5cf26ebd158416f477de799; Type: CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: refresh_token PK_b575dd3c21fb0831013c909e7fe; Type: CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: roles UQ_f6d54f95c31b73fb1bdd8e91d0c; Type: CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_f6d54f95c31b73fb1bdd8e91d0c" UNIQUE (code);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: user_roles FK_472b25323af01488f1f66a06b67; Type: FK CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles FK_86033897c009fcca8b6505d6be2; Type: FK CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: refresh_token FK_8e913e288156c133999341156ad; Type: FK CONSTRAINT; Schema: public; Owner: giang
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict AhqeluNN8N2v7e3NAmmaYU5PDrLUH0hgkZxCaVvQpX5hr2leRdW7pOIOrLnFgqA

