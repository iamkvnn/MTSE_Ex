import { Client } from "@elastic/elasticsearch";
import { Product } from "../model/product.js";

const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || "http://localhost:9200";
export const PRODUCT_INDEX = "products";

export const elasticSearch = new Client({
  node: ELASTICSEARCH_NODE
});

const productMapping = {
  properties: {
    name: {
      type: "text",
      analyzer: "autocomplete_index",
      search_analyzer: "autocomplete_search",
      fields: {
        keyword: {
          type: "keyword",
          ignore_above: 256
        }
      }
    },
    description: {
      type: "text",
      analyzer: "autocomplete_index",
      search_analyzer: "autocomplete_search",
    },
    price: {
      type: "float"
    },
    category: {
      type: "keyword"
    },
    image: {
      type: "keyword"
    },
    stock: {
      type: "integer"
    },
    isActive: {
      type: "boolean"
    },
    createdAt: {
      type: "date"
    },
    updatedAt: {
      type: "date"
    }
  }
};

const checkElasticsearchConnection = async () => {
  try {
    const health = await elasticSearch.cluster.health();
    console.log("Elasticsearch cluster health:", health.status);
    return true;
  } catch (error) {
    console.error("Elasticsearch connection error:", error.message);
    return false;
  }
};

const createProductIndex = async () => {
  try {
    const indexExists = await elasticSearch.indices.exists({ index: PRODUCT_INDEX });
    
    if (!indexExists) {
      await elasticSearch.indices.create({
        index: PRODUCT_INDEX,
        body: {
          mappings: productMapping,
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                vietnamese_analyzer: {
                  type: "custom",
                  tokenizer: "standard",
                  filter: ["lowercase", "asciifolding"]
                },
                autocomplete_index: {
                  tokenizer: "autocomplete_tokenizer",
                  filter: ["lowercase", "asciifolding"]
                },
                autocomplete_search: {
                  tokenizer: "standard",
                  filter: ["lowercase", "asciifolding"]
                }
              },
              tokenizer: {
                autocomplete_tokenizer: {
                  type: "edge_ngram",
                  min_gram: 1,
                  max_gram: 20,
                  token_chars: ["letter", "digit"]
                }
              }
            }
          }
        }
      });
      console.log(`Index "${PRODUCT_INDEX}" created successfully`);
    } else {
      console.log(`Index "${PRODUCT_INDEX}" already exists`);
    }
  } catch (error) {
    console.error("Error creating index:", error.message);
  }
};

export const initElasticsearch = async () => {
    const elasticsearchAvailable = await checkElasticsearchConnection();
    if (elasticsearchAvailable) {
        await createProductIndex();
        const products = await Product.find({}).lean();
        await syncAllProductsToES(products);
    }
    return elasticsearchAvailable;
};

const syncAllProductsToES = async (products) => {
  try {
    if (!products || products.length === 0) {
      console.log("No products to sync");
    }
    
    const operations = products.flatMap(product => [
      { index: { _index: PRODUCT_INDEX, _id: product._id.toString() } },
      {
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
    ]);
    
    const bulkResponse = await elasticSearch.bulk({
      refresh: true,
      body: operations
    });
    
    let success = 0;
    let failed = 0;
    
    if (bulkResponse.errors) {
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          failed++;
          console.error(`Error indexing product ${i}:`, action[operation].error);
        } else {
          success++;
        }
      });
    } else {
      success = products.length;
    }
    
    console.log(`Synced ${success} products to Elasticsearch, ${failed} failed`);
  } catch (error) {
    console.error("Error syncing products to ES:", error.message);
  }
};