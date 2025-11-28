import { elasticSearch, PRODUCT_INDEX } from "../config/elasticsearch.js";


export const indexProduct = async (product) => {
  try {
    await elasticSearch.index({
      index: PRODUCT_INDEX,
      id: product._id.toString(),
      body: {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        stock: product.stock,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    console.error("Error indexing product:", error.message);
  }
};

export const updateProductInES = async (productId, updateData) => {
  try {
    await elasticSearch.update({
      index: PRODUCT_INDEX,
      id: productId.toString(),
      body: {
        doc: updateData
      }
    });
  } catch (error) {
    console.error("Error updating product in ES:", error.message);
  }
};

export const searchProducts = async ({
  query,
  category,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10
}) => {
  try {
    const from = (page - 1) * limit;
    const must = [
      { term: { isActive: true } }
    ];

    if (query) {
      must.push(
        {
          multi_match: {
            query: query,
            fields: ["name^6", "description"],
            fuzziness: "AUTO"
          }
        }
      );
    }

    if (category && category !== "all") {
      must.push({ term: { category: category } });
    }

    const rangeFilter = {};
    if (minPrice !== undefined) {
      rangeFilter.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      rangeFilter.lte = maxPrice;
    }
    if (Object.keys(rangeFilter).length > 0) {
      must.push({ range: { price: rangeFilter } });
    }

    const boolQuery = { must };
    
    const response = await elasticSearch.search({
      index: PRODUCT_INDEX,
      body: {
        query: { bool: boolQuery },
        from: from,
        size: limit,
        highlight: {
          fields: {
            name: {},
            description: {}
          },
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"]
        }
      }
    });
    
    const hits = response.hits.hits;
    const total = response.hits.total.value;
    
    const products = hits.map(hit => ({
      _id: hit._id,
      ...hit._source,
      _score: hit._score,
      highlight: hit.highlight
    }));
    
    return {
      EC: 0,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: from + products.length < total
      }
    };
  } catch (error) {
    console.error("Error searching products:", error.message);
    return {
      EC: 1,
      EM: "Error searching products",
      products: [],
      pagination: {}
    };
  }
};

export const suggestProducts = async (query, limit = 5) => {
  try {
    const response = await elasticSearch.search({
      index: PRODUCT_INDEX,
      body: {
        query: {
          bool: {
            must: [
              { term: { isActive: true } },
              {
                multi_match: {
                  query: query,
                  type: "bool_prefix",
                  fields: ["name", "name._2gram", "name._3gram"]
                }
              }
            ]
          }
        },
        size: limit,
        _source: ["name", "category", "price", "image"]
      }
    });
    
    const suggestions = response.hits.hits.map(hit => ({
      _id: hit._id,
      ...hit._source
    }));
    
    return {
      EC: 0,
      suggestions
    };
  } catch (error) {
    console.error("Error getting suggestions:", error.message);
    return {
      EC: 1,
      EM: "Error getting suggestions",
      suggestions: []
    };
  }
};