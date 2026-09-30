import { supabase } from "@/integrations/supabase/client";
import { ALLOWED_FILE, MAX_FILE_BYTES } from "@/lib/pahana";

export type Service = {
  id: string;
  icon: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  active: boolean;
  sort_order: number;
};

export type Order = {
  id: string;
  code: string;
  user_id: string;
  service_id: string | null;
  service_name: string;
  title: string;
  module: string;
  course: string;
  university: string;
  assign_type: string;
  description: string;
  word_count: number | null;
  ref_style: string;
  deadline: string;
  preferred_date: string | null;
  budget: number | null;
  phone: string;
  extra: string | null;
  status: string;
  payment_status: string;
  price: number | null;
  payment_method: string | null;
  admin_notes: string;
  delivery_msg: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderFile = {
  id: string;
  order_id: string;
  user_id: string;
  kind: "student" | "proof" | "delivery";
  name: string;
  size: number;
  path: string;
  created_at: string;
};

export type OrderEvent = { id: string; order_id: string; status: string; at: string };

export type Message = {
  id: string;
  user_id: string;
  sender: "student" | "admin";
  body: string;
  read: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  user_id: string | null;
  name: string;
  rating: number;
  body: string;
  approved: boolean;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  bank_name: string;
  account_name: string;
  account_no: string;
  branch: string;
  instructions: string;
  tiers: [string, number][];
};

/* ---------- public reads ---------- */

export async function fetchActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function fetchAllServices(): Promise<Service[]> {
  const { data, error } = await supabase.from("services").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function fetchApprovedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function fetchSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data as unknown as SiteSettings;
}

/* ---------- student reads ---------- */

export async function fetchMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Order | null) ?? null;
}

export async function fetchOrderFiles(orderId: string): Promise<OrderFile[]> {
  const { data, error } = await supabase
    .from("order_files")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as OrderFile[];
}

export async function fetchOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const { data, error } = await supabase
    .from("order_events")
    .select("*")
    .eq("order_id", orderId)
    .order("at");
  if (error) throw error;
  return (data ?? []) as OrderEvent[];
}

export async function fetchMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Notification[];
}

/* ---------- files ---------- */

export function validateFile(file: File) {
  if (!ALLOWED_FILE.test(file.name)) return `Unsupported file type: ${file.name}`;
  if (file.size > MAX_FILE_BYTES) return `${file.name} is over the 20 MB limit`;
  return null;
}

export async function uploadOrderFiles(
  files: File[],
  opts: { orderId: string; ownerId: string; uploaderId: string; kind: OrderFile["kind"] },
) {
  for (const file of files) {
    const problem = validateFile(file);
    if (problem) throw new Error(problem);
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${opts.ownerId}/${opts.orderId}/${opts.kind}-${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage
      .from("assignments")
      .upload(path, file, { upsert: false, ...(file.type ? { contentType: file.type } : {}) });
    if (upErr) throw upErr;
    const { error } = await supabase.from("order_files").insert({
      order_id: opts.orderId,
      user_id: opts.uploaderId,
      kind: opts.kind,
      name: file.name,
      size: file.size,
      path,
    });
    if (error) throw error;
  }
}

export async function downloadFile(file: OrderFile) {
  const { data, error } = await supabase.storage
    .from("assignments")
    .createSignedUrl(file.path, 120, { download: file.name });
  if (error) throw error;
  window.open(data.signedUrl, "_blank", "noopener");
}

/* ---------- admin ---------- */

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  university: string | null;
  student_id: string | null;
  avatar_url: string | null;
  provider: string | null;
  suspended: boolean;
  created_at: string;
};

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function fetchAllMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function fetchAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function fetchAdminRoles(): Promise<{ user_id: string; role: string }[]> {
  const { data, error } = await supabase.from("user_roles").select("user_id, role");
  if (error) throw error;
  return (data ?? []) as { user_id: string; role: string }[];
}

export async function notify(userId: string, body: string) {
  await supabase.from("notifications").insert({ user_id: userId, body });
}
