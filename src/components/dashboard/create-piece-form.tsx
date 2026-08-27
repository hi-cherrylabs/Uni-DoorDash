import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { toast } from "sonner";

import { CATEGORIES } from "@/data/catalog";
import { useAuth } from "@/components/auth-provider";
import { getFirebaseAuth } from "@/lib/firebase";
import { createProduct } from "@/lib/firestore-data";
import { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } from "@/lib/cloudinary-config";
import { getCloudinaryUploadSignature } from "@/server/cloudinary-upload";
import { notifyNewProduct } from "@/server/push-notify";

// Downscaled client-side before upload — this is just to avoid shipping a
// raw 12MB phone photo over the wire. Cloudinary hosts and serves the
// result (with its own CDN/optimization on top), so this cap is generous
// compared to the old scheme, which had to fit the whole image inside a
// single Firestore document.
const MAX_IMAGE_WIDTH = 1600;

function compressImageToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) {
      reject(new Error("Not an image"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))),
          "image/jpeg",
          0.85,
        );
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/** Uploads directly to Cloudinary using a server-issued signature. Returns the hosted image URL. */
async function uploadToCloudinary(blob: Blob, category: string): Promise<string> {
  const idToken = await getFirebaseAuth().currentUser?.getIdToken();
  if (!idToken) throw new Error("Not signed in.");

  const { timestamp, folder, signature } = await getCloudinaryUploadSignature({
    data: { idToken, category },
  });

  const body = new FormData();
  body.append("file", blob);
  body.append("api_key", CLOUDINARY_API_KEY);
  body.append("timestamp", String(timestamp));
  body.append("folder", folder);
  body.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body,
  });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const json = (await res.json()) as { secure_url?: string };
  if (!json.secure_url) throw new Error("Cloudinary upload failed");
  return json.secure_url;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  quantity: "",
  price: "",
  deliveryTime: "",
};

export function CreatePieceForm() {
  const { user, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);

  // Revoke the object URL whenever it's replaced or the form unmounts, so
  // we don't leak blob URLs.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      const blob = await compressImageToBlob(file);
      setImageBlob(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch {
      toast.error("Couldn't read that image — try a different file.");
    }
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void handleFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!isAdmin) {
      toast.error("Only the admin account can post products.");
      return;
    }

    const { name, description, category, quantity, price, deliveryTime } = form;
    if (!name.trim() || !description.trim() || !category || !price.trim()) {
      toast.error("Fill in product name, description, category and price.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = "";
      if (imageBlob) {
        setStatusLabel("Uploading image…");
        imageUrl = await uploadToCloudinary(imageBlob, category);
      }

      setStatusLabel("Posting…");
      await createProduct({
        name: name.trim(),
        description: description.trim(),
        category,
        quantity: quantity.trim() ? Number(quantity) : 1,
        price: Number(price) || 0,
        deliveryTime: deliveryTime.trim() || "1-3 min",
        image: imageUrl,
        sellerEmail: user?.email ?? null,
      });

      // Best-effort — never let a push failure block the "posted
      // successfully" flow, which has already completed at this point.
      void (async () => {
        try {
          const idToken = await getFirebaseAuth().currentUser?.getIdToken();
          if (!idToken) return;
          await notifyNewProduct({ data: { idToken, productName: name.trim() } });
        } catch {
          /* silent — see comment above */
        }
      })();

      toast.success("Posted! Now live in Market Place and Home.");
      setForm(EMPTY_FORM);
      setImageBlob(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Couldn't post that product. Please try again.");
    } finally {
      setSubmitting(false);
      setStatusLabel(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-border p-8 text-center">
        <p className="text-sm font-semibold">Only the admin account can post products.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign in with the Uni Door Dash admin account to use this form.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex h-44 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/40 bg-cover bg-center text-center shadow-lg sm:h-52"
        style={{
          backgroundImage: previewUrl
            ? `url(${previewUrl})`
            : "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)",
        }}
      >
        {!previewUrl && (
          <>
            <span className="grid size-12 place-items-center rounded-full bg-white/20 backdrop-blur">
              <Upload className="size-6 text-white" />
            </span>
            <p className="text-sm font-bold text-white">Drag and drop media</p>
          </>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full bg-white px-4 py-2 text-xs font-bold text-neutral-900 hover:opacity-90"
        >
          {previewUrl ? "Change image" : "Or browse files"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileInputChange}
          className="hidden"
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Product name
          </label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Amber Noir Eau de Parfum"
            className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Description
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the product — materials, scent notes, fit, whatever matters most."
            className="w-full resize-none rounded-lg bg-accent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none"
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Also decides which Cloudinary folder the image is stored in.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Quantity available
            </label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              placeholder="1"
              className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Price (Tsh)
            </label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="25000"
              className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estimated delivery time
            </label>
            <input
              value={form.deliveryTime}
              onChange={(e) => update("deliveryTime", e.target.value)}
              placeholder="1-3 min"
              className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)",
          }}
        >
          {submitting ? (statusLabel ?? "Posting…") : "Post product"}
        </button>
      </form>
    </div>
  );
}
