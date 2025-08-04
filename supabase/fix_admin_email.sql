-- Fix Admin Email Policies for Blog System
-- Run this in Supabase SQL Editor to update admin access to use alexgrwood@me.com

-- 1. Drop existing policies with wrong email pattern
DROP POLICY IF EXISTS "Admin can manage all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can manage blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Admin can manage blog post categories" ON blog_post_categories;
DROP POLICY IF EXISTS "Admin can view analytics" ON blog_post_views;

-- 2. Create new policies with correct email
CREATE POLICY "Admin can manage all blog posts" ON blog_posts
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'alexgrwood@me.com'
    ));

CREATE POLICY "Admin can manage blog categories" ON blog_categories
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'alexgrwood@me.com'
    ));

CREATE POLICY "Admin can manage blog post categories" ON blog_post_categories
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'alexgrwood@me.com'
    ));

CREATE POLICY "Admin can view analytics" ON blog_post_views
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'alexgrwood@me.com'
    ));

-- 3. Verify the policies are working (optional check)
-- This will show you all the policies for the blog tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('blog_posts', 'blog_categories', 'blog_post_categories', 'blog_post_views')
ORDER BY tablename, policyname;