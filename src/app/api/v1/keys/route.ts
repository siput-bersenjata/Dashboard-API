import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ status: "success", data: keys });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      outlet,
      percentage,
      startDate,
      endDate,
      paymentModes,
      maxPerRequest,
    } = body;

    if (!name) {
      return NextResponse.json(
        { status: "error", message: "Nama Akses wajib diisi" },
        { status: 400 }
      );
    }

    // Generate secure API Key format: sk_live_xxxxxxxxxxxxxxxx
    const randomBytes = Math.random().toString(36).substring(2, 12) +
      Math.random().toString(36).substring(2, 12);
    const generatedKey = `sk_live_${randomBytes}`;

    const newKey = await prisma.apiKey.create({
      data: {
        name,
        key: generatedKey,
        description: description || null,
        outlet: outlet || "Semua Kasir",
        percentage: Number(percentage) || 100,
        startDate: startDate || null,
        endDate: endDate || null,
        paymentModes: paymentModes ? JSON.stringify(paymentModes) : "[]",
        maxPerRequest: Number(maxPerRequest) || 100,
        status: "active",
      },
    });

    return NextResponse.json({ status: "success", data: newKey });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, percentage, name, description, maxPerRequest } = body;

    if (!id) {
      return NextResponse.json({ status: "error", message: "ID wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(percentage !== undefined && { percentage: Number(percentage) }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(maxPerRequest !== undefined && { maxPerRequest: Number(maxPerRequest) }),
      },
    });

    return NextResponse.json({ status: "success", data: updated });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ status: "error", message: "ID wajib disertakan" }, { status: 400 });
  }

  await prisma.apiKey.delete({ where: { id } });
  return NextResponse.json({ status: "success", message: "API Key berhasil dihapus" });
}
