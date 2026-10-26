import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { defineRelationsPart } from 'drizzle-orm';
import * as schema from './schema/schema';
import * as authSchema from './schema/auth-schema';
import { authRelations } from './schema/auth-schema';
import { relations } from './schema/relations';

const { authRelations: _, ...authTables } = authSchema;
const baseRelations = defineRelationsPart({ ...schema, ...authTables });

const finalRelations = {
  ...baseRelations,
  ...authRelations,
  ...relations,
  user: {
    ...authRelations.user,
    relations: {
      ...authRelations.user.relations,
      ...relations.user.relations,
    },
  },
};

export const db = drizzle(process.env.DATABASE_URL!, { relations: finalRelations });
