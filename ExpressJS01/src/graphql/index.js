import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { cartTypeDefs } from './schema/cartSchema.js';
import { cartResolvers } from './resolvers/cartResolvers.js';

const typeDefs = cartTypeDefs;
const resolvers = cartResolvers;

// Create Apollo Server instance
export const createApolloServer = () => {
    return new ApolloServer({
        typeDefs,
        resolvers,
    });
};

export const setupGraphQL = async (app) => {
    const server = createApolloServer();
    await server.start();
    
    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }) => {
                const user = req.user || null;
                return { user };
            }
        }),
    );
    
    console.log('GraphQL server running at /graphql');
    return server;
};
