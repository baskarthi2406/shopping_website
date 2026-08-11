import type { Uom } from "@/domain/catalog";

export interface UomRepository {
  getByCode(code: string): Promise<Uom | null>;
  list(): Promise<readonly Uom[]>;
}
