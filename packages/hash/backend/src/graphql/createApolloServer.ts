import { performance } from "perf_hooks";

import {
  ApolloServer,
  defaultPlaygroundOptions,
  makeExecutableSchema,
} from "apollo-server-express";
import { Logger } from "winston";
import { StatsD } from "hot-shots";

import { schema } from "./typeDefs";
import { resolvers } from "./resolvers";
import { DBAdapter } from "../db";
import { buildPassportGraphQLMethods } from "../auth/passport";
import { GraphQLContext } from "./context";
import EmailTransporter from "../email/transporter";

export const createApolloServer = (
  db: DBAdapter,
  emailTransporter: EmailTransporter,
  logger: Logger,
  statsd?: StatsD
) => {
  // go via makeExecutableSchema to set inheritResolversFromInterfaces
  const combinedSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers,
    inheritResolversFromInterfaces: true,
  });

  return new ApolloServer({
    schema: combinedSchema,
    dataSources: () => ({ db }),
    context: (ctx): Omit<GraphQLContext, "dataSources"> => ({
      ...ctx,
      user: ctx.req.user,
      emailTransporter,
      passport: buildPassportGraphQLMethods(ctx),
      logger: logger.child({ requestId: ctx.res.get("x-hash-request-id") }),
    }),
    debug: true, // required for stack traces to be captured
    plugins: [
      {
        requestDidStart: (ctx) => {
          ctx.logger = ctx.context.logger as Logger;
          const startedAt = performance.now();
          return {
            didResolveOperation: (ctx) => {
              if (ctx.operationName) {
                statsd?.increment(ctx.operationName, ["graphql"]);
              }
            },

            willSendResponse: async (ctx) => {
              if (ctx.operationName === "IntrospectionQuery") {
                // Ignore introspection queries from graphiql
                return;
              }
              const msg = { message: "graphql", operation: ctx.operationName };
              if (ctx.errors) {
                const stack = ctx.errors.map((err) => err.stack);
                ctx.logger.error({ ...msg, errors: ctx.errors, stack });
              } else {
                ctx.logger.info(msg);
                if (ctx.operationName) {
                  const elapsed = performance.now() - startedAt;
                  statsd?.timing(ctx.operationName, elapsed, 1, ["graphql"]);
                }
              }
            },
          };
        },
      },
    ],
    playground: {
      ...defaultPlaygroundOptions,
      settings: {
        ...defaultPlaygroundOptions.settings,
        "request.credentials": "include",
      },
    },
  });
};
