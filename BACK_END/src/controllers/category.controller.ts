import { Request, Response } from "express";

import * as categoryService from "../services/category.service";
import { HttpError } from "../services/brand.service";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Đã xảy ra lỗi không xác định.";
};

const getErrorStatusCode = (error: unknown, fallback: number): number => {
  if (error instanceof HttpError) {
    return error.statusCode;
  }

  return fallback;
};

const getQueryParam = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }

  return undefined;
};

const getPathParam = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

export const getPublicCategories = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getPublicCategories({
      page: getQueryParam(req.query.page)
        ? Number(getQueryParam(req.query.page))
        : undefined,
      limit: getQueryParam(req.query.limit)
        ? Number(getQueryParam(req.query.limit))
        : undefined,
      search: getQueryParam(req.query.search),
      parentId: getQueryParam(req.query.parentId),
      sortBy: getQueryParam(req.query.sortBy),
      sortOrder: getQueryParam(req.query.sortOrder) as "asc" | "desc" | undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục thành công.",
      data: result.categories,
      pagination: result.pagination,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const getPublicCategoryTree = async (_req: Request, res: Response) => {
  try {
    const tree = await categoryService.getPublicCategoryTree();

    return res.status(200).json({
      success: true,
      message: "Lấy cây danh mục thành công.",
      data: tree,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const getPublicCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getPublicCategoryById(
      getPathParam(req.params.id)
    );

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết danh mục thành công.",
      data: category,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 404))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const getPublicCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getPublicCategoryBySlug(
      getPathParam(req.params.slug)
    );

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết danh mục thành công.",
      data: category,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 404))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const getAdminCategories = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getAdminCategories({
      page: getQueryParam(req.query.page)
        ? Number(getQueryParam(req.query.page))
        : undefined,
      limit: getQueryParam(req.query.limit)
        ? Number(getQueryParam(req.query.limit))
        : undefined,
      search: getQueryParam(req.query.search),
      isActive: getQueryParam(req.query.isActive) as boolean | undefined,
      parentId: getQueryParam(req.query.parentId),
      sortBy: getQueryParam(req.query.sortBy),
      sortOrder: getQueryParam(req.query.sortOrder) as "asc" | "desc" | undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục (Admin) thành công.",
      data: result.categories,
      pagination: result.pagination,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const getAdminCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getAdminCategoryById(
      getPathParam(req.params.id)
    );

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết danh mục (Admin) thành công.",
      data: category,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 404))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);

    return res.status(201).json({
      success: true,
      message: "Tạo danh mục mới thành công.",
      data: category,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.updateCategory(
      getPathParam(req.params.id),
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công.",
      data: category,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.toggleCategoryStatus(
      getPathParam(req.params.id),
      req.body.isActive
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái danh mục thành công.",
      data: category,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const updateSortOrder = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.updateSortOrder(req.body.items);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.deleteCategory(getPathParam(req.params.id));

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};
