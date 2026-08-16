import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/db";
import type { Category } from "@/lib/products";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") as
    | Category
    | null;
  const products = await getAllProducts(category ?? undefined);
  return NextResponse.json({ products });
}
