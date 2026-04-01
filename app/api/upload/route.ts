import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || "image/jpeg";
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "lovelink-studio"
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error("UPLOAD_ERROR", error);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}
