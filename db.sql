CREATE DATABASE C_BILLING;

CREATE TABLE USERS(
  ID SERIAL PRIMARY KEY,
  NAME VARCHAR(255) NOT NULL,
  PASSWORD VARCHAR(100) NOT NULL,
  EMAIL VARCHAR(100) UNIQUE NOT NULL,
  CPF VARCHAR(11) UNIQUE,
  TELEPHONE VARCHAR(14) UNIQUE
);
 
CREATE TABLE CUSTOMERS(
  ID SERIAL PRIMARY KEY,
  NAME VARCHAR(255) NOT NULL,
  EMAIL VARCHAR(100) UNIQUE NOT NULL,
  CPF VARCHAR(11) UNIQUE NOT NULL,
  TELEPHONE VARCHAR(14) UNIQUE NOT NULL,
  ADDRESS VARCHAR(255),
  COMPLEMENT VARCHAR(100),
  CEP VARCHAR(8),
  DISTRICT VARCHAR(100),
  CITY VARCHAR(100),
  UF VARCHAR(2)
);

CREATE TABLE DEBTS(
  ID SERIAL PRIMARY KEY,
  CUSTOMER_ID SERIAL,
  DESCRIPTION VARCHAR(255) NOT NULL,
  DUE_DATE TIMESTAMP NOT NULL,
  VALUE INT NOT NULL,
  PAID BOOLEAN NOT NULL,
  FOREIGN KEY (CUSTOMER_ID) REFERENCES CUSTOMERS(ID)
);