# 11_API.md

# API Specification

Versão: 1.0

Arquitetura

REST API

JSON

JWT

---

# Estrutura

/api

/auth

/users

/projects

/services

/categories

/testimonials

/faq

/media

/settings

/translations

/upload

---

# Auth

POST

/auth/login

POST

/auth/logout

POST

/auth/refresh

GET

/auth/me

---

# Users

GET

/users

GET

/users/:id

POST

/users

PATCH

/users/:id

DELETE

/users/:id

---

# Projects

GET

/projects

GET

/projects/featured

GET

/projects/:slug

POST

/projects

PATCH

/projects/:id

DELETE

/projects/:id

---

Filtros

category

city

year

featured

status

search

---

# Services

GET

/services

GET

/services/:slug

POST

/services

PATCH

/services/:id

DELETE

/services/:id

---

# Categories

GET

/categories

POST

/categories

PATCH

/categories/:id

DELETE

/categories/:id

---

# FAQ

GET

/faq

POST

/faq

PATCH

/faq/:id

DELETE

/faq/:id

---

# Testimonials

GET

/testimonials

POST

/testimonials

PATCH

/testimonials/:id

DELETE

/testimonials/:id

---

# Media

POST

/upload/image

POST

/upload/video

POST

/upload/pdf

POST

/upload/model

DELETE

/media/:id

GET

/media

---

# Settings

GET

/settings

PATCH

/settings

---

# SEO

GET

/seo

PATCH

/seo

---

# Translations

GET

/translations

PATCH

/translations

---

# Response Pattern

Success

success

message

data

meta

---

Error

success

message

error

statusCode

---

# Segurança

JWT

Rate Limit

Helmet

Cors

Validation

Zod

---

# Upload

Cloudinary

Imagens

Vídeos

Modelos

PDF

---

# Paginação

page

limit

total

totalPages

---

# Busca

search

sort

order

filter

---

# Versionamento

v1

Preparado para

v2

---

# Futuro

GraphQL

Webhooks

Analytics

Notifications

Audit Logs