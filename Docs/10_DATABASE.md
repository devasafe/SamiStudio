# 10_DATABASE.md

# Database Architecture

Versão: 1.0

Projeto:
Sami da Silva Studio

Banco de Dados:
MongoDB Atlas

ODM:
Mongoose

---

# Objetivo

Modelar todas as entidades do sistema.

A estrutura deverá ser escalável, desacoplada e preparada para internacionalização.

---

# Collections

Users

Projects

Services

Testimonials

FAQ

SiteSettings

Translations

Media

Categories

Logs

Sessions

Analytics (Futuro)

---

# Users

Responsável pelo acesso ao painel.

Campos

_id

name

email

passwordHash

role

avatar

lastLogin

createdAt

updatedAt

Status

active

inactive

---

Roles

ADMIN

EDITOR

---

# Projects

Representa um projeto do portfólio.

Campos

_id

slug

title

description

client

city

country

categoryId

year

coverImage

gallery

video

beforeImage

afterImage

featured

status

seo

translations

createdAt

updatedAt

---

Gallery

Array

id

url

alt

width

height

order

---

Video

url

thumbnail

provider

duration

---

SEO

title

description

keywords

ogImage

canonical

---

Status

draft

published

archived

---

# Categories

_id

name

slug

icon

order

---

Exemplos

Residential

Commercial

Interior

Exterior

Concept

---

# Services

_id

title

slug

description

icon

coverImage

gallery

order

seo

translations

---

# Testimonials

_id

name

company

role

photo

text

rating

order

featured

---

# FAQ

_id

question

answer

category

order

translations

---

# Media

Responsável pelos uploads.

_id

filename

url

type

width

height

size

alt

folder

createdAt

---

Tipos

Image

Video

PDF

Model

Texture

HDRI

---

# SiteSettings

Configurações globais.

siteName

logo

favicon

phone

email

address

instagram

linkedin

facebook

youtube

behance

seo

analytics

whatsapp

heroProject

defaultLanguage

availableLanguages

---

# Translations

Sistema i18n.

_id

entity

entityId

locale

content

---

Locales

pt-BR

en

es

---

# Sessions

Controle de login.

_id

user

token

ip

device

expiresAt

---

# Logs

Histórico administrativo.

_id

user

action

entity

entityId

createdAt

---

# Relacionamentos

Projects

↓

Category

Projects

↓

Media

Projects

↓

Translations

Services

↓

Translations

FAQ

↓

Translations

---

# Índices

Slug

Unique

Projects

Featured

Projects

Category

Projects

Status

Users

Email

Unique

---

# Backup

Backup diário.

Backup semanal.

Backup mensal.

---

# Regras

Nunca apagar definitivamente.

Sempre Soft Delete quando possível.

Utilizar UUID quando necessário.

Todo documento deverá possuir:

createdAt

updatedAt