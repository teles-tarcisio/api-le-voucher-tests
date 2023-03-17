import { jest } from "@jest/globals";
import voucherService from "services/voucherService";
import voucherRepository from "repositories/voucherRepository";
import { Voucher } from "@prisma/client";

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

  it("should not apply a voucher without minimum amount", async () => {
    const invalidAmountVoucher: Voucher = {
      id: 1,
      code: "invalid_amount",
      discount: 10,
      used: false
    };
    
    const invalidAmount = 99;
    
    const expectedReturn = {
      amount: invalidAmount,
      discount: invalidAmountVoucher.discount,
      finalAmount: invalidAmount,
      applied: false
    };

    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(invalidAmountVoucher);
    
    const result = await voucherService.applyVoucher(invalidAmountVoucher.code, invalidAmount);

    expect(result).toMatchObject(expectedReturn);
  });

  it("should successfullly apply a voucher", async () => {
    const validAmountVoucher: Voucher = {
      id: 1,
      code: "valid_amount",
      discount: 10,
      used: false
    };
    
    const validAmount = 200;
    
    
    const usedValidVoucher: Voucher = {
      id: validAmountVoucher.id,
      code: validAmountVoucher.code,
      discount: validAmountVoucher.discount,
      used: true
    };
    
    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(validAmountVoucher);
    jest.spyOn(voucherRepository, "useVoucher").mockResolvedValueOnce(usedValidVoucher);

    const expectedReturn = {
      amount: validAmount,
      discount: validAmountVoucher.discount,
      finalAmount: validAmount * (1 - (validAmountVoucher.discount)/100),
      applied: true
    };
    
    const result = await voucherService.applyVoucher(validAmountVoucher.code, validAmount);

    console.log(result);
    expect(result).toMatchObject(expectedReturn);
  });

});