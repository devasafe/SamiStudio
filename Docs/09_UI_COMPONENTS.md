# 09_UI_COMPONENTS.md

# UI Components

Versão: 1.0

Projeto:
Sami da Silva Studio

---

# Objetivo

Este documento lista TODOS os componentes reutilizáveis do projeto.

Nenhuma tela deverá criar componentes exclusivos sem necessidade.

Sempre reutilizar.

---

# Layout

AppLayout

Container

Section

Grid

Spacer

Divider

Background

---

# Navegação

Navbar

Logo

Navigation

NavigationItem

LanguageSwitcher

ThemeToggle (Futuro)

CTAButton

MobileMenu

Hamburger

Breadcrumb

Footer

FooterLinks

FooterSocial

FooterCopyright

---

# Hero

Hero

HeroContent

HeroHeadline

HeroDescription

HeroCTA

HeroScrollIndicator

BlueprintCanvas

BlueprintScene

CameraController

ScrollController

ProgressIndicator

---

# Tipografia

Heading

SubHeading

Paragraph

Caption

Quote

Label

Badge

SectionTitle

SectionSubtitle

---

# Botões

Button

IconButton

LinkButton

FloatingButton

WhatsAppButton

---

# Cards

ServiceCard

PortfolioCard

ProjectCard

FeatureCard

StatCard

TeamCard

TestimonialCard

FAQCard

BlogCard (Futuro)

---

# Inputs

Input

Textarea

Checkbox

Radio

Select

SearchInput

FileUpload

ImageUpload

---

# Formulários

ContactForm

NewsletterForm

LeadForm

ValidationMessage

SuccessMessage

ErrorMessage

---

# Portfólio

PortfolioGrid

PortfolioFilter

PortfolioSearch

ProjectGallery

ProjectInfo

ProjectVideo

BeforeAfter

RelatedProjects

ProjectTags

ProjectMetadata

---

# Timeline

Timeline

TimelineItem

TimelineConnector

TimelineStep

TimelineIcon

TimelineLabel

---

# FAQ

Accordion

AccordionItem

AccordionContent

AccordionTrigger

---

# Depoimentos

Testimonials

TestimonialSlider

TestimonialCard

Stars

Author

Company

---

# Galeria

Gallery

GalleryGrid

GalleryItem

Lightbox

ImageViewer

FullscreenViewer

---

# Estatísticas

Stats

Counter

StatItem

Metric

---

# Feedback

Toast

Alert

Modal

Dialog

Loading

Spinner

Skeleton

ProgressBar

---

# CMS

Editor

RichTextEditor

ImageSelector

MediaLibrary

UploadArea

MarkdownEditor

---

# Admin

Dashboard

Sidebar

Topbar

Table

DataTable

Pagination

Filter

SearchBar

EmptyState

ConfirmDialog

UserAvatar

ProfileMenu

SettingsPanel

AnalyticsCard

Chart

---

# SEO

MetaPreview

SlugEditor

SEOScore

OpenGraphPreview

---

# Three.js

Canvas

Scene

Camera

Lights

Environment

OrbitController (Dev)

ScrollController

BlueprintController

AnimationController

LoadingManager

AssetLoader

ModelLoader

MaterialManager

PostProcessing

---

# Blueprint Engine

BlueprintEngine

BlueprintModel

BlueprintMaterial

BlueprintAnimation

BlueprintTimeline

BlueprintProgress

BlueprintRenderer

---

# Internacionalização

LanguageProvider

LocaleSwitcher

TranslationProvider

TranslationLoader

---

# Utilitários

PageTransition

FadeIn

Reveal

Parallax

CursorFollower (Opcional)

MouseGlow (Opcional)

---

# Componentes Compartilhados

Avatar

Logo

SocialLinks

ContactCard

WhatsAppCTA

DownloadButton

PDFViewer

Map

VideoPlayer

---

# Convenções

Todo componente deverá:

Ser reutilizável.

Ser independente.

Possuir tipagem forte.

Possuir documentação.

Possuir Props bem definidas.

Possuir loading.

Possuir tratamento de erro.

Possuir acessibilidade.

Ser facilmente testável.

---

# Estrutura

/components

/ui

/layout

/hero

/portfolio

/services

/about

/contact

/admin

/forms

/icons

/providers

/three

/blueprint-engine

/shared

---

# Regra Principal

Antes de criar um novo componente, verificar se já existe outro que possa ser reutilizado.

Duplicação de componentes é proibida.