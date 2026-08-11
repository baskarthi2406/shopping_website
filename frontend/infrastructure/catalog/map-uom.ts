import type { Uom } from "@/domain/catalog";
import type { UomRecord } from "./data/uom-records";

export function mapUom(record: UomRecord): Uom {
  return {
    code: record.code,
    label: record.label,
  };
}
