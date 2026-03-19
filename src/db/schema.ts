import { pgTable, serial, date, varchar, text, boolean, timestamp, integer, unique } from 'drizzle-orm/pg-core';

export const prayersDaily = pgTable('prayers_daily', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  prayerName: varchar('prayer_name', { length: 50 }).notNull(),
  status: text('status').default('None'), // 'Prayed' | 'Missed' | 'Qaza' | 'None'
  isVoluntary: boolean('is_voluntary').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique('unique_prayer').on(table.date, table.prayerName),
]);

export const qazaBacklog = pgTable('qaza_backlog', {
  id: serial('id').primaryKey(),
  prayerName: varchar('prayer_name', { length: 50 }).notNull().unique(),
  count: integer('count').default(0),
  totalCompleted: integer('total_completed').default(0),
});

export const userSettings = pgTable('user_settings', {
  settingKey: varchar('setting_key', { length: 100 }).primaryKey(),
  settingValue: text('setting_value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
