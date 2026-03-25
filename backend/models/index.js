import { Brand } from "./Brand.js";
import { Category } from "./Category.js";
import { Product } from "./Product.js";
import { ProductImage } from "./ProductImage.js";
import { AboutPage } from "./AboutPage.js";
import { AboutValue } from "./AboutValue.js";
import { AboutTeamMember } from "./AboutTeamMember.js";
// ✅ Category(id_categoria) <-> Brand(categoryId)
Category.hasMany(Brand, {
  foreignKey: "categoryId",
  sourceKey: "id_categoria",
});
Brand.belongsTo(Category, {
  foreignKey: "categoryId",
  targetKey: "id_categoria",
});

// ✅ Brand(id_marca) <-> Product(brandId)
Brand.hasMany(Product, { foreignKey: "brandId", sourceKey: "id_marca" });
Product.belongsTo(Brand, { foreignKey: "brandId", targetKey: "id_marca" });

// ✅ Category(id_categoria) <-> Product(categoryId)
Category.hasMany(Product, {
  foreignKey: "categoryId",
  sourceKey: "id_categoria",
});
Product.belongsTo(Category, {
  foreignKey: "categoryId",
  targetKey: "id_categoria",
});

// ✅ Product(id_producto) <-> ProductImage(productId)
Product.hasMany(ProductImage, {
  foreignKey: "productId",
  sourceKey: "id_producto",
  as: "images",
  onDelete: "CASCADE",
});
ProductImage.belongsTo(Product, {
  foreignKey: "productId",
  targetKey: "id_producto",
});

// AboutPage -> Values
AboutPage.hasMany(AboutValue, {
  foreignKey: "aboutPageId",
  sourceKey: "id",
  as: "values",
  onDelete: "CASCADE",
  hooks: true,
});

AboutValue.belongsTo(AboutPage, {
  foreignKey: "aboutPageId",
  targetKey: "id",
  as: "aboutPage",
});

// AboutPage -> Team
AboutPage.hasMany(AboutTeamMember, {
  foreignKey: "aboutPageId",
  sourceKey: "id",
  as: "teamMembers",
  onDelete: "CASCADE",
  hooks: true,
});

AboutTeamMember.belongsTo(AboutPage, {
  foreignKey: "aboutPageId",
  targetKey: "id",
  as: "aboutPage",
});

export {
  Brand,
  Category,
  Product,
  ProductImage,
  AboutPage,
  AboutValue,
  AboutTeamMember,
};
