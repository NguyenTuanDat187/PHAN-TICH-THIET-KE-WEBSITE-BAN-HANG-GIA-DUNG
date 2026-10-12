
import mongoose, { Types } from "mongoose";
import UserAddress from "../models/UserAddress.model";

/**
 * FILE: src/services/userAddress.service.ts
 *
 * Nghiệp vụ quản lý địa chỉ giao hàng của người dùng.
 */

interface AddressInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  ward?: string | null;
  district?: string | null;
  province?: string | null;
  isDefault?: boolean;
}

const normalizeOptionalFields = (
  input: AddressInput
): AddressInput => ({
  ...input,
  ward: input.ward?.trim() || null,
  district: input.district?.trim() || null,
  province: input.province?.trim() || null,
});

const validateUserId = (userId: string): void => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("ID người dùng không hợp lệ.");
  }
};

// Lấy tất cả địa chỉ của người dùng hiện tại.
export const getMyAddressesService = async (
  userId: string
) => {
  validateUserId(userId);

  return UserAddress.find({ userId })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
};

// Lấy một địa chỉ thuộc người dùng hiện tại.
export const getMyAddressByIdService = async (
  userId: string,
  addressId: string
) => {
  validateUserId(userId);

  if (!Types.ObjectId.isValid(addressId)) {
    throw new Error("ID địa chỉ không hợp lệ.");
  }

  const address = await UserAddress.findOne({
    _id: addressId,
    userId,
  }).lean();

  if (!address) {
    throw new Error("Không tìm thấy địa chỉ.");
  }

  return address;
};

// Tạo địa chỉ mới.
export const createAddressService = async (
  userId: string,
  input: AddressInput
) => {
  validateUserId(userId);

  const data = normalizeOptionalFields(input);

  // Đảm bảo chỉ có một địa chỉ mặc định cho mỗi người dùng.
  // Dùng transaction để cập nhật địa chỉ mặc định và tạo địa chỉ mới.
  const session = await mongoose.startSession();

  try {
    let createdAddress: unknown;

    await session.withTransaction(async () => {
      const hasAddress = await UserAddress.exists({
        userId,
      }).session(session);

      const shouldBeDefault =
        data.isDefault === true || !hasAddress;

      if (shouldBeDefault) {
        await UserAddress.updateMany(
          { userId, isDefault: true },
          { $set: { isDefault: false } },
          { session }
        );
      }

      const [created] = await UserAddress.create(
        [
          {
            ...data,
            userId,
            isDefault: shouldBeDefault,
          },
        ],
        { session }
      );

      createdAddress = created;
    });

    return createdAddress;
  } finally {
    await session.endSession();
  }
};

// Cập nhật địa chỉ.
export const updateAddressService = async (
  userId: string,
  addressId: string,
  input: Partial<AddressInput>
) => {
  validateUserId(userId);

  if (!Types.ObjectId.isValid(addressId)) {
    throw new Error("ID địa chỉ không hợp lệ.");
  }

  const data = normalizeOptionalFields(input as AddressInput);

  const session = await mongoose.startSession();

  try {
    let updatedAddress: unknown = null;

    await session.withTransaction(async () => {
      const address = await UserAddress.findOne({
        _id: addressId,
        userId,
      }).session(session);

      if (!address) {
        throw new Error("Không tìm thấy địa chỉ.");
      }

      if (data.isDefault === true) {
        await UserAddress.updateMany(
          {
            userId,
            _id: { $ne: addressId },
            isDefault: true,
          },
          { $set: { isDefault: false } },
          { session }
        );
      }

      Object.assign(address, data);

      await address.save({ session });
      updatedAddress = address;
    });

    return updatedAddress;
  } finally {
    await session.endSession();
  }
};

// Đặt địa chỉ hiện có làm mặc định.
export const setDefaultAddressService = async (
  userId: string,
  addressId: string
) => {
  validateUserId(userId);

  if (!Types.ObjectId.isValid(addressId)) {
    throw new Error("ID địa chỉ không hợp lệ.");
  }

  const session = await mongoose.startSession();

  try {
    let defaultAddress: unknown = null;

    await session.withTransaction(async () => {
      const address = await UserAddress.findOne({
        _id: addressId,
        userId,
      }).session(session);

      if (!address) {
        throw new Error("Không tìm thấy địa chỉ.");
      }

      await UserAddress.updateMany(
        { userId, _id: { $ne: addressId } },
        { $set: { isDefault: false } },
        { session }
      );

      address.isDefault = true;
      await address.save({ session });

      defaultAddress = address;
    });

    return defaultAddress;
  } finally {
    await session.endSession();
  }
};

// Xóa địa chỉ của người dùng.
export const deleteAddressService = async (
  userId: string,
  addressId: string
) => {
  validateUserId(userId);

  if (!Types.ObjectId.isValid(addressId)) {
    throw new Error("ID địa chỉ không hợp lệ.");
  }

  const session = await mongoose.startSession();

  try {
    let wasDefault = false;

    await session.withTransaction(async () => {
      const address = await UserAddress.findOne({
        _id: addressId,
        userId,
      }).session(session);

      if (!address) {
        throw new Error("Không tìm thấy địa chỉ.");
      }

      wasDefault = address.isDefault;
      await address.deleteOne({ session });

      // Nếu xóa địa chỉ mặc định, chọn địa chỉ mới gần nhất.
      if (wasDefault) {
        const nextAddress = await UserAddress.findOne({
          userId,
        })
          .sort({ createdAt: -1 })
          .session(session);

        if (nextAddress) {
          nextAddress.isDefault = true;
          await nextAddress.save({ session });
        }
      }
    });

    return { message: "Xóa địa chỉ thành công." };
  } finally {
    await session.endSession();
  }
};
