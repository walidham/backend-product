import { Router } from "express";
import multer from "multer";
import path from "path";
import Product from "../models/product.js";

const router = Router();

// stockage local ./uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    if (/image\/(png|jpe?g|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only images are allowed"));
  }
});

// CRUD
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description = "", price } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ message: "name and price required" });
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      imageUrl
    });
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const update = {};
    if (name != null) update.name = name;
    if (description != null) update.description = description;
    if (price != null) update.price = Number(price);
    if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true
    });
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});

export default router;
