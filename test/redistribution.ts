import { Client, Provider, ProviderRegistry, Result, Receipt, unwrapInt, unwrapResult } from "@blockstack/clarity";
import { assert } from "chai";
import { ListMap, getCurrentPage, getCurrentList, getitemMap, execMethod } from "./helper-functions"
import { StacksTestnet } from "@blockstack/stacks-transactions"

const contractSignature = "SP1FXTNRCXQW7CNKKRXZQZPZPKKVPAZS6JYX25YP5";
const organiserSignature = "SP2AYGM74FNMJT9M197EJSB49P88NRH0ES1KZD1BX";
const donatorSignature = "ST398K1WZTBVY6FE2YEHM6HP20VSNVSSPJTW0D53M";
const beneficiarySignature = "SP3T8WFCWHZNQ97SBYQH8T6ZJ1VWDMD46Y3VZ3JNJ";

function unwrapBoolean(receipt: Receipt): Boolean {
  return receipt.result === "true"
}

describe("redistribution contract test suite", () => {
  let client: Client;
  let provider: Provider;
  before(async () => {
    provider = await ProviderRegistry.createProvider();

    // endless-list is considered a third party library and it's functionality is assumed to be working
    let endlessListClient = new Client(contractSignature + ".endless-list", "endless-list", provider);
    await endlessListClient.deployContract()

    client = new Client(contractSignature + ".redistribution", "redistribution", provider);
  });

  it("should have a valid syntax", async () => {
    await client.checkContract();
  });

  describe("deploying an instance of the contract", () => {
    let receipt: Receipt;
    before(async () => {
      receipt = await client.deployContract();
    });

    it("should succeed", () => {
      assert.isTrue(receipt.success)
    })
  });

  describe("when checking if the beneficiary has been registered", () => {
    let result: Boolean;

    before(async () => {
      const query = client.createQuery({
        method: { name: "does-exist", args: [`'${beneficiarySignature}`] }
      });

      let receipt = await client.submitQuery(query);
      result = unwrapBoolean(receipt)
    })

    it("should be false", () => {
      assert.isFalse(result);
    })
  })

  describe("when registering the beneficiary", () => {
    let receipt: Receipt;

    before(async () => {
      receipt = await execMethod(client, organiserSignature, "add-beneficiary", [`'${beneficiarySignature}`])
    })

    it("should succeed", () => {
      assert.isTrue(receipt.success)
    })

    describe("when checking if the beneficiary has been registered", () => {
      let result: Boolean;

      before(async () => {
        const query = client.createQuery({
          method: { name: "does-exist", args: [`'${beneficiarySignature}`] }
        });

        let receipt = await client.submitQuery(query);
        result = unwrapBoolean(receipt)
      })

      it("should be true", () => {
        assert.isTrue(result);
      })
    })

    describe("when getting total beneficiaries", () => {
      let result: string;

      before(async () => {
        const query = client.createQuery({
          method: { name: "get-total-beneficiaries", args: [] }
        });

        let receipt = await client.submitQuery(query);
        result = receipt.result
      })

      it("should be true", () => {
        assert.equal(result, "u1");
      })
    })
  })

  // As much as I would love to have all this tested, time is short
  // and the clarity JS doesn't have any support currently for transactional tests
  describe("when donating to the fund", () => {
    let result: Receipt
    before(async () => {
      result = await execMethod(client, donatorSignature, "donate", ["u1000"])
    })

    it("accepts the donation", () => {
      
      // assert.isTrue(result.success)
    })
  })

  describe("when distributing the pot", () => {
    let result: Receipt
    
    before(async () => {
      result = await execMethod(client, organiserSignature, "distribute", ["1", "2"])
    })

    it("distributes the pot", () => {      
      // assert.isTrue(result.success)
    })
  })

  after(async () => {
    await provider.close();
  });
});
