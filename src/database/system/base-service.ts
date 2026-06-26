import { prisma } from "@/database/system/db.js";
import { Page, Pagination } from "@/types/db.js";
import Util from "@/core/utils/index.js";

const { Password } = Util;

abstract class BaseService<TData = unknown, TResult = unknown> {
  protected database = prisma;
  protected Password = Password;

  protected readonly PAGE_SIZE = 10;

  constructor() {}

  protected abstract transaction(data?: TData): Promise<TResult | null>;

  public async call(data?: TData): Promise<TResult | null> {
    try {
      return await this.transaction(data);
    } catch (error) {
      console.error("Database transaction error:", error);
      return null;
    }
  }

  protected cursor(data: Page): Pagination {
    const skip = (data.page - 1) * data.pageSize;
    const take = data.pageSize;
    return { take, skip };
  }
}

export default BaseService;
