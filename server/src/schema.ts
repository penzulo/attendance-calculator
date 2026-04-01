import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	index,
	integer,
	pgTable,
	serial,
	varchar,
} from "drizzle-orm/pg-core";

export const subjects = pgTable("subjects", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull().unique(),
	presentCount: integer("present_count").notNull().default(0),
	totalLectures: integer("total_lectures").notNull().default(0),
});

export const logs = pgTable(
	"logs",
	{
		id: serial("id").primaryKey(),
		subjectId: integer("subject_id")
			.notNull()
			.references(() => subjects.id, { onDelete: "cascade" }),
		didAttend: boolean("did_attend").notNull(),
		timestamp: bigint("timestamp", { mode: "number" }).notNull(),
	},
	(table) => ({
		subjectIdIdx: index("logs_subject_id_idx").on(table.subjectId),
	}),
);

// Telling drizzle about the relationship for deeply nested queries.
export const subjectRelations = relations(subjects, ({ many }) => ({
	logs: many(logs),
}));
