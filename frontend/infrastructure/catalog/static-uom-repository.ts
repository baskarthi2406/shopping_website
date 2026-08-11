import type { Uom } from "@/domain/catalog";
import type { UomRepository } from "@/application/catalog/uom-repository";
import { uomRecords } from "./data/uom-records";
import { mapUom } from "./map-uom";

export class StaticUomRepository implements UomRepository {
  async getByCode(code: string): Promise<Uom | null> {
    const record = uomRecords.find((uom) => uom.code === code);
    return record ? mapUom(record) : null;
  }

  async list(): Promise<readonly Uom[]> {
    return uomRecords.map(mapUom);
  }
}
