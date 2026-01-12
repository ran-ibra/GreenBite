import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

const UNIT_OPTIONS = ["kg", "g", "L", "ml", "pcs"];

const pickEditable = (listing) => ({
  title: listing?.title ?? "",
  description: listing?.description ?? "",
  price: listing?.price ?? "",
  currency: listing?.currency ?? "EGP",
  quantity: listing?.quantity ?? "",
  unit: listing?.unit ?? "kg",
  available_until: listing?.available_until ?? "",
  featured_image: null, // File
});

const EditListingDialog = ({ open, onOpenChange, listing, onSubmit }) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState(() => pickEditable(listing));

  React.useEffect(() => {
    setForm(pickEditable(listing));
  }, [listing?.id]);

  const setField = (key) => (e) =>
    setForm((p) => ({
      ...p,
      [key]: e.target.value,
    }));

  const handleFile = (e) => {
    const file = e.target.files?.[0] ?? null;
    setForm((p) => ({ ...p, featured_image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!listing?.id) return;

    setSubmitting(true);
    try {
      // ✅ only send allowed fields
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: form.price,
        currency: form.currency,
        quantity: Number(form.quantity),
        unit: form.unit,
        available_until: form.available_until,
      };

      // include image only if chosen
      if (form.featured_image) payload.featured_image = form.featured_image;

      await onSubmit?.(listing.id, payload);
      onOpenChange?.(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-green-50 text-slate-900 border border-green-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-green-900">Edit Listing</DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
            placeholder="Title"
            value={form.title}
            onChange={setField("title")}
            required
          />

          <Textarea
            className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
            placeholder="Description"
            value={form.description}
            onChange={setField("description")}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
              type="number"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={setField("price")}
              required
            />
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
              placeholder="Currency"
              value={form.currency}
              onChange={setField("currency")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400 border-green-200"
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={setField("quantity")}
              required
            />

            <Select value={form.unit} onValueChange={(value) => setForm((p) => ({ ...p, unit: value }))}>
              <SelectTrigger className="bg-white text-slate-900 border-green-200">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent className="bg-white text-slate-900 border border-green-200">
                {UNIT_OPTIONS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            className="bg-white text-slate-900 border-green-200"
            type="date"
            value={form.available_until}
            onChange={setField("available_until")}
            required
          />

          <Input
            className="bg-white text-slate-900 border-green-200 file:text-slate-900"
            type="file"
            accept="image/*"
            onChange={handleFile}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditListingDialog;