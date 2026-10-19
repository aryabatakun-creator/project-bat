import { createClient } from "./supabase/client";
import {
  CaseItem,
  CaseAttachment,
  MasterArea,
  MasterLocation,
  MasterCategory,
  MasterPic,
} from "./types";
import {
  initialAreas,
  initialLocations,
  initialCategories,
  initialPics,
  initialCases,
} from "./mockData";

const KEYS = {
  CASES: "bat_cache_cases_v3",
  AREAS: "bat_cache_areas_v3",
  LOCATIONS: "bat_cache_locations_v3",
  CATEGORIES: "bat_cache_categories_v3",
  PICS: "bat_cache_pics_v3",
  DELETED_IDS: "bat_deleted_ids_v3",
};

export const STORAGE_BUCKET = "case-photos";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to write localStorage key ${key}:`, err);
  }
}

function getDeletedIds(): string[] {
  return readLocal<string[]>(KEYS.DELETED_IDS, []);
}

function addDeletedId(id: string) {
  if (!id) return;
  const current = getDeletedIds();
  if (!current.includes(id)) {
    writeLocal(KEYS.DELETED_IDS, [...current, id]);
  }
}

export function getCachedData() {
  const deleted = new Set(getDeletedIds());
  return {
    areas: readLocal<MasterArea[]>(KEYS.AREAS, initialAreas).filter(
      (a) => !deleted.has(a.id)
    ),
    locations: readLocal<MasterLocation[]>(
      KEYS.LOCATIONS,
      initialLocations
    ).filter((l) => !deleted.has(l.id)),
    categories: readLocal<MasterCategory[]>(
      KEYS.CATEGORIES,
      initialCategories
    ).filter((c) => !deleted.has(c.id)),
    pics: readLocal<MasterPic[]>(KEYS.PICS, initialPics).filter(
      (p) => !deleted.has(p.id)
    ),
    cases: readLocal<CaseItem[]>(KEYS.CASES, initialCases).filter(
      (c) => !deleted.has(c.id) && !deleted.has(c.case_id)
    ),
  };
}

export async function fetchAllAppData(): Promise<{
  areas: MasterArea[];
  locations: MasterLocation[];
  categories: MasterCategory[];
  pics: MasterPic[];
  cases: CaseItem[];
  isSupabaseConnected: boolean;
}> {
  const cached = getCachedData();
  const deleted = new Set(getDeletedIds());
  const supabase = createClient();

  if (!supabase) {
    return { ...cached, isSupabaseConnected: false };
  }

  try {
    const [resAreas, resLocations, resCats, resPics, resCases] =
      await Promise.all([
        supabase.from("master_areas").select("*").order("name"),
        supabase
          .from("master_locations")
          .select("*, master_areas(name)")
          .order("name"),
        supabase.from("master_categories").select("*").order("name"),
        supabase.from("master_pics").select("*").order("name"),
        supabase
          .from("cases")
          .select(
            `
          *,
          master_categories(name),
          master_areas(name),
          master_pics(name),
          case_attachments(*)
        `
          )
          .order("date_reported", { ascending: false }),
      ]);

    const hasValidConnection = !resCases.error;

    // 1. Merge Areas
    let finalAreas = cached.areas;
    if (resAreas.data && resAreas.data.length > 0) {
      const dbAreas: MasterArea[] = resAreas.data.filter(
        (a: any) => !deleted.has(a.id) && !deleted.has(a.name)
      );
      const localOnlyAreas = cached.areas.filter(
        (la) =>
          !isValidUuid(la.id) &&
          !dbAreas.some((da) => da.name.toLowerCase() === la.name.toLowerCase())
      );
      finalAreas = [...dbAreas, ...localOnlyAreas];
      writeLocal(KEYS.AREAS, finalAreas);
    }

    // 2. Merge Locations
    let finalLocations = cached.locations;
    if (!resLocations.error && resLocations.data && resLocations.data.length > 0) {
      const dbLocations: MasterLocation[] = resLocations.data
        .filter((l: any) => !deleted.has(l.id))
        .map((l: any) => ({
          id: l.id,
          area_id: l.area_id,
          area_name:
            l.master_areas?.name ||
            l.area_name ||
            finalAreas.find((a) => a.id === l.area_id)?.name ||
            "Malang",
          name: l.name,
          created_at: l.created_at,
        }));
      const localOnlyLocations = cached.locations.filter(
        (ll) =>
          !isValidUuid(ll.id) &&
          !dbLocations.some(
            (dl) =>
              dl.name.toLowerCase() === ll.name.toLowerCase() &&
              dl.area_name.toLowerCase() === ll.area_name.toLowerCase()
          )
      );
      finalLocations = [...dbLocations, ...localOnlyLocations];
      writeLocal(KEYS.LOCATIONS, finalLocations);
    }

    // 3. Merge Categories
    let finalCategories = cached.categories;
    if (resCats.data && resCats.data.length > 0) {
      const dbCats: MasterCategory[] = resCats.data.filter(
        (c: any) => !deleted.has(c.id) && !deleted.has(c.name)
      );
      const localOnlyCats = cached.categories.filter(
        (lc) =>
          !isValidUuid(lc.id) &&
          !dbCats.some((dc) => dc.name.toLowerCase() === lc.name.toLowerCase())
      );
      finalCategories = [...dbCats, ...localOnlyCats];
      writeLocal(KEYS.CATEGORIES, finalCategories);
    }

    // 4. Merge PICs
    let finalPics = cached.pics;
    if (resPics.data && resPics.data.length > 0) {
      const dbPics: MasterPic[] = resPics.data.filter(
        (p: any) => !deleted.has(p.id) && !deleted.has(p.name)
      );
      const localOnlyPics = cached.pics.filter(
        (lp) =>
          !isValidUuid(lp.id) &&
          !dbPics.some((dp) => dp.name.toLowerCase() === lp.name.toLowerCase())
      );
      finalPics = [...dbPics, ...localOnlyPics];
      writeLocal(KEYS.PICS, finalPics);
    }

    // 5. Merge Cases
    let finalCases = cached.cases;
    if (resCases.data) {
      const dbCases: CaseItem[] = resCases.data
        .filter((c: any) => !deleted.has(c.id) && !deleted.has(c.case_id))
        .map((c: any) => {
          const localMatch = cached.cases.find(
            (lc) => lc.id === c.id || lc.case_id === c.case_id
          ) as (CaseItem & { _localModified?: boolean }) | undefined;

          const dbAttachments: CaseAttachment[] = Array.isArray(
            c.case_attachments
          )
            ? c.case_attachments
            : [];

          const localAttachments = localMatch?.attachments || [];
          const mergedAttachments =
            dbAttachments.length >= localAttachments.length
              ? dbAttachments
              : localAttachments;

          const rawAreaName =
            c.master_areas?.name ||
            c.area_name ||
            localMatch?.area_name ||
            "-";

          // Parse legacy "Malang - KR4" into Area: "Malang", Location: "KR4" if location_name is empty
          let parsedArea = rawAreaName;
          let parsedLocation =
            c.location_name || localMatch?.location_name || "";
          if (!parsedLocation && rawAreaName.includes(" - ")) {
            const parts = rawAreaName.split(" - ");
            parsedArea = parts[0].trim();
            parsedLocation = parts.slice(1).join(" - ").trim();
          }

          if (localMatch && localMatch._localModified) {
            return {
              ...c,
              ...localMatch,
              id: c.id,
              area_name: localMatch.area_name || parsedArea,
              location_name: localMatch.location_name || parsedLocation || "-",
              attachments: mergedAttachments,
            };
          }

          return {
            ...c,
            category_name:
              c.master_categories?.name ||
              c.category_name ||
              localMatch?.category_name ||
              "-",
            area_name: parsedArea,
            location_id: c.location_id || localMatch?.location_id,
            location_name: parsedLocation || "-",
            pic_name:
              c.master_pics?.name || c.pic_name || localMatch?.pic_name || "-",
            attachments: mergedAttachments,
          };
        });

      const localOnlyCases = cached.cases.filter(
        (lc) =>
          !dbCases.some(
            (dc) => dc.id === lc.id || dc.case_id === lc.case_id
          )
      );

      finalCases = [...localOnlyCases, ...dbCases];
      writeLocal(KEYS.CASES, finalCases);
    }

    return {
      areas: finalAreas,
      locations: finalLocations,
      categories: finalCategories,
      pics: finalPics,
      cases: finalCases,
      isSupabaseConnected: hasValidConnection,
    };
  } catch (err) {
    console.error("Error fetching from Supabase, using local cache:", err);
    return { ...cached, isSupabaseConnected: false };
  }
}

async function resolveMasterId(
  table: "master_areas" | "master_categories" | "master_pics",
  id?: string,
  name?: string
): Promise<string | null> {
  if (isValidUuid(id)) return id!;
  if (!name) return null;

  const supabase = createClient();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .ilike("name", name.trim())
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created } = await supabase
    .from(table)
    .insert({ name: name.trim() })
    .select("id")
    .maybeSingle();

  return created?.id || null;
}

/**
 * Uploads photo file to Supabase Storage bucket `case-photos` and returns public URL.
 * Falls back to Base64 DataURL if bucket does not exist yet.
 */
async function uploadPhotoToStorage(
  file: File,
  caseIdentifier: string
): Promise<string> {
  const supabase = createClient();
  if (supabase) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `cases/${caseIdentifier}/${Date.now()}_${cleanName}`;

      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "31536000, public, immutable",
          contentType: file.type || "image/webp",
          upsert: true,
        });

      if (!uploadErr) {
        const { data: pubData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          return pubData.publicUrl;
        }
      } else {
        console.warn(
          "Supabase Storage upload notice (using DataURL fallback):",
          uploadErr.message
        );
      }
    } catch (err) {
      console.warn("Storage upload exception, using DataURL fallback:", err);
    }
  }
  return await fileToDataUrl(file);
}

export async function saveCaseItem(
  caseData: Partial<CaseItem>,
  photoFiles: File[] = [],
  editingCase?: CaseItem | null,
  currentCases: CaseItem[] = []
): Promise<{ updatedCases: CaseItem[]; savedCase: CaseItem }> {
  const baseList =
    currentCases.length > 0 ? currentCases : getCachedData().cases;

  const reportDate =
    caseData.date_reported ||
    editingCase?.date_reported ||
    new Date().toISOString().split("T")[0];
  const caseYear = new Date(reportDate).getFullYear();
  const existingYearCases = baseList.filter((c) =>
    c.case_id?.startsWith(`BAT-${caseYear}-`)
  );
  let maxSeq = existingYearCases.length;
  existingYearCases.forEach((c) => {
    const parts = (c.case_id || "").split("-");
    const num = parseInt(parts[2] || "0", 10);
    if (!isNaN(num) && num > maxSeq) maxSeq = num;
  });
  const targetCaseId =
    editingCase?.case_id ||
    `BAT-${caseYear}-${String(maxSeq + 1).padStart(3, "0")}`;

  // 1. Upload photo files to Supabase Storage bucket `case-photos` (with Base64 fallback)
  const newAttachments: CaseAttachment[] = [];
  for (const file of photoFiles) {
    try {
      const fileUrl = await uploadPhotoToStorage(file, targetCaseId);
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        case_id: editingCase?.id || "",
        file_url: fileUrl,
        file_name: file.name,
        file_size_kb: Math.round(file.size / 1024),
        mime_type: file.type || "image/webp",
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed processing photo file:", err);
    }
  }

  if (editingCase) {
    const existingAttachments =
      caseData.attachments !== undefined
        ? caseData.attachments
        : editingCase.attachments || [];
    const mergedAttachments = [...existingAttachments, ...newAttachments];

    let updatedCase: CaseItem & { _localModified?: boolean } = {
      ...editingCase,
      ...caseData,
      last_update: new Date().toISOString().split("T")[0],
      attachments: mergedAttachments,
      _localModified: true,
    };

    let nextCases = baseList.map((c) =>
      c.id === editingCase.id ? updatedCase : c
    );
    writeLocal(KEYS.CASES, nextCases);

    const supabase = createClient();
    if (supabase) {
      const [resolvedCatId, resolvedAreaId, resolvedPicId] = await Promise.all([
        resolveMasterId(
          "master_categories",
          updatedCase.category_id,
          updatedCase.category_name
        ),
        resolveMasterId(
          "master_areas",
          updatedCase.area_id,
          updatedCase.area_name
        ),
        resolveMasterId("master_pics", updatedCase.pic_id, updatedCase.pic_name),
      ]);

      const baseUpdatePayload: Record<string, any> = {
        case_title: updatedCase.case_title,
        status: updatedCase.status,
        progress: updatedCase.progress,
        remarks: updatedCase.remarks,
        priority: updatedCase.priority,
        target_date: updatedCase.target_date,
      };
      if (resolvedCatId) baseUpdatePayload.category_id = resolvedCatId;
      if (resolvedAreaId) baseUpdatePayload.area_id = resolvedAreaId;
      if (resolvedPicId) baseUpdatePayload.pic_id = resolvedPicId;

      const fullUpdatePayload: Record<string, any> = {
        ...baseUpdatePayload,
        location_name: updatedCase.location_name || null,
        location_id: isValidUuid(updatedCase.location_id)
          ? updatedCase.location_id
          : null,
      };

      let { data: updatedRows, error: updateErr } = isValidUuid(editingCase.id)
        ? await supabase
            .from("cases")
            .update(fullUpdatePayload)
            .eq("id", editingCase.id)
            .select("id")
        : await supabase
            .from("cases")
            .update(fullUpdatePayload)
            .eq("case_id", editingCase.case_id)
            .select("id");

      // Fallback if location_name column hasn't been added to DB yet
      if (updateErr) {
        const retry = isValidUuid(editingCase.id)
          ? await supabase
              .from("cases")
              .update(baseUpdatePayload)
              .eq("id", editingCase.id)
              .select("id")
          : await supabase
              .from("cases")
              .update(baseUpdatePayload)
              .eq("case_id", editingCase.case_id)
              .select("id");
        updatedRows = retry.data;
      }

      if (updatedRows && updatedRows.length > 0) {
        updatedCase = { ...updatedCase, _localModified: false };
        nextCases = nextCases.map((c) =>
          c.id === editingCase.id ? updatedCase : c
        );
        writeLocal(KEYS.CASES, nextCases);
      }

      if (newAttachments.length > 0 && isValidUuid(editingCase.id)) {
        await supabase.from("case_attachments").insert(
          newAttachments.map((att) => ({
            case_id: editingCase.id,
            file_url: att.file_url,
            file_name: att.file_name,
            file_size_kb: att.file_size_kb,
            mime_type: att.mime_type,
          }))
        );
      }
    }

    return { updatedCases: nextCases, savedCase: updatedCase };
  } else {
    const tempId = `case-${Date.now()}`;
    const attachmentsWithCaseId = newAttachments.map((a) => ({
      ...a,
      case_id: tempId,
    }));

    let newCase: CaseItem = {
      id: tempId,
      case_id: targetCaseId,
      date_reported: reportDate,
      case_title: caseData.case_title || "Kasus Baru",
      category_id: caseData.category_id,
      category_name: caseData.category_name || "Operasional",
      area_id: caseData.area_id,
      area_name: caseData.area_name || "Malang",
      location_id: caseData.location_id,
      location_name: caseData.location_name || "-",
      priority: caseData.priority || "Medium",
      pic_id: caseData.pic_id,
      pic_name: caseData.pic_name || "PIC",
      target_date:
        caseData.target_date || new Date().toISOString().split("T")[0],
      status: caseData.status || "Open",
      progress: caseData.progress ?? 0,
      last_update: new Date().toISOString().split("T")[0],
      remarks: caseData.remarks || "",
      attachments: attachmentsWithCaseId,
    };

    let nextCases = [newCase, ...baseList];
    writeLocal(KEYS.CASES, nextCases);

    const supabase = createClient();
    if (supabase) {
      const [resolvedCatId, resolvedAreaId, resolvedPicId] = await Promise.all([
        resolveMasterId(
          "master_categories",
          newCase.category_id,
          newCase.category_name
        ),
        resolveMasterId("master_areas", newCase.area_id, newCase.area_name),
        resolveMasterId("master_pics", newCase.pic_id, newCase.pic_name),
      ]);

      const baseInsertPayload: Record<string, any> = {
        case_id: newCase.case_id,
        date_reported: newCase.date_reported,
        case_title: newCase.case_title,
        category_id: resolvedCatId,
        area_id: resolvedAreaId,
        pic_id: resolvedPicId,
        priority: newCase.priority,
        status: newCase.status,
        progress: newCase.progress,
        target_date: newCase.target_date,
        remarks: newCase.remarks,
      };

      const fullInsertPayload: Record<string, any> = {
        ...baseInsertPayload,
        location_name: newCase.location_name || null,
        location_id: isValidUuid(newCase.location_id)
          ? newCase.location_id
          : null,
      };

      let { data: inserted, error } = await supabase
        .from("cases")
        .insert(fullInsertPayload)
        .select(
          `
          *,
          master_categories(name),
          master_areas(name),
          master_pics(name)
        `
        )
        .maybeSingle();

      // Fallback if location_name column hasn't been added in DB yet
      if (error) {
        const retry = await supabase
          .from("cases")
          .insert(baseInsertPayload)
          .select(
            `
            *,
            master_categories(name),
            master_areas(name),
            master_pics(name)
          `
          )
          .maybeSingle();
        inserted = retry.data;
      }

      if (inserted) {
        let savedAttachments = attachmentsWithCaseId;
        if (newAttachments.length > 0 && inserted.id) {
          const { data: insertedAtts } = await supabase
            .from("case_attachments")
            .insert(
              newAttachments.map((att) => ({
                case_id: inserted.id,
                file_url: att.file_url,
                file_name: att.file_name,
                file_size_kb: att.file_size_kb,
                mime_type: att.mime_type,
              }))
            )
            .select("*");

          if (insertedAtts && insertedAtts.length > 0) {
            savedAttachments = insertedAtts;
          }
        }

        newCase = {
          ...newCase,
          ...inserted,
          category_name:
            inserted.master_categories?.name || newCase.category_name,
          area_name: inserted.master_areas?.name || newCase.area_name,
          location_name: inserted.location_name || newCase.location_name,
          pic_name: inserted.master_pics?.name || newCase.pic_name,
          attachments: savedAttachments,
        };

        nextCases = nextCases.map((c) => (c.id === tempId ? newCase : c));
        writeLocal(KEYS.CASES, nextCases);
      }
    }

    return { updatedCases: nextCases, savedCase: newCase };
  }
}

export async function removeCaseItem(
  id: string,
  currentCases: CaseItem[]
): Promise<CaseItem[]> {
  const target = currentCases.find((c) => c.id === id);
  addDeletedId(id);
  if (target?.case_id) addDeletedId(target.case_id);

  const nextCases = currentCases.filter((c) => c.id !== id);
  writeLocal(KEYS.CASES, nextCases);

  const supabase = createClient();
  if (supabase) {
    if (isValidUuid(id)) {
      await supabase.from("cases").delete().eq("id", id);
    } else if (target?.case_id) {
      await supabase.from("cases").delete().eq("case_id", target.case_id);
    }
  }

  return nextCases;
}

export async function createMasterArea(
  name: string,
  current: MasterArea[]
): Promise<MasterArea[]> {
  let newArea: MasterArea = { id: `area-${Date.now()}`, name };
  const supabase = createClient();
  if (supabase) {
    const { data } = await supabase
      .from("master_areas")
      .insert({ name })
      .select("*")
      .maybeSingle();
    if (data) newArea = data;
  }
  const next = [...current, newArea];
  writeLocal(KEYS.AREAS, next);
  return next;
}

export async function removeMasterArea(
  id: string,
  current: MasterArea[]
): Promise<MasterArea[]> {
  const target = current.find((a) => a.id === id);
  addDeletedId(id);
  if (target?.name) addDeletedId(target.name);

  const next = current.filter((a) => a.id !== id);
  writeLocal(KEYS.AREAS, next);

  const supabase = createClient();
  if (supabase) {
    if (isValidUuid(id)) {
      await supabase.from("master_areas").delete().eq("id", id);
    } else if (target?.name) {
      await supabase.from("master_areas").delete().eq("name", target.name);
    }
  }
  return next;
}

export async function createMasterLocation(
  areaId: string,
  areaName: string,
  name: string,
  current: MasterLocation[]
): Promise<MasterLocation[]> {
  let newLoc: MasterLocation = {
    id: `loc-${Date.now()}`,
    area_id: areaId,
    area_name: areaName,
    name,
  };
  const supabase = createClient();
  if (supabase) {
    const resolvedAreaId = await resolveMasterId("master_areas", areaId, areaName);
    const { data } = await supabase
      .from("master_locations")
      .insert({
        area_id: resolvedAreaId,
        area_name: areaName,
        name,
      })
      .select("*")
      .maybeSingle();
    if (data) {
      newLoc = {
        ...data,
        area_name: data.area_name || areaName,
      };
    }
  }
  const next = [...current, newLoc];
  writeLocal(KEYS.LOCATIONS, next);
  return next;
}

export async function removeMasterLocation(
  id: string,
  current: MasterLocation[]
): Promise<MasterLocation[]> {
  const target = current.find((l) => l.id === id);
  addDeletedId(id);

  const next = current.filter((l) => l.id !== id);
  writeLocal(KEYS.LOCATIONS, next);

  const supabase = createClient();
  if (supabase) {
    if (isValidUuid(id)) {
      await supabase.from("master_locations").delete().eq("id", id);
    } else if (target?.name) {
      await supabase
        .from("master_locations")
        .delete()
        .eq("name", target.name)
        .eq("area_name", target.area_name);
    }
  }
  return next;
}

export async function createMasterCategory(
  name: string,
  current: MasterCategory[]
): Promise<MasterCategory[]> {
  let newCat: MasterCategory = { id: `cat-${Date.now()}`, name };
  const supabase = createClient();
  if (supabase) {
    const { data } = await supabase
      .from("master_categories")
      .insert({ name })
      .select("*")
      .maybeSingle();
    if (data) newCat = data;
  }
  const next = [...current, newCat];
  writeLocal(KEYS.CATEGORIES, next);
  return next;
}

export async function removeMasterCategory(
  id: string,
  current: MasterCategory[]
): Promise<MasterCategory[]> {
  const target = current.find((c) => c.id === id);
  addDeletedId(id);
  if (target?.name) addDeletedId(target.name);

  const next = current.filter((c) => c.id !== id);
  writeLocal(KEYS.CATEGORIES, next);

  const supabase = createClient();
  if (supabase) {
    if (isValidUuid(id)) {
      await supabase.from("master_categories").delete().eq("id", id);
    } else if (target?.name) {
      await supabase.from("master_categories").delete().eq("name", target.name);
    }
  }
  return next;
}

export async function createMasterPic(
  name: string,
  role: string,
  email: string,
  current: MasterPic[]
): Promise<MasterPic[]> {
  let newPic: MasterPic = { id: `pic-${Date.now()}`, name, role, email };
  const supabase = createClient();
  if (supabase) {
    const { data } = await supabase
      .from("master_pics")
      .insert({ name, role, email })
      .select("*")
      .maybeSingle();
    if (data) newPic = data;
  }
  const next = [...current, newPic];
  writeLocal(KEYS.PICS, next);
  return next;
}

export async function removeMasterPic(
  id: string,
  current: MasterPic[]
): Promise<MasterPic[]> {
  const target = current.find((p) => p.id === id);
  addDeletedId(id);
  if (target?.name) addDeletedId(target.name);

  const next = current.filter((p) => p.id !== id);
  writeLocal(KEYS.PICS, next);

  const supabase = createClient();
  if (supabase) {
    if (isValidUuid(id)) {
      await supabase.from("master_pics").delete().eq("id", id);
    } else if (target?.name) {
      await supabase.from("master_pics").delete().eq("name", target.name);
    }
  }
  return next;
}
