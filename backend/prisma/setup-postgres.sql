-- Setup script for PostgreSQL with pgvector extension
-- This script is run when the PostgreSQL container starts

-- Create the vector extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the attendance database if it doesn't exist
-- Note: This is typically handled by Docker environment variables
-- but we include it here for completeness
-- CREATE DATABASE IF NOT EXISTS attendance;

-- Grant privileges to the postgres user
-- GRANT ALL PRIVILEGES ON DATABASE attendance TO postgres;

-- Set the search path to public schema
SET search_path TO public;

-- Additional setup can be added here
