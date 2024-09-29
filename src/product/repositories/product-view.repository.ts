import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductView } from "../schemas/product-view.schema";
@Injectable()
export class ProductViewRepository {
  constructor(
    @InjectModel(ProductView.name) private productViewModel: Model<ProductView>,
  ) {}

  async createProduct(productView: Partial<ProductView>): Promise<ProductView> {
    const createProductView = new this.productViewModel(productView);
    return createProductView.save();
  }
  async deleteProduct({ id }: { id: string }): Promise<void> {
    await this.productViewModel.deleteOne({ id: id }).exec();
  }
  async findById(id: string): Promise<ProductView | null> {
    return this.productViewModel.findOne({ id }).exec();
  }
}
