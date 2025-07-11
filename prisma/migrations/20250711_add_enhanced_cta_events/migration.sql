-- Add enhanced events field to CTA table
ALTER TABLE "ctas" ADD COLUMN "events" JSONB;

-- Add missing columns to CTA table
ALTER TABLE "ctas" ADD COLUMN "customId" TEXT;
ALTER TABLE "ctas" ADD COLUMN "onClickEvent" TEXT;
ALTER TABLE "ctas" ADD COLUMN "onHoverEvent" TEXT;
ALTER TABLE "ctas" ADD COLUMN "onMouseOutEvent" TEXT;
ALTER TABLE "ctas" ADD COLUMN "onFocusEvent" TEXT;
ALTER TABLE "ctas" ADD COLUMN "onBlurEvent" TEXT;
ALTER TABLE "ctas" ADD COLUMN "onKeyDownEvent" TEXT;
ALTER TABLE "ctas" ADD COLUMN "onKeyUpEvent" TEXT;
ALTER TABLE "ctas" ADD COLUMN "onTouchStartEvent" TEXT;
ALTER TABLE "ctas" ADD COLUMN "onTouchEndEvent" TEXT;

-- Create GlobalFunctions table
CREATE TABLE "global_functions" (
    "id" SERIAL PRIMARY KEY,
    "functions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
); 