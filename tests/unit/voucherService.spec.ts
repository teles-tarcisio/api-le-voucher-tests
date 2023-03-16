import { jest } from "@jest/globals";
import voucherService from "services/voucherService";
import voucherRepository from "repositories/voucherRepository";
import { Voucher } from "@prisma/client";
import { AppError } from "utils/errorUtils";

describe("Voucher Service test suite", () => {
  it("should successfully create a voucher", async() => {
    const testCode = "test_voucher_code";
    const testAmount = 40;

    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(undefined);

    jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce((): any => Promise.resolve());

    await voucherService.createVoucher(testCode, testAmount);

    expect(voucherRepository.createVoucher).toBeCalledWith(testCode, testAmount)
  });

  it("should throw an error when voucher already exists", async () => {
    const duplicatedVoucher: Voucher = {
      id: 2,
      code: "duplicate",
      discount: 2,
      used: false
    };

    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(duplicatedVoucher);

    await expect(voucherService.createVoucher).rejects.toMatchObject({
      message: "Voucher already exist.",
      type: "conflict"
    });
  });

  it("should not apply inexistent voucher", async () => {
    
    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(undefined);

    await expect(voucherService.applyVoucher).rejects.toMatchObject({
      message: "Voucher does not exist.",
      type: "conflict"
    });
  });

  /*
  const validVoucher: Voucher = {
    id: 1,
    code: "valid_code",
    discount: 10,
    used: false
  };
  */
});