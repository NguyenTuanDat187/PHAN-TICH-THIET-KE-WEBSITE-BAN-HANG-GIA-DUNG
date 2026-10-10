import { Request, Response } from "express";

import * as attributeService from "../services/attribute.service";
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

const getPathParam = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

export const getAllAttributes = async (_req: Request, res: Response) => {
  try {
    const attributes = await attributeService.getAllAttributesWithValues();

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách thuộc tính thành công.",
      data: attributes,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const getAttributeById = async (req: Request, res: Response) => {
  try {
    const attribute = await attributeService.getAttributeById(
      getPathParam(req.params.id)
    );

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết thuộc tính thành công.",
      data: attribute,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 404))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const createAttribute = async (req: Request, res: Response) => {
  try {
    const attribute = await attributeService.createAttribute(req.body);

    return res.status(201).json({
      success: true,
      message: "Tạo thuộc tính mới thành công.",
      data: attribute,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const updateAttribute = async (req: Request, res: Response) => {
  try {
    const attribute = await attributeService.updateAttribute(
      getPathParam(req.params.id),
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật thuộc tính thành công.",
      data: attribute,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const deleteAttribute = async (req: Request, res: Response) => {
  try {
    const result = await attributeService.deleteAttribute(getPathParam(req.params.id));

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

export const createAttributeValue = async (req: Request, res: Response) => {
  try {
    const value = await attributeService.createAttributeValue(
      getPathParam(req.params.id),
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Thêm giá trị thuộc tính thành công.",
      data: value,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const updateAttributeValue = async (req: Request, res: Response) => {
  try {
    const value = await attributeService.updateAttributeValue(
      getPathParam(req.params.valueId),
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật giá trị thuộc tính thành công.",
      data: value,
    });
  } catch (error) {
    return res
      .status(getErrorStatusCode(error, 500))
      .json({ success: false, message: getErrorMessage(error) });
  }
};

export const deleteAttributeValue = async (req: Request, res: Response) => {
  try {
    const result = await attributeService.deleteAttributeValue(
      getPathParam(req.params.valueId)
    );

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
