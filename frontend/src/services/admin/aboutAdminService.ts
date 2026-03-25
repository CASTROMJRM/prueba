/* eslint-disable @typescript-eslint/no-explicit-any */
import { API } from "../../api/api";
import type {
  AboutPageDTO,
  AboutTeamMemberDTO,
  AboutValueDTO,
} from "../../services/aboutService";

type AnyApi = any;

const mapAboutValue = (item: any): AboutValueDTO => ({
  id: String(item.id ?? ""),
  title: item.title ?? "",
  description: item.description ?? "",
  iconKey: item.iconKey ?? null,
  order: Number(item.order ?? 0),
  isActive: Boolean(item.isActive ?? true),
});

const mapAboutTeamMember = (item: any): AboutTeamMemberDTO => ({
  id: String(item.id ?? ""),
  name: item.name ?? "",
  role: item.role ?? "",
  description: item.description ?? null,
  imageUrl: item.imageUrl ?? null,
  facebookUrl: item.facebookUrl ?? null,
  twitterUrl: item.twitterUrl ?? null,
  linkedinUrl: item.linkedinUrl ?? null,
  order: Number(item.order ?? 0),
  isActive: Boolean(item.isActive ?? true),
});

const mapAboutPage = (data: AnyApi): AboutPageDTO => ({
  id: String(data.id ?? ""),
  slug: data.slug ?? "main",

  heroLabel: data.heroLabel ?? null,
  heroTitle: data.heroTitle ?? null,
  heroHighlight: data.heroHighlight ?? null,
  heroSubtitle: data.heroSubtitle ?? null,
  heroImageUrl: data.heroImageUrl ?? null,

  introTitle: data.introTitle ?? null,
  introHighlight: data.introHighlight ?? null,
  introText: data.introText ?? null,
  introImageUrl: data.introImageUrl ?? null,

  stat1Value: data.stat1Value ?? null,
  stat1Label: data.stat1Label ?? null,
  stat2Value: data.stat2Value ?? null,
  stat2Label: data.stat2Label ?? null,
  stat3Value: data.stat3Value ?? null,
  stat3Label: data.stat3Label ?? null,

  missionTitle: data.missionTitle ?? null,
  missionText: data.missionText ?? null,
  missionImageUrl: data.missionImageUrl ?? null,

  visionTitle: data.visionTitle ?? null,
  visionText: data.visionText ?? null,
  visionImageUrl: data.visionImageUrl ?? null,

  valuesTitle: data.valuesTitle ?? null,
  valuesText: data.valuesText ?? null,
  valuesImageUrl: data.valuesImageUrl ?? null,

  ctaTitle: data.ctaTitle ?? null,
  ctaText: data.ctaText ?? null,
  ctaAddress: data.ctaAddress ?? null,
  ctaPhone: data.ctaPhone ?? null,
  ctaPrimaryButtonText: data.ctaPrimaryButtonText ?? null,
  ctaPrimaryButtonLink: data.ctaPrimaryButtonLink ?? null,
  ctaSecondaryButtonText: data.ctaSecondaryButtonText ?? null,
  ctaSecondaryButtonLink: data.ctaSecondaryButtonLink ?? null,

  values: Array.isArray(data.values) ? data.values.map(mapAboutValue) : [],
  teamMembers: Array.isArray(data.teamMembers)
    ? data.teamMembers.map(mapAboutTeamMember)
    : [],

  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

export async function getAdminAboutPage() {
  const { data } = await API.get("/admin/about");
  return mapAboutPage(data);
}

export async function updateAdminAboutPage(form: FormData) {
  const { data } = await API.put("/admin/about", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapAboutPage(data);
}

export async function createAboutValue(payload: {
  title: string;
  description: string;
  iconKey?: string;
}) {
  const { data } = await API.post("/admin/about/values", payload);
  return mapAboutValue(data);
}

export async function updateAboutValue(
  id: string,
  payload: {
    title?: string;
    description?: string;
    iconKey?: string;
    isActive?: boolean;
  }
) {
  const { data } = await API.put(`/admin/about/values/${id}`, payload);
  return mapAboutValue(data);
}

export async function deleteAboutValue(id: string) {
  await API.delete(`/admin/about/values/${id}`);
}

export async function reorderAboutValues(order: string[]) {
  const { data } = await API.put("/admin/about/values/reorder", { order });
  return Array.isArray(data) ? data.map(mapAboutValue) : [];
}

export async function createAboutTeamMember(form: FormData) {
  const { data } = await API.post("/admin/about/team", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapAboutTeamMember(data);
}

export async function updateAboutTeamMember(id: string, form: FormData) {
  const { data } = await API.put(`/admin/about/team/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapAboutTeamMember(data);
}

export async function deleteAboutTeamMember(id: string) {
  await API.delete(`/admin/about/team/${id}`);
}

export async function reorderAboutTeamMembers(order: string[]) {
  const { data } = await API.put("/admin/about/team/reorder", { order });
  return Array.isArray(data) ? data.map(mapAboutTeamMember) : [];
}