# Supabase Database Changes for Budget Planner

## Required Changes to `budget_items` Table

You need to add two new columns to your existing `budget_items` table in Supabase:

### 1. Add Notes Column
```sql
ALTER TABLE budget_items 
ADD COLUMN notes TEXT;
```

### 2. Add Links Column
```sql
ALTER TABLE budget_items 
ADD COLUMN links JSONB;
```

## How to Apply These Changes

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Select the `budget_items` table
4. Click **Add Column** for each new column:

   **For Notes Column:**
   - Name: `notes`
   - Type: `text`
   - Default value: (leave empty)
   - Allow nullable: ✓ (checked)

   **For Links Column:**
   - Name: `links`
   - Type: `jsonb`
   - Default value: (leave empty)
   - Allow nullable: ✓ (checked)

### Option 2: Using SQL Editor
1. Go to **SQL Editor** in your Supabase dashboard
2. Run these SQL commands one at a time:

```sql
-- Add notes column
ALTER TABLE budget_items 
ADD COLUMN notes TEXT;

-- Add links column  
ALTER TABLE budget_items 
ADD COLUMN links JSONB;
```

## What These Columns Store

### Notes Column
- **Type**: Text
- **Purpose**: Stores simple text notes about budget items
- **Example**: "Need to check if this fits in the nursery"

### Links Column
- **Type**: JSONB (JSON with indexing)
- **Purpose**: Stores an array of link objects with URL, price, and source
- **Example**: 
```json
[
  {
    "url": "https://johnlewis.com/product123", 
    "price": "299.99", 
    "source": "John Lewis"
  },
  {
    "url": "https://amazon.co.uk/dp/xyz", 
    "price": "279.00", 
    "source": "Amazon"
  }
]
```

## After Making Changes

Once you've added these columns to your `budget_items` table:

1. **Test the changes**: Try adding a new budget item with notes and links
2. **Existing data**: All your existing budget items will continue to work normally
3. **New features**: You'll now be able to:
   - Add notes to budget items
   - Add multiple links with different prices for comparison
   - View notes and links in the budget planner
   - Export notes and links in CSV format

## Troubleshooting

If you encounter any issues:

1. **Column already exists error**: Check if the columns were already added
2. **Permission error**: Make sure you have admin access to the Supabase project
3. **Data type error**: Ensure you're using `text` for notes and `jsonb` for links

The app has been designed to handle both old items (without these fields) and new items (with these fields) seamlessly.
