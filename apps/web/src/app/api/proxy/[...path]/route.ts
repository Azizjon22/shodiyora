import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

async function handle(req: NextRequest, path: string[]) {
  const search = req.nextUrl.search;
  const targetPath = `/${path.join("/")}${search}`;

  const method = req.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;

  try {
    const data = await apiFetch(targetPath, {
      method,
      body: body && body.length > 0 ? body : undefined,
    });
    return NextResponse.json(data ?? {});
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body ?? { message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Kutilmagan xatolik yuz berdi" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handle(req, path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handle(req, path);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handle(req, path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handle(req, path);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return handle(req, path);
}
