import {
  faqGroup,
  job,
  post,
  project,
  service,
  siteSettings,
  teamMember,
  testimonial,
} from "./documents";
import { faqItem, media, metric, richText, seo, step } from "./objects";

export const schemaTypes = [
  // documents
  project,
  service,
  teamMember,
  testimonial,
  job,
  faqGroup,
  post,
  siteSettings,
  // objects
  richText,
  media,
  metric,
  faqItem,
  step,
  seo,
];
