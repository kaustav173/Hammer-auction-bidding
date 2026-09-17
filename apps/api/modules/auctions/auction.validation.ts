import type { NextFunction, Request, Response } from "express";

export function validateCreateAuction(req: Request, res: Response, next: NextFunction) {
  const {
    title,
    description,
    category,
    startingPrice,
    reservePrice,
    minimumIncrement,
    startAt,
    endAt,
    images,
  } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ success: false, message: "Valid title is required" });
  }
  if (typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ success: false, message: "Valid description is required" });
  }
  if (typeof category !== "string" || !category.trim()) {
    return res.status(400).json({ success: false, message: "Valid category is required" });
  }
  if (typeof startingPrice !== "number" || !Number.isInteger(startingPrice) || startingPrice <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "startingPrice must be a positive integer" });
  }
  if (reservePrice !== undefined && reservePrice !== null) {
    if (
      typeof reservePrice !== "number" ||
      !Number.isInteger(reservePrice) ||
      reservePrice < startingPrice
    ) {
      return res
        .status(400)
        .json({ success: false, message: "reservePrice must be >= startingPrice" });
    }
  }
  if (
    typeof minimumIncrement !== "number" ||
    !Number.isInteger(minimumIncrement) ||
    minimumIncrement <= 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "minimumIncrement must be a positive integer" });
  }

  const parsedStartAt = new Date(startAt);
  const parsedEndAt = new Date(endAt);

  if (Number.isNaN(parsedStartAt.getTime()) || Number.isNaN(parsedEndAt.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "startAt and endAt must be valid dates" });
  }
  if (parsedStartAt >= parsedEndAt) {
    return res.status(400).json({ success: false, message: "startAt must be before endAt" });
  }
  if (parsedStartAt <= new Date()) {
    return res.status(400).json({ success: false, message: "startAt must be in the future" });
  }
  if (
    images !== undefined &&
    (!Array.isArray(images) || images.some((u: unknown) => typeof u !== "string"))
  ) {
    return res.status(400).json({ success: false, message: "images must be an array of URLs" });
  }

  req.body = {
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    startingPrice,
    reservePrice: reservePrice ?? null,
    minimumIncrement,
    startAt: parsedStartAt,
    endAt: parsedEndAt,
    images: images ?? [],
  };

  next();
}
