import type { ContentType, Locale, UnlockType } from "../types";

export type ContentCopy = {
  description: string;
  resultLabel: string;
  title: string;
};

export type I18nMessages = {
  brand: string;
  buttons: {
    createVault: string;
    next: string;
    start: string;
  };
  content: Record<ContentType, ContentCopy>;
  errors: {
    contactRequired: string;
    dateRequired: string;
    privacyRequired: string;
  };
  home: {
    allMethods: string;
    cardExamples: Record<ContentType, string>;
    futureSupportCopy: string;
    gallery: string;
    gallerySamples: Array<{ body: string; eyebrow: string; title: string }>;
    futureMoments: string[];
    heroSubtitle: string;
    heroTitle: string;
    mainCta: string;
    mainMethods: string;
    moreMethods: string;
    popular: string;
    previewDate: string;
    previewMessage: string;
    recommendationBadge: string;
    record: string;
    resultPreview: string;
    resultSamples: Array<{ body: string; eyebrow: string; tag: string; title: string }>;
    steps: Array<{ body: string; title: string }>;
    timeline: string;
    timelineItems: string[];
    trustBody: string;
    trustTitle: string;
    urgencyLine: string;
    visitorExperiences: string;
  };
  languageLabels: Record<Locale, string>;
  privacy: {
    body: string;
    checkbox: string;
  };
  unlock: Record<UnlockType, string>;
  vault: {
    lockedTitle: string;
    missingBody: string;
    missingTitle: string;
    openNow: string;
    requestOpen: string;
    testUnlock: string;
  };
};
