import { NextResponse } from "next/server";
import { Readable } from "stream";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // add this new one
    const mime = file.type || "";
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    // add this new one
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only image and video files are allowed." },
        { status: 400 }
      );
    }

    // add this new one
    const maxFileSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "File is too large. Please upload a file smaller than 15MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // add this new one
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "lovelink-studio",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });

    let poster: string | undefined;

    if (isVideo) {
      poster = cloudinary.url(uploadResult.public_id, {
        resource_type: "video",
        format: "jpg",
        secure: true
      });
    }

    return NextResponse.json({
      url: uploadResult.secure_url,
      resourceType: isVideo ? "video" : "image",
      poster
    });
  } catch (error: any) {
    console.error("UPLOAD_ERROR", error);

    // add this new one
    const message =
      error?.message ||
      error?.error?.message ||
      "Media upload failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}