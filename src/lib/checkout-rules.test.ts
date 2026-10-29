import { describe, expect, it } from "vitest";
import { computeTotals, isValidCpf, maskCep, shippingPrice } from "./checkout-rules";

describe("checkout rules", () => {
  it("PAC costs R$ 18,90 and Sedex R$ 29,90", () => {
    expect(shippingPrice("PAC")).toBe(18.9);
    expect(shippingPrice("SEDEX")).toBe(29.9);
  });
  it("adds shipping to subtotal", () => {
    expect(computeTotals([{ price: 24, quantity: 2 }, { price: 38, quantity: 1 }], "SEDEX")).toEqual({
      subtotal: 86,
      shipping_cost: 29.9,
      total: 115.9,
    });
  });
  it("masks CEP as XXXXX-XXX", () => {
    expect(maskCep("01310100")).toBe("01310-100");
  });
  it("validates CPF check digits", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("529.982.247-24")).toBe(false);
  });
});
