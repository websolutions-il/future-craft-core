

## Plan: Add Task Editing with "Edited" Indicator

### Database Migration
Add `edited_at` (timestamptz, nullable) column to `dev_tasks` table to track when a task was last edited.

### UI Changes (src/pages/CompletedTasks.tsx)

1. **Edit state**: Add `editingTask` state (DevTask | null) and edit form fields (`editSummary`, `editClarification`, `editPriority`, `editSize`).

2. **Edit modal/inline form**: When clicking an edit button (Pencil icon) on a task row, open a Dialog with pre-filled fields (summary, clarification, priority, size selectors — same as the "add" form). Save updates via `supabase.update()` setting `edited_at = now()`.

3. **Edit button**: Add a Pencil icon button in the action column (for super_admin users) next to the existing "בוצע"/"החזר" buttons.

4. **"Edited" indicator**: In the task row, if `task.edited_at` is not null, show a small badge/text like "✏️ נערך" next to the summary or status, indicating the task was modified.

5. **Update DevTask interface** to include `edited_at: string | null`.

### Technical Details
- Single file edit: `src/pages/CompletedTasks.tsx`
- One DB migration: add `edited_at` column
- Uses existing Dialog component from shadcn/ui
- Edit permission: super_admin only (consistent with existing action buttons)

