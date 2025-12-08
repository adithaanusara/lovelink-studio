import { NextResponse } from "next/server";
import { Readable } from "stream";
import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    let data: FormData;
    try {
      data = await request.formData();
    } catch {
      return NextResponse.json({ error: "Use multipart form data." }, { status: 400 });
    }
    const file = data.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const mime = file.type || "";
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only image and video files are allowed." },
        { status: 400 }
      );
    }

    const maxFileSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "File is too large. Please upload a file smaller than 15MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
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
          if (!result) {
            reject(new Error("Cloudinary returned no upload result."));
            return;
          }
          resolve(result);
        }
      );

      uploadStream.on("error", reject);
      Readable.from(buffer).on("error", reject).pipe(uploadStream);
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
  } catch (error) {
    console.error("UPLOAD_ERROR", error);

    return NextResponse.json({ error: "Media upload failed. Please try again." }, { status: 500 });
  }
}